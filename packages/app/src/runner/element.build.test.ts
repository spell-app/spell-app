import { execFileSync } from "node:child_process"
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, posix } from "node:path"
import { runInNewContext } from "node:vm"
import { afterAll, beforeAll, describe, test, expect } from "vite-plus/test"

/**
 * Production builds of the runners:  `<spell-app>` and `<spell-editor>` (`yarn build:element` => `dist-element/`) and
 * the VS Code runner (`yarn build:runner` => `dist-runner/`).  Each folder is built as its script builds it, into a
 * temp folder:  `vite.solid.config.ts` first, then the rest beside it.
 * - ONE Solid per page:  two copies fail SILENTLY (`solid-2.md`).
 *   So Solid (`solid-js`, `@solidjs/web`, `@solidjs/signals`) is in `spell-solid.js` ALONE,
 *   with `@spell-app/ui`'s element core (which `<spell-app>` and `<spell-editor>` are defined on),
 *   and the rest of `@spell-app/ui` in `spell-ui.js` and its lazy chunks (`ui/`) alone;
 *   `spell-app.js`, `spell-editor.js` and `runner.js` import them.  See `sharedSolid()` in `vite.shared.ts`.
 * - The component pack, `spell.pack.js`:  a classic script registering both tags, whose `define()` imports their
 *   modules;  `spell-ui.js` gives it `SpellUI.registerPack`.
 * - `spellCore` MUST be in `spell-runtime.js` ALONE:
 *   each runner loads its own copy of that file, for a `spellCore` of its own.
 *   - In a shared chunk, every app on a page would share one -- one runtime, one console --
 *     and a runner would show a `spellCore` its program doesn't run on.
 *   - So nothing a runner itself imports may import `spellCore`.
 * - And `spell-runtime.js` draws with the page's one Solid:
 *   it imports `spell-solid.js`, bundles none of its own, and never loads `ui` (epic `output-targets` P10).
 * - Monaco only in `<spell-editor>`'s lazy chunks:  the parser compiles, and apps run, before it loads.
 * - Icon packs beside the chunk holding `BuiltInPacks`, where it looks -- complete enough for every Fomantic name.
 * - Every bundle MUST parse:  a build can succeed and still write javascript no browser runs --
 *   e.g. vite's module preloading once moved an `await` into a non-`async` arrow.  See `agents/PAPERCUTS.md`.
 * - What a chunk holds comes from its sourcemap's `sources` (every build here writes maps),
 *   not from guessing at minified text;  `spellCore` is the exception, by `resetRuntime` --
 *   `spell-editor.js` holds a few of `core`'s runtime-light modules.
 */
