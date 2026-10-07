/**
 * Loose types of the `epic-answer` family.
 * - Data only:  nothing here runs.
 */

import type { epicAnswerVocabulary } from "./epic-answer.vocabulary.en"
import type { epicReplyVocabulary } from "./epic-reply.vocabulary.en"
import type { epicMoreVocabulary } from "./epic-more.vocabulary.en"

/** `epicAnswerVocabulary`'s type. */
export type EpicAnswerVocabulary = typeof epicAnswerVocabulary

/** `epicReplyVocabulary`'s type. */
export type EpicReplyVocabulary = typeof epicReplyVocabulary

/** `epicMoreVocabulary`'s type. */
export type EpicMoreVocabulary = typeof epicMoreVocabulary
