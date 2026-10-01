/**
 * Loose constants, types and helpers of `<ui-rating>`:  its element classes and native fallback import them from here.
 */

import { HOME, END } from "$/ui/components/components.types"

////////////////
// ## UIRating
////////////////

/** Fomantic's default `maxRating`. */
export const DEFAULT_MAX = 4

/** Class word of a partly filled icon. */
export const PARTIAL = "partial"

/** Class of the clipped glyph over a partly filled icon. */
export const FILL = "fill"

/** Fomantic's custom property for the filled share of a partial icon. */
export const FULL = "--full"

/** Group role and radio type. */
export const RADIOGROUP = "radiogroup"
export const RADIO = "radio"

/** Keys that clear the rating. */
export const CLEAR_KEYS = new Set(["Backspace", "Delete"])

/** Keys that choose natively (or through us), blocked while `readonly`. */
export const CHOICE_KEYS = new Set([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", HOME, END, ...CLEAR_KEYS])

/** `UI.ids` prefix. */
export const ID_PREFIX = "ui-rating"

////////////////
// ## ui-rating.fallback
////////////////

/** The part of a rating host the fallback touches;  optional, the element may not have upgraded. */
export type RatingHost = HTMLElement & { value?: number }
