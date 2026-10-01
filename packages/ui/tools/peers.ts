/**
 * Every peer specifier `@spell-app/ui`'s `dist/` imports, one namespace re-export each.
 * - `yarn vendor` builds one file per line (`vendor/`, for import-map pages) -- ONE build, so `solid-js` exists
 *   once and `@spell-app/solid-element` / `@solidjs/web` link to that copy;  `yarn measure` bundles this file once as
 *   the `library (full)` tier.  `BundleMeasure`'s `peersMissing` check flags a specifier `dist/` needs but this
 *   list lacks.
 */

export * as solidJs from "solid-js"
export * as web from "@solidjs/web"
export * as element from "@spell-app/solid-element"
