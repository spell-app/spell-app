/**
 * Loose constants, types and helpers of `<ui-tab>`:  its element classes and native fallback import them from here.
 */

import { tabVocabulary } from "./ui-tab.vocabulary.en"
import type { tabsVocabulary } from "./ui-tabs.vocabulary.en"

////////////////
// ## UITab
////////////////

/** TabVocabulary type, for brevity. */
export type TabVocabulary = typeof tabVocabulary

/** What a pane asks its owner (`UITabs`, not imported:  it imports this file). */
export type TabOwner = {
  /** How `pane` shows now.  Tracked. */
  paneState(pane: Element): TabPaneState
  /** `pane`'s value:  its `value`, else its index.  Untracked. */
  valueOf(pane: Element): string
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

/** Class after the noun:  the pane is a segment. */
export const SEGMENT = "segment"

/** Host role while owned. */
export const TABPANEL = "tabpanel"

/** A lazy pane's templates:  direct children only. */
export const TEMPLATES = ":scope > template"

////////////////
// ## UITabs
////////////////

/** TabsVocabulary type, for brevity. */
export type TabsVocabulary = typeof tabsVocabulary

/**
 * Fomantic's noun for the tab list:  it IS a menu (`ui top attached tabular menu`).
 * - NOTE: above the class, not with the other constants:  a static initializer reads it.
 */
export const MENU_NOUN = "menu"

////////////////
// ## ui-tab.fallback
////////////////

/** Either vocabulary, for brevity. */
export type TabFallbackVocabulary = typeof tabsVocabulary | typeof tabVocabulary

/** Attributes read here. */
export const VALUE = "value"

/** Host state every pane carries (`ui-tab.css`). */
export const PANE = "pane"

export const ACTIVE_ITEM = "active item"
export const MENU = "menu"
export const SEGMENT_ACTIVE = "segment active"

/** Roles and parts. */
export const TABLIST = "tablist"
export const TAB = "tab"
export const TAB_PART = "tab"
export const MENU_PART = "menu"

////////////////
// ## UITabs
////////////////

/** Noun of a pane child (`<ui-tab>`). */
export const PANE_NOUN = tabVocabulary.noun

/** The tab buttons in the tab list. */
export const TAB_SELECTOR = ":scope > [role=tab]"

/** Window events `history` follows. */
export const HASHCHANGE = "hashchange"
export const POPSTATE = "popstate"

/** A value no pane has. */
export const NONE = "\u0000"

/** Prefix of the id a server render gives a pane, for its tab's `aria-controls`. */
export const PANE_ID = "ui-tab"
