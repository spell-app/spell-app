/**
 * `$/epics/answers`:  the pages Claude makes for Owen to answer ON (epic `epic-workflow` P12), as their elements
 * keep them -- a details page's answer (`AnswerForm`), a syntax-choices page's boxes (`ChoicesForm`) -- and their
 * types.
 * - Node-safe at import:  nothing touches `window` / `document` until a form's `forPage()`, `watch()` or
 *   `expandAll()`.
 * - Bundled into the pack (the elements import it);  NOT in the `$/epics` barrel, which the node tools load.
 */
export * from "./answers.types"
export * from "./AnswerForm"
export * from "./ChoicesForm"
