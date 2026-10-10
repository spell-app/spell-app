/**
 * Loose types and constants of the `epic-section` family, and the FOLD pieces `<epic-overview>`, `<epic-section>`
 * and `<epic-phase>` share (`EpicFold`):  their vocabularies spread `FOLD_*`.
 * - Data only:  nothing here runs.  Vocabularies value-import it, so it imports them with `import type` only, and
 *   node imports it through them (`Definitions`):  never a DOM or Solid value here.
 */

import type { epicSectionVocabulary } from "./EpicSection.en"

/** `epicSectionVocabulary`'s type. */
export type EpicSectionVocabulary = typeof epicSectionVocabulary

////////////////
// ## Fold vocabulary (shared)
////////////////

/** The `open` attribute every folding element takes:  page state, never written in a doc. */
export const FOLD_OPEN_ATTRIBUTE = {
  name: "open",
  kind: "boolean",
  description:
    "Unfolded:  PAGE state, never written in a doc (plan docs open folded).  A click on the title, a link to it " +
    "(or into it) and find-in-page set it;  set it from code to open it."
} as const

/** Events of every folding element:  `ui-open` / `ui-close` (cancelable), and its `source` body's. */
export const FOLD_EVENTS = [
  {
    name: "ui-open",
    detail: "{ open: true, element: Element, originalEvent?: Event }",
    cancelable: true,
    description: "About to unfold:  its title was clicked.  Cancel to stay folded.  After the fact for a link."
  },
  {
    name: "ui-close",
    detail: "{ open: false, element: Element, originalEvent?: Event }",
    cancelable: true,
    description: "About to fold:  its title was clicked.  Cancel to stay open."
  },
  {
    name: "ui-load",
    detail: "{ source: string, content: string }",
    description: "The `source` part arrived and is in its children (as `<ui-section source>`'s)."
  },
  {
    name: "ui-error",
    detail: "{ kind: 'load' | 'cross-origin' | 'file-protocol' | 'render', source: string, error: unknown }",
    cancelable: true,
    description: "The `source` part couldn't be loaded;  its note says so unless cancelled."
  }
] as const

/** Parts of every folding element. */
export const FOLD_PARTS = [
  { name: "base", description: "The element's box." },
  {
    name: "section",
    description: "The `<ui-section>` drawing the title bar and fold:  its own parts through `::part()` from inside."
  },
  { name: "body", description: "Around its children:  sets `--epic-stack` for them." },
  {
    name: "collapse-all",
    description: "While open, the double chevron before the fold chevron:  folds everything inside it, not itself."
  },
  { name: "note", description: "The `Loads from parts/x.html ...` line, when its part can't load." }
] as const

/** States of every folding element. */
export const FOLD_STATES = [
  { name: "open", description: "Unfolded." },
  { name: "loaded", description: "Its `source` part is in." },
  { name: "error", description: "Its `source` part couldn't be loaded." }
] as const

/** Texts of every folding element. */
export const FOLD_TEXTS = [
  {
    key: "partNote",
    text: "Loads from {source} when opened (needs the page server).",
    description: "Its part can't load:  the page was opened from disk."
  },
  { key: "partError", text: "Couldn't load {source}.", description: "Its part couldn't be loaded." },
  {
    key: "collapseAll",
    text: "Fold everything in {name}",
    description: "The collapse-all button's name and tooltip;  `name` its title (`3. Questions`)."
  }
] as const

////////////////
// ## Fold (`EpicFold`)
////////////////

/** The folding elements:  what a link landing inside one opens first. */
export const FOLD_TAGS = "epic-overview, epic-section, epic-phase, epic-item"

/** The custom property every folding element sets around its children:  the bottom of the stuck titles, px. */
export const STACK_PROPERTY = "--epic-stack"

/** `SourceFailure.kind` of a page opened from disk. */
export const FILE_PROTOCOL = "file-protocol"

/** What a folding element needs of its inner `<ui-section>`'s component (`UISection`):  its sticky line and stack. */
export type SectionStack = {
  /** where its title sticks, px from the viewport's top */
  readonly stickTop: number
  /** where titles inside it stick:  below its own, px from the viewport's top */
  readonly innerStackTop: number
}

