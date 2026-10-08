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
export const STATUS = "status"

/** An item's Original Discussion:  history, not a choice, so its options never take a Choose pill. */
export const ORIGINAL_TAG = "epic-original"

////////////////
// ## Choose pills (P10)
////////////////

/** What an option's Choose pill shows:  is its letter the item's pick, has that gone to Claude, does anyone listen. */
export type PillState = {
  /** its letter is the item's pick */
  picked: boolean
  /** picked, and the mark carrying the pick has gone to Claude */
  sent: boolean
  /** a Claude session waits on the inbox */
  listening: boolean
}

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
export const CHOOSE = "choose"
export const BODY = "body"

/** Class words on the box:  answered (a panel, not a card), chosen, picked in review (P10). */
export const PANEL = "panel"
export const CARD = "card"
export const CHOSEN_CLASS = "chosen"
export const PICKED = "picked"

/** Class word on a picked pill whose mark has gone to Claude:  outlined, not filled. */
export const SENT = "sent"

/** `id`s inside the shadow roots, for `aria-controls`. */
export const PANELS_ID = "panels"
export const BODY_ID = "body"

/** Between an option's letter and its title:  `A · A named palette`. */
export const LETTER_SEPARATOR = " · "
