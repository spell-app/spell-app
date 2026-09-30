/**
 * Builds @spell/ui from its CURRENT working tree (`../ui`), then bundles `docs/_assets/spell-ui.entry.js` into
 * `docs/_assets/spell-ui.js`:  ONE minified classic script (IIFE), because docs open from `file://`, where
 * browsers refuse ES modules.
 *
 *   node scripts/docs/bundle-spell-ui.mjs [--skip-ui-build]
 *
 * - `--skip-ui-build`:  reuse `../ui/dist` as is.  `SPELL_UI_DIR` overrides where UI lives.
 * - UI build:  the fork (`yarn fork:build`, its `dist/` is what UI's build links to), then `yarn build`
 *   (`tsc && vite build`).  If `tsc` fails on in-progress work, falls back to `vite build` alone, and says so.
 * - Exactly ONE Solid:  every `solid-js` / `@solidjs/*` / `@spell/solid-element` import resolves from UI's root,
 *   so the linked fork can't pick up its own `node_modules` copy.  Checked against the metafile.
 * - No `import()` / `import.meta` may survive:  string-literal `import()`s (the runtime chunk, alias maps, emoji
 *   data, Temporal polyfill) are inlined, and `supported: { "dynamic-import": false }` turns the one computed
 *   `import()` (a glyph file, `Icons.#loadGlyph()`) into a rejected promise, which `Icons` records as a miss.
 * - Glyphs:  the ones in `GLYPHS` are bundled and `Icons.register()`ed by the virtual `spell-ui:glyphs` module,
 *   which the entry imports first;  any other icon name draws nothing.
 */

import { build } from "esbuild"
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { gzipSync } from "node:zlib"

/** Parser repo root. */
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
/** UI repo root:  a sibling checkout, unless `SPELL_UI_DIR` says otherwise. */
const UI_DIR = resolve(process.env.SPELL_UI_DIR ?? join(REPO, "../ui"))
const ASSETS = join(REPO, "docs/_assets")
const ENTRY = join(ASSETS, "spell-ui.entry.js")
const OUTFILE = join(ASSETS, "spell-ui.js")
/** Page behaviour, the RUNTIME's file;  bundled as an empty module while it doesn't exist yet. */
const PAGE_RUNTIME = join(ASSETS, "spell-doc-runtime.js")

/**
 * Glyphs bundled into the script, as `<style>/<Font Awesome name>` => extra names to register them under.
 * - Why:  `Icons` loads each glyph with `import()` of a sibling file, which a classic script on `file://` can't.
 * - Extra names are aliases the docs use, registered directly so `Icons.peek()` draws them in the first frame;
 *   other aliases still resolve through the (inlined) alias maps.
 * - ~0.3-0.6 KB each:  add what a widget or doc needs, don't bundle all 2,163 (1.4 MB).
 */
const GLYPHS = {
  "solid/magnifying-glass": ["search"], // `<ui-input icon="search">`, `<ui-search>`
  "solid/xmark": ["close", "remove"], // `<ui-message dismissible>`, `<ui-label removable>`, modal / toast close
  "solid/circle-info": ["info circle"],
  "solid/circle-check": ["check circle"],
  "solid/triangle-exclamation": ["warning sign"],
  "solid/circle-exclamation": ["warning circle"],
  "solid/circle-xmark": ["times circle"],
  "solid/check": ["checkmark"],
  "solid/chevron-down": [],
  "solid/chevron-right": [],
  "solid/link": [],
  "solid/copy": [],
  "solid/bars": []
}

/** Bare specifiers that MUST resolve from UI's root:  Solid (all subpaths) and the element-layer fork. */
const SOLID = /^(solid-js|@solidjs\/[\w-]+|@spell\/solid-element)(\/.*)?$/

const args = process.argv.slice(2)
if (!args.includes("--skip-ui-build")) buildUI()
const warnings = await bundle()
report(warnings)

////////////////
// ## UI build
////////////////

/**
 * Builds the fork, then UI, from their working trees -- "latest UI" is whatever is checked out there.
 * - `yarn build` type-checks first;  in-progress UI work may not, so fall back to `vite build` rather than fail.
 */
