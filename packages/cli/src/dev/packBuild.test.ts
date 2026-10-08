import { spawnSync } from "child_process"
import {
  appendFileSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from "fs"
import { tmpdir } from "os"
import { join } from "path"
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test"

import { CLI } from "$/cli"

/**
 * ONE throwaway checkout, with a tiny pack in it:  `pack new` + `pack element` (unbuilt), on copies of the root files,
 * with `packages/ui` a link to this checkout's (the build needs Spell UI's `baseConfig()`).  The tests run in order.
 */
const ROOT = realpathSync(mkdtempSync(join(tmpdir(), "pack-build-")))
afterAll(() => rmSync(ROOT, { recursive: true, force: true }))

/** The pack's folder, and its card family's. */
const PACK = join(ROOT, "packages", "demo")
const CARD = join(PACK, "components", "demo-card")

/** `spell`, from this checkout's source. */
const SPELL = join(CLI.REPO_ROOT, "packages", "cli", "bin", "spell.mjs")

beforeAll(async () => {
  for (const file of ["package.json", "tsconfig.base.json"]) cpSync(join(CLI.REPO_ROOT, file), join(ROOT, file))
  mkdirSync(join(ROOT, "packages"))
  symlinkSync(join(CLI.REPO_ROOT, "packages", "ui"), join(ROOT, "packages", "ui"))
  await CLI.newPack(ROOT, "demo", { prefix: "demo-", build: false })
  await CLI.newElement(ROOT, "demo", "demo-card", { build: false })
})

describe("CLI.buildPack() / CLI.checkPack()", () => {
  test("an unbuilt pack is STALE:  every generated file missing", async () => {
    expect((await CLI.checkPack(ROOT, "demo")).stale).toEqual([
      "packages/demo/pack/demo.catalog.ts:  missing",
      "packages/demo/pack/demo.entry.ts:  missing",
      "packages/demo/pack/demo.pack.js:  missing"
    ])
  })

  test("builds ONE classic script:  an IIFE taking Solid and Spell UI from `SpellUI.packModules`, registering itself", async () => {
    const report = await CLI.buildPack(ROOT, "demo")
    expect(report).toMatchObject({
      pack: "demo",
      tags: ["demo-card"],
      files: [
        "packages/demo/pack/demo.catalog.ts",
        "packages/demo/pack/demo.entry.ts",
        "packages/demo/pack/demo.pack.js"
      ]
    })
    const script = readFileSync(join(PACK, "pack", "demo.pack.js"), "utf8")
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
    const catalog = readFileSync(join(PACK, "pack", "demo.catalog.ts"), "utf8")
    expect(catalog).toContain(`// sources:  ${report.hash}\n`)
    expect(catalog).toContain(`"demo-card": {"folder":"demo-card","skeleton":{"height":"2em"}}`)
    expect(readFileSync(join(PACK, "pack", "demo.entry.ts"), "utf8")).toContain(`import("../components/demo-card")`)
  }, 60_000)

  // After an edit, through the CLI:  a fresh process reads the vocabularies again (`import()` caches them here)

  test("CURRENT once built;  STALE after a vocabulary edit, and current again after a rebuild", async () => {
    expect(await CLI.checkPack(ROOT, "demo")).toMatchObject({ stale: [] })
    expect(spell("check")).toEqual({ status: 0, out: "demo:  current\n" })
    const vocabulary = join(CARD, "demo-card.vocabulary.en.ts")
    writeFileSync(vocabulary, readFileSync(vocabulary, "utf8").replace(`height: "2em"`, `height: "5em"`))
    expect((await CLI.checkPack(ROOT, "demo")).stale).toEqual([
      "packages/demo/pack/demo.catalog.ts:  built from older sources",
      "packages/demo/pack/demo.pack.js:  built from older sources"
    ])
    expect(spell("check")).toEqual({
      status: CLI.EXIT.ERRORS,
      out:
        "demo:  STALE\n  packages/demo/pack/demo.catalog.ts:  built from older sources\n" +
        "  packages/demo/pack/demo.pack.js:  built from older sources\nfix:  spell dev pack build demo\n"
    })
    expect(spell("build", "demo").status).toBe(0)
    expect(readFileSync(join(PACK, "pack", "demo.catalog.ts"), "utf8")).toContain(`"height":"5em"`)
    expect(spell("check", "demo").status).toBe(0)
  }, 60_000)

  test("a test file's edit never makes the pack stale:  tests aren't in it", () => {
    appendFileSync(join(CARD, "demo-card.test.tsx"), "// more\n")
    expect(spell("check").status).toBe(0)
  })

  test("a hand edit of the catalog is caught, though its hash still matches", () => {
    const catalog = join(PACK, "pack", "demo.catalog.ts")
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
    const vocabulary = join(CARD, "demo-card.vocabulary.en.ts")
    const words = readFileSync(vocabulary, "utf8")
    writeFileSync(vocabulary, words.replace(`tag: "demo-card"`, `tag: "x-card"`))
    expect(spell("build", "demo")).toMatchObject({ status: CLI.EXIT.ERRORS })
    expect(spell("build", "demo").out).toContain("every tag must start 'demo-', but these don't:  x-card")
    writeFileSync(vocabulary, words)
  }, 60_000)

  // The hash follows the elements' imports:  `src/` may hold node-only code (a tool, its tests) the script never bundles

  test("a file under `src/` the elements don't import never makes the pack stale", () => {
    const hash = CLI.packHash(CLI.readPack(ROOT, "demo"))
    mkdirSync(join(PACK, "src", "tool"), { recursive: true })
    writeFileSync(join(PACK, "src", "tool", "Tool.ts"), `export const TOOL = 1\n`)
    expect(CLI.packHash(CLI.readPack(ROOT, "demo"))).toBe(hash)
    writeFileSync(join(PACK, "src", "tool", "Tool.ts"), `export const TOOL = 2\n`)
    expect(CLI.packHash(CLI.readPack(ROOT, "demo"))).toBe(hash)
  })

  test("a file under `src/` the elements DO import, directly or through another, or as `?inline` CSS, does", () => {
    const pack = CLI.readPack(ROOT, "demo")
    mkdirSync(join(PACK, "src", "shared"), { recursive: true })
    writeFileSync(join(PACK, "src", "shared", "index.ts"), `export * from "./words"\n`)
    writeFileSync(join(PACK, "src", "shared", "words.ts"), `export const WORDS = 1\n`)
    writeFileSync(join(PACK, "src", "shared", "look.css"), `:host { color: red }\n`)
    const element = join(CARD, "DemoCard.tsx")
    const source = readFileSync(element, "utf8")
    writeFileSync(
      element,
      `import { WORDS } from "$/demo/shared"\nimport look from "../../src/shared/look.css?inline"\n${source}`
    )
    const hashes = [CLI.packHash(pack)]
    writeFileSync(join(PACK, "src", "shared", "index.ts"), `export * from "./words"\nexport const MORE = 1\n`)
    hashes.push(CLI.packHash(pack))
    writeFileSync(join(PACK, "src", "shared", "words.ts"), `export const WORDS = 2\n`)
    hashes.push(CLI.packHash(pack))
    writeFileSync(join(PACK, "src", "shared", "look.css"), `:host { color: blue }\n`)
    hashes.push(CLI.packHash(pack))
    expect(new Set(hashes).size).toBe(4)
    expect(CLI.packSources(pack).map((file) => file.slice(PACK.length + 1))).toEqual([
      "components/demo-card/DemoCard.tsx",
      "components/demo-card/demo-card.css",
      "components/demo-card/demo-card.fallback.ts",
      "components/demo-card/demo-card.types.ts",
      "components/demo-card/demo-card.vocabulary.en.ts",
      "components/demo-card/index.ts",
      "components/index.ts",
      "src/shared/index.ts",
      "src/shared/look.css",
      "src/shared/words.ts"
    ])
    writeFileSync(element, source)
  })
})

/** `spell dev pack <args>` run as a person would, in the throwaway pack's folder:  its exit code and output. */
function spell(...args: string[]) {
  const run = spawnSync(process.execPath, [SPELL, "dev", "pack", ...args], { cwd: PACK, encoding: "utf8" })
  return { status: run.status, out: run.stdout + run.stderr }
}
