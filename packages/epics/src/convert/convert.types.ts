/**
 * Types of `$/epics/convert`:  the converter from the old plan-doc markup (`ui-section`, `ui-item[data-status]` ...)
 * to `<epic-*>` markup, and the proof that it lost nothing.
 * - Bottom of the folder's import graph:  `import type` only, apart from these constants and the tool's types file.
 *   `convert.types` <- `DocReading` <- `OldReading` / `NewReading` <- `ConversionProof`;
 *   `convert.types` <- `CardConverter` <- `ItemConverter` / `PhaseConverter` <- `Converter` <- `ConvertRun`;
 *   the second pass:  `convert.types` <- `ConvertedReading` / `Upgrader`, on the tool's `ProseShapes` and
 *   `ProseRewrite` (`$/epics/tool`).
 * - The OLD markup's selectors live here, once:  the converter reads them, and the proof's `OldReading` knows which
 *   of their text is chrome (`Chrome`:  the tool's, `$/epics/tool/planDoc.types`, re-exported here).  Rules for that
 *   markup:  `templates/epics/plan-doc.md`, "Markup the script writes".
 */

import { ProseBlocks, ProseCounted } from "$/epics/tool/planDoc.types"

////////////////
// ## Errors
////////////////

/**
 * A doc the converter can't convert:  markup it doesn't know where a structure is expected (a phase section holding
 * something other than phases), or a layout from before 2026-10-02 (`spell dev plan-doc migrate` first).
 * - `cause.where`:  the element, in a few words
 */
export class ConvertError extends Error {
  declare cause: ConvertErrorCause | undefined
}
ConvertError.prototype.name = "ConvertError"

/** `ConvertError`'s cause. */
export type ConvertErrorCause = {
  /** The doc's name. */
  doc?: string
  /** The element it's about, in a few words:  `<ui-section id="phases">`. */
  where?: string
}

////////////////
// ## Results
////////////////

/** One converted doc (`Converter.convert()`). */
export type Conversion = {
  /** The epic's name:  its folder in `epics/`. */
  name: string
  /** The skeleton, formatted:  `<name>.plan.html`. */
  skeleton: string
  /** Its part files, formatted:  id => text (`parts/<id>.html`), in page order. */
  parts: Map<string, string>
  /** What the converter did that a reader should know about:  text moved, markup kept as it was. */
  notes: string[]
  /** What `Markup.validate()` found in the output:  ANY is a failed conversion. */
  problems: string[]
  /** The proof:  same ids, same links, same text. */
  proof: ProofReport
  /** Was the input split (a skeleton plus parts)? */
  wasSplit: boolean
  /**
   * Which pass made it:  `1`, the old markup => `<epic-*>` (`Converter`);  `2`, a converted doc => the P14 shapes
   * (`Upgrader`).
   */
  pass: 1 | 2
  /**
   * The second pass's counts, by what it did (`question`, `net effect` ...) and, `kept:` first, by what it left as
   * prose (`kept: net effect in other words`).  Empty for the first pass.
   */
  counts: Record<string, number>
}

/**
 * What `ConversionProof` found:  every difference, never hidden.
 * - `clean`:  no missing or added id, link or word
 */
export type ProofReport = {
  /** Ids:  every id in the old doc must be in the new. */
  ids: SetDifference
  /** Link targets (`href`):  the same set. */
  links: SetDifference
  /** Visible text, per unit (an item, a phase, a section ...):  the same words. */
  text: TextDifference
  /** Nothing missing or added. */
  clean: boolean
}

/** Two sets compared:  what only the old had, what only the new has, and what was left out on purpose. */
export type SetDifference = {
  /** In the old doc, not the new. */
  missing: string[]
  /** In the new doc, not the old. */
  added: string[]
  /** How many were compared (the old doc's, after exclusions). */
  compared: number
  /** Left out of the comparison on purpose, with why:  `#plan-started (meta line, drawn by <epic-page>)`. */
  excluded: string[]
}

/** The visible text compared, unit by unit. */
export type TextDifference = {
  /** Units whose words differ. */
  units: UnitDifference[]
  /** How many words were compared (the old doc's, after exclusions). */
  words: number
  /** Units whose words are the same but in another order (an answer moved after its question ...):  not a loss. */
  reordered: string[]
}

/** One unit's words that differ. */
export type UnitDifference = {
  /** The unit:  an item's id (`q7`), a phase's (`p2`), a section's (`decisions`), `overview`, or `page`. */
  unit: string
  /** Words only the old doc has, in its order. */
  missing: string[]
  /** Words only the new doc has, in its order. */
  added: string[]
}

////////////////
// ## Old markup
////////////////

/**
 * The OLD markup the converter reads (2026-10-02 on:  `ui-section`s, `ui-item`s), by what it is.
 * - Older layouts (`section.s2`, `ol.plan-items`, `#plan`, `D` items) aren't read:  `OLD_LAYOUTS`.
 */