describe("runner builds", () => {
  /** `dist-element/` and `dist-runner/`, built once in `beforeAll()`. */
  let element = ""
  let runner = ""

  beforeAll(() => {
    element = mkdtempSync(join(tmpdir(), "spell-element-"))
    build(element, "vite.solid.config.ts", "vite.element.config.ts", "vite.editor.config.ts")
    runner = mkdtempSync(join(tmpdir(), "spell-runner-"))
    build(runner, "vite.solid.config.ts", "vite.runner.config.ts")
  }, 180_000)

  afterAll(() => {
    for (const dir of [element, runner]) if (dir) rmSync(dir, { recursive: true, force: true })
  })

  test("one Solid per page:  Solid only in what `spell-solid.js` loads, `ui` only there + `spell-ui.js` + `ui/`, the elements import them", () => {
    for (const [dir, entries] of [
      [element, ["spell-app.js", "spell-editor.js"]],
      [runner, ["runner.js"]]
    ] as const) {
      const files = chunks(dir)
      // `spell-solid.js` and the chunks it imports (Rolldown puts the Solid and `ui` core modules `spell-ui.js` shares
      // in one of `ui/`), built ONCE, by `vite.solid.config.ts`
      const shared = staticImports(dir, "spell-solid.js")
      const withSolid = files.filter((file) => holds(dir, file, "solid"))
      expect(withSolid, dir).not.toEqual([])
      expect(
        withSolid.filter((file) => !shared.includes(file)),
        dir
      ).toEqual([])
      const withUI = files.filter((file) => holds(dir, file, "ui"))
      expect(withUI, dir).toContain("spell-ui.js")
      expect(
        withUI.filter((file) => !shared.includes(file) && file !== "spell-ui.js" && !file.startsWith("ui/")),
        dir
      ).toEqual([])
      // imported, NOT bundled:  each element's static imports reach the one `spell-solid.js`
      for (const entry of entries) expect(staticImports(dir, entry), `${dir} ${entry}`).toContain("spell-solid.js")
      // compiled spell draws with the page's one Solid:  the runtime imports `spell-solid.js`, bundles no Solid of its
      // own, and never loads the rest of `ui` (`spell-ui.js`), statically OR lazily
      // - what `spell-solid.js` loads is the page's shared copy:  since `<spell-app>` became a Spell UI component, that
      //   holds `ui`'s element core too, in a chunk of `ui/`
      const runtimeFiles = staticImports(dir, "spell-runtime.js")
      expect(runtimeFiles, dir).toContain("spell-solid.js")
      for (const file of runtimeFiles.filter((file) => !shared.includes(file))) {
        expect(holds(dir, file, "solid") || holds(dir, file, "ui"), `${dir} ${file}`).toBe(false)
        expect(readFileSync(join(dir, file), "utf8"), `${dir} ${file}`).not.toMatch(/spell-ui\.js/)
      }
    }
  })

  test("`spellCore` only in `spell-runtime.js`, every bundle parses", () => {
    for (const dir of [element, runner]) {
      const files = chunks(dir)
      // `resetRuntime` is `spellCore`'s own -- see `spellCore/runtime.ts`
      const withCore = files.filter((file) => readFileSync(join(dir, file), "utf8").includes("resetRuntime"))
      expect(withCore, dir).toEqual(["spell-runtime.js"])
      expectParses(dir, files)
    }
  })

  test("<spell-app>:  its files, its CSS without Monaco's, the built-ins' pack and Semantic UI beside it", () => {
    expect(chunks(element)).toEqual(
      expect.arrayContaining(["spell-app.js", "spell-runtime.js", "spell-shared.js", "spell-solid.js", "spell-ui.js"])
    )
    expect(readFileSync(join(element, "spell-app.css"), "utf8")).not.toContain(".monaco-editor")
    expect(existsSync(join(element, "spellCore.scopes.js"))).toBe(true)
    expect(existsSync(join(element, "semantic-ui-css", "semantic.min.css"))).toBe(true)
  })

  test("<spell-editor>:  Monaco loaded lazily, in its own chunks;  its own CSS", () => {
    expect(chunks(element)).toEqual(
      expect.arrayContaining(["spell-editor.js", "spell-editor-monaco.js", "spell-editor-editor.worker.js"])
    )
    // Monaco only through `import()`, NOT a static import:  the parser compiles, and apps run, before it loads
    const entry = readFileSync(join(element, "spell-editor.js"), "utf8")
    expect(entry).toMatch(/import\(`\.\/spell-editor-monaco\.js`\)/)
    for (const file of staticImports(element, "spell-editor.js"))
      expect(holds(element, file, "monaco"), file).toBe(false)
    expect(holds(element, "spell-editor-monaco.js", "monaco")).toBe(true)
    // Monaco's CSS, in the editor's own file -- NOT `spell-app.css`, which every `<spell-app>` adopts
    expect(readFileSync(join(element, "spell-editor.css"), "utf8")).toContain(".monaco-editor")
  })

  test("<spell-app> and <spell-editor> are Spell UI components:  on the core in `spell-solid.js`, the rest of `ui` lazily", () => {
    const shared = staticImports(element, "spell-solid.js")
    expect(shared.filter((file) => sources(element, file).some((source) => UI_COMPONENT.test(source)))).toHaveLength(1)
    for (const entry of ["spell-app.js", "spell-editor.js"]) {
      expect(staticImports(element, entry), entry).not.toContain("spell-ui.js")
    }
  })

  test("the component pack:  a classic script registering both tags, its `define()` importing their modules", () => {
    const pack = readFileSync(join(element, "spell.pack.js"), "utf8")
    // run as `<ui-components source>` runs it:  a CLASSIC script, `SpellUI.registerPack()` on the page
    const registered: { name: string; prefix: string; catalog: object }[] = []
    runInNewContext(pack, {
      document: { currentScript: { src: "https://example.com/element/spell.pack.js" } },
      URL,
      SpellUI: { registerPack: (it: (typeof registered)[number]) => registered.push(it) }
    })
    expect(registered).toEqual([
      {
        name: "spell",
        prefix: "spell-",
        catalog: { "spell-app": { folder: "spell-app" }, "spell-editor": { folder: "spell-editor" } },
        define: expect.any(Function)
      }
    ])
    for (const file of ["spell-app.js", "spell-editor.js"]) {
      expect(pack).toContain(`import(at(${JSON.stringify(file)}))`)
      expect(existsSync(join(element, file)), file).toBe(true)
    }
    // `spell-ui.js` gives a page `SpellUI.registerPack()`, as the docs bundle does
    expect(readFileSync(join(element, "spell-ui.js"), "utf8")).toMatch(/SpellUI\b[^;]*registerPack/)
  })

  test("VS Code runner:  its files and CSS", () => {
    expect(chunks(runner)).toEqual(
      expect.arrayContaining(["runner.js", "spell-runtime.js", "spell-shared.js", "spell-solid.js", "spell-ui.js"])
    )
    expect(existsSync(join(runner, "runner.css"))).toBe(true)
  })

  test("icon packs beside the chunk holding `BuiltInPacks`, every Fomantic name's SVG there", () => {
    for (const dir of [element, runner]) {
      const builtIns = chunks(dir).filter((file) => sources(dir, file).some((source) => BUILT_IN_PACKS.test(source)))
      expect(builtIns, dir).toHaveLength(1)
      expectIconPacks(join(dir, dirname(builtIns[0]!), "icon-packs"))
    }
  })
})

