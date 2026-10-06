import { P } from "$/parser"

/**
 * The TARGETS spell compiles to:  a language and the runtime its code runs on, e.g. `js/solid`.
 * - Each has its WRITER (`P.Writer`:  the tree as that language's code), the file its code goes in, and what its
 *   runtime can do.
 * - A project lists its own in `project.json`, `"targets": ["js/solid", "ts/solid"]` -- see `SpellProject.targets`;
 *   `spell compile --target <name>` picks one for a single run.
 * - `js/solid` is ALWAYS compiled:  it's what the editor, the runners and `spell run` run.
 */

/** A target spell compiles to -- see `TARGETS`. */
export type Target = {
  /** Its name, LANGUAGE/RUNTIME, e.g. `js/solid`. */
  name: string
  /** Writes its code. */
  writer: P.Writer
  /** End of its compiled output file's name, e.g. `.compiled.js`. */
  suffix: string
  /** What its runtime can do. */
  can: TargetAbilities
}

/** What a target's runtime can do -- checked while compiling, so a project asks only what its targets give. */
export type TargetAbilities = {
  /** Draw a UI:  `dom` into the page, `html` as text (e.g. server pages), or not at all. */
  draw: "dom" | "html" | false
}

/** Every target, by name. */
export const TARGETS: Record<string, Target> = {
  "js/solid": { name: "js/solid", writer: P.JSWriter.instance, suffix: ".compiled.js", can: { draw: "dom" } }
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
