/**
 * Types, tables and the error class of the plan-doc tool:  `PlanReader` (reading a doc, either markup), `PlanDoc`
 * (editing one in `<epic-*>` markup) and the command line.  Rules, ids and what's data:  `PLAN-DOC.md` beside this.
 * - At the BOTTOM of the tool folder's import graph:  `import type` only, apart from `$/epics`' definitions (data),
 *   so nothing here loads a class module (WWOD §8).  `PlanReader` <- `PlanDoc` / `OldPlanReader` <- `PlanDocFiles`
 *   <- `PlanDocCommands`.
 * - The ELEMENTS (tags, attributes, which children go where) are `$/epics/definitions`':  this file holds only what
 *   the tool adds on top -- item kinds as the command line names them, review filters, result shapes.
 * - NOTE:  plain `&`, no `Prettify<>`:  `epics`' `tsconfig.json` doesn't include the repo root's `types/` (yet).
 */

import type { ItemSectionKind } from "$/epics/definitions"

////////////////
// ## Errors
////////////////

/** A problem the user should see as a message, not a stack trace:  the command line prints `message` alone. */
export class PlanDocError extends Error {}
PlanDocError.prototype.name = "PlanDocError"

////////////////
// ## Page
////////////////

/** What a plan doc's `<title>` starts with, before its title:  `Epic: Review Review`;  `<epic-page>` draws the h1. */
export const TITLE_PREFIX = "Epic: "

/** Which markup a doc is in:  `<epic-*>` elements, or the `ui-*` markup before the switch (P12). */
export const DOC_MARKUPS = ["epic", "old"] as const

/** One of `DOC_MARKUPS`. */
export type DocMarkup = (typeof DOC_MARKUPS)[number]

////////////////
// ## Phases
////////////////

/** A phase's status:  `<epic-phase status>`. */
export const PHASE_STATUSES = ["todo", "active", "done"] as const

/** One of `PHASE_STATUSES`. */
export type PhaseStatus = (typeof PHASE_STATUSES)[number]

/** Whether `status` is one of `PHASE_STATUSES`:  a command line's word, checked. */
export function isPhaseStatus(status: string): status is PhaseStatus {
  return (PHASE_STATUSES as readonly string[]).includes(status)
}

/**
 * The phase fields a command sets, by flag (`--symptom`, `--goal` ...):  each an `<epic-field name>`.
 * - `Done` has its own command (`phase <N> done --done`);  `To review` is the script's (`PlanDoc.updateToReview()`)
 */
export const PHASE_FIELDS = ["symptom", "changes", "goal", "files", "verify"] as const

/** One of `PHASE_FIELDS`. */
export type PhaseField = (typeof PHASE_FIELDS)[number]

/** One phase, as `PlanReader.phases` reads it. */
export type Phase = {
  /** its number:  `p3` is 3 */
  n: number
  /** its short name, without `P3 · ` */
  name: string
  /** `todo`, `active` or `done`;  any other text is a broken doc (`PlanReader.check()`) */
  status: string
  /** its estimate's text (`1-2h`);  `undefined` while missing or `TBD` */
  estimate: string | undefined
}

/** A phase's fields as HTML, by flag:  `PlanDoc.setPhaseFields()`;  `""` removes one. */
export type PhaseFieldValues = Partial<Record<PhaseField, string>>

/** `PlanDoc.addPhase()`'s options:  the fields, and the estimate. */
export type AddPhaseOptions = PhaseFieldValues & {
  /** wall-clock estimate (`1-2h`):  `<epic-phase estimate>` */
  estimate?: string
}

/** An estimate in minutes:  `PlanTime.parseDuration()`'s, `{ min: 60, max: 120 }` for `1-2h`. */
export type Duration = {
  /** the low end */
  min: number
  /** the high end;  `min` when it's no range */
  max: number
}

////////////////
// ## Items
////////////////

/**
 * Item kind, as the command line names it -> its id letter (`ItemLetters`, the definitions'), its section, and its
 * status while it counts:  a question waits (`open`), an answered one is in force (`decided`).
 * - a decision is an answered question (D13 of `review-review`):  `decision` makes a question born answered (`q` id,
 *   `decided`, `answered`), in Questions
 * - `test`:  something Owen checks by hand before merging (`V1`, "verify":  `t` is taken);  `close` it once it passes
 */
