/**
 * Node module hooks for `runProject.ts`, the child process of `spell run` / `spell test`:  they do the job of
 * the browser's import map, so compiled spell runs under node.
 * - `@spell/core` => spell's runtime, `core`'s `src/index.ts` -- run through `tsx`, which loads first.
 * - `@spell/project/<id>` => that project's compiled javascript, for a project which imports another.
 * - Solid's packages => their browser builds, which the runtime draws with (`SOLID`).  Found from `@spell/core`'s
 *   folder, whoever imports them:  so a program built from Solid TypeScript (`ts/solid`, see `buildTsx()`), in a
 *   temp folder outside the repo, gets the SAME Solid its runtime draws with -- one Solid, as on a page.
 * - Where each is comes from env var `SPELL_RUN` -- see `CLI.RunSpec`.
 * - SIDE EFFECT:  registers itself, so `node --import <this file>` is all it takes.
 * - NOTE: plain javascript:  node loads it with `--import`, before anything is compiled.
 */
import { register } from "node:module"

/** Where things are, from the parent process. */
const spec = JSON.parse(process.env.SPELL_RUN ?? "{}")

/**
 * Solid's packages, which spell's runtime draws with:  resolved to their BROWSER builds, as on a page -- node's own
 * are the server builds, which can't draw.  Only these:  others (`chalk` ...) keep their node builds.
 */
const SOLID = /^(solid-js|@solidjs\/(web|signals|h))(\/|$)/

/** Resolve the two kinds of spell import, and Solid's packages;  leave everything else to node. */
export async function resolve(specifier, context, next) {
  if (SOLID.test(specifier)) {
    return next(specifier, { ...context, parentURL: spec.spellCore, conditions: ["browser", ...context.conditions] })
  }
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
