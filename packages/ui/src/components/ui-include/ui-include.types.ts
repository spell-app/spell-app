/**
 * Loose constants and types of the `ui-include` family.
 * - Data only:  the element, its host and its fallback import what they need from here.
 */

import type { includeVocabulary } from "./ui-include.vocabulary.en"

/** Vocabulary type, for brevity. */
export type Vocabulary = typeof includeVocabulary

/**
 * Attributes holding a URL, rewritten against `source` so included links, images and nested includes point where
 * they did there.
 */
export const URL_ATTRIBUTES = ["href", "src", "action", "poster", "source"] as const

/** Elements carrying one of `URL_ATTRIBUTES`. */
export const URL_SELECTOR = URL_ATTRIBUTES.map((name) => `[${name}]`).join(",")

/**
 * Prefix of the attribute keeping a rewritten URL's ORIGINAL value (`data-ui-include-href`), so `content` (what a
 * save writes) gives the file back as it was written.
 */
export const ORIGINAL_PREFIX = "data-ui-include-"

/** The default `load` mode:  no class word. */
export const EAGER = "eager"

/** Class word after the noun while `source` loads. */
export const LOADING_CLASS = "loading"

/** Includes nested deeper than this refuse to load:  a cycle through different URLs, or a runaway. */
export const MAX_DEPTH = 8

/** The `<body ...>` opening tag and the closing tag of a page, for splicing a saved body back into its file. */
export const BODY_OPEN = /<body\b[^>]*>/i
export const BODY_CLOSE = /<\/body\s*>/i

/** What the host asks of its controller (`UIInclude`). */
export type IncludeController = {
  /** where the included markup lives */
  contentRoot(): HTMLElement | undefined
}