export const KINDS = {
  question: { prefix: "q", section: "questions", live: "open" },
  caveat: { prefix: "c", section: "caveats", live: "open" },
  issue: { prefix: "i", section: "issues", live: "open" },
  todo: { prefix: "t", section: "todos", live: "open" },
  test: { prefix: "v", section: "tests", live: "open" },
  decision: { prefix: "q", section: "questions", live: "decided" },
  judgement: { prefix: "j", section: "judgements", live: "open" }
} as const satisfies Record<string, { prefix: string; section: ItemSectionKind; live: "open" | "decided" }>

/** An item's kind, `KINDS`':  `question`, `caveat` ... */
export type ItemKind = keyof typeof KINDS

/** Whether `kind` is one of `KINDS`:  a command line's word, checked. */
export function isItemKind(kind: string): kind is ItemKind {
  return Object.hasOwn(KINDS, kind)
}

/**
 * An old decision's id (`d7`):  kept on an answer (`<epic-answer id="d7">`) since decisions became answers
 * (2026-10-04), so old `#d7` links land, and `close d7` finds its question.
 */
export const OLD_DECISION = /^d\d+$/

/** A question's id:  `q7`. */
export const QUESTION_ID = /^q\d+$/

/**
 * Item statuses that are closed:  not counted open, not on a "To review" line, coloured `recent` / `old`.
 * - `done`:  finished (fixed, passed, accepted)
 * - `decided`:  an answered question, in force
 * - `canceled`:  made moot by another decision (J16 of `review-review`):  the ONE status struck through;  `cancel`
 *   sets it, `reopen` undoes it
 */
export const CLOSED = new Set(["done", "decided", "canceled"])

/** The statuses `PlanDoc.setItem()` sets:  "open" means the kind's live status. */
export const ITEM_STATUSES = ["open", "done", "canceled"] as const

/** A status `PlanDoc.setItem()` sets. */
export type ItemStatus = (typeof ITEM_STATUSES)[number]

/**
 * Kinds `summary` reports while open, in the order a reader should act on them.
 * - `judgement`:  a choice Claude made without Owen (a `/bedtime` run, an agent mid-phase);  open until he reviews
 *   it, then `close`d (accepted), or turned into a question.
 */
export const OPEN_KINDS = ["question", "judgement", "issue", "caveat", "todo", "test"] as const

/** A kind `summary` reports, `OPEN_KINDS`'. */
export type OpenKind = (typeof OPEN_KINDS)[number]

/** One item, as `PlanReader.items()` lists it. */
export type ItemSummary = {
  /** its id, lower case:  `c3` */
  id: string
  /** its title's text */
  title: string
  /** its status, `open` when missing */
  status: string
}

/**
 * What an item says about itself, whichever markup it's in (`PlanReader.facts()`):  what every reading of it --
 * its state, its review state, its "To review" line -- is worked out from.
 */
export type ItemFacts = {
  /** its id, lower case */
  id: string
  /** its title's text */
  title: string
  /** its status, `open` when missing */
  status: string
  /** when a command last changed it (ISO), or `undefined` */
  changed: string | undefined
  /** the phase active when it was added */
  phase: number | undefined
  /** an answered question */
  answered: boolean
  /** reviewed that day, `YYYY-MM-DD` */
  reviewed: string | undefined
  /** deferred that day */
  deferred: string | undefined
  /** queued that day */
  queued: string | undefined
  /** the queued work */
  work: string | undefined
  /** work on it is under way */
  working: boolean
  /** changed during a `/bedtime` run */
  bedtime: boolean
}

/** One item (or an Overview sub-section), as `PlanReader.describeItem()` says it for `plan-doc inbox`. */
export type ItemDescription = {
  /** its id, upper case:  `C3` */
  id: string
  /** `PlanItem.kindOf()`'s:  `judgement`, `overview` (an Overview sub-section, Q14), `item` (an id of no kind) */
  kind: string
  /** its status, `open` when missing */
  status: string
  /** its title's text */
  title: string
}

/** `PlanDoc.addItem()`'s options. */
export type AddItemOptions = {
  /** HTML:  the item's details (its text, and any cards:  `<epic-choices>` ...) */
  details?: string
  /** `title` is HTML, not text:  with markup, it's a `slot="title"` child */
  titleHTML?: boolean
}

/** `PlanDoc.decide()`'s options. */
export type DecideOptions = {
  /** HTML in the answer (`<epic-answer>`'s children):  the answer, and why */
  details?: string
  /** the letter of the option chosen (`B`) */
  option?: string
}

