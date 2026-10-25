import { readdirSync, readFileSync } from "fs"
import JSON5 from "json5"
import { resolve } from "path"
import { describe, expect, test } from "vite-plus/test"

import { SP } from "spell-parser/spell"
import { parseSpellProject, type SpellSourceFile } from "spell-parser/spell/test"
import { SX } from "spell-parser/spellx"
import { projectFileFor } from "spell-parser/spell/node/projectFile"
import environment from "spell-app/spaces/server/node/environment"

// Spell UI's pack:  a spellx drawing names its components bare (`<button>`)
import "spell-app/spaces"

/**
 * Every built-in example, written as spellx by `SX.SpellxWriter` (epic `elemental-spell` P12),
 * compiles to the same javascript, file by file.
 * - Each project is parsed whole, then each `.spell` file converted, then the project parsed again with the
 *   `.spellx` files in their places:  each file's code must match, with no errors.
 * - Read where the examples are, never a frozen copy;  NOTHING is written:  the `.spellx` text lives in the test.
 * - Compared without comments and the `DECLARES` header, which carry line numbers.
 * - A drawing with the web's own elements (`<div>`, `<button>`) is written as code spell, in a `<spell>` chunk
 *   (epic `elemental-spell` J83):  so it means the same.
 */
const EXAMPLES_DIR = resolve(environment.systemFilesRoot, "examples")

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

  const converted = before.map(({ path, contents, match, scope }) => ({
    path: `${path}x`,
    contents: SX.SpellxWriter.write({ text: contents, match: match!, scope })
  }))
  const after = parseSpellProject(converted, { parentScope }).files
  for (const [index, file] of after.entries()) {
    expect(file.errors, file.path).toEqual([])
    expect(codeOf(file.compiled), file.path).toBe(codeOf(before[index]!.compiled))
  }
}

/** The `.spell` files of the project in `folder`, in its project file's order. */
function sourcesOf(folder: string): SpellSourceFile[] {
  const { imports } = JSON5.parse(readFileSync(projectFileFor(folder), "utf8")) as {
    imports: Array<{ path: string; active?: boolean }>
  }
  return imports
    .filter(({ path, active }) => active !== false && path.endsWith(".spell"))
    .map(({ path }) => ({ path, contents: readFileSync(resolve(folder, `.${path}`), "utf8") }))
}

/**
 * The examples kept in BOTH forms (epic `elemental-spell` P13, J54, J55):  a `.spellx` beside each `.spell`.
 * - The project file lists only the `.spell` files, which the app opens;  the `.spellx` twins are read here, by name
 *   (`Card.spell` => `Card.spellx` beside it), and parsed as a project of their own.
 * - Each `.spellx` must compile to the same javascript as its `.spell`, with no errors.
 * - A drawing with the web's own elements (`<div>`) is a `<spell>` chunk there, as written (J83).
 */
const PAIRED_EXAMPLES = [
  "Solitaire",
  "TaskList",
  "tic-tac-toe",
  "bill-splitter",
  "calculator",
  "flash-cards",
  "habit-tracker",
  "Solitario",
  "ListaDeTareas"
]

/** The paired examples whose `.spellx` can't compile the same today, and why:  each an item on the epic page. */
const PAIR_GAPS: Record<string, string> = {
  Solitario: KNOWN_GAPS.Solitario!
}

describe("the examples kept as .spellx beside their .spell compile to the same javascript", () => {
  for (const name of PAIRED_EXAMPLES) {
    const known = PAIR_GAPS[name]
    ;(known ? test.fails : test)(known ? `${name} -- known gap, ${known}` : name, () => pairCompilesTheSame(name))
  }
})

/** Example `name`'s `.spellx` files, beside its `.spell` files, compile to the same javascript, file by file. */
function pairCompilesTheSame(name: string) {
  const folder = resolve(EXAMPLES_DIR, name)
  const sources = sourcesOf(folder)
  const parentScope = SP.Language.rootScopeFor([...new Set(sources.map(({ path }) => SP.Language.forFile(path)))])
  const before = parseSpellProject(sources, { parentScope }).files
  const twins = sources.map(({ path }) => ({
    path: `${path}x`,
    contents: readFileSync(resolve(folder, `.${path}x`), "utf8")
  }))
  const after = parseSpellProject(twins, { parentScope }).files
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
