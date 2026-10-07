/**
 * Loose types and constants of the `epic-original` family.
 * - Data only:  nothing here runs.
 */

import type { epicOriginalVocabulary } from "./epic-original.vocabulary.en"
import type { epicVersionVocabulary } from "./epic-version.vocabulary.en"

/** `epicOriginalVocabulary`'s type. */
export type EpicOriginalVocabulary = typeof epicOriginalVocabulary

/** `epicVersionVocabulary`'s type. */
export type EpicVersionVocabulary = typeof epicVersionVocabulary

/** A version's tag:  a lone first version needs no heading. */
export const VERSION_TAG = "epic-version"

/** Class names inside the shadow roots. */
export const TOGGLE = "toggle"
export const BODY = "body"
export const HEADING = "heading"

/** `id` of the aside's body, which its toggle controls. */
export const BODY_ID = "body"
