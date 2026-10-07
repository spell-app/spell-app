/**
 * `$/epics/review`:  the page's review inbox client (`ReviewClient`), its types and helpers.
 * - Node-safe at import:  nothing touches `window` / `document` until `ReviewClient.forPage()` or `watch()`.
 * - Bundled into the pack (the elements import it);  NOT in the `$/epics` barrel, which the node tools load.
 */
export * from "./review.types"
export * from "./ReviewClient"
