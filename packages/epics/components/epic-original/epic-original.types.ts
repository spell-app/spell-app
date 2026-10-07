/**
 * Loose types of the `epic-original` family.
 * - Data only:  nothing here runs.
 */

import type { epicOriginalVocabulary } from "./epic-original.vocabulary.en"
import type { epicVersionVocabulary } from "./epic-version.vocabulary.en"

/** `epicOriginalVocabulary`'s type. */
export type EpicOriginalVocabulary = typeof epicOriginalVocabulary

/** `epicVersionVocabulary`'s type. */
export type EpicVersionVocabulary = typeof epicVersionVocabulary
