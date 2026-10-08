/**
 * Every peer specifier `@spell-app/ui`'s `dist/` imports, one namespace re-export each.
 * - `yarn vendor` builds one file per line (`vendor/`, for import-map pages) -- ONE build, so `solid-js` exists
 *   once and `@solidjs/web` links to that copy;  `yarn measure` bundles this file once as the `library (full)` tier.
 *   `BundleMeasure`'s `peersMissing` check flags a specifier `dist/` needs but this list lacks.
 */

export * as solidJs from "solid-js"
export * as web from "@solidjs/web"
