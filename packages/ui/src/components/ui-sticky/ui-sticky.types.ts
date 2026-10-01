/**
 * Loose constants, types and helpers of `<ui-sticky>`:  its element classes and native fallback import them from here.
 */

import type { stickyVocabulary } from "./ui-sticky.vocabulary.en"

////////////////
// ## UISticky
////////////////

/** StickyVocabulary type, for brevity. */
export type StickyVocabulary = typeof stickyVocabulary

/** What an observation depends on. */
export type StickyConfig = {
  connected: boolean
  offset: number
  bottomOffset: number
  pushing: boolean
}

/** `overflow-y` values that make a scroll container. */
export const SCROLLING = new Set(["auto", "scroll", "overlay", "hidden"])

/** Sub-pixel slack when comparing edges. */
export const SLACK = 0.5

/** Class words of the sentinels (`ui-sticky.css`). */
export const SENTINEL = "sentinel"
export const BOTTOM_SENTINEL = "bottom sentinel"

/** Private custom properties the box reads (`ui-sticky.css`), which win over the public tokens' aliases. */
export const OFFSET_PROPERTY = "--_ui-sticky-offset"
export const BOTTOM_OFFSET_PROPERTY = "--_ui-sticky-bottom-offset"
