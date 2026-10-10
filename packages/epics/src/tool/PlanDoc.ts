import { parseHTML } from "linkedom"

import {
  OVERVIEW_ID,
  OVERVIEW_PART_ID,
  SectionIds,
  type EpicData,
  type EpicTag,
  type PageSectionKind
} from "$/epics/definitions"
import { Markup, type MarkupContent } from "$/epics/markup"

import {
  CALM_ID,
  CLOSED,
  ITEM_STATUSES,
  KINDS,
  OLD_DECISION,
  PHASE_FIELDS,
  PHASE_STATUSES,
  PlanDocError,
  QUESTION_ID,
  REVIEW_AS,
  UNDERWAY_CARD,
  isItemKind,
  isPhaseStatus,
  type AddItemOptions,
  type AddPhaseOptions,
  type BackfilledCommit,
  type CommitLogEntry,
  type CommitOptions,
  type CommitTarget,
  type DecideOptions,
  type ItemDescription,
  type ItemFacts,
  type ItemKind,
  type ItemText,
  type KeptNote,
  type MarkResult,
  type OptionCard,
  type OriginalOptions,
  type OriginalResult,
  type Phase,
  type PhaseFieldValues,
  type PlanMark,
  type ReviewAs
} from "./planDoc.types"

import { IncomingHtml } from "./IncomingHtml"
import { PlanCommits } from "./PlanCommits"
import { PlanItem } from "./PlanItem"
import { PlanMarkup } from "./PlanMarkup"
import { PlanReader } from "./PlanReader"
import { PlanTime } from "./PlanTime"
import { SUMMARY_ID } from "./ReviewInbox"

/****************
 * ### `PlanDoc`
 * A parsed plan doc in `<epic-*>` markup, `epics/<name>/<name>.plan.html`, and the edits `spell dev plan-doc` makes
 * to it.  What's data (ids, statuses, review marks, dates):  `PLAN-DOC.md` beside this.
 * - Every edit makes or sets `<epic-*>` elements THROUGH `$/epics` `Markup`:  data in attributes, prose in children,
 *   checked against the definitions.  It never writes layout:  the elements draw their chrome (chips, labels, the
 *   step label, progress, the Plan changes box, the Plan hung? notice ...).
 * - Children go where their parent's content model lists them (`Markup.place()`):  a phase's Symptom before its Goal, an
 *   item's text before its Choices, answer, replies, Original Discussion and commits.
 * - Pure:  a parsed document in, changes on it;  no files, no git, no clock unless passed one.
 *   The command line reads and writes the doc (its lock, its parts, links and formatting) and hands this the document.
 * - Reading (the summary, the review lists, item states) is `PlanReader`'s.
 * - The item STATE logic (stamps, colours, review marks, what a mark does) is the old tool's, unchanged (P7 ported
 *   it 1:1;  P8 switched its markup).
 ****************/
export class PlanDoc extends PlanReader {
  /** `PlanDoc` of HTML text;  `options` as the constructor's. */
  static parse(html: string, now?: Date, options?: ConstructorParameters<typeof PlanDoc>[2]): PlanDoc {
    return new PlanDoc(parseHTML(html).document as unknown as Document, now, options)
  }

  /** The doc as HTML text, ready to write:  boolean attributes bare, the doctype lower-case, `&` escaped (I2). */
  toString(): string {
    return PlanMarkup.serializePage(this.document)
  }

  ////////////////
  // ## The page
  ////////////////

  /** `<epic-page>`;  throws when the doc has none (not a plan doc, or one in the old markup). */
  get page(): Element {
    const page = this.document.querySelector("epic-page")
    if (!page) throw new PlanDocError("no <epic-page> in the doc:  is it a plan doc in the <epic-*> markup?")
    return page
  }

  /** `<epic-overview>`;  throws when there's none. */
  get overview(): Element {
    const overview = this.page.querySelector(":scope > epic-overview")
    if (!overview) throw new PlanDocError("no <epic-overview> in the doc")
    return overview
  }

  /** The epic's title:  `<epic-page title>`. */
  get title(): string {
    return this.document.querySelector("epic-page")?.getAttribute("title") ?? ""
  }

  /** A FUTURE epic:  `<epic-page future>`. */
  get future(): boolean {
    return Boolean(this.document.querySelector("epic-page")?.hasAttribute("future"))
  }

  /** The phases a `/bedtime` run is on:  `<epic-page bedtime>`, `null` when none is. */
  get bedtimeRun(): string | null {
    return this.document.querySelector("epic-page")?.getAttribute("bedtime") || null
  }

  /** The Overview's total:  `<epic-overview estimate>`. */
  get estimate(): string | undefined {
    return this.document.querySelector("epic-page > epic-overview")?.getAttribute("estimate") ?? undefined
  }

  /** Stamp "updated" with today:  `<epic-page updated>`. */
  touch(): void {
    Markup.set(this.page, { updated: this.today })
  }

  /** The page's section of `kind` (`<epic-section kind>` in `<epic-page>`), or `null`. */
  findSection(kind: PageSectionKind): Element | null {
    return this.document.querySelector(`epic-page > epic-section[kind="${kind}"]`)
  }

  /** The page's section of `kind`;  made, empty, in its place when the doc has none. */
  section(kind: PageSectionKind): Element {
    const found = this.findSection(kind)
    if (found) return found
    const section = this.make("epic-section", { id: SectionIds[kind], kind })
    Markup.place(this.page, section)
    return section
  }

  ////////////////
  // ## Phases
  ////////////////

  /** The `<epic-phase>`s, in order. */
  get phaseElements(): Element[] {
    return Array.from(this.document.querySelectorAll('epic-page > epic-section[kind="phases"] > epic-phase'))
  }

  /** Every phase, in order:  `{ n, name, status, estimate }`, from each `<epic-phase>`. */
  get phases(): Phase[] {
    return this.phaseElements.map((phase) => {
      const estimate = phase.getAttribute("estimate")
      return {
        n: PlanItem.idNumber(phase.id),
        name: PlanItem.titleOf(phase),
        status: phase.getAttribute("status") ?? "todo",
        estimate: estimate && estimate !== "TBD" ? estimate : undefined
      }
    })
  }

  /** Phase `n`'s `<epic-phase>`;  throws when there's none. */
  phase(n: number): Element {
    const phase = this.phaseElements.find((each) => each.id === `p${n}`)
    if (!phase) throw new PlanDocError(`no phase ${n} in the doc`)
    return phase
  }

  /**
   * Append phase `name` (2-4 words);  returns its number.
   * - `symptom` / `changes` / `goal` / `files` / `verify`:  its `<epic-field>`s, as HTML:
   *   the symptom one line, the changes two or three, the goal a `<ul>` (the details)
   *   - omitted ones get `TBD` to fill in, but the goal:  optional once there's a symptom or changes
   *   - neither of those:  the shape before P3 of `windows-and-review`, Goal / Files / Verify
   * - `estimate` (`1-2h`):  `<epic-phase estimate>`
   * - `before` (`add-phase --before N`, epic `skillz`):
   *   inserted as phase N, the to-do phases from N on moving down one (`makeRoomForPhase()`)
   * - a future epic with a phase is planned:  no longer future;  the "Plan hung?" notice (drawn while there's no
   *   phase) goes by itself
   */
  addPhase(name: string, { estimate, before, ...values }: AddPhaseOptions = {}): number {
    // the room first:  a refused --before changes nothing
    const n = before === undefined ? this.phases.length + 1 : this.makeRoomForPhase(before)
    const section = this.section("phases")
    if (this.future) Markup.set(this.page, { future: false })
    const framed = values.symptom !== undefined || values.changes !== undefined
    const fields = PHASE_FIELDS.filter((name) =>
      framed ? name !== "goal" || values.goal !== undefined : name !== "symptom" && name !== "changes"
    ).map((name) => this.make("epic-field", { name }, this.incoming(values[name] ?? "TBD")))
    const phase = this.make("epic-phase", { id: `p${n}`, title: name, status: "todo", estimate }, fields)
    if (before === undefined) section.append(phase)
    else this.phase(n + 1).before(phase)
    this.updateEstimate()
    return n
  }

  /**
   * Make room for a new phase `n`, before the one numbered `n` now (`add-phase --before n`):
   * it and every later phase move down one;  returns `n`.
   * - each moved phase's id (`p5` -> `p6`:  its title has no number), and everything that points at it:
   *   links (`href="#p5"`, the `P5` in their text), and the `phase` / `of` of items, UPDATE markers and Updated lines
   * - prose naming a phase without a link ("P5 tries it") isn't changed:  link phases to keep them right
   * - a split doc's part files follow by themselves:  each is written back under its host's new id, and every old
   *   name is taken by the phase that moved onto it, the new phase taking N's
   * - throws if there's no phase `n`, or a phase from `n` on has started
   *   (done or active:  its commits and log say its number)
   */
  makeRoomForPhase(n: number): number {
    const phases = this.phases
    if (!Number.isInteger(n) || n < 1 || n > phases.length) {
      throw new PlanDocError(`--before ${n}:  no such phase (${phases.length ? `1-${phases.length}` : "none yet"})`)
    }
    const started = phases.find((phase) => phase.n >= n && phase.status !== "todo")
    if (started) throw new PlanDocError(`--before ${n}:  P${started.n} has started;  only to-do phases move down`)
    // last first, so a number is free before anything moves onto it
    for (let k = phases.length; k >= n; k--) this.renumberPhase(k, k + 1)
    return n
  }

