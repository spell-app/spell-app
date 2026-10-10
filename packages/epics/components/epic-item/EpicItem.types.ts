/**
 * Loose types and constants of the `epic-item` family.
 * - Data only:  nothing here runs.
 */

import type { NewKind } from "$/epics/review"

import type { epicItemVocabulary } from "./EpicItem.en"
import type { UIJSXAttributes } from "$/epics/components/epic-page/EpicPage.types"

/** `epicItemVocabulary`'s type. */
export type EpicItemVocabulary = typeof epicItemVocabulary

////////////////
// ## States
////////////////

/** An item's id-chip colours, by where it stands (the script's `state`):  see `EpicItem.css`. */
export const ITEM_STATES = ["attention", "replied", "progress", "open", "recent", "old"] as const

/** One of `ITEM_STATES`. */
export type ItemState = (typeof ITEM_STATES)[number]

/**
 * The states that wait on Owen:  `attention` (red), and `replied` (orange:  Claude answered with options, his turn
 * to pick).  What a section's count and its "only what needs you" filter take (`<epic-section>`).
 */
export const NEEDS_OWEN: ReadonlySet<string> = new Set(["attention", "replied"] satisfies ItemState[])

/**
 * The items Owen may call urgent or not (`calm`, its id chip):  judgement calls and issues, the kinds red while open
 * and not reviewed (`PlanReader.itemState()`;  the tool's `CALM_ID`, the same rule).
 */
export const CALM_ID = /^[ij]\d+$/

/** Statuses that close an item:  a closed one's Choose pills show only while it's revisited (`<epic-option>`). */
export const CLOSED_STATUSES = ["decided", "done", "canceled"] as const

/**
 * An item's state when it has no `state` (the tool writes one on every edit), by its status:  decided or done
 * `recent` (green, however old), canceled `old` (grey:  no longer relevant), anything else `open`
 * (`PlanReader.itemState()`, Owen, 2026-10-08):  `STATUS_STATES[status] ?? "open"`.
 */
export const STATUS_STATES: Readonly<Record<string, ItemState>> = { decided: "recent", done: "recent", canceled: "old" }

