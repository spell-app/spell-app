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

/** The review label's look:  `todo` yellow (open:  work still to do), `deferred` grey, `reviewed` by state. */
export type ReviewLook = "todo" | "deferred" | "recent" | "old"

/** The review label on an item's line:  its words, look and tooltip. */
export type ReviewLabel = {
  /** what it says:  `to do`, `deferred`, `reviewed 10/6/26` */
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

/**
 * The slot of Claude's status cards (`<epic-status slot="status">`, P13):  drawn under Owen's marked note, above
 * the note box (an Overview sub-section's too).
 */
export const STATUS_SLOT = "status"

/** Children that aren't prose:  the item's parts, drawn by their own elements. */
export const EPIC_TAG = /^epic-/

/** `<epic-*>` tags that are prose (`flow`), not parts:  the UPDATE marker, a Net effect list. */
export const FLOW_TAGS: readonly string[] = ["epic-update", "epic-net-effect"]

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

/**
 * The colours of the review controls (decision Q20 of epic `epic-components`, Owen, 2026-10-08):  green decided or
 * done (Approve, Make Todo, a pick), blue do it now or Claude is on it (Revisit, Do Now).
 */
export type ReviewColor = "green" | "blue"

/**
 * How far a review button's mark has got:  its FILL (decision Q20), on every button, pill and chip with a lifecycle.
 * - `none`:  a grey outline, available
 * - `dashed`:  dashed in its colour:  Owen pressed it, not committed (not sent;  a Do Now not taken yet)
 * - `outline`:  outlined in its colour:  recorded (sent;  a Do Now taken), not done yet, or in progress
 * - `solid`:  filled in its colour:  done (applied, answered, filed:  the item's `review-as`)
 */
export type ReviewFill = "none" | "dashed" | "outline" | "solid"

/**
 * Owen's mark on an item, as its id chip wears it (Owen, 2026-10-08:  the chip matches the chosen button):  the
 * chosen button's colour and fill, and its name for the chip's tooltip.  Only a LIVE mark:  dashed or outlined.
 */
export type ChipMark = {
  color: ReviewColor
  fill: Exclude<ReviewFill, "none" | "solid">
  /** the chosen button's name (`approve`), or a pick's letter */
  label: ReviewButtonSpec["label"] | { pick: string }
}

/** One review button:  its action, colour, icon, and its name and tooltip texts. */
export type ReviewButtonSpec = {
  /** what it does (`ReviewClient.press()`;  `details` is Do Now, the inbox's name for an immediate request) */
  action: "approve" | "todo" | "revisit" | "details"
  /** its colour once pressed:  green decided, blue an ask of Claude (Q20) */
  color: ReviewColor
  /** its `ui-icon` */
  icon: string
  /** its name:  the plain tooltip */
  label: "approve" | "todo" | "revisit" | "doNow"
  /** what it does, for a screen reader */
  tip: "approveTip" | "todoTip" | "revisitTip" | "doNowTip"
}

/**
 * The line's four review buttons, in their order (decision Q20):  Approve, Revisit, Make Todo (the GROUP:  what Owen
 * makes of it), then Do Now apart, with a paper plane (an action, not a state:  it replaces Add Details Now and the
 * note box's Do Now).  Every one shows at every step:  a mark done can still be followed by another.
 */
export const REVIEW_BUTTONS: readonly ReviewButtonSpec[] = [
  { action: "approve", color: "green", icon: "check", label: "approve", tip: "approveTip" },
  { action: "revisit", color: "blue", icon: "history", label: "revisit", tip: "revisitTip" },
  { action: "todo", color: "green", icon: "list check", label: "todo", tip: "todoTip" },
  { action: "details", color: "blue", icon: "paper plane", label: "doNow", tip: "doNowTip" }
]

/**
 * An Overview sub-section's review buttons (decision Q14):  Revisit, Make Todo, Do Now -- notes on the plan's parts,
 * not sign-off, so no Approve.
 */
export const OVERVIEW_BUTTONS: readonly ReviewButtonSpec[] = REVIEW_BUTTONS.filter((spec) => spec.action !== "approve")

/**
 * The note box's buttons, in the line's order:  Revisit Later (queued for the next send), Make Todo.
 * - Revisit Later wears the line's Revisit icon:  both end in the same mark, a revisit
 * - no Do Now here any more (Q20):  the line's Do Now takes the note in the box with it
 */
export const NOTE_BUTTONS = [
  { how: "soon", color: "blue", icon: "history", label: "boxSoon", tip: "boxSoonTip" },
  { how: "todo", color: "green", icon: "list check", label: "boxTodo", tip: "boxTodoTip" }
] as const satisfies readonly { how: string; color: ReviewColor; icon: string; label: string; tip: string }[]

/** A note box button's `how`. */
export type NoteHow = (typeof NOTE_BUTTONS)[number]["how"]

/** Class names of the review controls, inside the shadow root (`ReviewControls.css`). */
export const REVIEW_CONTROLS = "review-controls"
export const REVIEW_GROUP = "review-group"
export const REVIEW_DO_NOW = "review-do-now"
export const REVIEW_NOTED = "review-noted"
export const REVIEW_PICK = "review-pick"
export const NOTE_BOX = "note-box"
export const NOTE_TEXT = "note-text"
export const NOTE_INPUT = "note-input"
export const NOTE_SAVED = "note-saved"
export const NOTE_ACTIONS = "note-actions"
export const SAID = "said"
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
      "The review buttons (P9):  the note bubble, a pick's letter, Approve / Revisit / Make Todo, then Do Now.  " +
      "Only while the page is reviewed (served by the page server, its inbox answering)."
  },
  { name: "note-box", description: "The note box:  the note, then Revisit Later and Make Todo." },
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
  { key: "doNow", text: "Do Now", description: "Review button:  its name." },
  {
    key: "doNowTip",
    text: "Claude takes it at once:  answers the note in its box, or adds details",
    description: "Review button:  what Do Now does."
  },
  { key: "waiting", text: "waiting:  {why}", description: "A request queued with nobody listening." },
  { key: "asked", text: "asked · waiting for Claude to take it", description: "A Do Now not taken yet." },
  { key: "working", text: "Claude is on it · click to call it off", description: "A button whose work is under way." },
  { key: "callOff", text: "{label}:  click to call it off", description: "A spinning button's tooltip." },
  { key: "chosenSent", text: "sent · click to clear", description: "A chosen button, its mark sent." },
  { key: "chosenUnsent", text: "not sent yet · click to clear", description: "A chosen button, its mark not sent." },
  { key: "doneBefore", text: "done", description: "How Claude handled an earlier mark (`review-as`):  done." },
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