  /** Phase `from` becomes phase `to`:  its element, and what points at it (`makeRoomForPhase()`). */
  private renumberPhase(from: number, to: number): void {
    Markup.set<"epic-phase">(this.phase(from), { id: `p${to}` })
    for (const element of this.document.querySelectorAll(
      PHASE_POINTERS.map((tag) => `${tag}[phase="${from}"]`).join()
    )) {
      Markup.set<"epic-item">(element, { phase: to })
    }
    for (const line of this.document.querySelectorAll(`epic-updated[of="${from}"]`)) {
      Markup.set<"epic-updated">(line, { of: to })
    }
    for (const link of this.document.querySelectorAll(`a[href="#p${from}"]`)) {
      link.setAttribute("href", `#p${to}`)
      link.innerHTML = link.innerHTML.replace(new RegExp(`\\bP${from}\\b`), `P${to}`)
    }
  }

  /** Set phase `n`'s estimate (`2h`, `1-2h`), then the Overview's total. */
  setEstimate(n: number, estimate: string): void {
    Markup.set(this.phase(n), { estimate })
    this.updateEstimate()
  }

  /**
   * The Overview's total, `<epic-overview estimate>`:  every phase's estimate added up, and what's left (phases not
   * done):  `4h-5h 30m in all, 2h-3h left (P5 not estimated)`.
   * - an estimate that won't parse (`TBD`, "a day") is named as not counted;  no phase estimated:  no total
   */
  updateEstimate(): void {
    const counted = this.phases.map((phase) => ({ ...phase, range: PlanTime.parseDuration(phase.estimate) }))
    const estimated = counted.filter((phase) => phase.range)
    if (!estimated.length) {
      Markup.set(this.overview, { estimate: undefined })
      return
    }
    const total = PlanTime.sumRanges(estimated.map((phase) => phase.range!))
    const left = PlanTime.sumRanges(estimated.filter((phase) => phase.status !== "done").map((phase) => phase.range!))
    const missing = counted.filter((phase) => !phase.range).map((phase) => `P${phase.n}`)
    let text = `${PlanTime.formatRange(total)} in all, ${PlanTime.formatRange(left)} left`
    if (missing.length) text += ` (${missing.join(", ")} not estimated)`
    Markup.set(this.overview, { estimate: text })
  }

  /**
   * Set phase `n` to `status` (`todo` / `active` / `done`).
   * - `done` removes the phase's UPDATE markers (`<epic-update phase="N">`):
   *   once it's finished, its changes are just the plan
   * - `done` with `{ done }` (HTML:  a `<ul>` of what was built, what Owen will ask about first):  its Done field
   * - throws on any other status
   * - SIDE EFFECT:  logs the change
   */
  setPhase(n: number, status: string, { done }: { done?: string } = {}): void {
    if (!isPhaseStatus(status)) throw new PlanDocError(`status must be ${PHASE_STATUSES.join(" / ")}, not "${status}"`)
    Markup.set(this.phase(n), { status })
    if (status === "done") {
      this.removeUpdateMarkers(n)
      if (done) this.setDone(n, done)
    }
    this.updateEstimate()
    this.log(`P${n} ${status}`)
  }

  /** Phase `n`'s Done field (`<epic-field name="done">`):  what was built, as HTML;  replaces an earlier one. */
  setDone(n: number, html: string): void {
    this.setField(this.phase(n), "done", html)
  }

  /**
   * Set phase `n`'s fields:  `{ symptom, changes, goal, files, verify }`, as HTML;  each one given replaces that
   * field, or is made in its place;  `""` removes it.  Returns the fields set, by label (`Symptom` ...).
   */
  setPhaseFields(n: number, values: PhaseFieldValues): string[] {
    const phase = this.phase(n)
    const set: string[] = []
    for (const name of PHASE_FIELDS) {
      const html = values[name]
      if (html === undefined) continue
      this.setField(phase, name, html)
      set.push(`${name[0]!.toUpperCase()}${name.slice(1)}`)
    }
    return set
  }

  /**
   * A change to phase `n`'s plan, `html` (what changed, and why), as one dated `<epic-updated>`, under its Symptom /
   * Changes, after the ones before it.
   * - `at`:  now, `YYYY-MM-DD HH:MM`;  `phase`:  the phase active when it was written, if any
   * - it STAYS when a phase is done (unlike the UPDATE markers);  while its phase is to do, the Phases section lists
   *   it in its Plan changes box (drawn)
   * - old prose shapes in `html` (a Net effect paragraph, a code accordion ...) become elements (`IncomingHtml`)
   * - SIDE EFFECT:  logs it
   */
  addPhaseUpdate(n: number, html: string): void {
    const phase = this.phase(n)
    const data = { at: PlanTime.clockTime(this.now), phase: this.activePhase }
    Markup.place(phase, this.make("epic-updated", data, this.incoming(html)))
    this.log(`P${n} plan updated`)
  }

  /**
   * The Phases section's Plan changes (T14):  a COPY of each `<epic-updated>` of every phase still to do (not
   * `done`), in phase order, as `<epic-updated slot="changes" of="N">` first in the section;
   * `<epic-section kind="phases">` draws them as a box above the phases.  Rewritten whole;  changed?
   * - copies, not links:  a phase's lines are in its part file, which the page loads only when it's opened
   * - a copy keeps the line's attributes (`at`, `phase`:  the phase under way then), adds `of` (whose plan it
   *   changes);  ids inside are renamed (`PlanItem.stripIds()`):  a copy is never a link's target
   * - STATIC:  the converter writes the same copies (`PhaseConverter`);  `section` must hold its phases' lines (an
   *   ASSEMBLED doc:  a skeleton alone would read as no changes)
   */
  static writePlanChanges(section: Element): boolean {
    const copies: Element[] = []
    for (const phase of section.querySelectorAll(":scope > epic-phase")) {
      if (phase.getAttribute("status") === "done") continue
      const of = PlanItem.idNumber(phase.id)
      for (const line of phase.querySelectorAll(":scope > epic-updated")) {
        const data = { ...Markup.read<"epic-updated">(line), of }
        const copy = Markup.element(section.ownerDocument, "epic-updated", data, line.innerHTML)
        copy.setAttribute("slot", PLAN_CHANGES_SLOT)
        PlanItem.stripIds(copy)
        copies.push(copy)
      }
    }
    const old = Array.from(section.querySelectorAll(`:scope > epic-updated[slot="${PLAN_CHANGES_SLOT}"]`))
    const markupOf = (elements: Element[]) => PlanMarkup.bare(elements.map((it) => it.outerHTML).join(""))
    if (markupOf(old) === markupOf(copies)) return false
    for (const each of old) each.remove()
    section.prepend(...copies)
    return true
  }

  /** The Plan changes of this doc's Phases section (`writePlanChanges()`);  changed? */
  updatePlanChanges(): boolean {
    const section = this.findSection("phases")
    return section ? PlanDoc.writePlanChanges(section) : false
  }

  /** UPDATE markers of phase `n`:  every `<epic-update phase="N">`, labels and notes. */
  updateMarkers(n: number): Element[] {
    return Array.from(this.document.querySelectorAll(`epic-update[phase="${n}"]`))
  }

  /**
   * Remove phase `n`'s UPDATE markers;  a title slot left with plain text goes back to a `title` (as the converter
   * writes a title without markup).
   */
  removeUpdateMarkers(n: number): void {
    for (const marker of this.updateMarkers(n)) {
      const slot = marker.parentElement?.getAttribute("slot") === "title" ? marker.parentElement : null
      marker.remove()
      if (slot && !slot.children.length) this.untitleSlot(slot)
    }
  }

  ////////////////
  // ## Items
  ////////////////

  /** Every `<epic-item>`, in page order. */
  get allItems(): Element[] {
    return Array.from(this.document.querySelectorAll("epic-page > epic-section > epic-item"))
  }

  /** The elements in `kind`'s section. */
  protected sectionChildren(kind: ItemKind): Element[] {
    return Array.from(this.findSection(KINDS[kind].section)?.children ?? [])
  }

  /** What `<epic-item>` `item` says, through `Markup.read()`. */
  facts(item: Element): ItemFacts {
    const data = Markup.read<"epic-item">(item)
    return {
      id: item.id,
      title: PlanItem.titleOf(item),
      status: data.status ?? "open",
      changed: data.changed,
      phase: data.phase,
      answered: Boolean(data.answered),
      reviewed: data.reviewed,
      deferred: data.deferred,
      queued: data.queued,
      work: data.work,
      working: Boolean(data.working),
      underway: !!item.querySelector(UNDERWAY_CARD),
      bedtime: Boolean(data.bedtime),
      calm: Boolean(data.calm),
      awaitsPick: PlanItem.awaitsPick(item),
      reviewAs: data.reviewAs
    }
  }

  /**
   * The item with `id` (any case), or `null`.
   * - an old decision's id (`d7`), kept on an answer (`<epic-answer id="d7">`), finds the question holding it:
   *   `close d7`, `Fix D7:` commits still reach it
   */
  findItem(id: string): Element | null {
    const key = String(id).toLowerCase()
    let element = this.document.getElementById(key)
    if (element?.localName === "epic-answer" && OLD_DECISION.test(key)) element = element.closest("epic-item")
    return element?.localName === "epic-item" && element.parentElement?.localName === "epic-section" ? element : null
  }

  /** The item with `id` (any case);  throws when there's none. */
  item(id: string): Element {
    const item = this.findItem(id)
    if (!item) throw new PlanDocError(`no item "${id}"`)
    return item
  }