/** `detail` of a folding element's `ui-open` / `ui-close`. */
export type FoldToggleDetail = {
  /** state it's ABOUT to enter:  `true` unfolding */
  open: boolean
  /** the folding element */
  element: Element
  /** the click on its title;  none for a link */
  originalEvent?: Event
}

/**
 * What the page's rail shows for a folding element (its DOM element's `contentsEntry`, read by
 * `spell-doc-runtime.js`):  read fresh each time, never tracked.
 */
export type ContentsEntry = {
  /** its title as drawn, number and all:  `3. Questions`, `1.2 Why`, `P3 · Converter` */
  label: string
  /** its icon's name (Spell UI's):  a section's kind icon, a phase's status icon */
  icon?: string
  /**
   * the icon's colour (Spell UI's `color`):  a phase's status.
   * - REFACTOR: drawn by nothing since the contents list went (the rail shows only top-level sections, never a
   *   phase):  drop it, and rename `contentsEntry` to `railEntry`
   */
  color?: string
  /** a section's count of its items or phases;  none for a kind that isn't counted, or with nothing in it */
  count?: SectionCount
}

/**
 * An item section's state filter as the page's toolbar reads it (`DOMEpicSectionElement.stateFilter`):
 * one entry per state its items are in, in the filter's order.
 */
export type StateFilterEntry = {
  /** the state:  `attention` ... */
  state: ItemStateName
  /** its chip's colour:  `red` ... */
  color: FilterState["color"]
  /** how many of its items are in it */
  count: number
  /** its items show */
  on: boolean
}

/** What a folding element's code reads of its attributes, whatever its vocabulary. */
export type FoldAttributes = {
  id?: string
  open?: boolean
  source?: string
  partIds?: string
}

////////////////
// ## Sections
////////////////

/**
 * Each page section kind => its icon (Spell UI's names, from the docs bundle's set) and its title's text key.
 * `overview-part` has neither:  its title is its own.
 */
export const SECTION_LOOKS = {
  phases: { icon: "layer group", title: "phasesTitle" },
  questions: { icon: "file circle question", title: "questionsTitle" },
  judgements: { icon: "gavel", title: "judgementsTitle" },
  caveats: { icon: "triangle exclamation", title: "caveatsTitle" },
  todos: { icon: "list check", title: "todosTitle" },
  issues: { icon: "bug", title: "issuesTitle" },
  tests: { icon: "flask", title: "testsTitle" },
  log: { icon: "clock rotate left", title: "logTitle" }
} as const

/** A page section's look:  `SECTION_LOOKS`' values. */
export type SectionLook = (typeof SECTION_LOOKS)[keyof typeof SECTION_LOOKS]

/**
 * A report's kind (an overnight `/bedtime` report, P14):  titled its own, unnumbered.  `$/epics/definitions`' `REPORT`,
 * restated:  the components never value-import the definitions.
 */
export const REPORT = "report"

/** The page's NUMBERED blocks, as siblings:  the Overview and the sections, but a report. */
export const NUMBERED_BLOCKS = `:scope > epic-overview, :scope > epic-section:not([kind="${REPORT}"])`

/** The kinds that hold items:  an empty one says "none yet". */
export const ITEM_KINDS = ["questions", "judgements", "caveats", "todos", "issues", "tests"] as const

/** The Phases section's toggles:  which fields each shows, its icon, its texts, the custom property it sets. */
export const PHASE_TOGGLES = [
  { field: "files", icon: "folder", show: "showFiles", hide: "hideFiles", property: "--epic-files-display" },
  { field: "verify", icon: "flask", show: "showVerify", hide: "hideVerify", property: "--epic-verify-display" }
] as const

/** One of `PHASE_TOGGLES`. */
export type PhaseToggle = (typeof PHASE_TOGGLES)[number]

/** `localStorage` key prefix of the Phases toggles, per page path. */
export const PHASE_TOGGLES_KEY = "epic-phase-fields:"

/** Class of the toggles' group, the toggles, an empty section's line, the body wrapper. */
export const TOOLS = "tools"
export const TOGGLE = "toggle"
export const EMPTY = "empty"
export const BODY = "body"
export const NOTE = "note"

////////////////
// ## Counts and the state filter (P10)
////////////////

/**
 * Statuses that DON'T count as open:  finished (`done`), made moot (`canceled`), answered (`decided`);  a phase's
 * `done`.  The old runtime's `CLOSED`, and the tool's.
 */
