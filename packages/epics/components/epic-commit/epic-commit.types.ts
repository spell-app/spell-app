/**
 * Loose types and constants of the `epic-commit` family.
 * - Data only:  nothing here runs.
 */

import type { epicCommitVocabulary } from "./epic-commit.vocabulary.en"

/** `epicCommitVocabulary`'s type. */
export type EpicCommitVocabulary = typeof epicCommitVocabulary

/** How many of the sha's digits show. */
export const SHORT_SHA = 7

/** Where a sha's link opens:  one GitHub tab, as today's links. */
export const LINK_TARGET = "github"

/** The page around a commit, whose `repo` its link is made from. */
export const PAGE_TAG = "epic-page"

/** Classes of the shadow markup. */
export const HEADING = "heading"
export const LINE = "line"
export const SHA = "sha"
export const ICON = "icon"
