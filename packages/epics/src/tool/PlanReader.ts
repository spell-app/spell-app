import {
  CALM_ID,
  CANCELED,
  CLOSED,
  KINDS,
  OLD_DECISION,
  OPEN_KINDS,
  PlanDocError,
  QUESTION_ID,
  REVIEW_FILTERS,
  REVIEW_SECTIONS,
  SETTLED_AS,
  isReviewFilter,
  type ItemDescription,
  type ItemFacts,
  type ItemKind,
  type ItemState,
  type ItemSummary,
  type ItemText,
  type OpenKind,
  type OptionCard,
  type Phase,
  type PlanDocOptions,
  type PlanDocParts,
  type PlanSummary,
  type ReviewItem,
  type ReviewSection,
  type ReviewState,
  type ReviewStatus
} from "./planDoc.types"

import { PlanItem } from "./PlanItem"
import { PlanTime } from "./PlanTime"

/****************
 * ### `PlanReader`
 * A parsed plan doc, READ:  its phases, its items and where their reviews stand, a summary of what's open.
 * What `summary`, `list`, `items`, `check` and the inbox's listings need.
 * - ABSTRACT:  the markup is its subclass's, `PlanDoc` (`<epic-*>`, which also edits):  it says what an item is
 *   (`facts()`, `textOf()` ...);  the reckoning on top -- an item's state, its review state, the review lists, the
 *   summary -- is here.
 * - REFACTOR: one subclass since the old markup's reader went (epic `epic-components` P15):  fold this into `PlanDoc`
 * - Pure:  a parsed document in;  no files, no git, no clock unless passed one.
 * - Imports the tool's types and its markup-free helpers only:  never `PlanDoc`.
 ****************/
export abstract class PlanReader {
  /** linkedom (or browser) document of the plan doc */
  readonly document: Document

  /**
   * when edits happen:  the log's timestamps, the items' change stamps and the "updated" date, in LOCAL time
   * - a test may move it between edits
   */
  now: Date

  /**
   * the commit time (ISO) of `HEAD~2` in the doc's checkout, which `PlanDoc.updateStates()` writes to the page's
   * `recent-since` (D2).  `null`:  no git history, so it goes;  `undefined` (default):  left as the doc has it
   * - passed in, so the reader stays pure:  the command line asks git
   * - NOTE: no colour reads it since 2026-10-08 (a decided item stays green, however old:  `itemState()`);
   *   REFACTOR:  drop it, the git call and the attribute (the converter and its fixtures write it too)
   */
  recentSince: string | null | undefined

  /** how the doc was stored (split or not), set by the command line's `read()`;  never read here */
  parts?: PlanDocParts

  constructor(document: Document, now = new Date(), { recentSince }: PlanDocOptions = {}) {
    this.document = document
    this.now = now
    this.recentSince = recentSince
  }

  /** `now`'s date, `YYYY-MM-DD`. */
  get today(): string {
    return PlanTime.isoDate(this.now)
  }

  ////////////////
  // ## What the markup says (subclasses)
  ////////////////

  /** The epic's title, without `Epic: `;  `""` when the doc has none. */
  abstract get title(): string

  /** Every phase, in order. */
  abstract get phases(): Phase[]

  /** A FUTURE epic (`/epic future <name>`):  an idea written down, not planned yet. */
  abstract get future(): boolean

  /** The phases a `/bedtime` run is on (`P3-P6`);  `null` when none is. */
  abstract get bedtimeRun(): string | null

  /** The Overview's total estimate (`4h-5h in all, 2h left`), as the doc has it. */
  abstract get estimate(): string | undefined

  /** The elements in `kind`'s section (none without one):  `itemsOf()` keeps the items of that kind. */
  protected abstract sectionChildren(kind: ItemKind): Element[]

  /** Every item, in page order. */
  abstract get allItems(): Element[]

  /** What item `item` says about itself. */
  abstract facts(item: Element): ItemFacts

  /** The item with `id` (any case), or `null`;  an old decision's id (`d7`) finds the question it answers. */
  abstract findItem(id: string): Element | null

  /** Item `item`'s current text, its Original Discussion and its recommendation:  `reviewItem()`'s. */
  abstract textOf(item: Element): ItemText

