import { existsSync, readdirSync, readFileSync } from "fs"
import JSON5 from "json5"
import { resolve } from "path"
import { describe, expect, test } from "vite-plus/test"

import { SP } from "spell-parser/spell"
import { parseSpellProject, type SpellSourceFile } from "spell-parser/spell/test"
import { SX } from "spell-parser/spellx"
import { projectFileFor } from "spell-parser/spell/node/projectFile"
import environment from "spell-app/spaces/server/node/environment"
import { CODE_SPELL_TWINS_DIR } from "spell-app/spaces/test"

// Spell UI's pack:  a spellx drawing names its components bare (`<button>`)
import "spell-app/spaces"

/**
 * Every built-in example, written as spellx by `SX.SpellxWriter` (epic `elemental-spell` P12),
 * compiles to the same javascript, file by file:  the round trip `.spell` => spellx => javascript, in memory.
 * - Each project is parsed whole, then each `.spell` file converted, then the project parsed again with the
 *   `.spellx` files in their places:  each file's code must match, with no errors.
 *   - An example written in spellx (Solitaire, Task List) has nothing to convert:  it must compile with no errors.
 * - Read where the examples are, never a frozen copy;  NOTHING is written:  the `.spellx` text lives in the test.
 * - So the editor's "Show as Spellx" view of any example means what its `.spell` file does.
 * - Compared without comments and the `DECLARES` header, which carry line numbers.
 * - A drawing with the web's own elements (`<div>`, `<button>`) is written as code spell, in a `<spell>` chunk
 *   (epic `elemental-spell` J83):  so it means the same.
 */
const EXAMPLES_DIR = resolve(environment.systemFilesRoot, "examples")

/**
 * Each example's OTHER form, kept as a test fixture beside the tests:  one file per file of the example
 * (Owen, 2026-10-25, epic `elemental-spell` J95:  "one file").
 * - An example written as code spell:  its spellx in `__spellx__/<Example>/<File>.spellx`.
 * - An example written in spellx, the showcases (Solitaire, Task List):  its code spell in `__spell__/<Example>/<File>.spell`.
 * - NOT in the examples:  a template lives in ONE file, `.spell` or `.spellx`, never both.
 */
const SPELLX_FIXTURES_DIR = resolve(environment.repoDir, "tests", "spell", "__spellx__")
const SPELL_FIXTURES_DIR = CODE_SPELL_TWINS_DIR

/**
 * The examples that don't convert to the same program yet, and why:  each an item on the epic page.
 * - `test.fails`:  once one converts, its test fails, to say so;  take it off this list.
 */
const KNOWN_GAPS: Record<string, string> = {
  Solitario: "C44:  a Spanish spellx action with a built-in template's words is called as the template's"
}

describe("every example converts to spellx, and compiles to the same javascript", () => {
  const examples = readdirSync(EXAMPLES_DIR, { withFileTypes: true }).filter((it) => it.isDirectory())
  for (const { name } of examples) {
    const known = KNOWN_GAPS[name]
    ;(known ? test.fails : test)(known ? `${name} -- known gap, ${known}` : name, () => convertsTheSame(name))
  }
})

/** Example `name`, converted, compiles to the same javascript, file by file, with no errors. */
function convertsTheSame(name: string) {
  const sources = sourcesOf(resolve(EXAMPLES_DIR, name))
  const parentScope = SP.Language.rootScopeFor([...new Set(sources.map(({ path }) => SP.Language.forFile(path)))])
  const before = parseSpellProject(sources, { parentScope }).files
  expect(before.flatMap((file) => file.errors)).toEqual([])

  // a file already in spellx stays as it is
  const converted = before.map(({ path, contents, match, scope }) =>
    path.endsWith(".spellx")
      ? { path, contents }
      : { path: `${path}x`, contents: SX.SpellxWriter.write({ text: contents, match: match!, scope }) }
  )
  const after = parseSpellProject(converted, { parentScope }).files
  for (const [index, file] of after.entries()) {
    expect(file.errors, file.path).toEqual([])
    expect(codeOf(file.compiled), file.path).toBe(codeOf(before[index]!.compiled))
  }
}

