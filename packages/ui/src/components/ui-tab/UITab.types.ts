/**
 * The constants and types the `ui-tab` family's files share:  `UITab` and `UITabs`.
 * - Pure data, at the bottom of the folder's imports:  no imports at all, so node can load it (`yarn site:data`).
 * - A constant ONE class uses is a module constant below that class (epic `wwod-spell-ui`, Q18),
 *   unless the class reads it while it is defined (`MENU`).
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
// ## Class words
////////////////

/**
 * Fomantic's noun for the tab list, which IS a menu (`ui top attached tabular menu`):  its class word and part.
 * - Here, though only `UITabs` reads it:  its `menuClassBuilder` reads it while the class is defined.
 */
export const MENU = "menu"
