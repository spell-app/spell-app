/**
 * Loose types and constants of the `epic-overview` family.
 * - Data only:  nothing here runs.
 */

import type { epicOverviewVocabulary } from "./epic-overview.vocabulary.en"

/** `epicOverviewVocabulary`'s type. */
export type EpicOverviewVocabulary = typeof epicOverviewVocabulary

/** Classes of the shadow markup:  the folded prompt, the estimate line. */
export const PROMPT = "prompt"
export const ESTIMATE = "estimate"

/** Its icon:  the title's, and its contents entry's. */
export const TITLE_ICON = "lightbulb"
