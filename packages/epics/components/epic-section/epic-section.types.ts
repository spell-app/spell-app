/**
 * Loose types and constants of the `epic-section` family, and the FOLD pieces `<epic-overview>`, `<epic-section>`
 * and `<epic-phase>` share (`EpicFold`):  their vocabularies spread `FOLD_*`.
 * - Data only:  nothing here runs.  Vocabularies value-import it, so it imports them with `import type` only, and
 *   node imports it through them (`Definitions`):  never a DOM or Solid value here.
 */

import type { epicSectionVocabulary } from "./epic-section.vocabulary.en"

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
  { name: "note", description: "The `Loads from parts/x.htm ...` line, when its part can't load." }
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
  { key: "partError", text: "Couldn't load {source}.", description: "Its part couldn't be loaded." }
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

/** What a folding element needs of its inner `<ui-section>`'s controller:  its sticky line and stack. */
export type SectionStack = {
  /** where its title sticks, px from the viewport's top */
  stickTop(): number
  /** where titles inside it stick:  below its own, px from the viewport's top */
  innerStackTop(): number
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
 * Each page section kind => its icon (Spell UI's names, from the docs bundle's set) and its texts' keys:  title
 * and tooltip.  `overview-part` has neither:  its title is its own.
 */
export const SECTION_LOOKS = {
  phases: { icon: "layer group", title: "phasesTitle", tip: undefined },
  questions: { icon: "file circle question", title: "questionsTitle", tip: "questionsTip" },
  judgements: { icon: "gavel", title: "judgementsTitle", tip: "judgementsTip" },
  caveats: { icon: "triangle exclamation", title: "caveatsTitle", tip: undefined },
  todos: { icon: "list check", title: "todosTitle", tip: "todosTip" },
  issues: { icon: "bug", title: "issuesTitle", tip: undefined },
  tests: { icon: "flask", title: "testsTitle", tip: "testsTip" },
  log: { icon: "clock rotate left", title: "logTitle", tip: "logTip" }
} as const

/** A page section's look:  `SECTION_LOOKS`' values. */
export type SectionLook = (typeof SECTION_LOOKS)[keyof typeof SECTION_LOOKS]

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
