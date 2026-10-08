/**
 * Constants and types the `epic-choices` family's components share (`EpicChoices`, `EpicOption`).
 * - Data only:  nothing here runs.
 * - A constant only one of them uses lives below that component's class.
 */

////////////////
// ## The question around them
////////////////

/** The tags and attributes the options read their question's state from. */
export const ITEM_TAG = "epic-item"
export const CHOICES_TAG = "epic-choices"
export const ANSWERED = "answered"
export const CHOSEN = "chosen"
export const STATUS = "status"

/** An item's Original Discussion:  history, not a choice:  its options never take a pill, nor count as a set. */
export const ORIGINAL_TAG = "epic-original"

/**
 * Which card set of its item an `<epic-choices>` is (`EpicChoices.setOf()`):  `index`, its position among the
 * item's sets;  `own`, it's the item's own set.
 */
export type CardSet = { index: number; own: boolean }

////////////////
// ## Shadow markup
////////////////

/** Class of the `<button>` that folds:  Choices' heading, an answered option's header. */
export const TOGGLE = "toggle"
