/**
 * Loose constants, types and helpers of `<ui-sticky>`:  its element classes and native fallback import them from here.
 */

import type { stickyVocabulary } from "./ui-sticky.vocabulary.en"

////////////////
// ## UISticky
////////////////

/** StickyVocabulary type, for brevity. */
export type StickyVocabulary = typeof stickyVocabulary

/**
 * What an observation depends on.
 * - NOTE: the scroll-container / reservation thresholds (`STICKY_SCROLLING`, `STICKY_MAX_RESERVE`, `STICKY_SLACK`)
 *   moved to `$/ui/elements` with `StickyWatch`, shared with `<ui-section sticky>`.
 */
export type StickyConfig = {
  connected: boolean
  offset: number
  bottomOffset: number
  pushing: boolean
}

/** Class words of the sentinels (`ui-sticky.css`). */
export const SENTINEL = "sentinel"
export const BOTTOM_SENTINEL = "bottom sentinel"

/** Private custom properties the box reads (`ui-sticky.css`), which win over the public tokens' aliases. */
export const OFFSET_PROPERTY = "--_ui-sticky-offset"
export const BOTTOM_OFFSET_PROPERTY = "--_ui-sticky-bottom-offset"
