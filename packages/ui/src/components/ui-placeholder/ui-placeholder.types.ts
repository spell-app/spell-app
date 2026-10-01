/**
 * Loose constants, types and helpers of `<ui-placeholder>`:  its element classes and native fallback import them from here.
 */

import { placeholderVocabulary } from "./ui-placeholder.vocabulary.en"
import { placeholderHeaderVocabulary } from "./ui-placeholder-header.vocabulary.en"
import { placeholderParagraphVocabulary } from "./ui-placeholder-paragraph.vocabulary.en"
import { placeholderLineVocabulary } from "./ui-placeholder-line.vocabulary.en"
import { placeholderImageVocabulary } from "./ui-placeholder-image.vocabulary.en"

////////////////
// ## ui-placeholder.fallback
////////////////

/** Every vocabulary of the family. */
export const VOCABULARIES = [
  placeholderVocabulary,
  placeholderHeaderVocabulary,
  placeholderParagraphVocabulary,
  placeholderLineVocabulary,
  placeholderImageVocabulary
] as const

/** Solid shapes:  no slot. */
export const SOLID = new Set<object>([placeholderLineVocabulary, placeholderImageVocabulary])