/** The spell files (`.spell` and `.spellx`) of the project in `folder`, in its project file's order. */
function sourcesOf(folder: string): SpellSourceFile[] {
  const { imports } = JSON5.parse(readFileSync(projectFileFor(folder), "utf8")) as {
    imports: Array<{ path: string; active?: boolean }>
  }
  return imports
    .filter(({ path, active }) => active !== false && /\.spellx?$/.test(path))
    .map(({ path }) => ({ path, contents: readFileSync(resolve(folder, `.${path}`), "utf8") }))
}

/**
 * The examples' fixtures in their other form (`SPELLX_FIXTURES_DIR`, `SPELL_FIXTURES_DIR`), hand-kept since P13
 * (J54, J55), compile to the same javascript as the example's own files, file by file, with no errors.
 * - `Deck.spell` in an example => `__spellx__/<Example>/Deck.spellx`;  `Card.spellx` => `__spell__/<Example>/Card.spell`.
 * - A drawing with the web's own elements (`<div>`) is a `<spell>` chunk, or an `<html>` block, there (J83).
 */
const FIXTURE_EXAMPLES = [SPELLX_FIXTURES_DIR, SPELL_FIXTURES_DIR].flatMap((dir) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true })
        .filter((it) => it.isDirectory())
        .map((it) => it.name)
    : []
)

/** The fixtures that can't compile the same today, and why:  each an item on the epic page. */
const FIXTURE_GAPS: Record<string, string> = {
  Solitario: KNOWN_GAPS.Solitario!
}

describe("the examples' spellx fixtures compile to the same javascript as the examples", () => {
  for (const name of FIXTURE_EXAMPLES) {
    const known = FIXTURE_GAPS[name]
    ;(known ? test.fails : test)(known ? `${name} -- known gap, ${known}` : name, () => fixtureCompilesTheSame(name))
  }
})

// J95:  a template lives in ONE file, so its other form is a view the editor writes, never a second file to drift
test("no example keeps a template in both forms:  no `Card.spellx` beside `Card.spell`", () => {
  const both = readdirSync(EXAMPLES_DIR, { recursive: true, encoding: "utf8" })
    .filter((path) => path.endsWith(".spellx"))
    .filter((path) => existsSync(resolve(EXAMPLES_DIR, path.slice(0, -1))))
  expect(both).toEqual([])
})

/** Example `name`'s fixtures compile to the same javascript as its own files, file by file. */
function fixtureCompilesTheSame(name: string) {
  const sources = sourcesOf(resolve(EXAMPLES_DIR, name))
  const parentScope = SP.Language.rootScopeFor([...new Set(sources.map(({ path }) => SP.Language.forFile(path)))])
  const before = parseSpellProject(sources, { parentScope }).files
  const fixtures = sources.map(({ path }) => {
    const twin = path.endsWith(".spellx") ? path.slice(0, -1) : `${path}x`
    const dir = path.endsWith(".spellx") ? SPELL_FIXTURES_DIR : SPELLX_FIXTURES_DIR
    return { path: twin, contents: readFileSync(resolve(dir, name, `.${twin}`), "utf8") }
  })
  const after = parseSpellProject(fixtures, { parentScope }).files
  for (const [index, file] of after.entries()) {
    expect(file.errors, file.path).toEqual([])
    expect(codeOf(file.compiled), file.path).toBe(codeOf(before[index]!.compiled))
  }
}

/** `compiled` without its `DECLARES` header, comment lines and blank lines:  they carry line numbers. */
function codeOf(compiled: string): string {
  return compiled
    .replace(/\/\*! SPELL: DECLARES[^]*?\*\//g, "")
    .split("\n")
    .filter((line) => line.trim() && !line.trim().startsWith("//"))
    .join("\n")
}