/** `state`'s text key, for the id chip's tooltip. */
export const STATE_TIP_KEYS = {
  attention: "stateAttention",
  replied: "stateReplied",
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

/** Class word on the item box:  no details, its note box open under the line (its chevron folds it away). */
export const NOTE_OPEN = "note-open"

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

/** A card set with an option chosen, anywhere in an item:  a pick that has landed in the doc. */
export const CHOSEN_SET = "epic-choices[chosen]"

/**
 * The custom property `<epic-commit>` shows by (`block`):  the page's git toggle sets it for every commit, an item's
 * git icon for its own (`EpicPage.types.ts` `COMMITS_PROPERTY`, the same name).
 */
export const COMMITS_PROPERTY = "--epic-commits-display"

////////////////
// ## Review controls (P9:  `ReviewControls.tsx`, shared with `<epic-section>`'s Overview parts)
////////////////

/**
 * The colours of the review controls (decision Q20 of epic `epic-components`, Owen, 2026-10-08):
 * - green:  decided or done (Approve, Make Todo, a pick;  a todo's plane, do it in the next phase)
 * - blue:  do it now, or Claude is on it (Revisit, Do Now)
 * - grey:  no longer relevant (a todo's x, drop it:  Owen, 2026-10-09)
 */
export type ReviewColor = "green" | "blue" | "grey"

/**
 * How far a review button's mark has got:  its FILL (decision Q20), the review buttons being Owen's INPUT (Owen,
 * 2026-10-08).
 * - `none`:  a grey outline, available;  also once Claude has handled the mark:  the buttons CLEAR, and the id chip
 *   shows the result (green decided, yellow open, red needs Owen)
 * - `dashed`:  dashed in its colour:  Owen pressed it, not committed (not sent;  a Do Now not taken yet)
 * - `outline`:  outlined in its colour:  recorded (sent;  a Do Now taken), not done yet, or in progress
 * - never solid:  solid is the chips' (and the Choose pill's, once applied)
 */
export type ReviewFill = "none" | "dashed" | "outline"

/**
 * Where Owen's answer on an item stands, as its id chip wears it (`EpicItem.chipMark`):
 * a colour and a fill, dashed or outlined;  none, and the chip is solid in its state's colour.
 * - his live mark (Owen, 2026-10-08:  the chip matches the chosen button):  that button's colour and fill
 * - answered, work still due (Owen, 2026-10-10):  outlined, green queued, blue Claude on it
 */
export type ChipMark = {
  color: ReviewColor
  fill: Exclude<ReviewFill, "none">
  /** the chosen button's name (`approve`), or a pick's letter, for the tooltip;  none when work is still due */
  label?: ReviewButtonSpec["label"] | { pick: string }
}

/** One review button:  its action, colour, icon, and its name and tooltip texts. */
export type ReviewButtonSpec = {
  /**
   * what it does (`ReviewClient.press()`;  `details` is Do Now, the inbox's name for an immediate request;
   * `next` and `drop` a todo's plane and x)
   */
  action: "approve" | "todo" | "revisit" | "details" | "next" | "drop"
  /** its colour once pressed:  green decided, blue an ask of Claude (Q20), grey no longer relevant */
  color: ReviewColor
  /** its `ui-icon` */
  icon: string
  /** its name:  the plain tooltip */
  label: "approve" | "todo" | "revisit" | "doNow" | "next" | "revisitNote" | "drop"
  /** what it does, for a screen reader */
  tip: "approveTip" | "todoTip" | "revisitTip" | "doNowTip" | "nextTip" | "revisitNoteTip" | "dropTip"
}

/**
 * The line's four review buttons, in their order (decision Q20):
 * - Approve, Revisit, Make Todo (the GROUP:  what Owen makes of it)
 * - then Do Now apart, with the magic wand, as the page header's Review Now (Owen, 2026-10-09:  it was a paper
 *   plane, which a todo's "next phase" button wears now)
 *   (an action, not a state:  it replaces Add Details Now and the note box's Do Now)
 * - Every one shows at every step:  a mark done can still be followed by another.
 */
export const REVIEW_BUTTONS: readonly ReviewButtonSpec[] = [
  { action: "approve", color: "green", icon: "check", label: "approve", tip: "approveTip" },
  { action: "revisit", color: "blue", icon: "history", label: "revisit", tip: "revisitTip" },
  { action: "todo", color: "green", icon: "list check", label: "todo", tip: "todoTip" },
  { action: "details", color: "blue", icon: "wand magic sparkles", label: "doNow", tip: "doNowTip" }
]

/**
 * A TODO's review buttons (Owen, 2026-10-09), one group, in this order:
 * - the plane (`next`, green:  decided):  do it in the next phase;  `inbox apply` queues it into the first phase still
 *   to do
 * - Revisit (blue):  Owen is adding a note for Claude, in the box
 * - the x (`drop`, grey:  no longer relevant):  drop it;  `inbox apply` cancels it
 * - no Approve, Make Todo or Do Now:  a todo is already the follow-up
 */
export const TODO_BUTTONS: readonly ReviewButtonSpec[] = [
  { action: "next", color: "green", icon: "paper plane", label: "next", tip: "nextTip" },
  { action: "revisit", color: "blue", icon: "history", label: "revisitNote", tip: "revisitNoteTip" },
  { action: "drop", color: "grey", icon: "xmark", label: "drop", tip: "dropTip" }
]

/** A todo's id:  `t3`. */
export const TODO_ID = /^t\d+$/i

/**
 * An Overview sub-section's review buttons (decision Q14):  Revisit, Make Todo, Do Now -- notes on the plan's parts,
 * not sign-off, so no Approve.
 */
export const OVERVIEW_BUTTONS: readonly ReviewButtonSpec[] = REVIEW_BUTTONS.filter((spec) => spec.action !== "approve")

/** One note box button:  what it makes of the note (`how`), its colour, icon, name and tooltip. */
export type NoteButtonSpec = {
  /** the mark it makes of the note (`ReviewClient.useNote()`) */
  how: "soon" | "todo" | "next" | "drop"
  color: ReviewColor
  icon: string
  label: "boxSoon" | "boxTodo" | "boxNext" | "boxDrop"
  tip: "boxSoonTip" | "boxTodoTip" | "boxNextTip" | "boxDropTip"
}

/**
 * The note box's buttons, in the line's order:  Revisit Later (queued for the next send), Make Todo.
 * - Revisit Later wears the line's Revisit icon:  both end in the same mark, a revisit
 * - no Do Now here any more (Q20):  the line's Do Now takes the note in the box with it
 */
export const NOTE_BUTTONS: readonly NoteButtonSpec[] = [
  { how: "soon", color: "blue", icon: "history", label: "boxSoon", tip: "boxSoonTip" },
  { how: "todo", color: "green", icon: "list check", label: "boxTodo", tip: "boxTodoTip" }
]

/**
 * A TODO's note box buttons, in its line's order (Owen, 2026-10-09:  "the icons next to the field", the plane and the
 * x, to match the line):
 * - the plane:  do it in the next phase, with this note
 * - Revisit Later:  just the note, for Claude (the line's Revisit:  "I'm adding text for you")
 * - the x:  drop it, the note saying why
 */
export const TODO_NOTE_BUTTONS: readonly NoteButtonSpec[] = [
  { how: "next", color: "green", icon: "paper plane", label: "boxNext", tip: "boxNextTip" },
  { how: "soon", color: "blue", icon: "history", label: "boxSoon", tip: "boxSoonTip" },
  { how: "drop", color: "grey", icon: "xmark", label: "boxDrop", tip: "boxDropTip" }
]

/** A note box button's `how`. */
export type NoteHow = NoteButtonSpec["how"]

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
      "The review buttons (P9):  the note bubble, a pick's letter, Approve / Revisit / Make Todo, then Do Now (the " +
      "wand);  a todo's:  the plane (next phase), Revisit, the x (drop).  " +
      "Only while the page is reviewed (served by the page server, its inbox answering)."
  },
  {
    name: "note-box",
    description:
      "The note box:  the note, then Revisit Later and Make Todo;  a todo's:  the plane, Revisit Later, the x."
  },
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
  { key: "next", text: "Do it in the next phase", description: "A todo's review button (the plane):  its name." },
  {
    key: "nextTip",
    text: "Queued into the next phase still to do, once Claude applies it",
    description: "A todo's review button:  what the plane does."
  },
  {
    key: "revisitNote",
    text: "Revisit:  I'm adding a note for you",
    description: "A todo's review button:  Revisit's name."
  },
  {
    key: "revisitNoteTip",
    text: "Write a note for Claude in the box at its end",
    description: "A todo's review button:  what Revisit does."
  },
  { key: "drop", text: "Drop it", description: "A todo's review button (the x):  its name." },
  {
    key: "dropTip",
    text: "Canceled, struck through, once Claude applies it",
    description: "A todo's review button:  what the x does."
  },
  { key: "waiting", text: "waiting:  {why}", description: "A request queued with nobody listening." },
  { key: "asked", text: "asked · waiting for Claude to take it", description: "A Do Now not taken yet." },
  { key: "working", text: "Claude is on it · click to call it off", description: "A button whose work is under way." },
  { key: "callOff", text: "{label}:  click to call it off", description: "A spinning button's tooltip." },
  { key: "chosenSent", text: "sent · click to clear", description: "A chosen button, its mark sent." },
  { key: "chosenUnsent", text: "not sent yet · click to clear", description: "A chosen button, its mark not sent." },
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
  { key: "boxNext", text: "Do it in the next phase", description: "A todo's note box button (the plane):  its name." },
  {
    key: "boxNextTip",
    text: "Do it in the next phase, with this note",
    description: "A todo's note box:  the plane."
  },
  { key: "boxDrop", text: "Drop it", description: "A todo's note box button (the x):  its name." },
  { key: "boxDropTip", text: "Drop it:  this note says why", description: "A todo's note box:  the x." },
  { key: "saved", text: "Saved {time}", description: "The note box's floppy:  its draft is saved." },
  { key: "notSaved", text: "Not saved:  {why} (kept in this browser)", description: "The floppy, red:  not saved." },
  { key: "you", text: "You", description: "Who wrote a marked note." },
  { key: "howSoon", text: "revisit soon", description: "A marked note's kind." },
  { key: "howNow", text: "revisit now", description: "A marked note's kind." },
  { key: "howTodo", text: "todo", description: "A marked note's kind." },
  { key: "howNext", text: "next phase", description: "A marked note's kind:  a todo's plane." },
  { key: "howDrop", text: "drop", description: "A marked note's kind:  a todo's x." },
  { key: "saidSent", text: "{how} · sent {time}", description: "A marked note:  sent." },
  { key: "saidUnsent", text: "{how} · not sent yet", description: "A marked note:  not sent." },
  { key: "edit", text: "Edit", description: "A marked note's button:  back into the note box." }
] as const

