/**
 * Constants of the `ui-rating` family that its element (`UIRating`) and its native fallback (`RatingFallback`) share.
 * - Pure data, at the bottom of the folder's imports:  no imports at all, so node can load it (`yarn site:data`).
 * - A constant ONE class uses is a module constant below that class (epic `wwod-spell-ui`, Q18).
 */

////////////////
// ## The radio group
////////////////

/** Fomantic's default `maxRating`:  how many icons when `max-rating` is unset. */
export const DEFAULT_MAX = 4

/** Role of the group of points. */
export const RADIOGROUP = "radiogroup"

/** `type` of each point's native control. */
export const RADIO = "radio"
