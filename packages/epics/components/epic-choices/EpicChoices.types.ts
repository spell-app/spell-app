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

////////////////
// ## Shadow markup
////////////////

/** Class of the `<button>` that folds:  Choices' heading, an answered option's header. */
export const TOGGLE = "toggle"