  /**
   * Add a `kind` item titled `title`;  returns its id (`c3`).
   * - `details`:  HTML, its children (its text, and cards:  `<epic-choices>` ...);  old shapes are turned into
   *   elements on the way in (`IncomingHtml`);  a question's lead, the question as asked, goes in an
   *   `<epic-question>` (P14) unless the HTML has one
   * - `titleHTML`:  `title` is HTML;  with markup, it's a `slot="title"` child
   * - a question goes after the open questions at the top of its section;  a decision is a question born answered
   *   (D13):  the next `q` id, `decided`, `answered`, `title` its answer, among the answered ones;
   *   everything else at the end
   * - while a phase is active:  `phase` (its "To review" line lists it) and an UPDATE marker
   * - in bedtime mode (a `/bedtime` run):  `overnight`, for good (the bed icon on its line)
   * - `calm`:  not urgent (blue, not red, until reviewed):  a judgement call or issue that simply follows WWOD
   * - stamped (`stamp()`)
   * - throws on a kind not in `KINDS`;  `calm` on a kind that's never urgent
   */
  addItem(kind: string, title: string, { details, titleHTML = false, calm = false }: AddItemOptions = {}): string {
    if (!isItemKind(kind)) throw new PlanDocError(`kind must be ${Object.keys(KINDS).join(" / ")}, not "${kind}"`)
    const spec = KINDS[kind]
    const id = `${spec.prefix}${Math.max(0, ...this.items(kind).map((item) => PlanItem.idNumber(item.id))) + 1}`
    if (calm && !CALM_ID.test(id)) throw new PlanDocError(`--calm is for a judgement call or an issue, not a ${kind}`)
    const section = this.section(spec.section)
    const heading = titleHTML ? this.titleFromHTML(title) : { title }
    const data: EpicData<"epic-item"> = {
      id,
      title: heading.title,
      status: spec.live,
      phase: this.activePhase,
      answered: kind === "decision",
      ...(this.bedtime && { overnight: true }),
      ...(calm && { calm: true })
    }
    const item = this.make("epic-item", data, heading.slot ? [heading.slot] : [])
    for (const node of this.incoming(details, { question: kind === "question" })) Markup.place(item, node)
    section.append(item)
    if (spec.prefix === KINDS.question.prefix) this.placeQuestion(item)
    this.stamp(item)
    this.markUpdate(item)
    return id
  }

  /**
   * Answer question `questionId` with `answer` (text), INTO the question (D13);  returns its id (`q3`).
   * - `decided`, `answered`;  the title keeps the question
   * - the answer is an `<epic-answer title="<answer>">`, `details` (HTML) its children, after the question's text
   *   and Choices
   * - answering again replaces the answer in place:  the old one goes into the question's Original Discussion
   *   (`keepOriginal()`), never dropped;  an old decision's id (`d7`) stays on the new answer
   * - `option` (`A`):  that option is the chosen one (`chooseOption()`), of the question's own options or (`choices`,
   *   I8) of the card set at that position, a reply's say;  a question has ONE answer, so no other set stays chosen
   * - moves among the answered questions, in id order:  open ones stay on top
   * - throws when `questionId` isn't a question
   */
  decide(questionId: string, answer: string, { details, option, choices }: DecideOptions = {}): string {
    const question = this.item(questionId)
    if (!QUESTION_ID.test(question.id)) throw new PlanDocError(`${questionId} isn't a question`)
    const old = question.querySelector(":scope > epic-answer")
    const card = this.make("epic-answer", { title: answer }, this.incoming(details))
    if (old) {
      const id = old.getAttribute("id") ?? undefined
      old.replaceWith(card)
      Markup.set(old, { id: undefined })
      const same = PlanMarkup.bare(old.outerHTML) === PlanMarkup.bare(card.outerHTML)
      // the answer it replaces is kept (headed by its old decision's id, `D7`), unless it said the same
      if (!same) this.keepOriginal(question, [Markup.set(old, { id })])
      Markup.set(card, { id })
    } else Markup.place(question, card)
    if (option) {
      const set = this.chooseOption(question, option, choices)
      for (const other of PlanItem.choiceSets(question)) if (other !== set) Markup.set(other, { chosen: undefined })
    }
    Markup.set(question, { status: "decided", answered: true })
    this.placeQuestion(question)
    this.stamp(question)
    this.markUpdate(question)
    return question.id
  }

  /**
   * Mark option `letter` (`A`, `B` ...) of `item` as the one chosen:  `<epic-choices chosen="B">`, on its own card set
   * or (`choices`) the one at that position (`PlanItem.choiceSet()`, I8);  returns that set.
   * - throws when the set has no option with that letter;  never one in its Original Discussion (that's history)
   */
  chooseOption(item: Element, letter: string, choices?: number): Element {
    const want = String(letter).trim().toUpperCase()
    const set = PlanItem.choiceSet(item, choices)
    if (!set || !PlanItem.optionsIn(set).some((option) => option.letter === want))
      throw new PlanDocError(`${item.id.toUpperCase()} has no option ${want}${cardSetWords(choices)}`)
    Markup.set(set, { chosen: want })
    return set
  }

  /**
   * `item`'s options:  `[{ letter, title, recommended }]`;
   * its own card set's, or (`choices`) the one at that position (`PlanItem.choiceSet()`, I8).
   */
  optionCards(item: Element, choices?: number): OptionCard[] {
    return PlanItem.optionsIn(PlanItem.choiceSet(item, choices)).map(({ letter, title, recommended }) => ({
      letter,
      title,
      recommended
    }))
  }

  /**
   * Put question `item` where it belongs in its section:  an open one after the open questions on top;
   * an answered (or dropped) one among the answered, in id order.
   */
  placeQuestion(item: Element): void {
    const section = item.parentElement!
    if (item.getAttribute("status") === "open") {
      const last = this.openQuestions(section)
        .filter((other) => other !== item)
        .at(-1)
      if (last) last.after(item)
      else section.prepend(item)
      return
    }
    const n = PlanItem.idNumber(item.id)
    const later = Array.from(section.children).find(
      (other) =>
        other !== item &&
        QUESTION_ID.test(other.id) &&
        other.getAttribute("status") !== "open" &&
        PlanItem.idNumber(other.id) > n
    )
    if (later) later.before(item)
    else section.append(item)
  }

  /** The open questions at the top of `section`, in order. */
  openQuestions(section: Element): Element[] {
    const run: Element[] = []
    for (const item of section.children) {
      if (!QUESTION_ID.test(item.id) || item.getAttribute("status") !== "open") break
      run.push(item)
    }
    return run
  }

  /**
   * Set item `id` open, done or canceled;  closed items stay (`canceled` ones struck through).  Returns its title.
   * - "open" means the kind's live status:  a reopened answered question is `decided` again, an unanswered one `open`
   * - a question moves to its place (`placeQuestion()`);  stamped (`stamp()`)
   * - throws on any other status, or an id the doc doesn't have
   */
  setItem(id: string, status: string): string {
    if (!(ITEM_STATUSES as readonly string[]).includes(status))
      throw new PlanDocError(`item status must be ${ITEM_STATUSES.join(" / ")}`)
    const item = this.item(id)
    const question = QUESTION_ID.test(item.id)
    let live: "open" | "decided" =
      Object.values(KINDS).find((spec) => new RegExp(`^${spec.prefix}\\d+$`).test(item.id))?.live ?? "open"
    if (question) live = item.hasAttribute("answered") ? "decided" : "open"
    Markup.set(item, { status: status === "open" ? live : (status as "done" | "canceled") })
    if (question) this.placeQuestion(item)
    this.stamp(item)
    this.markUpdate(item)
    return PlanItem.titleOf(item)
  }

  /**
   * Stamp `item` as changed now:  `changed` (ISO local time, with offset), which `updateStates()` compares with the
   * page's `recent-since`;  during a `/bedtime` run also `bedtime`, until it's reviewed.
   * - `at`:  when, if not now (`review()`'s backfilled date);  `bedtime`:  `false` for a change Owen made
   */
  stamp(item: Element, { at = this.now, bedtime = this.bedtime }: { at?: Date; bedtime?: boolean } = {}): void {
    Markup.set<"epic-item">(item, { changed: PlanTime.isoTime(at), ...(bedtime && { bedtime: true }) })
  }

  /**
   * While a phase is active, flag `item` as changed in it (once):  an `<epic-update phase="N">` in its title, which
   * becomes a `slot="title"` child to hold it (as the converter writes one).
   */
  markUpdate(item: Element): void {
    const n = this.activePhase
    if (!n || item.querySelector(':scope > [slot="title"] > epic-update')) return
    const slot = this.titleSlot(item)
    slot.append(this.document.createTextNode(" "), this.make("epic-update", { phase: n }))
  }

  ////////////////
  // ## Review
  ////////////////

  /**
   * Mark item `id` reviewed today (`/epic review`, or any session that talked it through with Owen);
   * returns its title.
   * - `reviewed="YYYY-MM-DD"`;  clears `deferred`:  it's been gone through now
   * - the outcome goes in the log, not on the item
   * - `date`:  when it was reviewed, if not today (`backfill`:  the day of the evidence);  the change stamp is that
   *   day too, so a backfill doesn't make old items "recent"
   * - Owen has seen it now:  `bedtime` goes
   */
  review(id: string, { date = this.today }: { date?: string } = {}): string {
    const item = this.item(id)
    Markup.set(item, { reviewed: date, deferred: undefined })
    this.stamp(item, { at: date === this.today ? this.now : PlanTime.localDay(date), bedtime: false })
    Markup.set(item, { bedtime: undefined })
    return PlanItem.titleOf(item)
  }