/** A review control's text key. */
export type ReviewTextKey = (typeof REVIEW_TEXTS)[number]["key"]

/** How a review control asks its element for a text:  `UIComponent.translationForKey()`, narrowed to the review keys. */
export type ReviewText = (key: ReviewTextKey, params?: Record<string, string | number>) => string

////////////////
// ## New items from the page (epic `airplane` P2)
////////////////

/**
 * Each kind of new item Owen may ask for from the page (`NewItems.tsx`):  its icon, its words' keys (`label` on its
 * pending card, `add` on its section's button), and the section it lands in.
 */
export const NEW_KIND_LOOKS = {
  todo: { icon: "list check", label: "newTodo", add: "addTodo", section: "todos" },
  question: { icon: "circle question", label: "newQuestion", add: "addQuestion", section: "questions" }
} as const satisfies Record<NewKind, { icon: string; label: NewTextKey; add: NewTextKey; section: string }>

/** Class names of the new-item controls, inside the shadow root (`ReviewControls.css`). */
export const NEW_BUTTON = "new-button"
export const NEW_FORM = "new-form"
export const NEW_KINDS_GROUP = "new-kinds"
export const NEW_INPUT = "new-input"
export const NEW_ACTIONS = "new-actions"
export const NEW_LIST = "new-list"
export const NEW_CARD = "new-card"

