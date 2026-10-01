/**
 * Loose constants and types of the `ui-feed` family:  the words, selectors and shapes its element
 * classes and its native fallback share, lifted out of their files.
 * - Data only:  nothing here runs;  the classes import what they need from `./ui-feed.types`.
 */

import type { eventVocabulary } from "./ui-event.vocabulary.en"
import type { feedVocabulary } from "./ui-feed.vocabulary.en"

/** Root tags. */
export const UL = "ul"
export const OL = "ol"

/** Classes of the label box and the icon box. */
export const LABEL = "label"

/** Prefix of the colour remap class a coloured event adds (`ui-red`). */
export const COLOR_CLASS_PREFIX = "ui-"

/** Either vocabulary, for brevity. */
export type Vocabulary = typeof feedVocabulary | typeof eventVocabulary

/** The feed attribute that numbers events. */
export const ORDERED = "ordered"