function buildUI() {
  if (!existsSync(join(UI_DIR, "package.json"))) fail(`no UI checkout at ${UI_DIR} (set SPELL_UI_DIR)`)
  run("yarn", ["fork:build"], "build @spell/solid-element (UI's fork)")
  if (run("yarn", ["build"], "build @spell/ui (tsc + vite)", { allowFailure: true })) return
  console.warn("!! UI's tsc failed:  building with `vite build` alone (the bundle may carry type errors)")
  run("yarn", ["vite", "build"], "build @spell/ui (vite only)")
}

/**
 * Runs `command` in UI's folder, quietly;  prints its output only if it fails.
 * - Returns whether it succeeded;  exits unless `allowFailure`.
 */
function run(command, commandArgs, label, { allowFailure = false } = {}) {
  console.log(`-- ${label}`)
  const result = spawnSync(command, commandArgs, { cwd: UI_DIR, encoding: "utf8", shell: false })
  if (result.status === 0) return true
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}${result.error ?? ""}`.trim()
  console.error(output.split("\n").slice(-40).join("\n"))
  if (!allowFailure) fail(`${command} ${commandArgs.join(" ")} failed in ${UI_DIR}`)
  return false
}

////////////////
// ## Bundle
////////////////

/**
 * Bundles the entry into `OUTFILE`, then checks the output is safe for a classic script on `file://`.
 * - Returns esbuild's warnings, as text.
 */
async function bundle() {
  const dist = join(UI_DIR, "dist/index.js")
  if (!existsSync(dist)) fail(`${relative(REPO, dist)} is missing:  run without --skip-ui-build`)
  const result = await build({
    entryPoints: [ENTRY],
    outfile: OUTFILE,
    bundle: true,
    format: "iife",
    globalName: "SpellUI",
    platform: "browser",
    // UI targets current browsers only (anchor positioning, `light-dark()`):  lower nothing but `import()`
    target: "esnext",
    supported: { "dynamic-import": false },
    // `Icons.#moduleUrl` is never read:  `spell-ui:glyphs` sets `Icons.glyphBase` first
    define: { "import.meta.url": "undefined" },
    minify: true,
    legalComments: "eof",
    metafile: true,
    logLevel: "silent",
    plugins: [spellUiResolver()]
  })
  checkOneSolid(result.metafile)
  checkClassicScript()
  return result.warnings.map((warning) => `${warning.location?.file ?? ""}: ${warning.text}`)
}

/**
 * esbuild plugin wiring the entry to UI:
 * - `@spell/ui` ~== `dist/index.js`, `@spell/ui/<entry>` ~== `dist/<entry>.js`,
 *   `@spell/ui/icons/glyphs/*` ~== `dist/glyphs/*` (mirrors UI's `package.json` `exports`)
 * - Solid / fork imports resolve from UI's root (`SOLID`), whoever imports them
 * - `spell-ui:glyphs`:  the generated glyph registrations (`glyphsModule()`)
 * - the page runtime:  an empty module until its file exists
 */
function spellUiResolver() {
  return {
    name: "spell-ui-resolver",
    setup(pluginBuild) {
      pluginBuild.onResolve({ filter: /^spell-ui:glyphs$/ }, () => ({ path: "glyphs", namespace: "spell-ui" }))
      pluginBuild.onLoad({ filter: /.*/, namespace: "spell-ui" }, (loaded) =>
        loaded.path === "glyphs"
          ? { contents: glyphsModule(), resolveDir: ASSETS, loader: "js" }
          : { contents: "", loader: "js" }
      )
      pluginBuild.onResolve({ filter: /^@spell\/ui(\/.*)?$/ }, ({ path }) => ({ path: uiDistPath(path) }))
      pluginBuild.onResolve({ filter: SOLID }, async ({ path, kind, pluginData }) => {
        if (pluginData?.fromUiRoot) return undefined
        const resolved = await pluginBuild.resolve(path, { kind, resolveDir: UI_DIR, pluginData: { fromUiRoot: true } })
        return resolved.errors.length ? { errors: resolved.errors } : { path: resolved.path }
      })
      pluginBuild.onResolve({ filter: /spell-doc-runtime\.js$/ }, ({ path, resolveDir }) => {
        const file = resolve(resolveDir, path)
        if (file === PAGE_RUNTIME && !existsSync(file)) {
          console.warn(`!! ${relative(REPO, file)} doesn't exist yet:  bundled as an empty module`)
          return { path: "page-runtime", namespace: "spell-ui" }
        }
        return undefined
      })
    }
  }
}

