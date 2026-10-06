/**
 * Constants and types of the `ui-section` family that its element (`UISection`) and its native fallback
 * (`SectionFallback`) share -- and `<ui-panel>`, which subclasses both.
 * - Pure data, at the bottom of the folder's imports:  `import type` only, so node can load it (`yarn site:data`).
 * - A constant only `UISection` reads sits below that class (`UISection.tsx`).
 */

import type { sectionVocabulary } from "./ui-section.vocabulary.en"

/** `<ui-section>`'s vocabulary type, for brevity (`<ui-panel>` reuses it). */
export type SectionVocabulary = typeof sectionVocabulary

////////////////
// ## Levels
////////////////

/** Heading level of a top-level section:  under the page's `h1`. */
export const TOP_LEVEL = 2

/** Deepest heading level:  `h6`. */
export const MAX_LEVEL = 6

/** Prefix of the heading's tag:  `h` + level. */
export const HEADING_TAG = "h"

////////////////
// ## Shadow markup:  class words and part names
////////////////

/** Class word and part of the heading (`<hN>`). */
export const HEADING = "heading"

/** Class word and part of the toggle:  the fold button, or a plain box when the section can't fold. */
export const TOGGLE = "toggle"

/** Class words of the fold chevron. */
export const FOLD_ICON_CLASS = "fold icon"

/** Part of the fold chevron. */
export const FOLD_ICON_PART = "fold-icon"

/** Class word and part of the badge pill. */
export const BADGE = "badge"

/** Class word and part of the actions box. */
export const ACTIONS = "actions"

/** Class word and part of the subhead. */
export const SUBHEAD = "subhead"

/** Class word and part of the info tip. */
export const TIP = "tip"

/** Role of the info tip. */
export const TOOLTIP = "tooltip"

/** Tag of the toggle when the section can't fold:  a plain box (a fold button is `<button>`). */
export const STATIC_TOGGLE_TAG = "span"

/** Class word `height` adds after the noun when `scrolling` isn't set:  `height` implies scrolling. */
export const SCROLLING = "scrolling"

////////////////
// ## Ids:  unique, one section per shadow root
////////////////

/** `id` of the info tip, which the fold button (else the heading) is described by. */
export const TIP_ID = "tip"

/** `id` of the content box, which the fold button's `aria-controls` names. */
export const CONTENT_ID = "content"

////////////////
// ## Folding
////////////////

/**
 * `fold-icon`'s values:  the chevron before the title (`start`, inside the fold button), or at the far end of the
 * title bar (`end`, after the badge and actions).
 */
export const FoldIconPlace = { start: "start", end: "end" } as const
/** One of `FoldIconPlace`'s values, e.g. `"end"`. */
export type FoldIconPlace = (typeof FoldIconPlace)[keyof typeof FoldIconPlace]

/** `hidden` value that lets find-in-page reveal a folded section's content (`beforematch`). */
export const UNTIL_FOUND = "until-found"

/** Event find-in-page fires on hidden `until-found` content before revealing a match. */
export const BEFORE_MATCH = "beforematch"

////////////////
// ## Inline custom properties
////////////////

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
