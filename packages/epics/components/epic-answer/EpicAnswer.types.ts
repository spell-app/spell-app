/**
 * Constants several components of the `epic-answer` family share (`EpicAnswer`, `EpicReply`, `EpicMore`), and
 * `EpicStatus`, whose card is theirs (`epic-status`).
 * - Data only:  nothing here runs.
 * - A constant only one of them uses lives below that component's class.
 */

/** Between the parts of a card's heading:  `Answer · Named palette`, `Claude · re: ...`. */
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

/** A heading band with a date (`EpicReply`, `EpicStatus`):  a flex row, `WHO` left, `DATE` right on its top line. */
export const DATED = "dated"
export const WHO = "who"
export const DATE = "date"
