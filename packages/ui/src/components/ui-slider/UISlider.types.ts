/**
 * Constants of the `ui-slider` family that its component (`UISlider`) and its native fallback (`SliderFallback`)
 * share.
 * - Pure data:  no imports at all, so node can load it (`yarn site:data`).
 * - A constant ONE class uses is a module constant below that class;  `SliderScale`'s props live with it.
 */

////////////////
// ## Fomantic's defaults
////////////////

/** The lowest value when `min` is unset. */
export const DEFAULT_MIN = 0

/** The highest value when `max` is unset. */
export const DEFAULT_MAX = 20

/** The step when `step` is unset. */
export const DEFAULT_STEP = 1
