/**
 * Loose types and constants of the `epic-answer` family.
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

/** An old decision's id (`d7`), kept on its answer card:  the card is labelled `D7`, not `Answer`. */
export const OLD_DECISION = /^d\d+$/

/** A reply Owen wrote (`from="Owen"`):  his note's orange, not Claude's violet. */
export const FROM_OWEN = /^owen$/i

/** Between the parts of a card's heading:  `Answer · Named palette`, `Claude · 2026-10-06 23:55 · re: ...`. */
export const HEADING_SEPARATOR = " · "

/** Class names inside the shadow roots. */
export const HEADER = "header"
export const LABEL = "label"
export const TITLE = "title"
export const BODY = "body"
export const TOGGLE = "toggle"
export const EMPTY = "empty"

/** Class word on a reply box:  Owen's. */
export const OWEN = "owen"

/** `id` of More Details' body, which its toggle controls. */
export const BODY_ID = "body"