  /** Does a decision (an answered question, not `id` itself) link to `#id` in its current text? */
  abstract linkedFromDecision(id: string): boolean

  /**
   * `item`'s options, never one in its Original Discussion:  its own card set's, or (`choices`) the one at that
   * position among its sets (a reply's, More Details':  I8).
   */
  abstract optionCards(item: Element, choices?: number): OptionCard[]

  /** Structural problems, as text:  duplicate ids, `#id` links to nowhere, phases without a valid status ... */
  abstract check(): string[]

  /** The doc as HTML text. */
  abstract toString(): string

  ////////////////
  // ## Phases and items
  ////////////////

  /** Number of the phase in progress, if any. */
  get activePhase(): number | undefined {
    return this.phases.find((phase) => phase.status === "active")?.n
  }

  /** Is a `/bedtime` run going on?  Then every item a command changes stays "recent" until reviewed. */
  get bedtime(): boolean {
    return this.bedtimeRun !== null
  }

  /** Items of `kind` in its section, in order:  the elements whose id has the kind's letter (`q7`, never `d7`). */
  itemsOf(kind: ItemKind): Element[] {
    const pattern = new RegExp(`^${KINDS[kind].prefix}\\d+$`)
    return this.sectionChildren(kind).filter((item) => pattern.test(item.id))
  }

  /** Items of `kind`, in order:  `{ id, title, status }`. */
  items(kind: ItemKind): ItemSummary[] {
    return this.itemsOf(kind).map((item) => {
      const { id, title, status } = this.facts(item)
      return { id, title, status }
    })
  }

  /** Does the doc have item `id` (any case;  an old `d7` too:  `findItem()`)? */
  hasItem(id: string): boolean {
    return Boolean(this.findItem(id))
  }

  /**
   * Item `id`, as `plan-doc inbox` shows it:  `{ id, kind, status, title }` (`id` upper-case), or `null` when the
   * doc has no such item.
   */
  describeItem(id: string): ItemDescription | null {
    const item = this.findItem(id)
    if (!item) return null
    const facts = this.facts(item)
    return { id: facts.id.toUpperCase(), kind: PlanItem.kindOf(facts.id), status: facts.status, title: facts.title }
  }

  /**
   * What needs attention:  the phases, the next one to do, and the open questions / issues / caveats / todos.
   * - feeds the end-of-phase reply and its AskUserQuestion options
   */
  summary(): PlanSummary {
    const phases = this.phases
    const open = Object.fromEntries(
      OPEN_KINDS.map((kind) => [kind, this.items(kind).filter((item) => item.status === "open")])
    ) as Record<OpenKind, ItemSummary[]>
    return {
      title: this.title,
      phases,
      active: phases.find((phase) => phase.status === "active"),
      next: phases.find((phase) => phase.status === "todo"),
      estimate: this.estimate,
      bedtime: this.bedtimeRun,
      future: this.future,
      open
    }
  }

  ////////////////
  // ## States
  ////////////////

  /**
   * Item `item`'s standing, the `state` the page colours it by (`STATE_COLORS`):
   * - Claude is working on it (an underway status card, or `working`):  `progress`, closed or not (a revisit of a
   *   decided question is work too)
   * - canceled (made moot, struck through):  `old`, grey -- the ONE "no longer relevant"
   * - closed otherwise (done, decided, an old doc's `d7`):  `recent`, green, however long ago (Owen, 2026-10-08:
   *   "green across the board is good")
   * - work a review queued, not started (`queued`):  `open`, still to do (Q20:  no longer `progress`)
   * - Claude answered it last, with options nothing is picked in yet (`PlanItem.awaitsPick()`):  `replied`, Owen's
   *   turn to pick (Owen, 2026-10-09);  a pick, a newer reply from Owen, or closing it ends that
   * - waiting on Owen:  `attention`:  an open question;  an open judgement call or issue not reviewed, unless it's
   *   `calm` (not urgent:  it wouldn't surprise Owen, or he said so from its id chip):  then `open`
   * - settled by a review, though still open (`SETTLED_AS`:  approved, made a todo):  `recent`
   * - else `open`:  a revisit or Do Now Claude answered leaves it open, yellow (J10)
   */
  itemState(item: Element): ItemState {
    const facts = this.facts(item)
    if (facts.underway || facts.working) return "progress"
    if (facts.status === CANCELED) return "old"
    if (CLOSED.has(facts.status) || OLD_DECISION.test(facts.id)) return "recent"
    if (facts.queued !== undefined) return "open"
    if (facts.awaitsPick) return "replied"
    if (QUESTION_ID.test(facts.id)) return "attention"
    if (CALM_ID.test(facts.id) && facts.reviewed === undefined) return facts.calm ? "open" : "attention"
    if (SETTLED_AS.has(facts.reviewAs ?? "")) return "recent"
    return "open"
  }

