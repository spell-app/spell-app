/**
 * Types, tables and the error class of `PlanDoc`, the plan-doc tool's model of one parsed plan doc.  Rules, ids and
 * markup:  `templates/epics/plan-doc.md`.
 * - At the BOTTOM of the tool folder's import graph:  imports nothing, so nothing here loads a class module (WWOD §8).
 *   `PlanDoc`, `PlanMigration` and their helper classes (`PlanMarkup`, `PlanSections`, `PlanItem`, `PlanTime`,
 *   `PlanCommits`, `SectionConverter`) sit above it.
 * - Ported from `packages/docs/tools/plan-doc.js` (epic `epic-components`, P7):  the same tables, the same values.
 * - NOTE:  plain `&`, no `Prettify<>`:  `epics`' `tsconfig.json` doesn't include the repo root's `types/` (yet).
 */

////////////////
// ## Errors
////////////////

/** A problem the user should see as a message, not a stack trace:  the command line prints `message` alone. */
export class PlanDocError extends Error {}
PlanDocError.prototype.name = "PlanDocError"

////////////////
// ## Page
////////////////

/** What a plan doc's h1 and `<title>` start with, before its title:  `Epic: Review Review`. */
export const TITLE_PREFIX = "Epic: "

/**
 * The "Plan hung?" notice under the meta lines while planning:  how to restart, and the kickoff prompt to paste.
 * Folded (P3 of `windows-and-review`):  a `ui-accordion.plan-hung.spell-aside`;  a `ui-message.plan-hung` before.
 */
export const HUNG = ":is(ui-accordion, ui-message).plan-hung"

////////////////
// ## Phases
////////////////

/** Phase status -> its icon and color (UI's `color` attribute, so themes and dark mode just work). */
export const STATUS = {
  todo: { icon: "circle outline", color: "grey" },
  active: { icon: "circle half stroke", color: "orange" },
  done: { icon: "circle check", color: "green" }
} as const

/** A phase's status:  `todo`, `active` or `done`. */
export type PhaseStatus = keyof typeof STATUS

/** Whether `status` is one of `STATUS`:  a command line's word, checked. */
export function isPhaseStatus(status: string): status is PhaseStatus {
  return Object.hasOwn(STATUS, status)
}

/** Phase sections, either markup:  `<ui-section data-phase>` in `#phases`, or `section[data-phase]` (old). */
export const PHASE_SECTIONS = "ui-section#phases ui-section[data-phase], #phases-section section[data-phase]"

/**
 * A phase body's fields:  label and icon.
 * - `Estimate`:  wall-clock time for Claude to do the phase, agents included, Owen's review not;  `30m`, `2h`,
 *   `1h30m`, `1-2h`.  The Overview totals them (`PlanDoc.updateEstimate()`).
 */
export const PHASE_FIELDS = [
  ["Symptom", "circle exclamation"],
  ["Changes", "wand magic sparkles"],
  ["Goal", "bullseye"],
  ["Files", "folder"],
  ["Verify", "flask"],
  ["Estimate", "clock"]
] as const

/** A phase body field's label, `PHASE_FIELDS`':  `Symptom`, `Goal` ... */
export type PhaseField = (typeof PHASE_FIELDS)[number][0]

/**
 * A phase body's fields, in the order they read (epic `windows-and-review` P3, Owen 2026-10-06:  "Symptom (one
 * line), Changes (two or three lines), then the details"):  a field made later goes before the first one after it
 * here (`PlanSections.insertField()`).
 * - `Updated`:  the fenced block of changes to the plan (`PlanDoc.addPhaseUpdate()`), right under Symptom / Changes
 */
export const FIELD_ORDER = [
  "Symptom",
  "Changes",
  "Updated",
  "Goal",
  "Done",
  "Commits",
  "Files",
  "Verify",
  "Estimate",
  "To review"
]

/** One phase, as `PlanDoc.phases` reads it from its section. */
export type Phase = {
  /** its number, `data-phase` */
  n: number
  /** its short name:  the title without `P2 · ` */
  name: string
  /** `data-status`, `todo` when missing;  any other text is a broken doc (`PlanDoc.check()`) */
  status: string
  /** its estimate's text (`1-2h`):  the title's badge, else an old Estimate field;  `undefined` while missing or `TBD` */
  estimate: string | undefined
}

/** A phase body's fields as HTML, by lower-case label:  `PlanDoc.setPhaseFields()`;  `""` removes one. */
export type PhaseFieldValues = {
  /** what's wrong today, one line */
  symptom?: string
  /** what changes, two or three lines */
  changes?: string
  /** the details:  a `<ul>`, one bullet per outcome */
  goal?: string
  /** what changes, by file */
  files?: string
  /** how we know it worked */
  verify?: string
}

