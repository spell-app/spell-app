import { expect } from "vite-plus/test"

import {
  core,
  Thing,
  List,
  App,
  on,
  off,
  once,
  trigger,
  positionOf,
  position,
  spellPosition,
  endPosition,
  withSpellPositions
} from "$/core"
import { P } from "$/parser"
import { SP } from "$/spell"

import { parseSpellProject } from "./parseSpellProject"

/**
 * Spell `lines` compiled as one file, then RUN on `core`'s source:  what a program does, end to end.
 * - Returns a function that runs it and hands back the top-level variables `names` lists, by spell's names:
 *   `run("deck, first_pile")` => `{ deck, first_pile }`.
 * - Each run is a fresh program:  its classes and things are new.
 * - Its things don't register in `core.things` (`quietly()`).
 * - Fails the test if the file has parse errors.
 */
export function runSpell(lines: string[]): (names: string) => Record<string, unknown> {
  const { files } = parseSpellProject([{ path: "/Test.spell", contents: lines.join("\n") }])
  const [file] = files
  expect(file!.errors).toEqual([])
  const parts = files.map(({ match, compiled }) => (match?.AST instanceof P.ASTStatementGroup ? match.AST : compiled))
  const code = SP.SpellProject.combineCompiled(parts)
    .split("\n")
    .filter((line) => !line.startsWith("import "))
    .join("\n")
    .replace(/^export /gm, "")
  return (names: string) => {
    // each top-level variable by spell's name, e.g. `first_pile`:  compiled javascript calls it `firstPile`
    const named = names
      .split(/,\s*/)
      .filter(Boolean)
      .map((name) => `${name}: ${P.JSWriter.instance.nameOf(name)}`)
    const body = `${code}\nreturn { ${named.join(", ")} }`
    // `@spell/core`'s helpers it imports by name, e.g. `trigger()`, as the import it lost would give them
    const imported = { on, off, once, trigger, positionOf, position, spellPosition, endPosition, withSpellPositions }
    // oxlint-disable-next-line no-implied-eval -- running compiled spell, as a runner does, is the test
    const fn = new Function("core", "Thing", "List", "App", ...Object.keys(imported), body)
    const run = () => fn(core, Thing, List, App, ...Object.values(imported))
    return core.things.quietly(run) as Record<string, unknown>
  }
}