/**
 * What `PlanDoc.keepOriginal()` (and `restoreOriginal()`) did:  `added` a version, found it `unchanged` (one saying
 * the same is there), or found nothing but whitespace (`empty`).
 */
export type OriginalResult = "added" | "unchanged" | "empty"

/** `PlanDoc.keepOriginal()`'s and `restoreOriginal()`'s options. */
export type OriginalOptions = {
  /** when the text was replaced, `YYYY-MM-DD HH:MM`;  default now (or, for the first version, undated) */
  asOf?: string
}

////////////////
// ## Options
////////////////

/** A question's option, as `PlanReader.optionCards()` gives it. */
export type OptionCard = {
  /** its letter:  `A` */
  letter: string
  /** its title, without its letter or "(recommended)":  `Inbox file` */
  title: string
  /** the one recommended */
  recommended: boolean
}

////////////////
// ## Review
////////////////

/**
 * An item's `state` (`PlanReader.itemState()`) -> its colour, as UI's `color` attribute:  what the page paints its
 * id chip with, and the review picker its state icon (`ItemPicker`).
 * - `attention`:  open and needs Owen (an open question;  an open judgement call or issue not reviewed)
 * - `progress`:  work under way (`queued`, `working`)
 * - `open`:  open, not urgent (todos, caveats, tests;  reviewed issues and judgement calls)
 * - `recent`:  decided, reviewed or closed since the page's `recent-since`, or during a `/bedtime` run
 * - `old`:  decided, reviewed or closed before that
 */
export const STATE_COLORS = {
  attention: "red",
  progress: "orange",
  open: "blue",
  recent: "green",
  old: "grey"
} as const

/** An item's standing on the page, `STATE_COLORS`':  `attention`, `progress` ... */
export type ItemState = keyof typeof STATE_COLORS

/**
 * An item's review state (`PlanReader.reviewState()`):
 * - `queued`:  reviewed, work waiting
 * - `reviewed`:  marked, closed, or linked from a decision
 * - `deferred`:  put off for now;  still outstanding
 * - `outstanding`:  none of the above
 */
export type ReviewState = "queued" | "reviewed" | "deferred" | "outstanding"

/**
 * The sections `/epic review` walks, in page order:  the kind and what Owen calls it.
 * - Questions:  the `Q` items, open and answered
 */
export const REVIEW_SECTIONS: { kind: ItemKind; label: string }[] = [
  { kind: "question", label: "Questions" },
  { kind: "judgement", label: "Judgement calls" },
  { kind: "caveat", label: "Caveats" },
  { kind: "todo", label: "Todos" },
  { kind: "issue", label: "Issues" },
  { kind: "test", label: "To test" }
]

/** One item, as a review walks it (`PlanReader.reviewItem()`). */
export type ReviewItem = {
  /** its id, upper case:  `C3` */
  id: string
  /** its title's text */
  title: string
  /** its status, `open` when missing */
  status: string
  /** where its review stands */
  state: ReviewState
  /** its colour on the page (`PlanReader.itemState()`) */
  docState: ItemState
  /** reviewed, `YYYY-MM-DD`, or `null` */
  reviewed: string | null
  /** deferred, `YYYY-MM-DD`, or `null` */
  deferred: string | null
  /** queued, `YYYY-MM-DD`, or `null` */
  queued: string | null
  /** the work a review queued, or `null` */
  work: string | null
  /** its CURRENT text, whitespace collapsed:  its Original Discussion left out */
  details: string
  /** its current text as written, for a page that shows it whole (`ItemPicker`) */
  detailsHtml: string
  /** its Original Discussion as text, or `null` when it has none */
  original: string | null
  /** the option it recommends, without the mark, or `null` */
  recommendation: string | null
}

/** An item's text, as `PlanReader.textOf()` reads it for `reviewItem()`. */
export type ItemText = Pick<ReviewItem, "details" | "detailsHtml" | "original" | "recommendation">

/**
 * `PlanReader.reviewSections()`'s filters, by name:  which items (`ReviewItem`s) a review list shows.
 * - `unreviewed`:  what a review hasn't gone through:  outstanding, or deferred
 */
export const REVIEW_FILTERS = {
  unreviewed: (item: ReviewItem) => item.state === "outstanding" || item.state === "deferred",
  open: (item: ReviewItem) => item.status === "open",
  reviewed: (item: ReviewItem) => item.state === "reviewed" || item.state === "queued",
  queued: (item: ReviewItem) => item.state === "queued",
  all: () => true
}

