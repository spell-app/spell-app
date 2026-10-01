/**
 * Loose constants and types of the `ui-flyout` family:  the words, selectors and shapes its element
 * classes and its native fallback share, lifted out of their files.
 * - Data only:  nothing here runs;  the classes import what they need from `./ui-flyout.types`.
 */

import type { flyoutVocabulary } from "./ui-flyout.vocabulary.en"

/** Vocabulary type, for brevity. */
export type Vocabulary = typeof flyoutVocabulary

/** The attribute with word values. */
export const WIDTH = "width"

/** Fomantic's word widths (`thin flyout`), which `width` takes beside column counts. */
export const FLYOUT_WORD_WIDTHS = ["very thin", "thin", "wide", "very wide"] as const
