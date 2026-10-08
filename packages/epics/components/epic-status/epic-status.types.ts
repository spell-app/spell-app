/**
 * Loose types and constants of the `epic-status` family.
 * - Data only:  nothing here runs.
 */

import type { epicStatusVocabulary } from "./epic-status.vocabulary.en"

/** `epicStatusVocabulary`'s type. */
export type EpicStatusVocabulary = typeof epicStatusVocabulary

/** A status card's `state`. */
export type StatusState = "underway" | "done"

/** `state` of a finished card:  violet, its date `done-at`. */
export const DONE = "done"

/** The summary's slot (`<p slot="summary">`), under the reading. */
export const SUMMARY_SLOT = "summary"

/** Class names inside the shadow root, beside the card's (`epic-answer.types`' `HEADER`, `DATED` ...). */
export const SUMMARY = "summary"