  /**
   * Item `id` is urgent (`calm` false) or not (`calm` true):  Owen's click on its id chip, applied (`plan-doc inbox
   * apply`);  returns what it did, for the log (`not urgent`), or `undefined` when it already was.
   * - only a judgement call or an issue:  throws for any other item, or an id the doc doesn't have
   */
  setCalm(id: string, calm: boolean): string | undefined {
    const item = this.item(id)
    if (!CALM_ID.test(item.id))
      throw new PlanDocError(`${item.id.toUpperCase()} is never urgent:  only calls and issues`)
    if (item.hasAttribute("calm") === calm) return undefined
    Markup.set(item, { calm: calm || undefined })
    this.stamp(item)
    return calm ? "not urgent" : "urgent"
  }

  /** Put item `id` off (`deferred`, today):  still outstanding, shown as such next review;  returns its title. */
  defer(id: string): string {
    const item = this.item(id)
    Markup.set(item, { deferred: this.today })
    this.stamp(item)
    return PlanItem.titleOf(item)
  }

  /**
   * Queue `work` for item `id`:  a review decided it should be done, and it isn't yet;  returns its title.
   * - `queued` (today) + `work`;  also marks it reviewed (so `bedtime` goes, as `review()`)
   * - survives sessions:  the next `/epic review` offers it first, `unqueue()` once it's started or dropped
   */
  queue(id: string, work: string): string {
    const item = this.item(id)
    Markup.set(item, { queued: this.today, work: String(work), reviewed: this.today, deferred: undefined })
    this.stamp(item, { bedtime: false })
    Markup.set(item, { bedtime: undefined })
    return PlanItem.titleOf(item)
  }

  /** Take item `id` off the queue (started, or dropped);  it stays reviewed.  Returns its title. */
  unqueue(id: string): string {
    const item = this.item(id)
    Markup.set(item, { queued: undefined, work: undefined })
    this.stamp(item)
    return PlanItem.titleOf(item)
  }

  /**
   * Does a decision (an answered question other than the item itself) link to `#id` in its current text (its
   * Original Discussion doesn't count)?
   */
  linkedFromDecision(id: string): boolean {
    return this.itemsOf("question").some(
      (decision) =>
        decision.id !== id &&
        decision.hasAttribute("answered") &&
        PlanItem.current(decision.querySelectorAll(`a[href="#${id}"]`)).length > 0
    )
  }

  /**
   * Item `item`'s current text (its Original Discussion left out) as text and as HTML (cards as prose, for a page
   * without the elements:  `ItemPicker`), its Original Discussion as text, its recommended option.
   */
  textOf(item: Element): ItemText {
    const current = PlanItem.currentText(item)
    const original = item.querySelector(":scope > epic-original")
    const prose = this.document.createElement("div")
    for (const node of Array.from(current.cloneNode(true).childNodes)) prose.append(PlanItem.asProse(node, PLAIN))
    return {
      details: PlanMarkup.squeeze(this.shownText(current)),
      detailsHtml: prose.innerHTML.trim(),
      original: original ? PlanMarkup.squeeze(original.textContent ?? "") : null,
      recommendation: PlanItem.recommendation(item)
    }
  }

  ////////////////
  // ## Review inbox
  ////////////////

  /**
   * Item `id` as the inbox shows it;  what takes notes as an item does too (`reviewPart()`):
   * an Overview sub-section (`o3`, Q14), kind `overview`;  a phase (`p3`), kind `phase`, its status;
   * the summary (`summary`), kind `summary`, its own text the title (epic `airplane` P2).
   */
  describeItem(id: string): ItemDescription | null {
    const part = this.reviewPart(id)
    if (!part) return super.describeItem(id)
    const { element, kind } = part
    const status = kind === "phase" ? (element.getAttribute("status") ?? "todo") : "open"
    const title = kind === "summary" ? summaryText(element) : PlanItem.titleOf(element)
    return { id: String(id).toUpperCase(), kind, status, title }

    /** The summary's own text:  its slotted children (Owen's kept notes, status cards) left out. */
    function summaryText(summary: Element): string {
      const own = Array.from(summary.childNodes).filter(
        (node) => !(PlanMarkup.isElement(node) && node.hasAttribute("slot"))
      )
      return PlanMarkup.squeeze(own.map((node) => node.textContent ?? "").join(""))
    }
  }

  /**
   * Apply one mark Owen SENT from the page, when it's mechanical:
   * returns `{ applied: true, did }`, or `{ applied: false, left }` (why it's left for Claude),
   * plus `gone: true` for an item the doc no longer has (the caller drops its mark).
   * - `approve`:
   *   - an open question:  answered with its recommended option (`decide()`, that option chosen), and reviewed;
   *     none recommended:  left, "needs talk"
   *   - an open judgement call:  closed (accepted);  an open test:  closed (it passed);  both reviewed
   *   - anything else (an open caveat, issue or todo;  a closed or answered item):  reviewed
   * - `pick`, from any of the item's card sets (`choices`, by position;  none, its own:  I8):  that set's option
   *   chosen;  a question answered with it (its title the answer), any other item APPROVED with it (as approve);
   *   reviewed, a Done card `Chose B · <title>` (`pickOption()`)
   * - `todo`:  a new todo, "Follow up:  <title>", linking back;  the item reviewed
   * - `next`, a todo's plane (Owen, 2026-10-09):  queued into the NEXT phase, the first still to do
   *   (`queue()`, its work `P10 · <name>`;  none:  "the next phase"), a Done card `Queued for P10 · <name>`
   * - `drop`, a todo's x:  canceled (struck through, grey), "dropped by Owen in review" in the log;  reviewed
   * - `next`, `drop` with a note:  the note kept first, as Owen's reply (`keepNote()`)
   * - `revisit` soon:  left, for Claude to talk over in the chat;  `details`, revisit `now`:  left, an agent's
   *   - a revisit carrying a `pick` ("pick B, but ..."):  left too, NOT answered:  the note may change the pick
   * - an Overview sub-section (`o3`, Q14), a phase (`p3`), the summary (`summary`, epic `airplane` P2):
   *   approve is noted, todo makes a todo;  the rest as for an item (`applyToPart()`)
   * - `new`, a new todo or question Owen asked for from the page (epic `airplane` P2):
   *   made, as `plan-doc add` makes one (`addFromPage()`)
   * - an applied mark adds ONE log line (`J9 approved:  closed (accepted)`);  the methods it calls stamp the item
   */
  applyMark(mark: PlanMark): MarkResult {
    if (mark.action === "new") return this.addFromPage(mark)
    const part = this.reviewPart(mark.id)
    if (part) {
      const result = this.applyToPart(part, mark)
      if (result.applied) this.log(`${String(mark.id).toUpperCase()} ${result.did}`)
      return result
    }
    const item = this.findItem(mark.id)
    if (!item) return { applied: false, gone: true, left: "no such item:  mark dropped" }
    const result = this.applyAction(item, mark)
    if (result.applied) {
      this.log(`${item.id.toUpperCase()} ${result.did}`)
      this.reviewedAs(item, mark.action === "pick" ? "approve" : mark.action)
    }
    return result
  }

  /**
   * Record on `item` how Owen's review mark was handled (`review-as`:  `approve`, `todo`, `revisit`, `now`), once
   * Claude applied it, talked it over or did it:  the inbox forgets the mark, the doc keeps it, and the page keeps that
   * review button SOLID after a reload (done:  epic `windows-and-review` P2, Q8;  the fill rule, Q20).
   * A pick counts as approve;  `now`:  an immediate request (Do Now) done.
   * - any other action:  nothing to record
   */
  reviewedAs(item: Element, action: string): void {
    if ((REVIEW_AS as readonly string[]).includes(action)) Markup.set(item, { reviewAs: action as ReviewAs })
  }

  /** `applyMark()`'s work on `item`, the log line aside. */
  applyAction(item: Element, { action, pick, choices, when, note, at }: PlanMark): MarkResult {
    const kind = PlanItem.kindOf(item.id)
    const open = item.getAttribute("status") === "open"
    switch (action) {
      case "approve": {
        if (kind === "question" && open) {
          const option = this.optionCards(item).find((card) => card.recommended)
          if (!option) return { applied: false, left: "needs talk:  no option is marked (recommended)" }
          this.answerWith(item, option)
          return { applied: true, did: `approved:  answered ${option.letter} · ${option.title} (recommended)` }
        }
        return { applied: true, did: `approved:  ${this.approve(item, kind, open)}` }
      }
      case "pick":
        return this.pickOption(item, kind, open, pick, choices)
      case "todo": {
        const from = { label: item.id.toUpperCase(), link: item.id, what: kind, title: PlanItem.titleOf(item) }
        const todo = this.followUp(from, note)
        this.review(item.id)
        this.addStatus(item.id, filedTodo(todo), { done: true })
        return { applied: true, did: `to todo ${todo.toUpperCase()}` }
      }
      case "next": {
        const phase = this.phases.find((each) => each.status === "todo")
        const where = phase ? `P${phase.n} · ${phase.name}` : "the next phase"
        if (note) this.keepNote(item.id, { note, action: "next phase", at })
        this.queue(item.id, where)
        const card = phase ? `Queued for ${where}` : `Queued for the next phase:  there's no phase to do yet`
        this.addStatus(item.id, PlanMarkup.text(card), { done: true })
        return { applied: true, did: `queued for ${where}${phase ? "" : " (no phase to do yet)"}` }
      }
      case "drop": {
        if (note) this.keepNote(item.id, { note, action: "drop", at })
        this.setItem(item.id, "canceled")
        this.review(item.id)
        return { applied: true, did: "canceled:  dropped by Owen in review" }
      }
      default:
        return this.leftForClaude({ action, pick, when, note }, () =>
          this.optionCards(item, choices).find((card) => card.letter === pick)
        )
    }
  }