/** File in UI's `dist/` for an `@spell/ui[/...]` specifier. */
function uiDistPath(specifier) {
  const sub = specifier.slice("@spell/ui".length).replace(/^\//, "")
  if (!sub) return join(UI_DIR, "dist/index.js")
  if (sub.startsWith("icons/glyphs/")) return join(UI_DIR, "dist/glyphs", sub.slice("icons/glyphs/".length))
  return join(UI_DIR, "dist", `${sub}.js`)
}

/**
 * Source of `spell-ui:glyphs`:  static imports of `GLYPHS` + `Icons.register()` of each, under each name.
 * - Imports `Icons` from `@spell/ui/core` -- the same module `index.js` uses -- so this runs BEFORE any family
 *   defines (and so upgrades) its elements.
 * - Also points `Icons.glyphBase` at `glyphs/` beside the script:  a real URL, so an unbundled icon is a quiet
 *   miss (the `import()` is compiled away) rather than `new URL()` throwing on `import.meta.url`.
 */
function glyphsModule() {
  const imports = [`import { Icons } from "@spell/ui/core"`]
  const registers = [`Icons.glyphBase = new URL("glyphs/", document.currentScript?.src || location.href).href`]
  Object.entries(GLYPHS).forEach(([glyph, aliases], index) => {
    const [style, name] = glyph.split("/")
    imports.push(`import glyph${index} from "@spell/ui/icons/glyphs/${glyph}.js"`)
    for (const each of [name, ...aliases]) {
      registers.push(`Icons.register(${JSON.stringify(each)}, glyph${index}, "${style}")`)
    }
  })
  return [...imports, ...registers].join("\n")
}

////////////////
// ## Checks
////////////////

/** Fails if two copies of a Solid package made it into the bundle, e.g. the fork's own `node_modules`. */
function checkOneSolid(metafile) {
  const copies = new Map()
  for (const input of Object.keys(metafile.inputs)) {
    const match = input.match(/node_modules\/((?:@[\w-]+\/)?[\w-]+)\//)
    if (!match || !SOLID.test(match[1])) continue
    const root = input.slice(0, match.index + match[0].length)
    copies.set(match[1], new Set([...(copies.get(match[1]) ?? []), root]))
  }
  for (const [name, roots] of copies) {
    if (roots.size > 1) fail(`${name} bundled ${roots.size} times:\n  ${[...roots].join("\n  ")}`)
  }
  if (!copies.has("solid-js")) fail("solid-js isn't in the bundle:  check the resolver")
}

/** Fails if the output still needs ES module machinery a classic script on `file://` doesn't have. */
function checkClassicScript() {
  const code = readFileSync(OUTFILE, "utf8")
  const problems = [
    [/\bimport\s*\(/, "a runtime import()"],
    [/\bimport\.meta\b/, "import.meta"],
    [/^\s*(import|export)\s[\w{*"]/m, "a top-level import / export"]
  ].filter(([pattern]) => pattern.test(code))
  if (problems.length) fail(`${relative(REPO, OUTFILE)} still has ${problems.map(([, what]) => what).join(", ")}`)
}

////////////////
// ## Output
////////////////

/** Prints the bundle's size (raw, gzip) and any esbuild warnings. */
function report(warnings) {
  const code = readFileSync(OUTFILE)
  const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`
  console.log(`-- ${relative(REPO, OUTFILE)}  ${kb(code.length)}  (gzip ${kb(gzipSync(code).length)})`)
  for (const warning of warnings) console.warn(`!! ${warning}`)
}

/** Prints `message` and exits with an error. */
function fail(message) {
  console.error(`!! ${message}`)
  process.exit(1)
}
