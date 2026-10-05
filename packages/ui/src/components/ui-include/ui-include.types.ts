/**
 * Loose constants and types of the `ui-include` family.
 * - Data only:  the element, its host and its fallback import what they need from here.
 */

import type { includeVocabulary } from "./ui-include.vocabulary.en"

/** Vocabulary type, for brevity. */
export type Vocabulary = typeof includeVocabulary

/*
 * NOTE: `URL_ATTRIBUTES`, `URL_SELECTOR`, `ORIGINAL_PREFIX` and `MAX_DEPTH` moved to the element core
 * (`$/ui/core`, `elements.types.ts`):  `SourceMarkup` uses them for `<ui-section source>` /
 * `<ui-accordion source>` too.
 */

/** The default `load` mode:  no class word. */
export const EAGER = "eager"

/** Class word after the noun while `source` loads. */
export const LOADING_CLASS = "loading"

/** The `<body ...>` opening tag and the closing tag of a page, for splicing a saved body back into its file. */
export const BODY_OPEN = /<body\b[^>]*>/i
export const BODY_CLOSE = /<\/body\s*>/i

/** `detail` of `ui-insert`. */
export type IncludeInsertDetail = {
  /** the markup about to go in:  parsed, `select`ed, URLs rewritten;  not yet in the page */
  fragment: DocumentFragment
  /** `source` as written */
  source?: string
}

/** What the host asks of its controller (`UIInclude`). */
export type IncludeController = {
  /** where the included markup lives */
  contentRoot(): HTMLElement | undefined
}