/** `PlanDoc.addPhase()`'s options:  the body's fields, and the title's estimate badge. */
export type AddPhaseOptions = PhaseFieldValues & {
  /** wall-clock estimate (`1-2h`):  the title's `badge`;  old markup:  the Estimate field */
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
 * Item kind -> its id prefix (`c3`), the list it lives in (`.plan-items[data-kind=list]`) and its status while it
 * counts:  a question waits (`open`), an answered one is in force (`decided`) -- only `open` items are "open" in the
 * section's count.
 * - questions and decisions are ONE kind of item since 2026-10-04 (D13):  a decision is an answered question, so
 *   `decision` makes a question born answered (`q` id, `decided`).  The list is still
 *   `.plan-items[data-kind="decision"]`, in `#decisions` ("Questions").
 * - docs from before have `D` items (`d7`) and struck question + decision pairs until `migrate` merges them
 *   (`PlanMigration.mergeDecisions()`):  readers take both (`OLD_DECISION`)
 * - `test`:  something Owen checks by hand before merging (`V1`, "verify":  `t` is taken), in "To test";  `close`
 *   one once it passes
 */
export const KINDS = {
  question: { prefix: "q", list: "decision", live: "open" },
  caveat: { prefix: "c", list: "caveat", live: "open" },
  issue: { prefix: "i", list: "issue", live: "open" },
  todo: { prefix: "t", list: "todo", live: "open" },
  test: { prefix: "v", list: "test", live: "open" },
  decision: { prefix: "q", list: "decision", live: "decided" },
  judgement: { prefix: "j", list: "judgement", live: "open" }
} as const

/** An item's kind, `KINDS`':  `question`, `caveat` ... */
export type ItemKind = keyof typeof KINDS

/** Whether `kind` is one of `KINDS`:  a command line's word, checked. */
export function isItemKind(kind: string): kind is ItemKind {
  return Object.hasOwn(KINDS, kind)
}

/**
 * An old doc's decision id (`d7`):  a decision kept apart from its question, before D13 (2026-10-04).
 * - once migrated, the id is on the answer card INSIDE the question (`PlanMigration.mergeDecisions()`), so old `#d7`
 *   links land
 */
export const OLD_DECISION = /^d\d+$/

/**
 * Item statuses that are closed:  not counted open, not on a "To review" line, colored `recent` / `old`.
 * - `done`:  finished (fixed, passed, accepted);  NOT struck through since 2026-10-04:  the grey chip says it
 * - `decided`:  an answered question, in force
 * - `canceled`:  made moot by another decision (J16 of `review-review`):  the ONE status struck through
 *   (`plan-doc.css`);  `cancel` sets it, `reopen` undoes it
 */
export const CLOSED = new Set(["done", "decided", "canceled"])

/** The statuses `PlanDoc.setItem()` sets:  "open" means the kind's live status. */
export const ITEM_STATUSES = ["open", "done", "canceled"] as const

/** A status `PlanDoc.setItem()` sets. */
export type ItemStatus = (typeof ITEM_STATUSES)[number]

/** The marks an item carries besides its status:  `PlanMigration.mergeDecisions()` moves a decision's onto its question. */
export const ITEM_MARKS = [
  "data-phase",
  "data-changed",
  "data-reviewed",
  "data-deferred",
  "data-queued",
  "data-work",
  "data-bedtime"
]

/**
 * Kinds `summary` reports while open, in the order a reader should act on them.
 * - `judgement`:  a choice Claude made without Owen (a `/bedtime` run, an agent mid-phase);  open until he reviews
 *   it, then `close`d (accepted), or turned into a question.
 */
export const OPEN_KINDS = ["question", "judgement", "issue", "caveat", "todo", "test"] as const

/** A kind `summary` reports, `OPEN_KINDS`'. */
export type OpenKind = (typeof OPEN_KINDS)[number]

/** One item, as `PlanDoc.items()` lists it. */
export type ItemSummary = {
  /** its id, lower case:  `c3` */
  id: string
  /** its title's text */
  title: string
  /** `data-status`, `open` when missing */
  status: string
}

/** One item, as `PlanDoc.describeItem()` says it for `plan-doc inbox`. */
export type ItemDescription = {
  /** its id, upper case:  `C3` */
  id: string
  /** `PlanItem.itemKind()`'s:  `judgement`, `decision` (an old doc's `d7`), `item` (an id of no kind) */
  kind: string
  /** `data-status`, `open` when missing */
  status: string
  /** its title's text */
  title: string
}

/** `PlanDoc.addItem()`'s options. */
export type AddItemOptions = {
  /** HTML for a collapsed panel whose TITLE is the item's line */
  details?: string
  /** `title` is HTML, not text */
  titleHTML?: boolean
}

/** `PlanDoc.decide()`'s options. */
export type DecideOptions = {
  /** HTML after the answer's title, in its card */
  details?: string
  /** the letter of the option chosen (`B`) */
  option?: string
}

////////////////
// ## Item details
////////////////

/**
 * An item's ORIGINAL DISCUSSION (I7 of `review-review`):  a folded aside at the end of its details, before its
 * commits, holding every earlier version of its text, oldest first.  A rewrite never drops an item's text:  it moves
 * here (`PlanDoc.keepOriginal()`).
 * - `<ui-accordion class="spell-aside plan-original" styled><ui-title>Original Discussion</ui-title><ui-content>`,
 *   no `open`:  it starts folded, as every aside
 * - one `div.plan-version` per version:  the first as first written (no heading, until a second one comes:  then
 *   "As first written"), each later one under `<h5>As of 2026-10-04 20:49</h5>` (`data-as-of`):  when it was
 *   replaced
 * - ids inside are renamed `data-original-id` (`PlanItem.stripIds()`):  never a second `#q3`, never a link's target
 * - readers skip it (`PlanItem.inOriginal()`):  option cards, a recommendation, links from decisions, `items` details,
 *   `check()`'s links;  on the page, the Choose pills and the contents (`spell-doc-runtime.js`)
 */
export const ORIGINAL = "ui-accordion.plan-original"

/** The Original Discussion's title. */
export const ORIGINAL_TITLE = "Original Discussion"

/**
 * An ANSWERED question's details read in the order it happened (I9 of `review-review`, Owen 2026-10-04):  what was
 * asked, the choices, what was picked (`PlanDoc.layoutAnswer()`):
 * - `div.plan-question`:  the question's text as asked, its Net effect too (the page labels it "Original
 *   question");  none when the question had no text
 * - `CHOICES`:  its option cards as ONE folded aside, "Choices", holding a `ui-accordion.plan-options`:  a panel per
 *   option, its title the card's label (`A · Push main first (recommended)`), its content the card's body;  the
 *   chosen one's title carries `data-chosen` (a check and a green tint on the page), and the accordion opens on it
 * - the answer card (`.plan-answer-block`), titled `D4 · ...` when it carries a migrated decision's id, else
 *   `Answer · ...`
 * - then replies (`.plan-reply`), the Original Discussion (`ORIGINAL`) and the commits, as before
 * - an OPEN question keeps its option cards (`ui-grid.spell-pros-cons`) and their Choose pills
 */
export const QUESTION = "div.plan-question"

/** An answered question's Choices aside (`QUESTION`). */
export const CHOICES = "ui-accordion.plan-choices"

/** The accordion of options inside the Choices aside, a panel per option (`QUESTION`). */
export const OPTIONS = "ui-accordion.plan-options"

/** The Choices aside's title. */
export const CHOICES_TITLE = "Choices"

/**
 * Add Details (`details --more`, epic `windows-and-review` P3, Owen 2026-10-06):  the item's text stays on top, and
 * the new text goes under it in a white "More Details" card, open and foldable (`PlanDoc.addMore()`):
 * - `FIRST`:  the item's text, labelled "Original Reply" on the page;  an answered question's is its `QUESTION`
 *   already ("Original question"), never wrapped again
 * - `MORE`:  `<ui-accordion class="plan-more" styled open="0"><ui-title>More Details</ui-title><ui-content>`
 */
export const FIRST = "div.plan-first"
/** The More Details card (`FIRST`). */
export const MORE = "ui-accordion.plan-more"

/** The More Details card's title (`MORE`). */
export const MORE_TITLE = "More Details"

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

/** `PlanDoc.layoutAnswer()`'s result:  what it did, or why it skipped the question. */
export type LayoutResult =
  | {
      /** why it was left as it is:  born answered (no answer card) */
      skipped: string
    }
  | {
      /** whether the details changed */
      changed: boolean
      /** what a converted question kept in its text, and why */
      notes: string[]
    }

/** `PlanDoc.relayout()`'s result:  every answered question laid out, or not, and why. */
export type RelayoutResult = {
  /** ids (upper case) laid out anew */
  changed: string[]
  /** answered questions left as they are, and why */
  skipped: { id: string; why: string }[]
  /** what a converted question kept in its text */
  notes: { id: string; note: string }[]
  /** an old doc's `D` items:  `migrate` merges them into their questions first */
  oldDecisions: number
}

////////////////
// ## Options
////////////////

/** A question's option, as `PlanDoc.optionCards()` gives it. */
export type OptionCard = {
  /** its letter:  `A` */
  letter: string
  /** its label after the letter, "(recommended)" left out:  `Inbox file` */
  title: string
  /** whether its label says "(recommended)" */
  recommended: boolean
}

/** An option's label, as `PlanItem.optionLabel()` reads it. */
export type OptionLabel = OptionCard & {
  /** its title's words (`PlanItem.words()`):  what `PlanMigration.inferOption()` matches */
  words: string[]
}

/** A question's option on the page, `PlanItem.optionsOf()`'s. */
export type PlanOption = OptionLabel & {
  /** what carries `data-chosen`:  an open question's `ui-column`, an answered one's Choices panel `ui-title` */
  holder: Element
}

////////////////
// ## Review
////////////////

/**
 * An item's `data-state` (`PlanDoc.updateStates()`) -> its color, as UI's `color` attribute:  what the page paints
 * its id badge with, and the review picker its state icon (`pickerState()`).
 * - `attention`:  open and needs Owen (an open question;  an open judgement call or issue not reviewed)
 * - `progress`:  work under way (`data-queued`, `data-working`)
 * - `open`:  open, not urgent (todos, caveats, tests;  reviewed issues and judgement calls)
 * - `recent`:  decided, reviewed or closed since `data-recent-since` on `<body>`, or during a `/bedtime` run
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
 * An item's review state (`PlanDoc.reviewState()`):
 * - `queued`:  reviewed, work waiting
 * - `reviewed`:  marked, closed, or linked from a decision
 * - `deferred`:  put off for now;  still outstanding
 * - `outstanding`:  none of the above
 */
export type ReviewState = "queued" | "reviewed" | "deferred" | "outstanding"

/**
 * The sections `/epic review` walks, in page order:  the kind and what Owen calls it.
 * - Questions:  the `Q` items in "Questions", open and answered;  never an old doc's `D` items
 */
export const REVIEW_SECTIONS: { kind: ItemKind; label: string }[] = [
  { kind: "question", label: "Questions" },
  { kind: "judgement", label: "Judgement calls" },
  { kind: "caveat", label: "Caveats" },
  { kind: "todo", label: "Todos" },
  { kind: "issue", label: "Issues" },
  { kind: "test", label: "To test" }
]

/** One item, as a review walks it (`PlanDoc.reviewItem()`). */
export type ReviewItem = {
  /** its id, upper case:  `C3` */
  id: string
  /** its title's text */
  title: string
  /** `data-status`, `open` when missing */
  status: string
  /** where its review stands */
  state: ReviewState
  /** its color on the page (`PlanDoc.itemState()`) */
  docState: ItemState
  /** `data-reviewed`, `YYYY-MM-DD`, or `null` */
  reviewed: string | null
  /** `data-deferred`, `YYYY-MM-DD`, or `null` */
  deferred: string | null
  /** `data-queued`, `YYYY-MM-DD`, or `null` */
  queued: string | null
  /** `data-work`:  the work a review queued, or `null` */
  work: string | null
  /** its CURRENT text, whitespace collapsed:  its Original Discussion left out */
  details: string
  /** its current text as written, for a page that shows it whole (`pickerSpec()`) */
  detailsHtml: string
  /** its Original Discussion as text, or `null` when it has none */
  original: string | null
  /** the option its details mark "(recommended)", without the mark, or `null` */
  recommendation: string | null
}

/**
 * `PlanDoc.reviewSections()`'s filters, by name:  which items (`ReviewItem`s) a review list shows.
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

/** One section a review walks (`PlanDoc.reviewSections()`). */
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

/** Where reviews stand (`PlanDoc.reviewStatus()`), for someone who remembers nothing. */
export type ReviewStatus = {
  /** the latest `data-reviewed` date, or `null` (never reviewed) */
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
 * A mark Owen left on the page, as `PlanDoc.applyMark()` reads it (the inbox's shape:  `inbox.js`).
 * - `action`:  `approve`, `pick`, `todo`, `revisit`, `details`
 */
export type PlanMark = {
  /** the item's id (any case) */
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

/** Owen's note, kept as his reply card (`PlanDoc.keepNote()`):  a mark Claude took and is clearing. */
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
  /** the repo's GitHub page:  the short sha links to the commit there;  `null` (default):  plain `<code>` */
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

/** What needs attention (`PlanDoc.summary()`):  the end-of-phase reply and its AskUserQuestion options. */
export type PlanSummary = {
  /** the epic's title, without `Epic: ` */
  title: string
  /** every phase, in order */
  phases: Phase[]
  /** the phase in progress */
  active: Phase | undefined
  /** the next phase to do */
  next: Phase | undefined
  /** the Overview's total (`1h-2h in all, 1h left`), without `Estimate:` */
  estimate: string | undefined
  /** the phases a `/bedtime` run is on (`P3-P6`), or `null` */
  bedtime: string | null
  /** a future epic:  not planned yet */
  future: boolean
  /** each kind's open items, in `OPEN_KINDS`' order */
  open: Record<OpenKind, ItemSummary[]>
}

////////////////
// ## Sections
////////////////

/**
 * The sections, in page order, by id (the `<ui-section>`'s, or an old doc's h2's):  `migrate` puts an older doc's
 * sections in this order and renumbers their titles.
 * - `#plan` (summary + phase list) was dropped on 2026-10-01
 * - `#questions` merged into `#decisions` the same day:  "Questions & Decisions", just "Questions" since D13
 */
export const SECTION_ORDER = [
  "overview",
  "phases",
  "decisions",
  "judgements",
  "caveats",
  "todos",
  "issues",
  "tests",
  "log"
]

/** Each section's icon, by its id (the template's):  `migrate` gives one to a section that has none. */
export const SECTION_ICONS: Record<string, string> = {
  overview: "lightbulb",
  phases: "layer group",
  decisions: "file circle question",
  judgements: "gavel",
  caveats: "triangle exclamation",
  todos: "list check",
  issues: "bug",
  tests: "flask",
  log: "clock rotate left"
}

/**
 * Section icons the template had before 2026-10-04, by id:  `migrate` swaps one still there for `SECTION_ICONS`'
 * (a custom icon stays).
 */
export const OLD_SECTION_ICONS: Record<string, string> = {
  decisions: "gavel",
  judgements: "compass"
}

/** The note under "To test" (the template's, which `PlanDoc.addTestsSection()` writes into older docs). */
export const TESTS_NOTE =
  "What to check by hand before merging:  each a step, and what should happen.  Struck through once it passes."

/** `#decisions`' note, "Questions" (the template's `data-tip`, which `migrate` writes into older docs). */
export const DECISIONS_NOTE =
  "Open questions first: waiting on you, each also asked in Claude Code. Then the answered ones, each with its " +
  "answer: settled, don't re-argue without new facts."

/** The notes "Questions & Decisions" had (2026-10-01 to 2026-10-04):  `migrate` replaces one with `DECISIONS_NOTE`. */
export const OLD_DECISIONS_NOTES = [
  "Open questions first: waiting on you, each also asked in Claude Code. Then what was decided, and why: settled, " +
    "don't re-argue without new facts. An answered question sits just above its decision."
]

/** The `#judgements` section as the template has it:  `migrate` adds it to older docs (`PlanMigration.addJudgements()`). */
export const JUDGEMENTS_SECTION = `<ui-section id="judgements" header="4. Judgement calls" sticky collapsible dividing collapsed>
          <ui-icon slot="icon" name="gavel"></ui-icon>
          <p class="meta">
            Choices made without you (a bedtime run, an agent mid-phase):  what was chosen, over what, and why.
            Open until you review it;  struck = accepted.  Disagree:  say so, and it becomes a question.
          </p>
          <ui-list class="plan-items" data-kind="judgement" divided relaxed></ui-list>
        </ui-section>`

/** What `SectionConverter.convertSections()` did to a document's old-markup sections. */
export type ConvertReport = {
  /** how many became `<ui-section>`s */
  converted: number
  /** ids of sections whose title has markup:  a `<span slot="header">` */
  slotHeaders: string[]
  /** ids of sections with several icons:  a `<span slot="icon">` */
  multiIcons: string[]
  /** ids of old `<section>`s dropped:  the heading's id wins */
  droppedIds: string[]
  /** sections given a `level`, as `#id:  h3, nested as h2` */
  levels: string[]
  /** the start of each section left alone:  not `section > ui-sticky > h2|h3[id]` */
  skipped: string[]
}

////////////////
// ## The doc
////////////////

/** `PlanDoc`'s options, besides the document and the time. */
export type PlanDocOptions = {
  /**
   * the commit time (ISO) of `HEAD~2` in the doc's checkout, which `PlanDoc.updateStates()` writes to
   * `<body data-recent-since>`;  `null`:  no git history, so the attribute goes;  `undefined`:  left as the doc has it
   */
  recentSince?: string | null
}

/**
 * How a doc was stored, set by the command line's `read()` (`plan-parts.js` `assembleParts()`'s result):  `PlanDoc`
 * itself never reads it.
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