  /**
   * Answer question `item` with option `option` (`optionCards()`'s):  `decide()`, the option chosen (in card set
   * `choices`, by position:  none, the question's own);  reviewed.
   */
  answerWith(item: Element, option: OptionCard, choices?: number): void {
    this.decide(item.id, option.title, { option: option.letter, choices })
    this.review(item.id)
  }

  /**
   * Approve `item` (of `kind`, `open` or not) as it stands;  returns what it did, for the log line.
   * - an open judgement call:  closed (accepted);  an open test:  closed (it passed);  both reviewed
   * - anything else (an open caveat, issue or todo;  a closed item):  reviewed
   */
  private approve(item: Element, kind: string, open: boolean): string {
    if (open && (kind === "judgement" || kind === "test")) {
      this.setItem(item.id, "done")
      this.review(item.id)
      return `closed (${kind === "test" ? "passed" : "accepted"})`
    }
    this.review(item.id)
    return "reviewed"
  }

  /**
   * A pick (a Choose pill, I8):  option `pick` of `item`'s card set at position `choices`
   * (none:  its own) is the chosen one, `<epic-choices chosen>`, wherever the set sits:
   * its text, a reply, More Details.
   * - a question:  answered with it (`answerWith()`)
   * - any other kind:  APPROVED with it (`approve()`:  an open judgement call closed, accepted;  reviewed)
   * - either way, a Done status card, `Chose B · <title>` (Q19), and the option in the log line
   * - left for Claude when the item has no such set, or the set no such option
   */
  private pickOption(
    item: Element,
    kind: string,
    open: boolean,
    pick: string | undefined,
    choices: number | undefined
  ): MarkResult {
    const set = PlanItem.choiceSet(item, choices)
    if (!set) return { applied: false, left: `no option cards${cardSetWords(choices)}:  can't pick ${pick}` }
    const option = PlanItem.optionsIn(set).find((card) => card.letter === pick)
    if (!option) return { applied: false, left: `no option ${pick}${cardSetWords(choices)}` }
    const where = set.closest(REPLY_TAG) ? " (a reply's options)" : set.closest(MORE_TAG) ? " (More Details')" : ""
    const picked = `picked ${option.letter}:  ${option.title}${where}`
    let did: string
    if (kind === "question") {
      this.answerWith(item, option, choices)
      did = picked
    } else {
      this.chooseOption(item, option.letter, choices)
      did = `${picked};  approved:  ${this.approve(item, kind, open)}`
    }
    this.addStatus(item.id, `Chose ${option.letter} · ${PlanMarkup.text(option.title)}`, { done: true })
    return { applied: true, did }
  }

  /**
   * Replace item `id`'s details with `html`, or (`append`) add `html` to them;  returns its title.
   * - for Claude's background agents during `/epic review`:  fuller details (Add Details), or a reply to Owen's
   *   revisit note (an `<epic-reply>`, appended)
   * - its answer, Original Discussion and commits stay;  everything goes where the item's content model lists it:
   *   appended prose at the end of its text (before its Choices and answer), a reply after the other replies
   * - replacing NEVER drops the text it replaces (Owen, 2026-10-04):  its text and cards (Choices, More Details,
   *   replies) move into the item's Original Discussion (`keepOriginal()`);  appending moves nothing
   * - replacing an ANSWERED question's text:
   *   the option chosen before stays chosen when the new options still have its letter
   * - old shapes in `html` (an option grid, a `div.plan-reply`, a Net effect paragraph, a code accordion ...) become
   *   elements (`IncomingHtml`)
   * - a question's new text:  its lead, the question as now asked, in an `<epic-question>` (P14);
   *   the one it replaces goes into the Original Discussion with the rest of the old text
   * - stamped (`changed`) and flagged UPDATE
   */
  setDetails(id: string, html: string, { append = false }: { append?: boolean } = {}): string {
    const item = this.item(id)
    const nodes = this.incoming(html, { question: !append && QUESTION_ID.test(item.id) })
    if (!append) {
      const answered = item.querySelector(":scope > epic-answer")
      const chosen = answered ? PlanItem.choicesOf(item)?.getAttribute("chosen") : null
      const replaced = Array.from(item.childNodes).filter((node) => !isKept(node))
      for (const node of replaced) node.remove()
      this.keepOriginal(item, replaced)
      for (const node of nodes) Markup.place(item, node)
      if (chosen && PlanItem.optionsOf(item).some((option) => option.letter === chosen)) this.chooseOption(item, chosen)
    } else for (const node of nodes) Markup.place(item, node)
    this.stamp(item)
    this.markUpdate(item)
    return PlanItem.titleOf(item)

    /** What a rewrite leaves:  slotted children (the title, status cards), the answer, Original Discussion, commits. */
    function isKept(node: Node): boolean {
      return PlanMarkup.isElement(node) && (node.hasAttribute("slot") || KEPT_ON_REWRITE.includes(node.localName))
    }
  }

  /**
   * Add Details (`details --more`):  item `id`'s text stays on top (the element labels it "Original reply"), and
   * `html` goes under it in an `<epic-more>` card;  returns its title.
   * - a second Add Details replaces the card:  the old card's text moves into the Original Discussion
   *   (`keepOriginal()`), as a rewrite's does
   * - stamped (`changed`) and flagged UPDATE
   */
  addMore(id: string, html: string): string {
    const item = this.item(id)
    const old = item.querySelector(":scope > epic-more")
    if (old) {
      old.remove()
      this.keepOriginal(item, Array.from(old.childNodes))
    }
    Markup.place(item, this.make("epic-more", {}, this.incoming(html)))
    this.stamp(item)
    this.markUpdate(item)
    return PlanItem.titleOf(item)
  }

  /**
   * Keep Owen's note -- `mark.note`, a mark Claude took and is clearing (`inbox done | clear`) -- in item `id`, as his
   * own reply:  `<epic-reply from="Owen" at="2026-10-06 10:42" re="revisit soon"><p>note</p></epic-reply>`.
   * - placed before the first reply dated at or after the note (Claude's answer to it), else after the replies
   * - a reply from Owen with the same time and note already there:  nothing (`done` after `clear`, a retry)
   * - an Overview sub-section's (Q14):  the same words as a paragraph at its end (a section holds prose only)
   * - a phase's (epic `airplane` P2):  the same reply, in the phase, under its Updated lines (its content model);
   *   the summary's:  under the summary, `<epic-reply slot="notes">`
   * - an item is stamped (`changed`);  no UPDATE flag:  nothing about the item changed but the record
   */
  keepNote(id: string, { note, action, when, at }: KeptNote): void {
    const stamp = PlanTime.clockTime(at ? new Date(at) : this.now)
    const how = action === "revisit" ? `revisit ${when === "now" ? "now" : "soon"}` : action
    const part = this.overviewPart(id)
    if (part) return this.keepNoteInPart(part, { note, stamp, how })
    const host = this.reviewPart(id)?.element ?? this.item(id)
    const replies = Array.from(host.querySelectorAll(":scope > epic-reply"))
    if (replies.some(isSame)) return
    const reply = this.make("epic-reply", { from: "Owen", at: stamp, re: how }, `<p>${PlanMarkup.text(note)}</p>`)
    if (host.localName === "epic-summary") reply.setAttribute("slot", NOTES_SLOT)
    const next = replies.find((each) => (each.getAttribute("at") ?? "") >= stamp)
    if (next) next.before(reply)
    else Markup.place(host, reply)
    if (host.localName === "epic-item") this.stamp(host)

    /** Is `reply` this note's already:  Owen's, at the same time, saying the same? */
    function isSame(reply: Element): boolean {
      return (
        reply.getAttribute("from") === "Owen" &&
        reply.getAttribute("at") === stamp &&
        reply.querySelector(":scope > p")?.textContent === note
      )
    }
  }

  /**
   * Keep `nodes` -- item `item`'s text being replaced, already out of the doc --
   * in its Original Discussion (`<epic-original>`), made when it has none.
   * Returns `"added"`, `"unchanged"` (a version saying the same is there)
   * or `"empty"` (nothing but whitespace:  no version).
   * - a new `<epic-version>`:  undated while it's the first (as first written);
   *   else `as-of` (default now, `YYYY-MM-DD HH:MM`), in date order
   * - a version holds prose only:  cards become the prose they say (`PlanItem.asProse()`);
   *   ids inside are renamed (`PlanItem.stripIds()`)
   */
  keepOriginal(item: Element, nodes: Node[], { asOf }: OriginalOptions = {}): OriginalResult {
    if (!nodes.some((node) => node.nodeType === 1 || node.textContent?.trim())) return "empty"
    let original = item.querySelector(":scope > epic-original")
    const versions = Array.from(original?.querySelectorAll(":scope > epic-version") ?? [])
    const when = asOf ?? PlanTime.clockTime(this.now)
    const dated = versions.length > 0 || asOf !== undefined
    const version = this.make("epic-version", { asOf: dated ? when : undefined })
    version.append(...nodes.map((node) => PlanItem.asProse(node)))
    PlanMarkup.trimWhitespace(version)
    PlanItem.stripIds(version)
    if (versions.some((other) => PlanMarkup.bare(other.innerHTML) === PlanMarkup.bare(version.innerHTML)))
      return "unchanged"
    if (!original) {
      original = this.make("epic-original", {})
      Markup.place(item, original)
    }
    // oldest first:  the undated first version never sorts after a date
    const later = versions.find((other) => (other.getAttribute("as-of") ?? "") > when)
    if (later) later.before(version)
    else original.append(version)
    return "added"
  }

