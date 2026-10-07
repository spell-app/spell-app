/**
 * Loose types and constants of the `epic-event` family.
 * - Data only:  nothing here runs.
 */

import type { epicEventVocabulary } from "./epic-event.vocabulary.en"

/** `epicEventVocabulary`'s type. */
export type EpicEventVocabulary = typeof epicEventVocabulary

/** Its icon without an `icon` attribute. */
export const DEFAULT_ICON = "pen to square"

/** An `at` time as shown:  `2026-10-06T08:12-04:00` => `2026-10-06 08:12`. */
export const SHOWN_TIME = /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2}))?/

/** Classes of the shadow markup. */
export const ICON = "icon"
export const TIME = "time"
export const TEXT = "text"
