/**
 * Types of the `ui-include` family:  what its element, host and fallback share.
 * - Pure data, at the bottom of the folder's imports:  `import type` only, so node can load it (`yarn site:data`).
 * - NOTE: `URL_ATTRIBUTES`, `URL_SELECTOR`, `ORIGINAL_PREFIX` and `MAX_DEPTH` live in the element core
 *   (`elements.types.ts`, as `E.X`):  `SourceMarkup` uses them for `<ui-section source>` / `<ui-accordion source>`
 *   too.  The constants only `UIInclude` reads sit below that class (epic `wwod-spell-ui`, Q18).
 */

import type { includeVocabulary } from "./ui-include.vocabulary.en"

////////////////
// ## Element
////////////////

/** Vocabulary type, for brevity. */
export type Vocabulary = typeof includeVocabulary

/** What the host asks of its controller (`UIInclude`). */
export type IncludeController = {
  /** where the included markup lives */
  contentRoot(): HTMLElement | undefined
}

////////////////
// ## Events
////////////////

/** `detail` of `ui-insert`. */
export type IncludeInsertDetail = {
  /** the markup about to go in:  parsed, `select`ed, URLs rewritten;  not yet in the page */
  fragment: DocumentFragment
  /** `source` as written */
  source?: string
}
