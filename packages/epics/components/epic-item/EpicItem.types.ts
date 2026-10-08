/**
 * Loose types and constants of the `epic-item` family.
 * - Data only:  nothing here runs.
 */

import type { epicItemVocabulary } from "./EpicItem.en"
import type { UIJSXAttributes } from "$/epics/components/epic-page/EpicPage.types"

/** `epicItemVocabulary`'s type. */
export type EpicItemVocabulary = typeof epicItemVocabulary

////////////////
// ## States
////////////////

/** An item's id-chip colours, by where it stands (the script's `state`):  see `EpicItem.css`. */
export const ITEM_STATES = ["attention", "progress", "open", "recent", "old"] as const

/** One of `ITEM_STATES`. */
export type ItemState = (typeof ITEM_STATES)[number]

/**
 * The items Owen may call urgent or not (`calm`, its id chip):  judgement calls and issues, the kinds red while open
 * and not reviewed (`PlanReader.itemState()`;  the tool's `CALM_ID`, the same rule).
 */
export const CALM_ID = /^[ij]\d+$/

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
export const GIT = "git"
export const OVERNIGHT = "overnight"
export const REVIEW = "review"
export const DETAILS = "details"
export const LABEL = "label"
export const NOTE = "note"
export const CELL = "cell"
/** Under the line, over the details:  a marked note, and the note box of an item without details. */
export const UNDER_LINE = "under-line"

/** Class words on the item box:  it has details;  it's unfolded. */
export const HAS_DETAILS = "has-details"
export const UNFOLDED = "unfolded"

/** The struck-through status, and its class word. */
export const CANCELED = "canceled"

/** `id` of the details box, which the toggle controls. */
export const DETAILS_ID = "details"

/** Children that aren't prose:  the item's parts, drawn by their own elements. */
export const EPIC_TAG = /^epic-/

/** `<epic-*>` tags that are prose (`flow`), not parts:  the UPDATE marker. */
export const FLOW_TAGS: readonly string[] = ["epic-update"]

/** The More Details card's tag:  an item with one labels its own text "Original reply". */
export const MORE_TAG = "epic-more"

/** The icon of an item made overnight (`overnight`):  `<epic-page bedtime>`'s too (J28). */
export const BED_ICON = "bed"

/** A commit's tag:  an item with one among its children gets the git icon (T17). */
export const COMMIT_TAG = "epic-commit"

/**
 * The custom property `<epic-commit>` shows by (`block`):  the page's git toggle sets it for every commit, an item's
 * git icon for its own (`EpicPage.types.ts` `COMMITS_PROPERTY`, the same name).
 */
export const COMMITS_PROPERTY = "--epic-commits-display"

////////////////
// ## Review controls (P9:  `ReviewControls.tsx`, shared with `<epic-section>`'s Overview parts)
////////////////

/** One review button:  its action, colour once chosen, icon, and its name and tooltip texts. */
export type ReviewButtonSpec = {
  /** what it does (`ReviewClient.press()`) */
  action: "approve" | "todo" | "revisit" | "details"
  /** chosen:  green decided, orange pending (Owen, 2026-10-06, epic `windows-and-review` Q4) */
  color: "green" | "orange"
  /** its `ui-icon` */
  icon: string
  /** its name:  the plain tooltip */
  label: "approve" | "todo" | "revisit" | "details"
  /** what it does, for a screen reader */
  tip: "approveTip" | "todoTip" | "revisitTip" | "detailsTip"
}

/**
 * The line's four review buttons, in their order:  Approve, Make Todo, Revisit (the GROUP:  states an item can be in),
 * then Add Details Now on its own (an action, not a state;  Owen, 2026-10-06, Q8).  Unchosen, all a grey outline.
 */
export const REVIEW_BUTTONS: readonly ReviewButtonSpec[] = [
  { action: "approve", color: "green", icon: "check", label: "approve", tip: "approveTip" },
  { action: "todo", color: "green", icon: "list check", label: "todo", tip: "todoTip" },
  { action: "revisit", color: "orange", icon: "history", label: "revisit", tip: "revisitTip" },
  { action: "details", color: "orange", icon: "magic", label: "details", tip: "detailsTip" }
]

/**
 * An Overview sub-section's review buttons (decision Q14):  Make Todo, Revisit, Add Details Now -- notes on the plan's
 * parts, not sign-off, so no Approve.
 */
export const OVERVIEW_BUTTONS: readonly ReviewButtonSpec[] = REVIEW_BUTTONS.filter((spec) => spec.action !== "approve")

/**
 * The note box's three buttons, in Owen's order (2026-10-07, J4):  Revisit Later (queued for the next send), Do Now
 * (revisit now), Make Todo.
 * - Revisit Later wears the line's Revisit icon:  both end in the same mark, a revisit
 */
export const NOTE_BUTTONS = [
  { how: "soon", icon: "history", label: "boxSoon", tip: "boxSoonTip" },
  { how: "now", icon: "wand magic sparkles", label: "boxNow", tip: "boxNowTip" },
  { how: "todo", icon: "list check", label: "boxTodo", tip: "boxTodoTip" }
] as const

/** A note box button's `how`. */
export type NoteHow = (typeof NOTE_BUTTONS)[number]["how"]

/** Class names of the review controls, inside the shadow root (`ReviewControls.css`). */
export const REVIEW_CONTROLS = "review-controls"
export const REVIEW_GROUP = "review-group"
export const REVIEW_DETAILS = "review-details"
export const REVIEW_NOTED = "review-noted"
export const REVIEW_PICK = "review-pick"
export const NOTE_BOX = "note-box"
export const NOTE_TEXT = "note-text"
export const NOTE_INPUT = "note-input"
export const NOTE_SAVED = "note-saved"
export const NOTE_ACTIONS = "note-actions"
export const SAID = "said"
export const SAID_TITLE = "said-title"
export const SAID_WHAT = "said-what"
export const SAID_EDIT = "said-edit"
export const SAID_NOTE = "said-note"

