/**
 * Loose constants and types of the `ui-card` family:  the words, selectors and shapes its element
 * classes and its native fallback share, lifted out of their files.
 * - Data only:  nothing here runs;  the classes import what they need from `./ui-card.types`.
 */

import { HEADER, type CardSharedVariation } from "$/ui/core"
import type { cardVocabulary } from "./ui-card.vocabulary.en"
import type { cardsVocabulary } from "./ui-cards.vocabulary.en"

/** Vocabulary type, for brevity. */
export type Vocabulary = typeof cardVocabulary

/** Shorthand attributes, by the part noun each renders. */
export type Shorthand = (typeof SHORTHANDS)[number]

/** Shorthand nouns. */
export const IMAGE = "image"

export const META = "meta"
export const DESCRIPTION = "description"
export const EXTRA = "extra"

/** Every shorthand, and those rendered in the content block. */
export const SHORTHANDS = [IMAGE, HEADER, META, DESCRIPTION, EXTRA] as const
export const CONTENT_SHORTHANDS = [HEADER, META, DESCRIPTION] as const

/** Variations a card takes from its group (`CardSharedVariation`). */
export const SHARED: ReadonlySet<string> = new Set<CardSharedVariation>([
  "size",
  "color",
  "horizontal",
  "raised",
  "link",
  "basic",
  "inverted"
])

/** Nothing slotted. */
export const EMPTY: ReadonlySet<string> = new Set()

/** Root tags. */
export const ANCHOR = "a"
export const ARTICLE = "article"

/** Utility class (`utilities.css`, adopted in every root) for the loading announcement. */
export const VISUALLY_HIDDEN = "ui-visually-hidden-force"

/** Role of the loading announcement. */
export const STATUS = "status"

/** Either vocabulary, for brevity. */
export type FallbackVocabulary = typeof cardVocabulary | typeof cardsVocabulary

/** Shorthands of the content block, in order. */
export const CONTENT_NOUNS = ["header", "meta", "description"] as const