/** A review list's filter, `REVIEW_FILTERS`':  `unreviewed`, `open` ... */
export type ReviewFilter = keyof typeof REVIEW_FILTERS

/** Whether `filter` is one of `REVIEW_FILTERS`:  a command line's word, checked. */
export function isReviewFilter(filter: string): filter is ReviewFilter {
  return Object.hasOwn(REVIEW_FILTERS, filter)
}

/** One section a review walks (`PlanReader.reviewSections()`). */
export type ReviewSection = {
  /** the kind of its items */
  kind: ItemKind
  /** what Owen calls it:  `Judgement calls` */
  label: string
  /** how many items it has */
  total: number
  /** how many of them aren't reviewed (outstanding or deferred) */
  notReviewed: number
  /** its items, filtered */
  items: ReviewItem[]
}

/** Where reviews stand (`PlanReader.reviewStatus()`), for someone who remembers nothing. */
export type ReviewStatus = {
  /** the latest reviewed date, or `null` (never reviewed) */
  last: string | null
  /** how many items carry `last` */
  reviewedThen: number
  /** how many items are deferred */
  deferred: number
  /** each piece of work waiting */
  queued: { id: string; title: string; work: string | null; queued: string | null }[]
}

////////////////
// ## Review inbox
////////////////

/**
 * A mark Owen left on the page, as `PlanDoc.applyMark()` reads it (the inbox's shape:  `ReviewInbox`).
 * - `action`:  `approve`, `pick`, `todo`, `revisit`, `details`
 */
export type PlanMark = {
  /** the item's id (any case);  an Overview sub-section's (`o3`, Q14) too */
  id: string
  /** what Owen asked for */
  action: string
  /** a pick's (or a revisit's pick's) option letter:  `B` */
  pick?: string
  /** a revisit's:  `soon` or `now` */
  when?: string
  /** Owen's note */
  note?: string
}

/** What `PlanDoc.applyMark()` did with a mark:  applied (and how), or left for Claude (and why). */
export type MarkResult =
  | {
      applied: true
      /** what it did, for the log:  `approved:  closed (accepted)` */
      did: string
      /** never set:  declared so `result.left` reads without narrowing */
      left?: undefined
    }
  | {
      applied: false
      /** why it's left:  `needs talk:  ...` */
      left: string
      /** the doc has no such item:  the caller drops its mark */
      gone?: true
      /** never set:  declared so `result.did` reads without narrowing */
      did?: undefined
    }

/** Owen's note, kept as his reply (`PlanDoc.keepNote()`):  a mark Claude took and is clearing. */
export type KeptNote = {
  /** what he wrote */
  note: string
  /** the mark's action:  `revisit`, `todo` ... */
  action: string
  /** a revisit's:  `soon` or `now` */
  when?: string
  /** when he marked it (ISO), else now */
  at?: string
}

////////////////
// ## Commits
////////////////

/** Where a commit is listed:  under phase `phase`, or item `item` (an id). */
export type CommitTarget = {
  /** a phase's number */
  phase?: number
  /** an item's id, any case */
  item?: string
}

/** One commit of the doc's git history, newest first (`git log`). */
export type CommitLogEntry = {
  /** the full sha */
  sha: string
  /** its subject line */
  subject: string
}

/** A commit `PlanDoc.backfillCommits()` listed:  its sha, and where. */
export type BackfilledCommit = CommitTarget & { sha: string }

/** `PlanDoc.addCommit()`'s options. */
export type CommitOptions = {
  /** the repo's GitHub page:  written to `<epic-page repo>`, which every `<epic-commit>` links through;  `null`:  left */
  base?: string | null
}

/** What a commit subject says it did (`PlanCommits.parseCommitSubject()`). */
export type ParsedCommit = {
  /** phase numbers (`P6a` -> 6) */
  phases: number[]
  /** item ids, lower case (`i3`) */
  items: string[]
  /** the subject after ` -- ` (`P3:  Name -- what it did`), else after the colon */
  sentence: string
}

////////////////
// ## Summary
////////////////

/** What needs attention (`PlanReader.summary()`):  the end-of-phase reply and its AskUserQuestion options. */
export type PlanSummary = {
  /** the epic's title, without `Epic: ` */
  title: string
  /** every phase, in order */
  phases: Phase[]
  /** the phase in progress */
  active: Phase | undefined
  /** the next phase to do */
  next: Phase | undefined
  /** the Overview's total (`1h-2h in all, 1h left`) */
  estimate: string | undefined
  /** the phases a `/bedtime` run is on (`P3-P6`), or `null` */
  bedtime: string | null
  /** a future epic:  not planned yet */
  future: boolean
  /** each kind's open items, in `OPEN_KINDS`' order */
  open: Record<OpenKind, ItemSummary[]>
}

