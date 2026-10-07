/**
 * Loose types of the `epic-choices` family.
 * - Data only:  nothing here runs.
 */

import type { epicChoicesVocabulary } from "./epic-choices.vocabulary.en"
import type { epicOptionVocabulary } from "./epic-option.vocabulary.en"

/** `epicChoicesVocabulary`'s type. */
export type EpicChoicesVocabulary = typeof epicChoicesVocabulary

/** `epicOptionVocabulary`'s type. */
export type EpicOptionVocabulary = typeof epicOptionVocabulary
