import { readdirSync, readFileSync } from "fs"
import { resolve } from "path"
import { describe, expect, test } from "vite-plus/test"

import { P } from "spell-parser/parser"
import { SP } from "spell-parser/spell"
import { parseSpellProject } from "spell-parser/spell/test"
import { SX } from "spell-parser/spellx"
import environment from "spell-app/spaces/server/node/environment"
import { importScopeIn } from "spell-app/spaces/test"

// Spell UI's pack:  a spellx drawing names its components bare (`<button>`)
import "spell-app/spaces"

/**
 * Every built-in NOTEBOOK (`@spell/notebooks`, epic `elemental-spell` P16) compiles cleanly, and means the same in
 * code spell:  written as code spell in memory (`SX.CodeSpellWriter`), it compiles to the same javascript.
 * - A notebook is only ever a `.spellx` file (Owen, 2026-10-25:  "one file.  notebooks are only `.spellx`"):
 *   its code spell is made here, never written beside it.
 * - Its bare names are written as the tags its own compile chose, as the editor's "Show as Code Spell" writes them:
 *   `<counter/>` is `<counter-counter/>`.
 * - Parsed under the projects it imports, as the editor parses it:  the Counter notebook draws the Counter example's
 *   counter (`@spell/examples/Counter`), so it keeps no template of its own.
 * - Compared without comments and the `DECLARES` header, which carry line numbers.
 */
const NOTEBOOKS_DIR = resolve(environment.systemFilesRoot, "notebooks")

describe("every notebook means the same in code spell", () => {
  const notebooks = readdirSync(NOTEBOOKS_DIR, { withFileTypes: true }).filter((it) => it.isDirectory())
  test("there's at least the Counter", () => expect(notebooks.map(({ name }) => name)).toContain("Counter"))
  for (const { name } of notebooks) test(name, () => meansTheSame(name))
})

/** Notebook `name`'s `.spellx` file compiles cleanly, and its code spell to the same javascript. */
function meansTheSame(name: string) {
  const path = `/${name}.spellx`
  const folder = resolve(NOTEBOOKS_DIR, name)
  const contents = readFileSync(resolve(folder, `${name}.spellx`), "utf8")
  const parentScope = importScopeIn(folder, [path])
  const [spellx] = parseSpellProject([{ path, contents }], { parentScope }).files
  expect(spellx!.errors).toEqual([])

  // each element's tag, as the parse chose it, by where it starts
  const tags = new Map<number, string>()
  const visit = (match: P.Match) => {
    const [element] = match.matched
    const data = match.data as { tagName?: string; children?: unknown[] }
    if (element instanceof P.JSXElementToken && data.tagName) tags.set(element.start, data.tagName)
    for (const inner of [...match.matched, ...(data.children ?? [])]) if (inner instanceof P.Match) visit(inner)
  }
  visit(spellx!.match!)
  const written = SX.CodeSpellWriter.write(contents, {
    path,
    componentTag: (word, start) => tags.get(start) ?? SP.ComponentPacks.tagFor(word, "en")
  })
  const [spell] = parseSpellProject([{ path: `/${name}.spell`, contents: written }], { parentScope }).files
  expect(spell!.errors).toEqual([])
  expect(codeOf(spell!.compiled)).toBe(codeOf(spellx!.compiled))
}

/** `compiled` without its comments and `DECLARES` headers. */
function codeOf(compiled: string): string {
  return compiled
    .replace(/\/\*! SPELL: DECLARES[^]*?\*\/\n?/g, "")
    .split("\n")
    .filter((line) => line.trim() && !line.trim().startsWith("//"))
    .join("\n")
}