/** The tag of the page the review controls mark as being reviewed (its `reviewing` attribute). */
export const PAGE_TAG = "epic-page"

/** `<epic-page>`'s attribute while the page is being reviewed:  `body.plan-reviewing`'s heir. */
export const REVIEWING = "reviewing"

/** The review controls' parts:  in every vocabulary that draws them. */
export const REVIEW_PARTS = [
  {
    name: "review-buttons",
    description:
      "The review buttons (P9):  the note bubble, a pick's letter, Approve / Make Todo / Revisit, Add Details Now.  " +
      "Only while the page is reviewed (served by the page server, its inbox answering)."
  },
  { name: "note-box", description: "The note box:  the note, then Revisit Later, Do Now and Make Todo." },
  { name: "said", description: "A note marked and closed:  `You · revisit soon · sent 10:42`, the note, Edit." }
] as const

/** The review controls' texts:  in every vocabulary that draws them. */
export const REVIEW_TEXTS = [
  { key: "reviewControls", text: "Review {id}", description: "The review buttons' group, for a screen reader." },
  { key: "approve", text: "Approve", description: "Review button:  its name." },
  { key: "approveTip", text: "Fine as it is", description: "Review button:  what Approve does." },
  { key: "todo", text: "Make Todo", description: "Review button:  its name." },
  { key: "todoTip", text: "Follow it up later, as a todo", description: "Review button:  what Make Todo does." },
  { key: "revisit", text: "Revisit", description: "Review button:  its name." },
  { key: "revisitTip", text: "Talk it over:  write in the box at its end", description: "Review button:  Revisit." },
  { key: "details", text: "Add Details Now", description: "Review button:  its name." },
  {
    key: "detailsTip",
    text: "Claude writes a fuller explanation into it, at once",
    description: "Review button:  what Add Details Now does."
  },
  { key: "waiting", text: "waiting:  {why}", description: "A request queued with nobody listening." },
  { key: "revisiting", text: "Claude is looking into this · click to call it off", description: "Revisit at work." },
  { key: "detailing", text: "Claude is adding details · click to call it off", description: "Add Details at work." },
  { key: "callOff", text: "{label}:  click to call it off", description: "A spinning button's tooltip." },
  { key: "chosenSent", text: "sent · click to clear", description: "A chosen button, its mark sent." },
  { key: "chosenUnsent", text: "not sent yet · click to clear", description: "A chosen button, its mark not sent." },
  { key: "doneBefore", text: "done before", description: "How Claude applied an earlier mark (`review-as`)." },
  { key: "pickedSent", text: "Picked {letter} · sent", description: "The pick's letter, sent." },
  { key: "pickedUnsent", text: "Picked {letter} · not sent yet", description: "The pick's letter, not sent." },
  { key: "noteDraft", text: "Your note, not sent yet (saved):  {note}", description: "The note bubble:  a draft." },
  { key: "noteSent", text: "Your note, sent:  {note}", description: "The note bubble:  a mark's note, sent." },
  { key: "noteUnsent", text: "Your note, not sent yet:  {note}", description: "The note bubble:  a mark's note." },
  { key: "notePlaceholder", text: "Your note:  a question, instructions, why", description: "The empty note box." },
  { key: "noteLabel", text: "{id}:  your note", description: "The note box, for a screen reader." },
  { key: "boxTodo", text: "Make Todo", description: "Note box button:  its name." },
  { key: "boxTodoTip", text: "Make Todo:  follow it up later, with this note", description: "Note box:  Make Todo." },
  { key: "boxSoon", text: "Revisit Later", description: "Note box button:  its name." },
  { key: "boxSoonTip", text: "Revisit Later:  talk it over in the next batch", description: "Note box:  Later." },
  { key: "boxNow", text: "Do Now", description: "Note box button:  its name." },
  { key: "boxNowTip", text: "Do Now:  Claude looks into it at once", description: "Note box:  Do Now." },
  { key: "saved", text: "Saved {time}", description: "The note box's floppy:  its draft is saved." },
  { key: "notSaved", text: "Not saved:  {why} (kept in this browser)", description: "The floppy, red:  not saved." },
  { key: "you", text: "You", description: "Who wrote a marked note." },
  { key: "howSoon", text: "revisit soon", description: "A marked note's kind." },
  { key: "howNow", text: "revisit now", description: "A marked note's kind." },
  { key: "howTodo", text: "todo", description: "A marked note's kind." },
  { key: "saidSent", text: "{how} · sent {time}", description: "A marked note:  sent." },
  { key: "saidUnsent", text: "{how} · not sent yet", description: "A marked note:  not sent." },
  { key: "edit", text: "Edit", description: "A marked note's button:  back into the note box." }
] as const

/** A review control's text key. */
export type ReviewTextKey = (typeof REVIEW_TEXTS)[number]["key"]

/** How a review control asks its element for a text:  `UIComponent.translationForKey()`, narrowed to the review keys. */
export type ReviewText = (key: ReviewTextKey, params?: Record<string, string | number>) => string

// the Spell UI tags the review controls draw (`ReviewControls.tsx`)
declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      "ui-button": UIJSXAttributes
      "ui-buttons": UIJSXAttributes
      "ui-icon": UIJSXAttributes
    }
  }
}
