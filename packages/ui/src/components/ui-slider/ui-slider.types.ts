/**
 * Loose constants, types and helpers of `<ui-slider>`:  its element classes and native fallback import them from here.
 */

////////////////
// ## SliderScale
////////////////

/** Constructor props for `SliderScale`. */
export type SliderScaleProps = {
  min: number
  max: number
  step: number
}

////////////////
// ## ui-slider.fallback
////////////////

/** Fomantic's defaults. */
export const DEFAULT_MIN = 0
export const DEFAULT_MAX = 20
export const DEFAULT_STEP = 1

/** The part of a slider host the fallback touches;  optional, the element may not have upgraded. */
export type SliderHost = HTMLElement & { value?: number; end?: number }

////////////////
// ## UISlider
////////////////

/** A thumb:  the first (`value`) or, in a range, the second (`end`). */
export type Thumb = 0 | 1

/** The thumbs. */
export const FIRST: Thumb = 0
export const SECOND: Thumb = 1

/** Fomantic's `labelDistance`:  least px between full labels. */
export const LABEL_DISTANCE = 100

/** Fomantic's `pageMultiplier`:  steps per PageUp / PageDown. */
export const PAGE_MULTIPLIER = 2

/** Class words of Fomantic's markup. */
export const INNER = "inner"
export const TRACK = "track"
export const TRACK_FILL = "track-fill"
export const THUMB = "thumb"
export const SECOND_CLASS = "second"
export const SECOND_THUMB = `${SECOND_CLASS} ${THUMB}`
export const LABELS = "auto labels"
export const HALF_TICK_LABEL = "halftick label"

/** Custom properties `ui-slider.css` positions by. */
export const AT = "--_slider-at"
export const FROM = "--_slider-from"
export const TO = "--_slider-to"

/** Roles and ARIA values. */
export const SLIDER = "slider"

/**
 * Marks the thumb (a range's group) in a static server render (`$/ui/server`), for the flattener:  the host's `id`
 * and ARIA names belong there.
 * - TODO: one shared constant (`UIT`) once `StaticFlattener` reads it (seo plan, P3).
 */
export const STATIC_CONTROL = "data-ui-control"

/** Hidden input carrying the value in a static server render:  `type`. */
export const HIDDEN = "hidden"

/** Keys. */
export const ARROW_UP = "ArrowUp"
export const ARROW_LEFT = "ArrowLeft"
export const ARROW_RIGHT = "ArrowRight"
export const PAGE_UP = "PageUp"
export const PAGE_DOWN = "PageDown"