/** Modules of each package a test asks about, as they appear in a sourcemap's `sources`. */
const PACKAGES = {
  solid: /\/node_modules\/(solid-js|@solidjs\/(web|signals))\//,
  ui: /\/packages\/ui\/src\//,
  monaco: /\/node_modules\/monaco-editor\//
}

/** `ui`'s component base class, in its element core. */
const UI_COMPONENT = /\/packages\/ui\/src\/elements\/UIComponent\.tsx$/

/** `ui`'s `BuiltInPacks`, which looks for the packs beside its own chunk. */
const BUILT_IN_PACKS = /\/packages\/ui\/src\/icons\/BuiltInPacks\.ts$/

/** Build `configs` into `outDir`, in order, as the `package.json` script does;  the first empties it. */
function build(outDir: string, ...configs: string[]) {
  for (const [index, config] of configs.entries()) {
    const args = ["vite", "build", "-c", config, "--outDir", outDir, "--logLevel", "silent"]
    execFileSync("npx", index === 0 ? [...args, "--emptyOutDir"] : args, {
      // the package folder:  a root run has another working directory
      cwd: join(import.meta.dirname, "..", ".."),
      stdio: "pipe"
    })
  }
}

/**
 * Javascript the builds wrote into `dir`, as paths relative to it:  every chunk, `ui/` included.
 * - NOT `semantic-ui-css/` (copied from `static/`) or the icon packs' `pack.js` indexes.
 */
function chunks(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .map((file) => file.split("\\").join("/"))
    .filter((file) => file.endsWith(".js") && !/(^|\/)(semantic-ui-css|icon-packs)\//.test(file))
    .sort()
}

/** Source modules chunk `file` was built from, from its sourcemap;  none for a chunk without one (a facade). */
function sources(dir: string, file: string): string[] {
  const map = join(dir, `${file}.map`)
  return existsSync(map) ? (JSON.parse(readFileSync(map, "utf8")) as { sources: string[] }).sources : []
}

/** Does chunk `file` hold any module of `pkg`? */
function holds(dir: string, file: string, pkg: keyof typeof PACKAGES): boolean {
  return sources(dir, file).some((source) => PACKAGES[pkg].test(source))
}

/**
 * `entry` and every chunk it loads STATICALLY, transitively -- what a page runs before any `import()`.
 * - Reads `from"./x.js"` / `import"./x.js"` in the minified output;  `import(...)` is lazy, so left out.
 */
function staticImports(dir: string, entry: string): string[] {
  const seen = new Set<string>()
  const queue = [entry]
  while (queue.length) {
    const file = queue.pop()!
    if (seen.has(file)) continue
    seen.add(file)
    const code = readFileSync(join(dir, file), "utf8")
    for (const [, specifier] of code.matchAll(/\b(?:from|import)\s*["'`](\.\.?\/[^"'`]+)["'`]/g)) {
      queue.push(posix.normalize(posix.join(posix.dirname(file), specifier!)))
    }
  }
  return [...seen].sort()
}

/**
 * Fail unless every javascript module in `files` parses -- by V8, in ONE `node` process (`vm.SourceTextModule`
 * compiles without running):  a `node --check` per file would take seconds for `ui/`'s ~80 chunks.
 */
function expectParses(dir: string, files: string[]) {
  const script = `
    const { SourceTextModule } = require("node:vm")
    const { readFileSync } = require("node:fs")
    const failed = []
    for (const file of process.argv.slice(1)) {
      try { new SourceTextModule(readFileSync(file, "utf8"), { identifier: file }) }
      catch (error) { failed.push(file + ":  " + error.message) }
    }
    if (failed.length) { console.error(failed.join("\\n")); process.exit(1) }`
  const paths = files.map((file) => join(dir, file))
  expect(() =>
    execFileSync("node", ["--experimental-vm-modules", "--no-warnings", "-e", script, ...paths], { stdio: "pipe" })
  ).not.toThrow()
}

/**
 * Fail unless `icon-packs/` holds the built-in packs, and every icon of the `fomantic` pack --
 * the app's icon names, whose keys point into the Font Awesome folders beside it (`../fa7-free/solid/gear`) --
 * has its SVG.
 */
function expectIconPacks(packs: string) {
  for (const pack of ["fa7-free", "fa7-brands", "fomantic"])
    expect(existsSync(join(packs, pack, "pack.js")), pack).toBe(true)
  const index = readFileSync(join(packs, "fomantic", "pack.js"), "utf8")
  const keys = [...index.matchAll(/^\s*"(\.\.\/[^"]+)":/gm)].map(([, key]) => key!)
  expect(keys.length).toBeGreaterThan(1000)
  expect(keys.filter((key) => !existsSync(join(packs, "fomantic", `${key}.svg`)))).toEqual([])
}