  /**
   * Put `html` -- item `id`'s earlier text, e.g. recovered from git -- into its Original Discussion, as
   * `keepOriginal()` keeps replaced text;  returns `"added"`, `"unchanged"` or `"empty"`.
   * - `asOf`:  when that text was replaced, `YYYY-MM-DD HH:MM`;  none:  as first written while the item has no
   *   Original Discussion, else now
   * - left out of `html`:  commits (the item keeps its own), and an answer that says what the item's says
   * - an Original Discussion inside `html` (`<epic-original>`, or the old markup's `.plan-original`, since text from
   *   git is in it):  each of its versions kept on its own, with its date
   * - NOT stamped or flagged UPDATE:  restoring history doesn't make an item recent
   */
  restoreOriginal(id: string, html: string, { asOf }: OriginalOptions = {}): OriginalResult {
    const item = this.item(id)
    const box = this.fragment(html)
    const answer = item.querySelector(":scope > epic-answer")
    let result: OriginalResult = "empty"
    for (const nested of Array.from(box.querySelectorAll("epic-original, .plan-original"))) {
      nested.remove()
      for (const version of nested.querySelectorAll("epic-version, .plan-version")) {
        version.querySelector(":scope > h5")?.remove()
        const when = version.getAttribute("as-of") ?? version.getAttribute("data-as-of") ?? undefined
        result = merge(result, this.keepOriginal(item, Array.from(version.childNodes), { asOf: when }))
      }
    }
    const shown = answer && PlanMarkup.bare(this.shownText(PlanItem.asProse(answer.cloneNode(true)) as Element))
    for (const node of Array.from(box.children)) {
      const sameAnswer =
        node.matches("epic-answer, .plan-answer-block") &&
        shown === PlanMarkup.bare(this.shownText(PlanItem.asProse(node) as Element))
      if (node.matches("epic-commit, .plan-commits") || sameAnswer) node.remove()
    }
    return merge(result, this.keepOriginal(item, Array.from(box.childNodes), { asOf }))

    /** The stronger of two results:  added, else unchanged, else empty. */
    function merge(a: OriginalResult, b: OriginalResult): OriginalResult {
      return [a, b].includes("added") ? "added" : [a, b].includes("unchanged") ? "unchanged" : "empty"
    }
  }

  ////////////////
  // ## Status cards
  ////////////////

  /**
   * Claude took Owen's mark on item `id` (or an Overview sub-section, `o3`;  a phase, `p3`;  the summary):  a new status card saying what it took
   * the task to be (`reading`, HTML);  returns its title (P13).
   * - `<epic-status slot="status" state="underway" at="2026-10-08 14:20"><p>reading</p></epic-status>`, after its
   *   other status cards:  a later mark adds a new card, the old ones stay
   * - `done`:  a card born done (`state="done"`, `at` alone):  a pick or a todo `inbox apply` filed (Q19)
   * - `reading`:  inline HTML (wrapped in a `<p>`) or blocks (`<p>`, `<ul>` ...);
   *   plain text goes as it is (`&lt;` for a `<`)
   * - slotted, so never ordered (`Markup.place()`):  appended;  drawn under Owen's marked note, above the note box
   * - an item is stamped (`changed`), not flagged UPDATE:  a record of a mark, not a change to the item
   * - throws for an id the doc doesn't have, or a reading with no text
   */
  addStatus(id: string, reading: string, { done = false }: { done?: boolean } = {}): string {
    const host = this.statusHost(id)
    const blocks = this.statusBlocks(reading)
    if (!blocks.length) throw new PlanDocError(`${id.toUpperCase()}:  a status card needs a reading`)
    const at = PlanTime.clockTime(this.now)
    const card = this.make("epic-status", { state: done ? "done" : "underway", at }, blocks)
    card.setAttribute("slot", STATUS_SLOT)
    Markup.place(host, card)
    if (host.localName === "epic-item") this.stamp(host)
    return PlanItem.titleOf(host)
  }

  /**
   * Item `id`'s work is done (or an Overview sub-section's):  its LATEST underway status card turns done, stamped
   * `done-at`, its reading kept;  `summary` (HTML, as `addStatus()`'s reading) goes under it, `slot="summary"`, when
   * there's something worth saying.  Returns its title.
   * - throws when it has no underway card:  `addStatus()` first, or `{ done: true }` for a card born done
   */
  finishStatus(id: string, summary?: string): string {
    const host = this.statusHost(id)
    const card = Array.from(host.querySelectorAll(UNDERWAY_CARD)).at(-1)
    if (!card)
      throw new PlanDocError(
        `${id.toUpperCase()} has no underway status card:  \`status <name> ${id} underway "<reading>"\` first ` +
          `(or \`done --filed "<what was filed>"\` for a card born done)`
      )
    Markup.set<"epic-status">(card, { state: "done", doneAt: PlanTime.clockTime(this.now) })
    for (const block of this.statusBlocks(summary ?? "")) {
      block.setAttribute("slot", SUMMARY_SLOT)
      card.append(block)
    }
    if (host.localName === "epic-item") this.stamp(host)
    return PlanItem.titleOf(host)
  }

  /**
   * What takes status cards:  the Overview sub-section, phase or summary `id` names (`reviewPart()`), else its item;
   * throws when there's neither.
   */
  private statusHost(id: string): Element {
    return this.reviewPart(id)?.element ?? this.item(id)
  }

  /**
   * `html` (a status card's reading or summary) as block elements of this doc:  blocks (`<p>`, `<ul>` ...) as they
   * are, each run of inline content between them in a `<p>`.  None for blank `html`.
   */
  private statusBlocks(html: string): Element[] {
    const blocks: Element[] = []
    let paragraph: Element | undefined
    for (const node of this.incoming(html)) {
      if (PlanMarkup.isElement(node) && STATUS_BLOCKS.test(node.localName)) {
        blocks.push(node)
        paragraph = undefined
      } else if (!PlanMarkup.isBlank(node) || paragraph) {
        if (!paragraph) blocks.push((paragraph = this.document.createElement("p")))
        paragraph.append(node)
      }
    }
    for (const block of blocks) PlanMarkup.trimWhitespace(block)
    return blocks
  }

  ////////////////
  // ## States
  ////////////////

  /**
   * The whole-doc pass every edit ends with (the command line's `edit()`):  one item's change can change others'
   * standing, so everything is worked out again;  returns how many things it changed.
   * - the page's `recent-since`:  from `recentSince` when it was passed in
   * - each item's `state` (`itemState()`):  what the page colours its id chip by
   * - each phase's "To review" field (`updateToReview()`)
   * - the Phases section's Plan changes (`updatePlanChanges()`)
   */
  updateStates(): number {
    let changed = 0
    const page = this.page
    if (this.recentSince !== undefined) {
      const before = page.getAttribute("recent-since")
      Markup.set(page, { recentSince: this.recentSince ?? undefined })
      if (before !== page.getAttribute("recent-since")) changed++
    }
    for (const item of this.allItems) {
      const state = this.itemState(item)
      if (item.getAttribute("state") === state) continue
      Markup.set<"epic-item">(item, { state })
      changed++
    }
    for (const phase of this.phaseElements) if (this.updateToReview(phase)) changed++
    if (this.updatePlanChanges()) changed++
    return changed
  }

  /**
   * Phase `phase`'s "To review" field (`<epic-field name="to-review">`), last:  the items added while it was active
   * (`phase="N"`) still open and not reviewed, not under way, in page order, as links;  none:  no field.  Changed?
   */
  updateToReview(phase: Element): boolean {
    const n = PlanItem.idNumber(phase.id)
    const old = phase.querySelector(':scope > epic-field[name="to-review"]')
    const items = this.allItems.filter((item) => {
      const facts = this.facts(item)
      if (facts.phase !== n || CLOSED.has(facts.status) || OLD_DECISION.test(facts.id)) return false
      return facts.reviewed === undefined && facts.queued === undefined && !facts.working && !facts.underway
    })
    if (!items.length) {
      old?.remove()
      return Boolean(old)
    }
    const html = items.map((item) => `<a href="#${item.id}">${item.id.toUpperCase()}</a>`).join(", ")
    // as oxfmt left it:  only the whitespace may differ
    if (old && PlanMarkup.squeeze(old.innerHTML) === PlanMarkup.squeeze(html)) return false
    this.setField(phase, "to-review", html)
    return true
  }

  ////////////////
  // ## Commits
  ////////////////

  /**
   * List commit `sha` (full) under phase `phase` or item `item` (an id), with `sentence`:
   * an `<epic-commit sha>`, oldest first;  replaces the one already there for it.  Returns `"added"` or `"replaced"`.
   * - `base`:  the repo's GitHub page:  the page's `repo`, through which every commit links (`null`:  left as is)
   * - a phase's go after its Done (else Goal), before Files;  an item's at the end
   */
  addCommit(
    { phase, item }: CommitTarget,
    sha: string,
    sentence: string,
    { base = null }: CommitOptions = {}
  ): "added" | "replaced" {
    const host = phase !== undefined ? this.phase(phase) : this.item(item!)
    if (base && this.page.getAttribute("repo") !== base) Markup.set(this.page, { repo: base })
    const entry = this.make("epic-commit", { sha }, PlanMarkup.text(sentence))
    const old = PlanCommits.findCommit(host, sha)
    if (old) {
      old.replaceWith(entry)
      return "replaced"
    }
    Markup.place(host, entry)
    return "added"
  }

