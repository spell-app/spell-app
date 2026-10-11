import { P } from "$/parser"

import { ELEMENTS_JS_SUFFIX } from "./spell.types"

/**
 * The TARGETS spell compiles to:  a language and the runtime its code runs on, e.g. `js/solid`.
 * - Each target has:
 *   - its WRITER (a `P.ProgramWriter`), which writes the parsed tree as that language's code
 *   - the file its code goes in
 *   - what its runtime can do
 * - A project lists its own in `project.json`, `"targets": ["js/solid", "ts/solid"]` -- see `SpellProject.targets`.
 *   `spell compile --target <name>` picks one for a single run.
 * - `js/solid` is ALWAYS compiled:  it's what the editor, the runners and `spell run` run.
 */

/** A target spell compiles to -- see `TARGETS`. */
export type Target = {
  /** Its name, LANGUAGE/RUNTIME, e.g. `js/solid`. */
  name: string
  /** Writes its code. */
  writer: P.ProgramWriter
  /** End of its compiled output file's name, e.g. `.compiled.js`. */
  suffix: string
  /** What its runtime can do. */
  can: TargetAbilities
  /**
   * What checks its output after `spell compile`, a function in `$/spell/node`:
   * - `tsc`:  `typecheck()`
   * - `pyright`:  `pyright()`
   */
  checkedBy?: "tsc" | "pyright"
  /**
   * End of the name of its own words file, beside its output, e.g. `.py.en.json`:  spell's wording of each member,
   * keyed by THIS target's names (`move_to_pile`) -- see `SP.SpellWords.json()`.
   * - `js/solid`'s words are `<Project>.en.js`, which every runner loads -- see `SP.SpellProject.wordsFile`.
   */
  wordsSuffix?: string
  /**
   * End of the name of its PAGE's file, beside its output, e.g. `.elements.js`:  a program that draws, its drawing half
   * in javascript (`P.ElementsWriter`), for a page that mirrors the program running here (epic `python-target` P19).
   * - Written only for a project that draws.
   */
  elementsSuffix?: string
}

/** What a target's runtime can do -- checked while compiling, so a project asks only what its targets give. */
export type TargetAbilities = {
  /** Draw a UI:  `dom` into the page, `html` as text (e.g. server pages), or not at all. */
  draw: "dom" | "html" | false
}

/** Every target, by name. */
export const TARGETS: Record<string, Target> = {
  "js/solid": { name: "js/solid", writer: P.JSWriter.instance, suffix: ".compiled.js", can: { draw: "dom" } },
  // Solid TypeScript, as a person writes it:  JSX, decorators (`@prop`, `@drawn`), on the same runtime.
  // Checked by `tsc`;  never run as is:  it needs a build first (`buildTsx()` in `$/spell/node/buildTsx`)
  "ts/solid": {
    name: "ts/solid",
    writer: P.TSWriter.instance,
    suffix: ".compiled.tsx",
    can: { draw: "dom" },
    checkedBy: "tsc"
  },
  // Python as a person writes it, with PEP 8's names, on `spell_core` (`packages/core/py`).
  // Draws HTML as text:  Python has no page (epic `python-target`, Q2)
  py: {
    name: "py",
    writer: P.PyWriter.instance,
    suffix: ".compiled.py",
    can: { draw: "html" },
    wordsSuffix: ".py.en.json",
    elementsSuffix: ELEMENTS_JS_SUFFIX,
    checkedBy: "pyright"
  },
  // The same Python on `asyncio`:  a function that pauses is `async def`, and its callers await it
  // (epic `python-target`, Q3 B and Q18)
  "py/asyncio": {
    name: "py/asyncio",
    writer: P.PyAsyncWriter.instance,
    suffix: ".compiled.asyncio.py",
    can: { draw: "html" },
    elementsSuffix: ELEMENTS_JS_SUFFIX,
    checkedBy: "pyright"
  }
}

/** The target everything runs:  always compiled -- see the module docs. */
export const RUNNING_TARGET = "js/solid"

/** Target `name` -- throws, listing the targets there are, if there's no such target. */
export function targetFor(name: string): Target {
  const target = TARGETS[name]
  if (!target) {
    throw new P.ParserError({
      message: `There's no target '${name}':  try ${Object.keys(TARGETS).join(", ")}.`,
      activity: "SP.targetFor",
      params: { name }
    })
  }
  return target
}
