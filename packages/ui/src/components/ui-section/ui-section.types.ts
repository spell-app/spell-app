/**
 * Shared constants, types and helpers of the `ui-section` family:  what its element class, vocabulary and native
 * fallback share.
 * - Runtime-light:  no element code, so every file of the family may import it.
 */

import type { sectionVocabulary } from "./ui-section.vocabulary.en"

////////////////
// ## UISection
////////////////

/** SectionVocabulary type, for brevity. */
export type SectionVocabulary = typeof sectionVocabulary

/** Heading level of a top-level section:  under the page's `h1`. */
export const TOP_LEVEL = 2

/** Deepest heading level:  `h6`. */
export const MAX_LEVEL = 6

/** Glyph of the fold button (rotated by CSS while folded). */
export const FOLD_ICON = "chevron down"

/** Class words of the shadow markup (`ui-section.css`). */
export const TITLE = "title"
export const HEADING = "heading"
export const TOGGLE = "toggle"
export const FOLD_ICON_CLASS = "fold icon"
export const HEADER = "header"
export const BADGE = "badge"
export const ACTIONS = "actions"
export const SUBHEAD = "subhead"
export const CONTENT = "content"
export const TIP = "tip"

/** `id` of the info tip, which the fold button (else the heading) is described by (unique:  one per shadow root). */
export const TIP_ID = "tip"

/** Role of the info tip. */
export const TOOLTIP = "tooltip"

/** `fold-icon`'s values:  the chevron before the title (inside the fold button), or at the far end of the bar. */
export type FoldIconPlace = "start" | "end"

/** `fold-icon` value that moves the chevron to the far end of the title bar, after the badge and actions. */
export const FOLD_END: FoldIconPlace = "end"

/** Class word of the 1px sentinel before the title, which `StickyWatch` observes with `sticky`. */
export const SENTINEL = "sentinel"

/** `id` of the content box, which the fold button's `aria-controls` names (unique:  one per shadow root). */
export const CONTENT_ID = "content"

/** Tag of the toggle when the section can't fold:  a plain box (a fold button is `<button>`). */
export const STATIC_TOGGLE_TAG = "span"

/** The fold button, in the shadow root:  where a click's path stops counting as "inside the title". */
export const TOGGLE_BUTTON = "button.toggle"

/** What acts on its own inside a rich title:  a click on one never folds the section (as accordion's `CONTROLS`). */
export const CONTROLS = "a[href], button, input, select, textarea, label, [contenteditable], [tabindex]"

/** Prefix of the heading's tag:  `h` + level. */
export const HEADING_TAG = "h"

/** Class word `height` adds after the noun when `scrolling` isn't set:  `height` implies scrolling. */
export const SCROLLING = "scrolling"

/**
 * Private custom property the content box reads for `height`:  inline, so the attribute wins over the page's
 * `--ui-section-scrolling-height`.
 */
export const HEIGHT_PROPERTY = "--_ui-section-height"

/**
 * Private custom property the sticky title reads for its `top`, inline:  the top-level `offset`, or the stack of
 * enclosing sticky titles above it, in pixels.
 */
export const STICK_TOP_PROPERTY = "--_ui-section-top"

/** Private custom property of a title's nesting depth (0 at the top), inline:  deeper titles slide under. */
export const DEPTH_PROPERTY = "--_ui-section-depth"

/** `hidden` value that lets find-in-page reveal a folded section's content (`beforematch`). */
export const UNTIL_FOUND = "until-found"

/** Class word of the line saying a `source` body failed (`part="error"`, inside the content box). */
export const SOURCE_ERROR = "source error"

/** Class word after the noun while a `source` body is slow to arrive:  the `loading` look. */
export const LOADING = "loading"

/** Event find-in-page fires on hidden `until-found` content before revealing a match. */
export const BEFORE_MATCH = "beforematch"
