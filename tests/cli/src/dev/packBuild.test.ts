import { spawnSync } from "child_process"
import {
  appendFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from "fs"
import { tmpdir } from "os"
import { dirname, join } from "path"
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test"

import { CLI } from "$/cli"

/**
 * ONE throwaway checkout, with a tiny pack in it:  `pack new` + `pack element` (unbuilt), on copies of a monorepo's
 *   root files (`fixtures/monorepo/`).
 * - `packages/ui` is a link to Spell UI (the build needs its `baseConfig()`), and `node_modules` to the install's:
 *   the pack's `tsconfig.json` extends `spell-kit/toolchain/tsconfig.base.json`, and its elements
 *   import Spell UI by its npm name (`@spell-app/ui/core`)
 * - the tests run in order
 */
const ROOT = realpathSync(mkdtempSync(join(tmpdir(), "pack-build-")))
afterAll(() => rmSync(ROOT, { recursive: true, force: true }))

/** The pack's folder, and its card family's. */
const PACK = join(ROOT, "packages", "demo")
const CARD = join(PACK, "components", "demo-card")

/** `spell`, from this checkout's source. */
const SPELL = join(CLI.REPO_ROOT, "cli", "bin", "spell.mjs")

/** A monorepo checkout's root files, frozen (`fixtures/monorepo/README.md`):  what `pack new` wires a pack into. */
const MONOREPO = join(import.meta.dirname, "fixtures", "monorepo")

/** The install `node_modules` this checkout runs on:  the nearest one above it (the top repo `spell`'s). */
function installedModules(): string {
  for (let dir = CLI.REPO_ROOT; ; dir = dirname(dir)) {
    if (existsSync(join(dir, "node_modules", "@spell-app"))) return join(dir, "node_modules")
    if (dirname(dir) === dir) throw new Error(`no node_modules above ${CLI.REPO_ROOT}`)
  }
}

beforeAll(async () => {
  for (const file of ["package.json", "tsconfig.base.json"]) cpSync(join(MONOREPO, file), join(ROOT, file))
  mkdirSync(join(ROOT, "packages"))
  // Spell UI's folder, as the install has it (spell-ui, beside spell-app in the top repo)
  symlinkSync(realpathSync(join(installedModules(), "@spell-app", "ui")), join(ROOT, "packages", "ui"))
  symlinkSync(installedModules(), join(ROOT, "node_modules"))
  await CLI.newPack(ROOT, "demo", { prefix: "demo-", build: false })
  await CLI.newElement(ROOT, "demo", "demo-card", { build: false })
})

/**
 * `spell dev pack build` / `check`, through the CLI:  the kit's pack tooling (`ComponentPack`, its own tests in
 * the kit's `tests/element/tools/`) on a pack found by name in a checkout, its paths relative to the checkout.
 */
describe("CLI.buildPack() / CLI.checkPack()", () => {
  test("an unbuilt pack is STALE:  every generated file missing", async () => {
    expect((await CLI.checkPack(ROOT, "demo")).stale).toEqual([
      "packages/demo/components/__pack/demo.catalog.ts:  missing",
      "packages/demo/components/__pack/demo.entry.ts:  missing",
      "packages/demo/components/__pack/demo.pack.js:  missing"
    ])
  })

  test("builds ONE classic script:  an IIFE taking Solid and Spell UI from `SpellUI.packModules`, registering itself", async () => {
    const report = await CLI.buildPack(ROOT, "demo")
    expect(report).toMatchObject({
      pack: "demo",
      tags: ["demo-card"],
      files: [
        "packages/demo/components/__pack/demo.catalog.ts",
        "packages/demo/components/__pack/demo.entry.ts",
        "packages/demo/components/__pack/demo.pack.js"
      ]
    })
    const script = readFileSync(join(PACK, "components", "__pack", "demo.pack.js"), "utf8")
    expect(script.split("\n")[0]).toBe(
      `/* GENERATED -- do not edit:  \`spell dev pack build demo\`.  sources:  ${report.hash} */`
    )
    expect(script.split("\n")[1]).toMatch(/^\(function\(/)
    expect(script).toMatch(
      /\}\)\(globalThis\.SpellUI\.packModules\[`@solidjs\/web`\],globalThis\.SpellUI\.packModules\[`\$\/ui\/core`\]\);\s*$/
    )
    expect(script).not.toMatch(/\bimport\s*[{(*]|\bexport\s*\{/)
    expect(script).toContain("registerPack({name:`demo`,prefix:`demo-`")
    expect(script).toContain(":host")
    const catalog = readFileSync(join(PACK, "components", "__pack", "demo.catalog.ts"), "utf8")
    expect(catalog).toContain(`// sources:  ${report.hash}\n`)
    expect(catalog).toContain(`"demo-card": {"folder":"demo-card","skeleton":{"height":"2em"}}`)
    expect(readFileSync(join(PACK, "components", "__pack", "demo.entry.ts"), "utf8")).toContain(
      `import("../demo-card")`
    )
  }, 60_000)

  // After an edit, through the CLI:  a fresh process reads the vocabularies again (`import()` caches them here)

  test("CURRENT once built;  STALE after a vocabulary edit, and current again after a rebuild", async () => {
    expect(await CLI.checkPack(ROOT, "demo")).toMatchObject({ stale: [] })
    expect(spell("check")).toEqual({ status: 0, out: "demo:  current\n" })
    const vocabulary = join(CARD, "DemoCard.en.ts")
    writeFileSync(vocabulary, readFileSync(vocabulary, "utf8").replace(`skeleton: "2 tall"`, `skeleton: "5 tall"`))
    expect((await CLI.checkPack(ROOT, "demo")).stale).toEqual([
      "packages/demo/components/__pack/demo.catalog.ts:  built from older sources",
      "packages/demo/components/__pack/demo.pack.js:  built from older sources"
    ])
    expect(spell("check")).toEqual({
      status: CLI.EXIT.ERRORS,
      out:
        "demo:  STALE\n  packages/demo/components/__pack/demo.catalog.ts:  built from older sources\n" +
        "  packages/demo/components/__pack/demo.pack.js:  built from older sources\nfix:  spell dev pack build demo\n"
    })
    expect(spell("build", "demo").status).toBe(0)
    expect(readFileSync(join(PACK, "components", "__pack", "demo.catalog.ts"), "utf8")).toContain(`"height":"5em"`)
    expect(spell("check", "demo").status).toBe(0)
  }, 60_000)

  test("a test file's edit never makes the pack stale:  tests aren't in it", () => {
    appendFileSync(join(CARD, "DemoCard.test.tsx"), "// more\n")
    expect(spell("check").status).toBe(0)
  })

  test("a hand edit of the catalog is caught, though its hash still matches", () => {
    const catalog = join(PACK, "components", "__pack", "demo.catalog.ts")
    writeFileSync(catalog, readFileSync(catalog, "utf8").replace("5em", "6em"))
    expect(spell("check").out).toContain("demo.catalog.ts:  not what a build writes (edited by hand?)")
    expect(spell("build", "demo").status).toBe(0)
  }, 60_000)

  test("refuses an import of Spell UI the page can't share, and a tag without the prefix", () => {
    const element = join(CARD, "DemoCard.tsx")
    const source = readFileSync(element, "utf8")
    writeFileSync(element, `import "$/ui/util"\n${source}`)
    expect(spell("build", "demo").out).toContain("imports '$/ui/util', which the page can't share")
    writeFileSync(element, source)
    const vocabulary = join(CARD, "DemoCard.en.ts")
    const words = readFileSync(vocabulary, "utf8")
    writeFileSync(vocabulary, words.replace(`tag: "demo-card"`, `tag: "x-card"`))
    expect(spell("build", "demo")).toMatchObject({ status: CLI.EXIT.ERRORS })
    expect(spell("build", "demo").out).toContain("every tag must start 'demo-', but these don't:  x-card")
    writeFileSync(vocabulary, words)
  }, 60_000)
})

// epic `epic-eject` J14:  spell-epic is one package, its pack in `src/`, `$/epics` that folder itself
describe("a pack at a checkout's root", () => {
  test("found by the name its root `package.json` gives it:  Spell UI's pack, `components/` and `$/<name>` in its `dir`", () => {
    const repo = realpathSync(mkdtempSync(join(tmpdir(), "pack-root-")))
    const src = join(repo, "src")
    writeFileSync(
      join(repo, "package.json"),
      JSON.stringify({ spellPack: { name: "flat", prefix: "flat-", dir: "src" }, scripts: {} })
    )
    try {
      expect(CLI.readPack(repo, "flat")).toMatchObject({ name: "flat", prefix: "flat-", dir: src, src, folder: repo })
      expect(CLI.packNames(repo)).toEqual(["flat"])
      expect(() => CLI.readPack(repo, "other")).toThrow(/isn't a component pack;  make one with `spell dev pack new/)
    } finally {
      rmSync(repo, { recursive: true, force: true })
    }
  })
})

/** `spell dev pack <args>` run as a person would, in the throwaway pack's folder:  its exit code and output. */
function spell(...args: string[]) {
  const run = spawnSync(process.execPath, [SPELL, "dev", "pack", ...args], { cwd: PACK, encoding: "utf8" })
  return { status: run.status, out: run.stdout + run.stderr }
}
