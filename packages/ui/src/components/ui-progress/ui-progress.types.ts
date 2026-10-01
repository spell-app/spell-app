/**
 * Loose constants, types and helpers of `<ui-progress>`:  its element classes and native fallback import them from here.
 */

////////////////
// ## ProgressValues
////////////////

/** Constructor props for `ProgressValues`:  the host's converted attributes. */
export type ProgressValuesProps = {
  /** `value`:  one number or a comma list. */
  value?: string | number | null
  /** `total`. */
  total?: number | null
  /** `percent`:  one number or a comma list. */
  percent?: string | number | null
  /** Decimal places for display. */
  precision?: number | null
}

////////////////
// ## UIProgress
////////////////

/** Host role. */
export const PROGRESSBAR = "progressbar"

/** The automatic outcome at 100%. */
export const SUCCESS = "success"

/** `bar-text` value for the ratio format. */
export const RATIO = "ratio"

/** Joins several bars' texts into one `aria-valuetext`. */
export const LIST_SEPARATOR = ", "
export const BAR_TEXT = "progress"

/** Prefix of the colour-remap utility class (`colors.css`), e.g. `ui-red`. */
export const UTILITY_PREFIX = "ui-"