////////////////
// ## The doc
////////////////

/** `PlanReader`'s options, besides the document and the time. */
export type PlanDocOptions = {
  /**
   * the commit time (ISO) of `HEAD~2` in the doc's checkout, which `PlanDoc.updateStates()` writes to
   * `<epic-page recent-since>`;  `null`:  no git history, so the attribute goes;  `undefined`:  left as the doc has it
   */
  recentSince?: string | null
}

/**
 * How a doc was stored, set by the command line's `read()`:  `PlanDoc` itself never reads it.
 * - for an old-markup doc:  what `PlanParts.assemble()` found;  for an `<epic-*>` doc, `EpicParts`'
 */
export type PlanDocParts = {
  /** whether it had part files at all */
  split: boolean
  /** ids of the hosts that load a part */
  hosts: string[]
  /** ids whose part file is missing */
  missing: string[]
  /** ids whose host held content of its own besides its part */
  inline: string[]
}

////////////////
// ## The old markup's chrome
////////////////

/**
 * Text and markup the OLD markup wrote that the `<epic-*>` elements now DRAW, from their attributes or position:
 * the converter (`$/epics/convert`) drops it, the proof leaves it out of the comparison -- narrowly, by these
 * patterns -- and `IncomingHtml` reads an old option card or reply by them.
 * - each is checked against the element's own data where it can be (a chip's text is its item's id)
 * - here, not in `convert.types` (which re-exports it):  the tool loads the converter only for `convert` (I5)
 * - REFACTOR: drop with the converter and `IncomingHtml` after the switch (P12)
 */
export const Chrome = {
  /** The h1's `Epic: ` (`<epic-page title>` holds the rest). */
  titlePrefix: /^\s*Epic:\s*/,
  /** A phase's `P2 · ` before its title. */
  phasePrefix: /^\s*P(\d+)\s*·\s*/,
  /** An Overview sub-section's `1.3 ` before its title:  drawn from its position. */
  partNumber: /^\s*\d+(\.\d+)+\.?\s+/,
  /** An option's `A · ` (or `A. `, `A: `) before its title. */
  optionLetter: /^\s*([A-Z])\s*[·.:)]\s+/,
  /** An option's ` (recommended)` after its title:  `<epic-option recommended>`. */
  recommended: /\s*\(recommended\)\s*$/i,
  /** A field's label:  `Goal:`. */
  fieldLabel: /^\s*([^:]+):\s*$/,
  /** An answer card's heading word:  `Answer`, or its id, `D7`. */
  answerWord: /^(Answer|D\d+)$/,
  /** A reply's `re: ` before what it's about. */
  replyRe: /^\s*re:\s*/,
  /** An Original Discussion version's heading. */
  versionHeading: /^As (first written|of .+)$/,
  /** The separator between drawn pieces:  `Owen · 2026-10-06 · re: ...`. */
  separator: "·",
  /** An answer card's ` · ` between its `Answer` / `D7` and its title. */
  answerSeparator: /^\s*·\s*/,
  /** The default `<epic-event icon>`:  left out when it's this. */
  defaultEventIcon: "pen to square"
} as const

/**
 * A reply's title (`div.plan-reply-title`) as `<epic-reply>`'s data:  `<b>Owen</b> · <time>2026-10-06 17:27</time> ·
 * re: "..."` => `{ from, at, re }`, `re: ` dropped.  `undefined` when it isn't in that shape:  then it stays prose.
 * - shared by the converter, the proof's `OldReading` and `IncomingHtml`:  the one rule for what of it is chrome
 * - flat text:  markup in what it's about (`<code>`) is read as its text
 */
export function replyTitleParts(title: Element): { from: string; at: string; re: string } | undefined {
  const from = title.querySelector(":scope > b")?.textContent?.trim()
  const at = title.querySelector(":scope > time")?.textContent?.trim()
  const pieces = (title.textContent ?? "").split(Chrome.separator)
  if (!from || !at || pieces.length < 3) return undefined
  const re = pieces.slice(2).join(Chrome.separator).replace(/\s+/g, " ").trim().replace(Chrome.replyRe, "")
  return { from, at, re }
}