  ////////////////
  // ## Review
  ////////////////

  /**
   * Item `item`'s review state:
   * - `queued`:  reviewed, work waiting
   * - `reviewed`:  marked, closed (`CLOSED`:  done, canceled, an answered question), or linked from a decision
   * - `deferred`:  put off for now;  still outstanding
   * - `outstanding`:  none of the above
   */
  reviewState(item: Element): ReviewState {
    const facts = this.facts(item)
    if (facts.queued !== undefined) return "queued"
    if (facts.reviewed !== undefined || CLOSED.has(facts.status)) return "reviewed"
    if (this.linkedFromDecision(facts.id)) return "reviewed"
    return facts.deferred !== undefined ? "deferred" : "outstanding"
  }

  /**
   * The sections a review walks, in page order:  `{ kind, label, total, notReviewed, items }`, `items` filtered by
   * `filter` (`REVIEW_FILTERS`:  `unreviewed`, the default;  `open`, `reviewed`, `queued`, `all`).
   * - Questions are the `Q` items, open and answered
   * - throws on any other filter
   */
  reviewSections({ filter = "unreviewed" }: { filter?: string } = {}): ReviewSection[] {
    if (!isReviewFilter(filter)) throw new PlanDocError(`filter must be ${Object.keys(REVIEW_FILTERS).join(" / ")}`)
    const keep: (item: ReviewItem) => boolean = REVIEW_FILTERS[filter]
    return REVIEW_SECTIONS.map(({ kind, label }) => {
      const all = this.itemsOf(kind).map((item) => this.reviewItem(item))
      const notReviewed = all.filter((item) => REVIEW_FILTERS.unreviewed(item)).length
      return { kind, label, total: all.length, notReviewed, items: all.filter(keep) }
    })
  }

  /** `reviewSections()`'s view of one item:  dates `YYYY-MM-DD` or `null`;  its text (`textOf()`). */
  reviewItem(item: Element): ReviewItem {
    const facts = this.facts(item)
    return {
      id: facts.id.toUpperCase(),
      title: facts.title,
      status: facts.status,
      state: this.reviewState(item),
      docState: this.itemState(item),
      reviewed: facts.reviewed ?? null,
      deferred: facts.deferred ?? null,
      queued: facts.queued ?? null,
      work: facts.work ?? null,
      ...this.textOf(item)
    }
  }

  /**
   * Where reviews stand, for someone who remembers nothing:  `{ last, reviewedThen, deferred, queued }`.
   * - `last`:  the latest reviewed date, or `null` (never reviewed);  `reviewedThen`:  how many items carry it
   * - `deferred`:  items deferred;  `queued`:  `{ id, title, work, queued }` for each piece of work waiting
   */
  reviewStatus(): ReviewStatus {
    const all = this.allItems.map((item) => this.facts(item))
    const dates = all.map((facts) => facts.reviewed).filter((date) => date !== undefined)
    // `YYYY-MM-DD` sorts as text
    const last = dates.reduce((latest, date) => (date > latest ? date : latest), "") || null
    return {
      last,
      reviewedThen: last ? dates.filter((date) => date === last).length : 0,
      deferred: all.filter((facts) => facts.deferred !== undefined).length,
      queued: all
        .filter((facts) => facts.queued !== undefined)
        .map((facts) => ({
          id: facts.id.toUpperCase(),
          title: facts.title,
          work: facts.work ?? null,
          queued: facts.queued ?? null
        }))
    }
  }
}