export const Old = {
  header: "ui-sticky.spell-h1",
  title: ".spell-page-head h1",
  step: ".plan-step",
  meta: "ui-list.plan-meta",
  hung: ":is(ui-accordion, ui-message).plan-hung",
  future: "ui-message.plan-future",
  overnight: "ui-section#overnight",
  summary: "p.plan-summary",
  promptPanel: "ui-accordion.plan-prompt-panel",
  prompt: "blockquote.plan-prompt",
  estimate: "p.plan-estimate",
  progress: "ui-progress.plan-progress",
  planChanges: "ui-message.plan-changes",
  phaseBody: "ui-list.plan-phase-body",
  updatedList: "ul.plan-updated-list",
  commitList: "ul.plan-commit-list",
  commitLink: ".plan-commit",
  items: "ui-list.plan-items",
  itemPanel: "ui-accordion.plan-item",
  chip: "a.plan-id",
  itemTitle: "span.plan-title",
  reviewLabel: "ui-label.plan-review",
  updateLabel: "ui-label.plan-update",
  updateMessage: "ui-message.plan-update",
  question: "div.plan-question",
  first: "div.plan-first",
  choices: "ui-accordion.plan-choices",
  options: "ui-accordion.plan-options",
  grid: "ui-grid.spell-pros-cons",
  answer: "div.plan-answer-block",
  answerTitle: "div.plan-answer-title",
  more: "ui-accordion.plan-more",
  reply: "div.plan-reply",
  replyTitle: "div.plan-reply-title",
  original: "ui-accordion.plan-original",
  version: "div.plan-version",
  commits: "div.plan-commits",
  feed: "ui-feed.plan-log",
  oldLog: "ul.plan-log",
  partNote: ".plan-part-note"
} as const

/** Layouts from before 2026-10-02, which `spell dev plan-doc migrate <name>` brings up to date:  never read here. */
export const OLD_LAYOUTS = "section.s2, section.s3, ol.plan-items, main > #plan, .plan-items > ui-item[id^='d']"

/** The ids of the meta lines' dates:  drawn by `<epic-page>` from `started` / `updated`. */
export const META_IDS = ["plan-started", "plan-updated"]

/** A phase body field's label (`<b>Goal:</b>`) => its `<epic-field name>`;  `Updated` and `Commits` are elements. */
export const FIELD_NAMES = {
  Symptom: "symptom",
  Changes: "changes",
  Goal: "goal",
  Done: "done",
  Files: "files",
  Verify: "verify",
  "To review": "to-review"
} as const

/** A field label `FIELD_NAMES` knows. */
export type FieldLabel = keyof typeof FIELD_NAMES

/** An `<epic-field name>`. */
export type FieldName = (typeof FIELD_NAMES)[FieldLabel]

/** The phase fields whose label is an element of its own, not an `<epic-field>`. */
export const UPDATED_LABEL = "Updated"
/** `UPDATED_LABEL`'s twin:  a phase's commits. */
export const COMMITS_LABEL = "Commits"

/**
 * Where a phase field the vocabulary has no name for goes (`Judgement calls:`, `Outcome:` ...):  the first of these
 * the phase has, else a new `goal`.  Kept whole, label and all, as a `<div>` at its end.
 */
export const EXTRA_FIELD_HOSTS: readonly FieldName[] = ["done", "goal"]

////////////////
// ## Chrome
////////////////

// What the old markup wrote that the elements now draw (`Chrome`), and a reply's title line (`replyTitleParts()`):
// the tool's too (`IncomingHtml` turns old shapes into elements on the way in), so its types file holds them
export { Chrome, replyTitleParts } from "$/epics/tool/planDoc.types"

/**
 * Is `message` (`ui-message.plan-update`) the script's own UPDATE note, `header="UPDATE"` with its phase?  It becomes
 * `<epic-update phase>`;  a hand-written one (`header="DONE · option A"`, no phase) stays prose.
 */
export function isScriptUpdate(message: Element): boolean {
  return message.getAttribute("header") === "UPDATE" && /^\d+$/.test(message.getAttribute("data-phase") ?? "")
}

/**
 * The exclusions, as the proof report lists them:  what of the old doc isn't compared, and why.
 * - one line each, for a reader;  the code is `OldReading`'s
 */
