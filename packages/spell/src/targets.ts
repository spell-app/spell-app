import { P } from "$/parser"
import { PY } from "$/py"

import { COMPILED_JS_SUFFIX, COMPILED_PY_SUFFIX, COMPILED_TSX_SUFFIX, ELEMENTS_JS_SUFFIX } from "./spell.types"

/**
 * The TARGETS spell compiles to:  a language and the runtime its code runs on, e.g. `js/solid`.
 * - Each target has:
 *   - its WRITER (a `P.ProgramWriter`), which writes the parsed tree as that language's code
 *   - the file its code goes in
 *   - what its runtime can do
 * - A project lists its own in its project file, e.g. `"targets": ["js/solid", "ts/solid"]` (`SpellProject.targets`).
 * - `spell compile --target <name>` picks one for a single run.
 * - `js/solid` is ALWAYS compiled:  it's what the editor, the runners and `spell run` run.
 */

/** A target spell compiles to -- see `TARGETS`. */
export type Target = {
  /** Its name, LANGUAGE/RUNTIME, e.g. `js/solid`. */
  name: string
  /** Writes its code. */
  writer: P.ProgramWriter
  /** End of its compiled output file's name, e.g. `.spell.js`. */
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
   * End of the name of its own words file, beside its output, e.g. `.py.en.json5`.
   * - The file:  spell's wording of each member, keyed by THIS target's names (`move_to_pile`).
   *   See `SP.SpellWords.json()`.
   * - `js/solid`'s words are `<Project>.en.js`, which every runner loads -- see `SP.SpellProject.wordsFile`.
   */
  wordsSuffix?: string
  /**
   * End of the name of its PAGE's file, beside its output, e.g. `.elements.spell.js` (epic `python-target` P19).
   * - The file:  a program that draws, its drawing half in javascript (`PY.ElementsWriter`),
   *   for a page that mirrors the program running here.
   * - Written only for a project that draws.
   */
  elementsSuffix?: string
  /**
   * End of the name of its web APP's file, beside its output, e.g. `.app.py` (epic `python-target` P20).
   * - The file:  a Quart app serving the program, a game per visitor (`PY.quartApp()`).
   * - Written only for a project that draws, and only while nobody has edited it (`PY.isUneditedApp()`).
   */
  appSuffix?: string
}

/** What a target's runtime can do -- checked while compiling, so a project asks only what its targets give. */
export type TargetAbilities = {
  /** Draw a UI:  `dom` into the page, `html` as text (e.g. server pages), or not at all. */
  draw: "dom" | "html" | false
  /**
   * Run the program:  its top-level steps, e.g. `spell run`, and the core contract's runs.
   * - `false` for a library (`ts/lib`), which keeps only the classes;  every other target runs.
   */
  run?: false
}

/** Every target, by name. */
export const TARGETS: Record<string, Target> = {
  "js/solid": { name: "js/solid", writer: P.JSWriter.instance, suffix: COMPILED_JS_SUFFIX, can: { draw: "dom" } },
  // Solid TypeScript, as a person writes it, on the same runtime:  JSX, decorators (`@prop`, `@drawn`)
  // - checked by `tsc`
  // - never run as is:  it needs a build first (`buildTsx()` in `$/spell/node/buildTsx`)
  "ts/solid": {
    name: "ts/solid",
    writer: P.TSWriter.instance,
    suffix: COMPILED_TSX_SUFFIX,
    can: { draw: "dom" },
    checkedBy: "tsc"
  },
  // Python as a person writes it, with PEP 8's names, on `spell_core` (`packages/py/core`), on asyncio
  // (epic `python-target`, one target since P22):
  // - a function that pauses is `async def`, and its callers await it
  // - draws HTML as text (Q2)
  // - a program that draws also gets its page, `.elements.spell.js`, and its web app, `.app.py`
  py: {
    name: "py",
    writer: PY.PyWriter.instance,
    suffix: COMPILED_PY_SUFFIX,
    can: { draw: "html" },
    wordsSuffix: ".py.en.json5",
    elementsSuffix: ELEMENTS_JS_SUFFIX,
    appSuffix: ".app.py",
    checkedBy: "pyright"
  },
  // A LIBRARY (epic `people-and-orgs` P3):  the project's classes alone, as ONE TypeScript file,
  // for the repo's code to import
  // - no drawing, no top-level steps, the core with no Solid (`$/core/model`)
  // - `People.lib.ts`, committed beside its source and marked generated
  // - checked by `tsc`, as `ts/solid` is
  "ts/lib": {
    name: "ts/lib",
    writer: P.LibraryWriter.instance,
    suffix: ".lib.ts",
    can: { draw: false, run: false },
    checkedBy: "tsc"
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