  /** Is commit `sha` listed under phase `phase` / item `item` already? */
  hasCommit({ phase, item }: CommitTarget, sha: string): boolean {
    return Boolean(PlanCommits.findCommit(phase !== undefined ? this.phase(phase) : this.item(item!), sha))
  }

  /**
   * Fill in commits from the doc's git history:  `log` is `{ sha, subject }`s, newest first (`git log`);
   * returns what it added, `{ sha, phase }` / `{ sha, item }`, oldest first.
   * - subjects `PlanCommits.parseCommitSubject()` reads:
   *   phase commits (`P3:  Name -- summary`) and item fixes (`Fix I3:  ...`)
   * - only phases and items the doc has;  a commit already listed there is skipped, so it can run again
   */
  backfillCommits(log: Iterable<CommitLogEntry>, { base = null }: CommitOptions = {}): BackfilledCommit[] {
    const added: BackfilledCommit[] = []
    for (const { sha, subject } of Array.from(log).reverse()) {
      const parsed = PlanCommits.parseCommitSubject(subject)
      if (!parsed) continue
      const targets: CommitTarget[] = [
        ...parsed.phases.filter((n) => this.phases.some((phase) => phase.n === n)).map((n) => ({ phase: n })),
        ...parsed.items.filter((id) => this.hasItem(id)).map((id) => ({ item: id }))
      ]
      for (const target of targets) {
        if (this.hasCommit(target, sha)) continue
        this.addCommit(target, sha, parsed.sentence, { base })
        added.push({ sha, ...target })
      }
    }
    return added
  }

  ////////////////
  // ## Log
  ////////////////

  /** Add a line to the log:  an `<epic-event at>`, local time with its offset (`2026-10-06T08:12-04:00`). */
  log(line: string): void {
    this.section("log").append(this.make("epic-event", { at: PlanTime.isoMinutes(this.now) }, PlanMarkup.text(line)))
  }

  ////////////////
  // ## Future epics
  ////////////////

  /**
   * Make this new doc a future epic (`/epic future <name>`, epic `epic-future`):
   * `<epic-page future>`, no branch or worktree yet.  The element draws its notice and its FUTURE label.
   */
  makeFuture(): void {
    Markup.set(this.page, { future: true, branch: undefined, worktree: undefined })
  }

  /**
   * A future epic, planned at last (`/epic <name>` reusing it):  an ordinary epic, on `branch` in `worktree`.
   * Returns whether it was a future one.
   */
  promote({ branch, worktree }: { branch: string | null; worktree: string | null }): boolean {
    if (!this.future) return false
    Markup.set(this.page, { future: false })
    this.setMeta({ branch, worktree })
    this.log("planned:  no longer a future epic")
    return true
  }

  /** The page's branch and worktree (`null`:  none yet, a future epic). */
  setMeta({ branch, worktree }: { branch: string | null; worktree: string | null }): void {
    Markup.set(this.page, { branch: branch ?? undefined, worktree: worktree ?? undefined })
  }

  ////////////////
  // ## Bedtime
  ////////////////

  /** A `/bedtime` run starts:  bedtime mode on, `phases` (`P3-P6`) what it runs. */
  startBedtime(phases: string): void {
    Markup.set(this.page, { bedtime: phases })
  }

  /** The run is over:  bedtime mode off;  was it on? */
  finishBedtime(): boolean {
    const was = this.bedtime
    Markup.set(this.page, { bedtime: undefined })
    return was
  }

  /**
   * Remove an older doc's `#overnight` section;  was there one?
   * - `/bedtime` wrote a report section on top of the doc until 2026-10-05 (D5 of `review-review`);
   *   the converter keeps one it finds, outside `<epic-page>`,
   *   until Owen has read it and runs `overnight <name> remove`
   */
  removeOvernight(): boolean {
    const section = this.document.getElementById("overnight")
    section?.remove()
    return Boolean(section)
  }

  ////////////////
  // ## Prompt
  ////////////////

  /**
   * Set the prompt that started the plan:  `<epic-prompt>` in the Overview (drawn folded, "Kickoff prompt", P14),
   * after its summary, one `<p>` per paragraph (blank lines split them, single newlines become `<br>`).
   * Replaces any earlier one, an older doc's `<blockquote slot="prompt">` too;  `""` removes it.
   */
  setPrompt(prompt: string | null | undefined): void {
    const overview = this.overview
    const old = overview.querySelector(`:scope > epic-prompt, :scope > [slot="prompt"]`)
    const html = promptHTML(prompt)
    if (!html) {
      old?.remove()
      return
    }
    const made = this.make("epic-prompt", {}, html)
    if (old) old.replaceWith(made)
    else Markup.place(overview, made)
  }

  ////////////////
  // ## Checking
  ////////////////

