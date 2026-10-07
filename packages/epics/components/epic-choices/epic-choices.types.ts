/**
 * Loose types and constants of the `epic-choices` family.
 * - Data only:  nothing here runs.
 */

import type { epicChoicesVocabulary } from "./epic-choices.vocabulary.en"
import type { epicOptionVocabulary } from "./epic-option.vocabulary.en"

/** `epicChoicesVocabulary`'s type. */
export type EpicChoicesVocabulary = typeof epicChoicesVocabulary

/** `epicOptionVocabulary`'s type. */
export type EpicOptionVocabulary = typeof epicOptionVocabulary

////////////////
// ## The question around them
////////////////

/** The tags and attributes the options read their question's state from. */
export const ITEM_TAG = "epic-item"
export const CHOICES_TAG = "epic-choices"
export const ANSWERED = "answered"
export const CHOSEN = "chosen"

////////////////
// ## Shadow markup
////////////////

/** Class names inside the shadow roots. */
export const TOGGLE = "toggle"
export const PANELS = "panels"
export const HEADER = "header"
export const CHECK = "check"
export const TITLE = "title"
export const RECOMMENDED = "recommended"
export const ACTIONS = "actions"
export const BODY = "body"

/** Class words on the box:  answered (a panel, not a card), chosen. */
export const PANEL = "panel"
export const CARD = "card"
export const CHOSEN_CLASS = "chosen"

/** `id`s inside the shadow roots, for `aria-controls`. */
export const PANELS_ID = "panels"
export const BODY_ID = "body"

/** Between an option's letter and its title:  `A · A named palette`. */
export const LETTER_SEPARATOR = " · "
