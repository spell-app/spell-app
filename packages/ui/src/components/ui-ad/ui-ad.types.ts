/**
 * Loose constants and types of the `ui-ad` family:  the words, selectors and shapes its element
 * classes and its native fallback share, lifted out of their files.
 * - Data only:  nothing here runs;  the classes import what they need from `./ui-ad.types`.
 */

import { adVocabulary } from "./ui-ad.vocabulary.en"

/** Fomantic's placeholder class word. */
export const TEST = "test"

/** The English default `test` text, from the vocabulary:  a failed render can't count on the runtime's texts. */
export const DEFAULT_TEXT = adVocabulary.texts.find(({ key }) => key === "adTest")!.text
