/**
 * Types and constants of the `ui-tab` family that several of its files share:  its elements (`UITab`, `UITabs`) and
 * their native fallback (`TabFallback`).
 * - Pure data, at the bottom of the folder's imports:  no imports at all, so node can load it (`yarn site:data`).
 * - A constant ONE class uses is a module constant below that class (epic `wwod-spell-ui`, Q18).
 */

////////////////
// ## The owner contract
////////////////

/** What a pane asks its owner (`UITabs`, not imported:  it imports this file). */
export type TabOwner = {
  /** How `pane` shows now.  Tracked. */
  paneState(pane: Element): TabPaneState
  /** `pane`'s value:  its `value`, else its index.  Untracked. */
  valueFor(pane: Element): string
}

/** How a pane shows, from `TabOwner.paneState()`. */
export type TabPaneState = {
  /** the shown pane */
  selected: boolean
  /** edge it joins the menu on */
  attached?: string | boolean
  /** no segment box */
  basic: boolean
  /** a dark pane */
  inverted: boolean
}

////////////////
// ## Class words and roles
////////////////

/** Fomantic's noun for the tab list, which IS a menu (`ui top attached tabular menu`):  its class word and part. */
export const MENU = "menu"

/** A tab in the list:  its role and part. */
export const TAB = "tab"

/** Role of the tab list. */
export const TABLIST = "tablist"

/** Role of an owned pane's host. */
export const TABPANEL = "tabpanel"

/** Class after a pane's noun:  the pane is a segment (`ui ... tab segment`). */
export const SEGMENT = "segment"