  /**
   * Structural problems, as text:  duplicate ids, `#id` links to nowhere (a link in an Original Discussion is
   * history:  skipped), phases without a valid status, and what `Markup.validate()` finds.
   */
  check(): string[] {
    const problems: string[] = []
    const seen = new Map<string, number>()
    for (const el of this.document.querySelectorAll("[id]")) seen.set(el.id, (seen.get(el.id) ?? 0) + 1)
    for (const [id, count] of seen) if (count > 1) problems.push(`id "${id}" used ${count} times`)
    for (const a of PlanItem.current(this.document.querySelectorAll('a[href^="#"]'))) {
      const id = a.getAttribute("href")!.slice(1)
      if (id && !seen.has(id)) problems.push(`link to missing #${id} ("${(a.textContent ?? "").trim()}")`)
    }
    for (const phase of this.phases)
      if (!isPhaseStatus(phase.status)) problems.push(`P${phase.n} has status "${phase.status}"`)
    for (const problem of Markup.validate(this.document)) {
      // duplicate ids are counted above, once each
      if (problem.kind !== "duplicate id") problems.push(`${problem.kind}:  ${problem.where} ${problem.message}`)
    }
    return problems
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** A new `<tag>` of the doc, through `Markup.element()`:  the definitions check its data. */
  make<T extends EpicTag>(tag: T, data: EpicData<T>, children?: MarkupContent): Element {
    return Markup.element(this.document, tag, data, children)
  }

  /**
   * Set `phase`'s field `name` (`<epic-field name>`) to `html`:  replaces its children, or a new field in its place;
   * `""` removes it.
   */
  private setField(phase: Element, name: EpicData<"epic-field">["name"], html: string): void {
    const old = phase.querySelector(`:scope > epic-field[name="${name}"]`)
    if (html === "") {
      old?.remove()
      return
    }
    if (old) {
      old.replaceChildren()
      Markup.append(old, this.incoming(html))
      return
    }
    Markup.place(phase, this.make("epic-field", { name }, this.incoming(html)))
  }

  /**
   * `html` (a command's) as nodes of this doc, old shapes turned into elements (`IncomingHtml`).
   * - `question`:  it's a question's text:  its lead, the question as asked, goes in an `<epic-question>`
   */
  private incoming(html: string | undefined, { question = false }: { question?: boolean } = {}): Node[] {
    if (!html?.trim()) return []
    const nodes = IncomingHtml.nodes(this.document, html)
    return question ? IncomingHtml.asQuestion(this.document, nodes) : nodes
  }

  /** `html` parsed into a `<div>` of this doc, out of it. */
  private fragment(html: string): Element {
    const box = this.document.createElement("div")
    box.innerHTML = html
    return box
  }

  /**
   * A title given as HTML:
   * `{ title }` when it's plain text (entities decoded), else `{ slot }`, a `<span slot="title">` holding it.
   */
  private titleFromHTML(html: string): { title?: string; slot?: Element } {
    const box = this.fragment(html)
    if (!box.children.length) return { title: PlanMarkup.squeeze(box.textContent ?? "") }
    const slot = this.document.createElement("span")
    slot.setAttribute("slot", "title")
    slot.append(...Array.from(box.childNodes))
    return { slot }
  }

  /** `element`'s `slot="title"` child:  made from its `title` (which goes) when it has none. */
  private titleSlot(element: Element): Element {
    const found = element.querySelector(':scope > [slot="title"]')
    if (found) return found
    const slot = this.document.createElement("span")
    slot.setAttribute("slot", "title")
    slot.textContent = element.getAttribute("title") ?? ""
    element.removeAttribute("title")
    element.prepend(slot)
    return slot
  }

  /** A title slot holding plain text only, back into its parent's `title`. */
  private untitleSlot(slot: Element): void {
    const host = slot.parentElement!
    host.setAttribute("title", PlanMarkup.squeeze(slot.textContent ?? ""))
    slot.remove()
    Markup.set(host, {})
  }

  /**
   * `element`'s text as a reader sees it:  its own text, the headings its elements draw too (a card's, a Net effect's
   * label ...:  `PlanItem.asProse()`, plain).
   */
  private shownText(element: Element): string {
    const copy = element.cloneNode(true) as Element
    const prose = this.document.createElement("div")
    for (const node of Array.from(copy.childNodes)) prose.append(PlanItem.asProse(node, PLAIN))
    return prose.textContent ?? ""
  }

  /** The Overview sub-section `id` names (`o3`, any case), or `null`. */
  private overviewPart(id: string): Element | null {
    const key = String(id).toLowerCase()
    if (!OVERVIEW_PART_ID.test(key)) return null
    const part = this.document.getElementById(key)
    return part?.localName === "epic-section" && part.getAttribute("kind") === "overview-part" ? part : null
  }

  /**
   * What takes review notes as an item does, but isn't one, by its inbox id:  an Overview sub-section (`o3`, Q14), a
   * phase (`p3`) or the summary (`summary`:  it has no id of its own;  epic `airplane` P2);  `null` for anything else.
   * - with how a todo or a note names it:  `label` (`P3`, `the summary`), `what` it is in words, `title`,
   *   and `link` (its `#id`;  the summary's is the Overview's)
   */
  private reviewPart(id: string): ReviewPart | null {
    const key = String(id).toLowerCase()
    const part = this.overviewPart(key)
    if (part) {
      const title = PlanItem.titleOf(part)
      return {
        id: key,
        element: part,
        kind: "overview",
        label: key.toUpperCase(),
        link: key,
        what: "overview section",
        title
      }
    }
    if (key === SUMMARY_ID) {
      const summary = this.document.querySelector("epic-page > epic-overview > epic-summary")
      if (!summary) return null
      const label = "the summary"
      return { id: key, element: summary, kind: "summary", label, link: OVERVIEW_ID, what: "Overview", title: label }
    }
    const phase = PHASE_ID.test(key) ? this.document.getElementById(key) : null
    if (phase?.localName !== "epic-phase") return null
    const label = key.toUpperCase()
    const title = `${label} · ${PlanItem.titleOf(phase)}`
    return { id: key, element: phase, kind: "phase", label, link: key, what: "phase", title }
  }

  /**
   * A mark on what takes notes but isn't an item
   * (`reviewPart()`:  an Overview sub-section, Q14;  a phase or the summary, epic `airplane` P2):
   * - approve is noted (none of them has review marks:  the log says it)
   * - todo makes a todo linking back, and a Done status card on it
   * - pick isn't for them
   * - revisit and details are Claude's, as for an item
   */
  private applyToPart(part: ReviewPart, { action, pick, when, note }: PlanMark): MarkResult {
    switch (action) {
      case "approve":
        return { applied: true, did: "approved" }
      case "todo": {
        const todo = this.followUp(part, note)
        this.addStatus(part.id, filedTodo(todo), { done: true })
        return { applied: true, did: `to todo ${todo.toUpperCase()}` }
      }
      case "pick":
        return { applied: false, left: `${part.label} (${part.what}):  can't pick ${pick}` }
      default:
        return this.leftForClaude({ action, pick, when, note }, () => undefined)
    }
  }

  /**
   * A new todo, "Follow up:  <title>", linking back to what it's from (`from`:  its label, link and what it is),
   * Owen's note in his words;  its id.
   */
  private followUp(from: Pick<ReviewPart, "label" | "link" | "what" | "title">, note: string | undefined): string {
    // Owen's note (Make Todo's box, epic `windows-and-review` P2) goes in as his words
    const said = note ? `<p><b>Owen:</b>  ${PlanMarkup.text(note)}</p>` : ""
    const link = `<a href="#${from.link}">${PlanMarkup.text(from.label)}</a>`
    const details = `<p>From ${link} (${from.what}), marked "Make Todo" on the page:  ${PlanMarkup.text(from.title)}</p>${said}`
    return this.addItem("todo", `Follow up:  ${from.title}`, { details })
  }

  /**
   * A new todo or question Owen asked for from the page (`{ action: "new", kind, title, note?, near? }`, epic
   * `airplane` P2), made as `plan-doc add` makes one (`addItem()`):  his note its details, a line linking what it's
   * about (`near`), and a Done status card saying where it came from;  one log line.
   * - a mark with no kind or title (a hand edit):  dropped (`gone`), nothing made
   */
  private addFromPage({ id: key, kind, title, note, near, at }: PlanMark): MarkResult {
    if (!kind || !title) return { applied: false, gone: true, left: "a new item with no kind or title:  dropped" }
    const about = near ? `<p>About ${this.aboutLink(near)}.</p>` : ""
    const details = `${promptHTML(note)}${about}`
    const id = this.addItem(kind, title, { details: details || undefined })
    const written = at ? `, written ${PlanTime.clockTime(new Date(at))}` : ""
    this.addStatus(id, `Made from the page:  Owen's new ${kind}${written}.`, { done: true })
    this.log(`${id.toUpperCase()} made from the page:  Owen's new ${kind} (${String(key).toUpperCase()})`)
    return { applied: true, did: `made ${kind} ${id.toUpperCase()}:  ${title}` }
  }

  /** A link to `id` (an item, a phase, an Overview sub-section, `summary`) as HTML;  its id alone when it's gone. */
  private aboutLink(id: string): string {
    const part = this.reviewPart(id)
    const item = part ? null : this.findItem(id)
    if (!part && !item) return PlanMarkup.text(id.toUpperCase())
    const link = part?.link ?? item!.id
    return `<a href="#${link}">${PlanMarkup.text(part?.label ?? item!.id.toUpperCase())}</a>`
  }

  /** What's left for Claude:  revisits (with or without a pick), Add Details, and actions there are none of. */
  private leftForClaude(
    { action, pick, when, note }: Omit<PlanMark, "id">,
    optionFor: () => OptionCard | undefined
  ): MarkResult & { applied: false } {
    switch (action) {
      case "revisit": {
        if (when === "now") return { applied: false, left: "revisit now:  an agent's (`inbox done` once answered)" }
        if (!pick) return { applied: false, left: `to talk over${note ? `:  "${note}"` : ""}` }
        // "pick B, but ...":  never applied, the remark may change the pick
        return { applied: false, left: `to talk over:  ${PlanItem.pickAsks(pick, optionFor(), note)}` }
      }
      case "details":
        return { applied: false, left: "Add Details:  an agent's (`inbox done` once written)" }
      default:
        return { applied: false, left: `no such action:  ${action}` }
    }
  }

  /** Owen's note on an Overview sub-section, as a paragraph at its end;  once. */
  private keepNoteInPart(part: Element, { note, stamp, how }: { note: string; stamp: string; how: string }): void {
    const line = `<p><b>Owen · ${PlanMarkup.text(stamp)} · ${PlanMarkup.text(how)}:</b>  ${PlanMarkup.text(note)}</p>`
    const same = Array.from(part.querySelectorAll(":scope > p")).some(
      (p) => PlanMarkup.squeeze(p.outerHTML) === PlanMarkup.squeeze(line)
    )
    if (!same) Markup.append(part, line)
  }
}

/** `PlanItem.asProse()`'s option for text as a reader sees it:  every element's heading, at any depth. */
const PLAIN = { plain: true }

/** What a rewrite of an item's details (`PlanDoc.setDetails()`) leaves where it is, slotted children aside. */
const KEPT_ON_REWRITE = ["epic-answer", "epic-original", "epic-commit"]

/** The slot of Claude's status cards on an item or an Overview sub-section (`<epic-status slot="status">`). */
const STATUS_SLOT = "status"

/** The slot of a status card's summary, under its reading (`<p slot="summary">`). */
const SUMMARY_SLOT = "summary"

/** The slot of Owen's kept notes on the summary (`<epic-reply slot="notes">`, `PlanDoc.keepNote()`). */
const NOTES_SLOT = "notes"

/** A phase's id:  `p3`. */
const PHASE_ID = /^p\d+$/

/**
 * What takes review notes as an item does, but isn't one (`PlanDoc.reviewPart()`):
 * its inbox `id`, `element`, `kind` (`overview`, `phase`, `summary`), and how a todo or a note names it:
 * `label`, `link` (an `#id`), `what` it is in words, `title`.
 */
type ReviewPart = {
  id: string
  element: Element
  kind: "overview" | "phase" | "summary"
  label: string
  link: string
  what: string
  title: string
}

/** Tags that stand as blocks in a status card's reading or summary;  anything else is inline, wrapped in a `<p>`. */
const STATUS_BLOCKS = /^(p|ul|ol|dl|div|blockquote|pre|table)$/

/** A Done card's reading for a todo `inbox apply` filed (Q19):  `Made todo T23 to follow this up.`, linked. */
function filedTodo(todo: string): string {
  return `Made todo <a href="#${todo}">${todo.toUpperCase()}</a> to follow this up.`
}

/** The cards a pick's option set may sit in, for its log line (`PlanDoc.pickOption()`). */
const REPLY_TAG = "epic-reply"
const MORE_TAG = "epic-more"

/** A pick's card set by position, for a message:  ` in card set 2`;  `""` for the item's own (none given). */
function cardSetWords(choices: number | undefined): string {
  return choices === undefined ? "" : ` in card set ${choices + 1}`
}

/** The Phases section's slot for its Plan changes copies (`PlanDoc.writePlanChanges()`). */
const PLAN_CHANGES_SLOT = "changes"

/** The tags whose `phase` names a phase by number:  renumbered with it (`PlanDoc.makeRoomForPhase()`). */
const PHASE_POINTERS = ["epic-item", "epic-update", "epic-updated"]

/** A prompt's text as `<p>`s:  blank lines split paragraphs, single newlines become `<br>`;  `""` for none. */
function promptHTML(prompt: string | null | undefined): string {
  return String(prompt ?? "")
    .trim()
    .split(/\n\s*\n/)
    .filter((paragraph) => paragraph.trim())
    .map((paragraph) => `<p>${PlanMarkup.text(paragraph.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("")
}
