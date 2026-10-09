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

////////////////
// ## Ids inside the shadow roots:  what a card's fold button names and controls (`<FoldButton>`)
////////////////

/** The box a card folds:  its body (the status card's reading and summary together). */
export const BODY_ID = "body"

/** The heading's words, the fold button's name:  `Answer`, its title;  a reply's or a status card's `who`. */
export const LABEL_ID = "label"
export const TITLE_ID = "title"
export const WHO_ID = "who"