/** The new-item controls' parts:  in every vocabulary that draws them (`<epic-page>`, `<epic-section>`). */
export const NEW_PARTS = [
  {
    name: "new-button",
    description:
      "The New todo / question button (epic `airplane` P2):  the page header's `+`, a Todos or Questions section's at " +
      "its end.  Only while the page is reviewed."
  },
  { name: "new-form", description: "The new item's form:  todo or question, its title, a note, what it's about." },
  {
    name: "new-list",
    description: "A Todos or Questions section's new items waiting to be made:  dashed until sent, then outlined."
  }
] as const

/** The new-item controls' texts:  in every vocabulary that draws them. */
export const NEW_TEXTS = [
  { key: "newButton", text: "New todo or question", description: "The page header's `+`:  its name." },
  { key: "addTodo", text: "New todo", description: "The Todos section's button, at its end." },
  { key: "addQuestion", text: "New question", description: "The Questions section's button, at its end." },
  { key: "newForm", text: "A new todo or question, for Claude to add", description: "The form, for a screen reader." },
  { key: "newKind", text: "What it is", description: "The form's kind buttons, for a screen reader." },
  { key: "newTodo", text: "Todo", description: "Kind:  a todo." },
  { key: "newQuestion", text: "Question", description: "Kind:  a question." },
  { key: "newTitle", text: "Title:  what to do, or what to ask", description: "The title field's placeholder." },
  {
    key: "newNote",
    text: "More, if it helps:  why, what you know, what to check",
    description: "The note field's placeholder."
  },
  {
    key: "newNear",
    text: "About (an id, if any):  P3, Q7, O1, summary",
    description: "The about field's placeholder."
  },
  { key: "newAdd", text: "Add", description: "The form's button:  a new one." },
  { key: "newSave", text: "Save", description: "The form's button:  one being changed." },
  { key: "newCancel", text: "Cancel", description: "The form's button:  closes it, nothing saved." },
  { key: "newNeedsTitle", text: "Give it a title first", description: "Add pressed with no title." },
  { key: "newUnsent", text: "not sent yet:  Send hands it to Claude", description: "A pending new item, not sent." },
  {
    key: "newSent",
    text: "sent:  Claude adds it at the next review",
    description: "A pending new item, sent, not made yet."
  },
  { key: "newAbout", text: "About {id}", description: "A pending new item's link to what it's about." },
  { key: "newEdit", text: "Edit", description: "A pending new item's button:  back into the form." },
  { key: "newRemove", text: "Remove", description: "A pending new item's button:  gone, never made." }
] as const

/** A new-item control's text key. */
export type NewTextKey = (typeof NEW_TEXTS)[number]["key"]

/** How a new-item control asks its element for a text. */
export type NewText = (key: NewTextKey, params?: Record<string, string | number>) => string

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
