/**
 * Node module hooks for `runProject.ts`, the child process of `spell run` / `spell test`:
 * they do the job of the browser's import map, so compiled spell runs under node.
 * - `@spell/core` => spell's runtime, `core`'s `src/index.ts` -- run through `tsx`, which loads first.
 * - `@spell/project/<id>` => that project's compiled javascript, for a project which imports another.
 * - `@spell/elements` => a stand-in, `spellElements.mjs` (epic `drawable-thing` P10):
 *   what compiled TypeScript's element classes build on, with no Spell UI, which can't load here.
 * - Solid's packages => their browser builds, which the runtime draws with (`SOLID`).
 *   - Found from `@spell/core`'s folder, whoever imports them.
 *   - So a program built from Solid TypeScript (`ts/solid`, see `buildTsx()`), in a temp folder outside the repo,
 *     gets the SAME Solid its runtime draws with:  one Solid, as on a page.
 * - Where each is comes from env var `SPELL_RUN` -- see `CLI.RunSpec`.
 * - SIDE EFFECT:  registers itself, so `node --import <this file>` is all it takes.
 * - NOTE: plain javascript:  node loads it with `--import`, before anything is compiled.
 */
import { register } from "node:module"

/** Where things are, from the parent process. */
const spec = JSON.parse(process.env.SPELL_RUN ?? "{}")

/**
 * Solid's packages, which spell's runtime draws with:  resolved to their BROWSER builds, as on a page.
 * - Node's own are the server builds, which can't draw.
 * - Only these:  others (`chalk` ...) keep their node builds.
 */
const SOLID = /^(solid-js|@solidjs\/(web|signals|h))(\/|$)/

/** The stand-in for `@spell/elements`, beside us. */
const SPELL_ELEMENTS = new URL("./spellElements.mjs", import.meta.url).href

/** Resolve the three kinds of spell import, and Solid's packages;  leave everything else to node. */
export async function resolve(specifier, context, next) {
  if (SOLID.test(specifier)) {
    return next(specifier, { ...context, parentURL: spec.core, conditions: ["browser", ...context.conditions] })
  }
  if (specifier === "@spell/core") return next(spec.core, context)
  if (specifier === "@spell/elements") return { url: SPELL_ELEMENTS, shortCircuit: true }
  const project = specifier.startsWith("@spell/project/") && spec.projects?.[decodeURI(specifier.slice(15))]
  return project ? { url: project, shortCircuit: true } : next(specifier, context)
}

register(import.meta.url)
