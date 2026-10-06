/**
 * Constants of the `ui-step` family that its elements (`UIStep`, `UISteps`) and their native fallback
 * (`StepFallback`) share.
 * - Pure data, at the bottom of the folder's imports:  no imports at all, so node can load it (`yarn site:data`).
 * - A constant ONE class uses is a module constant below that class (epic `wwod-spell-ui`, Q18).
 */

////////////////
// ## A step
////////////////

/** Root tag of a plain step (a link step's is `UIT.ANCHOR_TAG`, a `link` step's `UIT.BUTTON`). */
export const BOX = "div"

/** `aria-current` of the selected step:  the current one in the sequence. */
export const CURRENT_STEP = "step"

/** The `header` shorthand's part and class word, Fomantic's `.title` (not `UIT.TITLE`, the tooltip attribute). */
export const TITLE_PART = "title"
