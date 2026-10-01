/**
 * Loose constants, types and helpers of `<ui-shape>`:  its element classes and native fallback import them from here.
 */

import type { shapeVocabulary } from "./ui-shape.vocabulary.en"
import type { UIT } from "$/ui/core"
import type { sideVocabulary } from "./ui-side.vocabulary.en"

////////////////
// ## UIShape
////////////////

/** ShapeVocabulary type, for brevity. */
export type ShapeVocabulary = typeof shapeVocabulary

/** Margin-box sizes of the active and next sides. */
export type ShapeSizes = {
  active: { width: number; height: number }
  next: { width: number; height: number }
}

/** Default of `direction` (the vocabulary's). */
export const DEFAULT_FLIP: UIT.ShapeFlip = "left"

/** The side noun. */
export const SIDE = "side"
export const INACTIVE = "inactive"
export const LEAVING = "leaving"

/** Class of the turning box (`ui-shape.css`). */
export const SIDES = "sides"

/** Live region politeness of the sides box. */
export const POLITE = "polite"

/** Its own boxes' inline styles are cleared after a flip;  on the sides, only what it staged. */
export const STYLE = "style"
export const STAGED = ["transform", "top", "left"] as const

/** ms added to the transition before giving up on `transitionend`. */
export const FAIL_SAFE = 100

////////////////
// ## ui-shape.fallback
////////////////

/** Either vocabulary, for brevity. */
export type ShapeFallbackVocabulary = typeof shapeVocabulary | typeof sideVocabulary

/** Classes and parts of the markup contract (`ui-shape.css`). */
export const SHAPE = "shape"
