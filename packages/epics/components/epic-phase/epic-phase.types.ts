/**
 * Loose types of the `epic-phase` family.
 * - Data only:  nothing here runs.
 */

import type { epicPhaseVocabulary } from "./epic-phase.vocabulary.en"
import type { epicFieldVocabulary } from "./epic-field.vocabulary.en"
import type { epicUpdatedVocabulary } from "./epic-updated.vocabulary.en"

/** `epicPhaseVocabulary`'s type. */
export type EpicPhaseVocabulary = typeof epicPhaseVocabulary

/** `epicFieldVocabulary`'s type. */
export type EpicFieldVocabulary = typeof epicFieldVocabulary

/** `epicUpdatedVocabulary`'s type. */
export type EpicUpdatedVocabulary = typeof epicUpdatedVocabulary
