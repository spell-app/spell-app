/**
 * Constants of the `ui-slider` family that its element (`UISlider`) and its native fallback (`SliderFallback`) share.
 * - Pure data, at the bottom of the folder's imports:  no imports at all, so node can load it (`yarn site:data`).
 * - A constant ONE class uses is a module constant below that class (epic `wwod-spell-ui`, Q18);  `SliderScale`'s
 *   props live with it.
 */

////////////////
// ## Fomantic's defaults
////////////////

/** Lowest value when `min` is unset. */
export const DEFAULT_MIN = 0

/** Highest value when `max` is unset. */
export const DEFAULT_MAX = 20

/** Step when `step` is unset. */
export const DEFAULT_STEP = 1