export const EXCLUSIONS = [
  "page header:  `Epic: ` and the step label (drawn by <epic-page> from `title` and the phases)",
  "meta lines:  `Plan doc for ... branch`, `Worktree:`, `Started ..., updated ...` and their ids and links (drawn from <epic-page> `branch`, `worktree`, `started`, `updated`);  the durable doc's link is kept",
  "section titles (`3. Questions`), their icons and tooltips (drawn per kind);  an Overview sub-section's `1.3 ` and a phase's `P2 · ` (drawn from position and id)",
  "the Phases progress bar and its Plan changes box (drawn from the phases and their <epic-updated> lines)",
  "`Kickoff prompt`, `Estimate:`, `Choices`, `More Details`, `Original Discussion`, `As first written` / `As of ...` (drawn around their slots and elements)",
  "phase field labels (`Goal:`, `Updated:`, `Commits:` ...) and commit short shas and links (drawn from `name`, `sha` and <epic-page repo>)",
  "item chips (`Q7`, linking `#q7`), review labels (`reviewed 10-06`), `UPDATE` on a marker (drawn from the item's data)",
  "an option's `A · ` and ` (recommended)`, an answer's `Answer · ` / `D7 · `, a reply's title line's ` · ` and `re: ` (drawn from `letter`, `recommended`, the answer's id, `from` / `at` / `re`)",
  "the `Plan hung?` and future-epic notices (drawn by <epic-page> while it has no phases / is `future`)",
  "the `plan-doc.css` link in the head:  dropped (P14:  the elements style themselves)",
  "an older doc's Overnight report (`#overnight`, before 2026-10-05), its ids and links:  dropped (Owen, I3:  what it said is in the items and phases now);  the items it linked are `overnight`"
] as const

////////////////
// ## The second pass
////////////////

// The old prose blocks' selectors and what the elements draw around them (`Drawn`):  the tool's too (`ProseShapes`,
// its way in's and this pass's ONE set of rules), so its types file holds them
export { Drawn, LABELLED_BLOCK } from "$/epics/tool/planDoc.types"

/**
 * The shapes the SECOND pass reads (`Upgrader`, P14):  blocks in a converted doc that no element owned until P14, by
 * what they are -- the page's own, and the prose blocks (`ProseBlocks`, the tool's).  The proof's `ConvertedReading`
 * knows which of their text the new elements draw.
 */
export const Prose = {
  crumbs: "ui-breadcrumb.spell-crumbs",
  report: "ui-section#overnight",
  summary: "p[slot='summary']",
  prompt: "blockquote[slot='prompt']",
  ...ProseBlocks
} as const

/**
 * What the second pass counts (`Conversion.counts`), by what it did;  `kept: ...`, what it left as prose, and why.
 * - the prose blocks' are `ProseRewrite`'s (`ProseCounted`, the tool's)
 * - a doc whose counts are all `kept: ...` has nothing to upgrade (`Upgrader.changed()`)
 */
export const Counted = {
  crumbs: "crumbs",
  css: "plan-doc.css link",
  report: "report section",
  summary: "summary",
  prompt: "prompt",
  question: "question",
  versionQuestion: "question, in a version",
  ...ProseCounted,
  keptOutside: "kept: outside <epic-page>"
} as const

/** A `Counted` key's text before what was kept as prose. */
export const KEPT = "kept: "

/**
 * The second pass's exclusions, as the proof report lists them:  what of a converted doc isn't compared, and why.
 * - one line each, for a reader;  the code is `ConvertedReading`'s
 */
export const UPGRADE_EXCLUSIONS = [
  "the old crumbs before <epic-page> (`Docs › Epics › <title>`) and their links (drawn by <epic-page>)",
  "the `plan-doc.css` link in the head:  dropped (P14:  the elements style themselves)",
  "a Net effect paragraph's label, `Net effect (A, recommended):` (drawn by <epic-net-effect> from `option` and `recommended`)",
  "an aside's `Aside: ` (drawn by <epic-aside>)",
  "a hand-written note's `UPDATE` / `DONE` and its ` · ` (drawn by <epic-note> from `state`);  a phase's bare `UPDATE` (drawn by <epic-update>)",
  "a labelled block's `Where:` (drawn by <epic-field> from `label`)",
  "an option card's `A · `, ` (recommended)` and ` (chosen)` (drawn from `letter`, `recommended` and <epic-choices chosen>)",
  "a hand-written answer's `Answer` / `D7` and a reply's title line (drawn from the element's data)"
] as const

////////////////
// ## The new page
////////////////

/** The old plan-doc sheet's link, which a converted page drops (P14:  the elements style themselves). */
export const PLAN_DOC_CSS = 'head > link[href$="/plan-doc.css"]'

/** The pack a converted page loads, from `epics/<name>/`:  `<ui-components source>`. */
export const PACK_SOURCE = "../../packages/epics/pack/epics.pack.js"

/** `<body>` attributes that move onto `<epic-page>` (camelCase key there). */
export const BODY_DATA = {
  "data-plan": "epic",
  "data-recent-since": "recentSince",
  "data-bedtime": "bedtime",
  "data-future": "future"
} as const

/** A commit link's address:  `<repo>/commit/<sha>`. */
export const COMMIT_URL = /^(https?:\/\/.+)\/commit\/([0-9a-f]{7,40})$/
