/**
 * `$/vocabulary` again, as a module ONLY the `api` entry (`src/api.ts`) reaches, so `V` has a namespace of its own.
 * - HACK: `export * as V from "$/vocabulary"` namespaces the BARREL, which `core` and every family also reach;
 *   Rolldown then hoists its runtime helpers (`__name`, `__exportAll`) into a shared `rolldown-runtime-<hash>.js`
 *   that `core.js` and every family import:  one more request on every page.  Namespacing this module instead keeps
 *   the namespace object in `api.js` and the helpers in `core.js`.  Checked by `yarn measure` (`runtimeChunks`).
 * - NEVER import it from shipped code:  it would put this module back on `core`'s path.
 */

export * from "$/vocabulary"