export const CLOSED_STATUSES = ["done", "decided", "canceled"] as const

/** The children a section counts:  its items, or its phases (`<epic-phase status>`). */
export const COUNTED = ":scope > epic-item, :scope > epic-phase"

/** The attributes of a counted child that change its count or its state:  a change re-counts. */
export const COUNT_ATTRIBUTES = ["status", "state"]

/**
 * Where an item stands, in the filter's order:  its state, its chip's colour, its texts' keys (the tooltip's words).
 * - the same six as `<epic-item state>` (`EpicItem.types.ts` `ITEM_STATES`), in the old runtime's filter order,
 *   `replied` (Owen's turn to pick, 2026-10-09) beside `attention`:  both wait on Owen
 */
export const FILTER_STATES = [
  { state: "progress", color: "blue", words: "stateProgress" },
  { state: "attention", color: "red", words: "stateAttention" },
  { state: "replied", color: "orange", words: "stateReplied" },
  { state: "open", color: "yellow", words: "stateOpen" },
  { state: "recent", color: "green", words: "stateRecent" },
  { state: "old", color: "grey", words: "stateOld" }
] as const

/**
 * The state filter's texts, in every vocabulary that draws its chips:  `<epic-section>`'s, and `<epic-page>`'s
 * (its toolbar filters every section at once).
 */
export const FILTER_TEXTS = [
  { key: "filterLabel", text: "Show items by state", description: "The state filter's group, for a screen reader." },
  {
    key: "chipWords",
    text: "{count} {words}:  {does}",
    description: "A state chip's name and tooltip:  how many, its state, what a click does (`showAll`, `chipOnly` ...)."
  },
  { key: "showAll", text: "show everything", description: "A state chip's click:  every state shows again." },
  { key: "chipOnly", text: "show only these", description: "A state chip's click:  only its state shows." },
  { key: "chipAlso", text: "show these too", description: "A state chip's click, hidden:  its state shows too." },
  { key: "chipHide", text: "hide these", description: "A state chip's click, showing:  its state hides." },
  {
    key: "stateProgress",
    text: "Claude is working on it",
    description: "A state chip's words:  `progress` (blue)."
  },
  { key: "stateAttention", text: "needs attention", description: "A state chip's words:  `attention` (red)." },
  {
    key: "stateReplied",
    text: "Claude answered:  your turn to pick",
    description: "A state chip's words:  `replied` (orange)."
  },
  { key: "stateOpen", text: "open, still undecided", description: "A state chip's words:  `open` (yellow)." },
  { key: "stateRecent", text: "decided or done", description: "A state chip's words:  `recent` (green)." },
  { key: "stateOld", text: "no longer relevant", description: "A state chip's words:  `old` (grey)." }
] as const

/** Each chip click (`StateFilter.clickDoes()`) => its words' text key. */
export const CHIP_CLICK_KEYS = { all: "showAll", only: "chipOnly", also: "chipAlso", hide: "chipHide" } as const

/** One of `FILTER_STATES`. */
export type FilterState = (typeof FILTER_STATES)[number]

/** One of `FILTER_STATES`' state names. */
export type ItemStateName = FilterState["state"]

/**
 * `localStorage` key prefix of the state filters, per page path:  `{ [section id]: [states shown] }`.
 * - the old runtime's (`spell-doc-runtime.js` `ITEM_FILTER_KEY_PREFIX`), same shape:  a filter left on an old page
 *   holds on its converted copy
 */
export const FILTER_KEY = "spell-item-state:"

/** A section's count:  its counted children, how many of them are open, and how many need Owen. */
export type SectionCount = {
  /** not closed (`CLOSED_STATUSES`) */
  open: number
  /** every one */
  total: number
  /**
   * the items that need Owen (`NEEDS_OWEN`:  `state="attention"`, red, or `replied`, orange:  his turn to pick):
   * what the rail counts (decision Q20:  red, only what needs him;  no pill for none)
   */
  attention: number
}

/** Classes of the filter's chips and its "hidden" line;  the Plan changes box and its heading. */
export const FILTER = "filter"
export const CHIP = "chip"
export const HIDDEN_NOTE = "hidden-note"
export const CHANGES = "changes"
export const CHANGES_HEAD = "changes-head"
