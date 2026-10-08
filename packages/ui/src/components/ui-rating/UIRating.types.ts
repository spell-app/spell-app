/**
 * Constants of the `ui-rating` family that its component (`UIRating`) and its native fallback (`RatingFallback`)
 * share.
 * - Pure data:  no imports at all, so node can load it (`yarn site:data`).
 * - A constant ONE class uses is a module constant below that class.
 */

////////////////
// ## The radio group
////////////////

/** Fomantic's default `maxRating`:  how many icons when `max-rating` is unset. */
export const DEFAULT_MAX = 4

/** The role of the group of points. */
export const RADIOGROUP = "radiogroup"

/** The `type` of each point's native control. */
export const RADIO = "radio"
