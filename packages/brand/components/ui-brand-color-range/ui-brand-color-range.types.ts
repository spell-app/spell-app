/**
 * Loose constants and types of the `ui-brand-color-range` family.
 * - Data only:  nothing here runs.
 */

import type { Scale, Step } from "$/brand"

import type { brandColorRangeVocabulary } from "./ui-brand-color-range.vocabulary.en"

/** `brandColorRangeVocabulary`'s type. */
export type BrandColorRangeVocabulary = typeof brandColorRangeVocabulary

/** Class words the element adds after the noun:  `range color brand`. */
export const BRAND_COLOR = "color brand"

/** `numbers` value that leaves the step numbers out. */
export const NO_NUMBERS = "none"

/** Token prefix without a `name`, as the Color Set Chooser's. */
export const DEFAULT_PREFIX = "color"

/** Shadow classes, one per part. */
export const CLASSES = {
  step: "step",
  number: "number",
  dot: "dot"
} as const

/** How `css()` writes each value:  `#8E96B5`, or `oklch(67.7% 0.047 274)`. */
export type CssFormat = "hex" | "oklch"

/** What a ladder is made from:  the range's attributes, converted. */
export type LadderInput = {
  /** base colour, as written */
  value?: string
  /** `auto`, or a step as text */
  anchor?: string
  /** percent of the base colour's chroma */
  vibrancy?: number
  /** degrees toward the dark end */
  hueShift?: number
  /** token prefix */
  name?: string
}

/** `ui-change`'s detail. */
export type RangeChange = {
  /** the base colour, `#RRGGBB` */
  value: string
  /** step => `#RRGGBB` */
  scale: Scale
  /** the base colour's step */
  anchor: Step
}
