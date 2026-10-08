/**
 * Constants several components of the `epic-answer` family share (`EpicAnswer`, `EpicReply`, `EpicMore`).
 * - Data only:  nothing here runs.
 * - A constant only one of them uses lives below that component's class.
 */

/** Between the parts of a card's heading:  `Answer · Named palette`, `Claude · 2026-10-06 23:55 · re: ...`. */
export const HEADING_SEPARATOR = " · "

////////////////
// ## Class names inside the shadow roots
////////////////

/** A card's heading band. */
export const HEADER = "header"

/** A card's (or More Details') body. */
export const BODY = "body"

/** A body with nothing in it. */
export const EMPTY = "empty"
