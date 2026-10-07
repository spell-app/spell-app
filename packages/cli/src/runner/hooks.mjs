/**
 * Node module hooks for `runProject.ts`, the child process of `spell run` / `spell test`:  they do the job of
 * the browser's import map, so compiled spell runs under node.
 * - `@spell/core` => spell's runtime, `core`'s `src/index.ts` -- run through `tsx`, which loads first.
 * - `@spell/project/<id>` => that project's compiled javascript, for a project which imports another.
 * - Where each is comes from env var `SPELL_RUN` -- see `CLI.RunSpec`.
 * - SIDE EFFECT:  registers itself, so `node --import <this file>` is all it takes.
 * - NOTE: plain javascript:  node loads it with `--import`, before anything is compiled.
 */
import { register } from "node:module"

/** Where things are, from the parent process. */
const spec = JSON.parse(process.env.SPELL_RUN ?? "{}")

/** Resolve the two kinds of spell import;  leave everything else to node. */
export async function resolve(specifier, context, next) {
  if (specifier === "@spell/core") return next(spec.spellCore, context)
  const project = specifier.startsWith("@spell/project/") && spec.projects?.[decodeURI(specifier.slice(15))]
  return project ? { url: project, shortCircuit: true } : next(specifier, context)
}

register(import.meta.url)

// a fake page (`spec.dom`, the core contract test):  the same "random" numbers every run, so a shuffle is the same
// on every target -- here, before lodash loads and keeps its own `Math.random`
if (spec.dom) {
  let seed = 1
  Math.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
}
