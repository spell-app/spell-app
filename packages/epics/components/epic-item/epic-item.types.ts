/**
 * Loose types and constants of the `epic-item` family.
 * - Data only:  nothing here runs.
 */

import type { epicItemVocabulary } from "./epic-item.vocabulary.en"

/** `epicItemVocabulary`'s type. */
export type EpicItemVocabulary = typeof epicItemVocabulary

////////////////
// ## States
////////////////

/** An item's id-chip colours, by where it stands (the script's `state`):  see `epic-item.css`. */
export const ITEM_STATES = ["attention", "progress", "open", "recent", "old"] as const

/** One of `ITEM_STATES`. */
export type ItemState = (typeof ITEM_STATES)[number]

/** Statuses that close an item:  without a `state`, its chip is `old` (grey), as the old runtime's `stateOf()`. */
export const CLOSED_STATUSES = ["decided", "done", "canceled"] as const

/** `state`'s text key, for the id chip's tooltip. */
export const STATE_TIP_KEYS = {
  attention: "stateAttention",
  progress: "stateProgress",
  open: "stateOpen",
  recent: "stateRecent",
  old: "stateOld"
} as const satisfies Record<ItemState, string>

/** The review label's look (`PlanItem.reviewLabelColor()`'s):  `todo` orange, `deferred` grey, `reviewed` by state. */
export type ReviewLook = "todo" | "deferred" | "recent" | "old"

/** The review label on an item's line:  its words, look and tooltip. */
export type ReviewLabel = {
  /** what it says:  `to do`, `deferred`, `reviewed 10-06` */
  words: string
  /** its colour */
  look: ReviewLook
  /** its tooltip:  the queued work, the date it was deferred */
  tip?: string
}

////////////////
// ## Shadow markup
////////////////

/** Class names inside the shadow root. */
export const LINE = "line"
export const FOLD = "fold"
export const TOGGLE = "toggle"
export const CHIP = "chip"
export const TITLE = "title"
export const EXTRAS = "extras"
export const REVIEW = "review"
export const DETAILS = "details"
export const LABEL = "label"
export const NOTE = "note"
export const CELL = "cell"

/** Class words on the item box:  it has details;  it's unfolded. */
export const HAS_DETAILS = "has-details"
export const UNFOLDED = "unfolded"

/** The struck-through status, and its class word. */
export const CANCELED = "canceled"

/** `id` of the details box, which the toggle controls. */
export const DETAILS_ID = "details"

/** `hidden` value that lets find-in-page reveal folded details (`beforematch`). */
export const UNTIL_FOUND = "until-found"

/** The event find-in-page fires on a hidden="until-found" box before revealing it. */
export const BEFORE_MATCH = "beforematch"

/** Children that aren't prose:  the item's parts, drawn by their own elements. */
export const EPIC_TAG = /^epic-/

/** `<epic-*>` tags that are prose (`flow`), not parts:  the UPDATE marker. */
export const FLOW_TAGS: readonly string[] = ["epic-update"]

/** The More Details card's tag:  an item with one labels its own text "Original reply". */
export const MORE_TAG = "epic-more"
