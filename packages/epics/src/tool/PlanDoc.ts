import { parseHTML } from "linkedom"

import {
  CHOICES,
  CHOICES_TITLE,
  CLOSED,
  FIRST,
  HUNG,
  ITEM_STATUSES,
  KINDS,
  MORE,
  MORE_TITLE,
  OLD_DECISION,
  OPEN_KINDS,
  OPTIONS,
  ORIGINAL,
  ORIGINAL_TITLE,
  PHASE_FIELDS,
  PHASE_SECTIONS,
  PlanDocError,
  QUESTION,
  REVIEW_FILTERS,
  REVIEW_SECTIONS,
  SECTION_ICONS,
  SECTION_ORDER,
  STATUS,
  TESTS_NOTE,
  isItemKind,
  isPhaseStatus,
  isReviewFilter,
  type AddItemOptions,
  type AddPhaseOptions,
  type BackfilledCommit,
  type CommitLogEntry,
  type CommitOptions,
  type CommitTarget,
  type DecideOptions,
  type ItemDescription,
  type ItemKind,
  type ItemState,
  type ItemSummary,
  type KeptNote,
  type LayoutResult,
  type MarkResult,
  type OpenKind,
  type OptionCard,
  type OriginalOptions,
  type OriginalResult,
  type Phase,
  type PhaseField,
  type PhaseFieldValues,
  type PlanDocOptions,
  type PlanDocParts,
  type PlanMark,
  type PlanSummary,
  type RelayoutResult,
  type ReviewItem,
  type ReviewSection,
  type ReviewState,
  type ReviewStatus
} from "./planDoc.types"

import { PlanCommits } from "./PlanCommits"
import { PlanItem } from "./PlanItem"
import { PlanMarkup } from "./PlanMarkup"
import { PlanMigration } from "./PlanMigration"
import { PlanSections } from "./PlanSections"
import { PlanTime } from "./PlanTime"

/****************
 * ### `PlanDoc`
 * A parsed plan doc, `epics/<name>/<name>.plan.html`, and the edits `spell dev plan-doc` makes to it.  Rules, ids
 * and markup:  `templates/epics/plan-doc.md`.
 * - Pure:  a parsed document in, changes on it;  no files, no git, no clock unless passed one.  The command line
 *   reads and writes the doc (its lock, the parts of a split doc, links and formatting) and hands this the document.
 * - Its tables and types:  `planDoc.types.ts`;  its helpers:  `PlanMarkup`, `PlanSections`, `PlanItem`, `PlanTime`,
 *   `PlanCommits`;  bringing an older doc up to date:  `PlanMigration` (`migrate()`).
 * - Sections are `<ui-section>`s;  docs not yet migrated (`section.s2|s3`, cli-additions) are still read and edited
 *   as they are, so every helper takes either markup (`PlanSections`).
 * - Writes TODAY's markup (`ui-*`), NOT the `<epic-*>` elements of this package's pack (a later phase of epic
 *   `epic-components` switches it).
 * - From `packages/docs/tools/plan-doc.js` (epic `epic-components`, P7):  the same public methods, the same markup,
 *   byte for byte (`PlanDoc.test.ts` is the proof).
 ****************/
export class PlanDoc {
  /** linkedom (or browser) document of the plan doc */
  readonly document: Document

  /**
   * when edits happen:  the log's timestamps, the items' change stamps and the "updated" date, in LOCAL time
   * - a test may move it between edits
   */
  now: Date

  /**
   * the commit time (ISO) of `HEAD~2` in the doc's checkout, which `updateStates()` writes to
   * `<body data-recent-since>`:  an item changed since then is "recent" (D2).  `null`:  no git history, so the
   * attribute goes;  `undefined` (default):  left as the doc has it
   * - passed in, so `PlanDoc` stays pure:  the command line asks git
   */
  recentSince: string | null | undefined

  /** how the doc was stored (split or not), set by the command line's `read()`;  never read here */
  parts?: PlanDocParts

  constructor(document: Document, now = new Date(), { recentSince }: PlanDocOptions = {}) {
    this.document = document
    this.now = now
    this.recentSince = recentSince
  }

  /** `PlanDoc` of HTML text;  `options` as the constructor's. */
  static parse(html: string, now?: Date, options?: PlanDocOptions): PlanDoc {
    return new PlanDoc(parseHTML(html).document, now, options)
  }

  /** `now`'s date, `YYYY-MM-DD`. */
  get today(): string {
    return PlanTime.isoDate(this.now)
  }

  /**
   * Is a `/bedtime` run going on?  Then every item a command changes also gets `data-bedtime` (`stamp()`), and
   * stays "recent" until reviewed.
   * - `<body data-bedtime>`, set by `startBedtime()`:  read it HERE only
   */
  get bedtime(): boolean {
    return this.bedtimeRun !== null
  }

  /**
   * The doc as HTML text, ready to write.
   * - boolean attributes go back to bare (`styled`, not `styled=""`), as written by hand and by oxfmt
   */
  toString(): string {
    return PlanMarkup.serialize(this.document)
  }

  ////////////////
  // ## Phases
  ////////////////

  /**
   * Every phase, in order:  `{ n, name, status, estimate }`, from the phase sections in `#phases`.
   * - `estimate`:  its Estimate field's text;  `undefined` while missing or `TBD`
   * - docs not yet migrated also have a phase LIST (`.plan-phases`) under `#plan`:  `check()` keeps the two in step
   */
  get phases(): Phase[] {
    return this.phaseSections.map((section) => ({
      n: Number(section.getAttribute("data-phase")),
      name: PlanSections.phaseName(PlanSections.titleText(section)),
      status: section.getAttribute("data-status") ?? "todo",
      estimate: PlanSections.estimateText(section)
    }))
  }

  /**
   * The phase sections, in order:  `<ui-section data-phase>` in `ui-section#phases`, or (old markup)
   * `section[data-phase]` in `#phases-section`.
   */
  get phaseSections(): Element[] {
    return Array.from(this.document.querySelectorAll(PHASE_SECTIONS))
  }

  /** Phase `n`'s section;  throws when there's none. */
  phaseSection(n: number): Element {
    const section = this.phaseSections.find((phase) => phase.getAttribute("data-phase") === String(n))
    if (!section) throw new PlanDocError(`no phase ${n} in the doc`)
    return section
  }

  /** Number of the phase in progress, if any. */
  get activePhase(): number | undefined {
    return this.phases.find((phase) => phase.status === "active")?.n
  }

  /**
   * Append phase `name` (2-4 words) to `#phases` (and an old doc's phase list);  returns its number.
   * - `symptom` / `changes` / `goal` / `files` / `verify`:  its body's fields, as HTML (`PHASE_FIELDS`):  the symptom
   *   one line, the changes two or three, the goal a `<ul>` of bullets (the details);  omitted ones get a placeholder
   *   to fill in, but the goal:  optional once there's a symptom or changes;  neither of those:  the shape before
   *   P3 of `windows-and-review`, Goal / Files / Verify
   * - `estimate` (`1-2h`):  the phase title's BADGE, not a body field (Owen, 2026-10-04);  old markup:  the field
   * - `<ui-section id="p3" data-phase data-status header="P3 · Name" ...>`, its status icon slotted;  old markup:
   *   `section.s3` > `ui-sticky.spell-h3` > `h3#p3`
   * - removes the "Plan hung?" notice (`HUNG`):  a plan with a phase has been written, so a hung session no longer
   *   means starting over from the kickoff prompt
   */
  addPhase(name: string, { symptom, changes, goal, files, verify, estimate }: AddPhaseOptions = {}): number {
    const section = this.section("phases")
    this.document.querySelector(HUNG)?.remove()
    // a future epic with a phase is planned:  no longer future (its meta lines stay until `new` promotes it)
    if (this.future) {
      this.document.body.removeAttribute("data-future")
      this.document.querySelector("ui-message.plan-future")?.remove()
    }
    const n = this.phases.length + 1
    const label = `P${n} · ${name}`
    this.addOldListEntry(n, label)
    const values: Record<PhaseField, string | undefined> = {
      Symptom: symptom,
      Changes: changes,
      Goal: goal,
      Files: files,
      Verify: verify,
      Estimate: estimate
    }
    const sections = section.localName === "ui-section"
    const framed = symptom !== undefined || changes !== undefined
    const body = PHASE_FIELDS.filter(([field]) => !skip(field)).map(
      ([field, glyph]) => `<ui-item icon="${glyph}"><b>${field}:</b>  ${values[field] ?? "TBD"}</ui-item>`
    )
    const list = `<ui-list class="plan-phase-body">${body.join("")}</ui-list>`
    if (sections) {
      const phase = this.element("ui-section", {
        id: `p${n}`,
        "data-phase": n,
        "data-status": "todo",
        header: label,
        ...(estimate ? { badge: estimate } : {}),
        sticky: "",
        collapsible: "",
        dividing: "",
        collapsed: ""
      })
      // newlines around the parts:  oxfmt keeps a custom element's whitespace as it is
      phase.innerHTML = `\n${PlanSections.icon("todo", true)}\n${list}\n`
      section.append(this.document.createTextNode("\n"), phase)
    } else {
      const phase = this.element("section", { class: "s3", "data-phase": n, "data-status": "todo" })
      phase.innerHTML = `<ui-sticky class="spell-h3"><h3 id="p${n}">${PlanSections.icon("todo")} ${PlanMarkup.text(label)}</h3></ui-sticky>
${list}`
      section.append(phase)
    }
    this.updateProgress()
    this.updateEstimate()
    return n

    /** Is `field` left out of the body?  The estimate (a badge);  the goal once framed, else Symptom / Changes. */
    function skip(field: PhaseField): boolean {
      return (
        (sections && field === "Estimate") ||
        (framed ? field === "Goal" && goal === undefined : field === "Symptom" || field === "Changes")
      )
    }
  }

  /**
   * Set phase `n`'s estimate (`2h`, `1-2h`):  the phase title's badge (dropping an old Estimate field);  old markup:
   * the field, added to a phase made before it existed.  Then the Overview's total.
   */
  setEstimate(n: number, estimate: string): void {
    const section = this.phaseSection(n)
    if (section.localName === "ui-section") {
      section.setAttribute("badge", estimate)
      PlanSections.estimateField(section)?.remove()
      return this.updateEstimate()
    }
    const body = section.querySelector(":scope > .plan-phase-body")
    if (!body) throw new PlanDocError(`phase ${n} has no body (\`.plan-phase-body\`)`)
    const html = `<b>Estimate:</b>  ${PlanMarkup.text(estimate)}`
    const field = PlanSections.estimateField(section)
    if (field) field.innerHTML = html
    else if (body.localName === "ui-list") body.append(this.fragment(`<ui-item icon="clock">${html}</ui-item>`))
    else body.append(this.fragment(`<li>${html}</li>`))
    this.updateEstimate()
  }

  /**
   * The Overview's total, `p.plan-estimate`, just below the summary and the prompt:  every phase's estimate added
   * up, and what's left (phases not done).
   * - an estimate that won't parse (`TBD`, "a day") is named as not counted
   * - no phase estimated:  no total
   */
  updateEstimate(): void {
    let line = this.document.querySelector("p.plan-estimate")
    const phases = this.phases
    const counted = phases.map((phase) => ({ ...phase, range: PlanTime.parseDuration(phase.estimate) }))
    const estimated = counted.filter((phase) => phase.range)
    if (!estimated.length) {
      line?.remove()
      return
    }
    const total = PlanTime.sumRanges(estimated.map((phase) => phase.range!))
    const left = PlanTime.sumRanges(estimated.filter((phase) => phase.status !== "done").map((phase) => phase.range!))
    const missing = counted.filter((phase) => !phase.range).map((phase) => `P${phase.n}`)
    let html = `<b>Estimate:</b>  ${PlanTime.formatRange(total)} in all, ${PlanTime.formatRange(left)} left`
    if (missing.length) html += ` (${missing.join(", ")} not estimated)`
    if (!line) {
      line = this.element("p", { class: "plan-estimate" })
      const overview = this.section("overview")
      const above =
        overview.querySelector(":scope > :is(.plan-prompt-panel, blockquote.plan-prompt)") ??
        overview.querySelector(":scope > .plan-summary")
      if (above) above.after(this.document.createTextNode("\n"), line)
      else PlanSections.prependContent(overview, line)
    }
    line.innerHTML = html
  }

  /** A doc not yet migrated keeps its phase list under `#plan` in step:  append phase `n` to it. */
  addOldListEntry(n: number, label: string): void {
    const list = this.document.querySelector(".plan-phases")
    if (!list) return
    if (list.localName === "ui-steps") {
      list.append(this.element("ui-step", { "data-phase": n, "data-status": "todo", href: `#p${n}`, header: label }))
      return
    }
    const li = this.element("li", { "data-phase": n, "data-status": "todo" })
    li.innerHTML = `${PlanSections.icon("todo")} <a href="#p${n}">${PlanMarkup.text(label)}</a>`
    list.append(li)
  }

  /**
   * Set phase `n` to `status` (`todo` / `active` / `done`), on its section and heading (and an old doc's list).
   * - `done` removes the phase's UPDATE markers:  once it's finished, its changes are just the plan
   * - `done` also folds every done phase (`collapsed`;  old markup:  `data-fold="closed"`, read by the page
   *   runtime);  no status unfolds a phase:  the reader opens what they want
   * - `done` with `{ done }` (HTML:  a `<ul>` of what was built, what Owen will ask about first):  the phase's Done
   *   field, after its Goal (`setDone()`)
   * - throws on any other status
   * - SIDE EFFECT:  logs the change
   */
  setPhase(n: number, status: string, { done }: { done?: string } = {}): void {
    if (!isPhaseStatus(status))
      throw new PlanDocError(`status must be ${Object.keys(STATUS).join(" / ")}, not "${status}"`)
    const section = this.phaseSection(n)
    const entry = this.document.querySelector(`.plan-phases > [data-phase="${n}"]`)
    for (const node of [entry, section]) {
      if (!node) continue
      node.setAttribute("data-status", status)
      if (node.localName !== "ui-section") {
        node.querySelector("ui-icon")?.replaceWith(this.fragment(PlanSections.icon(status)))
        continue
      }
      const glyph = node.querySelector(':scope > ui-icon[slot="icon"]')
      if (glyph) glyph.replaceWith(this.fragment(PlanSections.icon(status, true)))
      else node.prepend(this.fragment(PlanSections.icon(status, true)))
    }
    if (entry?.localName === "ui-step") {
      PlanMarkup.toggle(entry, "selected", status === "active")
      PlanMarkup.toggle(entry, "completed", status === "done")
    }
    if (status === "done") {
      for (const marker of this.updateMarkers(n)) marker.remove()
      this.foldDonePhases()
      if (done) this.setDone(n, done)
    }
    this.updateProgress()
    this.updateEstimate()
    this.log(`P${n} ${status}`)
  }

  /**
   * Phase `n`'s Done field:  what was built, as HTML (a `<ul>`, most-asked-about first), just after its Goal;
   * replaces an earlier one.
   */
  setDone(n: number, html: string): void {
    const body = this.phaseBody(n)
    const old = PlanSections.fieldOf(body, "Done")
    const field = this.fragment(`<ui-item icon="circle check"><b>Done:</b>  ${html}</ui-item>`).firstElementChild!
    if (old) return old.replaceWith(field)
    PlanSections.insertField(body, "Done", field)
  }

  /** Phase `n`'s body (`.plan-phase-body`);  throws when it has none. */
  phaseBody(n: number): Element {
    const body = this.phaseSection(n).querySelector(":scope > .plan-phase-body")
    if (!body) throw new PlanDocError(`phase ${n} has no body (\`.plan-phase-body\`)`)
    return body
  }

  /**
   * Set phase `n`'s body fields (`PHASE_FIELDS`):  `{ symptom, changes, goal, files, verify }`, as HTML;  each one
   * given replaces that field, or is made in its place (`FIELD_ORDER`);  returns the fields set.
   * - for phases written before Symptom / Changes (epic `windows-and-review` P3), or a plan that changed
   * - `""`:  removes the field
   */
  setPhaseFields(n: number, values: PhaseFieldValues): string[] {
    const body = this.phaseBody(n)
    const set: string[] = []
    for (const [field, glyph] of PHASE_FIELDS) {
      if (field === "Estimate") continue
      const html = values[field.toLowerCase() as keyof PhaseFieldValues]
      if (html === undefined) continue
      const old = PlanSections.fieldOf(body, field)
      set.push(field)
      if (html === "") {
        old?.remove()
        continue
      }
      const item = this.fragment(`<ui-item icon="${glyph}"><b>${field}:</b>  ${html}</ui-item>`).firstElementChild!
      if (old) old.replaceWith(item)
      else PlanSections.insertField(body, field, item)
    }
    return set
  }

  /**
   * A change to phase `n`'s plan, `html` (what changed, and why:  Owen's feedback), in its fenced "Updated" block,
   * right under Symptom / Changes (Owen, 2026-10-06:  never an "Updated" word buried in the text).
   * - `<ui-item icon="pen to square" class="plan-updated"><b>Updated:</b>  <ul><li data-phase="3"><time>2026-10-06
   *   14:30</time>  what changed</li></ul></ui-item>`, one `li` per change, oldest first;  `data-phase`:  the phase
   *   active when it was written, if any
   * - it STAYS when a phase is done (unlike the UPDATE markers):  it's the record of how the plan moved;  the list at
   *   the top of the phases names it while its phase is still to do (`updatePlanChanges()`)
   * - SIDE EFFECT:  logs it
   */
  addPhaseUpdate(n: number, html: string): void {
    const body = this.phaseBody(n)
    let field = PlanSections.fieldOf(body, "Updated")
    if (!field) {
      field = this.fragment(
        `<ui-item icon="pen to square" class="plan-updated"><b>Updated:</b>  <ul class="plan-updated-list"></ul></ui-item>`
      ).firstElementChild!
      PlanSections.insertField(body, "Updated", field)
    }
    const active = this.activePhase
    const entry = this.element("li", active ? { "data-phase": active } : {})
    entry.innerHTML = `<time>${PlanMarkup.text(PlanTime.clockTime(this.now))}</time>  ${html.trim()}`
    field.querySelector(":scope > ul")!.append(entry)
    this.log(`P${n} plan updated`)
  }

  /**
   * The list of plan changes at the top of `#phases` (`ui-message.plan-changes`, after the progress bar):  every
   * "Updated" entry (`addPhaseUpdate()`) of a phase not yet done, linked to its phase, oldest first;  none:  no list.
   * Returns whether it changed.
   * - so a re-review sees at a glance what moved (Owen, 2026-10-06), without opening every phase
   * - run by the whole-doc pass (`updateStates()`):  the phase bodies are read whole there
   */
  updatePlanChanges(): boolean {
    const section = this.document.getElementById("phases")
    if (!section || section.localName !== "ui-section") return false
    const old = section.querySelector(":scope > ui-message.plan-changes")
    const lines: string[] = []
    for (const phase of this.phases) {
      if (phase.status === "done") continue
      const body = this.phaseSection(phase.n).querySelector(":scope > .plan-phase-body")
      const updated = body && PlanSections.fieldOf(body, "Updated")
      const entries = Array.from(updated?.querySelectorAll(":scope > ul > li") ?? [])
      for (const entry of entries) lines.push(`<li><a href="#p${phase.n}">P${phase.n}</a>  ${entry.innerHTML}</li>`)
    }
    if (!lines.length) {
      old?.remove()
      return Boolean(old)
    }
    const html = `<ul>${lines.join("")}</ul>`
    if (old && PlanMarkup.bare(old.innerHTML) === PlanMarkup.bare(html)) return false
    const list =
      old ??
      this.element("ui-message", { class: "plan-changes", state: "warning", size: "small", header: "Plan changes" })
    list.innerHTML = html
    PlanItem.stripIds(list)
    if (!old) {
      const above =
        section.querySelector(":scope > ui-progress.plan-progress") ??
        section.querySelector(':scope > ui-icon[slot="icon"]')
      if (above) above.after(this.document.createTextNode("\n"), list)
      else section.prepend(list)
    }
    return true
  }

  /**
   * Each phase's Estimate field (`ui-item[icon=clock]`) into its title's badge (`badge="1-2h"`);  how many.
   * - why:  Owen wants the estimate in the title, beside the status (2026-10-04);  `TBD` just goes
   */
  estimatesToBadges(): number {
    let count = 0
    for (const section of this.phaseSections) {
      if (section.localName !== "ui-section") continue
      const field = PlanSections.estimateField(section)
      if (!field) continue
      const value = (field.textContent ?? "").trim().replace(/^Estimate:\s*/, "")
      if (value && value !== "TBD") section.setAttribute("badge", value)
      field.remove()
      count++
    }
    return count
  }

  /**
   * Fold every done phase;  never unfold one.
   * - Why:  docs start folded and open on demand (`packages/docs/AGENTS.md`, "Writing a page")
   */
  foldDonePhases(): void {
    for (const section of this.phaseSections) {
      if (section.getAttribute("data-status") === "done") PlanSections.setFolded(section, true)
    }
  }

  /**
   * The phases' progress bar (`ui-progress.plan-progress`):  done of all, hidden while none.  Then the header's
   * step label (`updateStep()`).
   */
  updateProgress(): void {
    const bar = this.document.querySelector("ui-progress.plan-progress")
    const phases = this.phases
    if (bar) {
      bar.setAttribute("value", String(phases.filter((phase) => phase.status === "done").length))
      bar.setAttribute("total", String(phases.length))
      PlanMarkup.toggle(bar, "hidden", phases.length === 0)
    }
    this.updateStep()
  }

  /**
   * The step label in the sticky page header (`.plan-step`):  where the plan is, at a glance.
   * - the active phase (orange, links to it);  else "DONE" (green) once every phase is;  else the next one (grey)
   * - hidden while there are no phases;  a future epic's (`future`):  "FUTURE" (violet)
   */
  updateStep(): void {
    const step = this.document.querySelector(".plan-step")
    if (!step) return
    const phases = this.phases
    const active = phases.find((phase) => phase.status === "active")
    const next = phases.find((phase) => phase.status === "todo")
    PlanMarkup.toggle(step, "hidden", phases.length === 0 && !this.future)
    if (!phases.length) step.innerHTML = this.future ? `<ui-label color="violet" icon="seedling">FUTURE</ui-label>` : ""
    else if (active) step.innerHTML = PlanSections.stepLabel(active, "orange", "circle half stroke", "")
    else if (!next) step.innerHTML = `<ui-label color="green" icon="check">DONE</ui-label>`
    else step.innerHTML = PlanSections.stepLabel(next, "grey", "circle right", "Next:  ")
  }

  /** UPDATE markers of phase `n`. */
  updateMarkers(n: number): Element[] {
    return Array.from(this.document.querySelectorAll(`.plan-update[data-phase="${n}"]`))
  }

  ////////////////
  // ## Items
  ////////////////

  /**
   * Add a `kind` item titled `title`;  returns its id (`c3`).
   * - `details`:  HTML for a collapsed panel whose TITLE is the item's line (id + title):  the line opens it
   * - `titleHTML`:  `title` is HTML, not text
   * - a question goes after the open questions at the top of its list;  a decision is a question born answered
   *   (D13):  the next `q` id, `decided`, `title` its answer, among the answered ones;  everything else at the end
   * - while a phase is active:  `data-phase="N"` (its "To review" line lists it) and that phase's UPDATE label
   * - stamped (`stamp()`):  `data-changed`, and `data-bedtime` during a `/bedtime` run
   * - throws on a kind not in `KINDS`
   */
  addItem(kind: string, title: string, { details, titleHTML = false }: AddItemOptions = {}): string {
    if (!isItemKind(kind)) throw new PlanDocError(`kind must be ${Object.keys(KINDS).join(" / ")}, not "${kind}"`)
    const spec = KINDS[kind]
    const list = this.listOf(kind)
    const id = `${spec.prefix}${Math.max(0, ...this.items(kind).map((item) => PlanItem.idNumber(item.id))) + 1}`
    const phase = this.activePhase
    const item = this.element(list.localName === "ol" ? "li" : "ui-item", {
      id,
      "data-status": spec.live,
      ...(phase ? { "data-phase": phase } : {}),
      ...(kind === "decision" ? { "data-answered": "" } : {})
    })
    const label = titleHTML ? title : PlanMarkup.text(title)
    const line = `<a class="plan-id" href="#${id}">${id.toUpperCase()}</a> <span class="plan-title">${label}</span>`
    item.innerHTML = details
      ? `<ui-accordion class="plan-item"><ui-title>${line}</ui-title><ui-content>${details}</ui-content></ui-accordion>`
      : line
    list.append(item)
    if (spec.prefix === KINDS.question.prefix) this.placeQuestion(item)
    this.stamp(item)
    this.markUpdate(item)
    return id
  }

  /**
   * Answer question `questionId` with `answer` (text), INTO the question (D13);  returns its id (`q3`).
   * - `decided`, `data-answered`;  the title keeps the question
   * - the answer is an ivory card:  `<div class="plan-answer-block"><div class="plan-answer-title"><b>Answer</b> ·
   *   ...</div>` + `details` (HTML) `</div>`;  a question without details gets a panel (`detailsOf()`)
   * - its details read in the order it happened (`layoutAnswer()`):  the question's text, its option cards as a
   *   folded "Choices" accordion, then the answer card
   * - answering again replaces the answer card in place:  the old one moves into the question's Original Discussion
   *   (`keepOriginal()`), never dropped;  a migrated decision's id (`d7`) stays on the new card, which is titled
   *   `D7 · ...` (old `#d7` links still land)
   * - `option` (`A`):  that option is the chosen one (`chooseOption()`)
   * - moves among the answered questions, in id order:  open ones stay on top
   * - throws when `questionId` isn't a question
   */
  decide(questionId: string, answer: string, { details, option }: DecideOptions = {}): string {
    const question = this.item(questionId)
    if (!question.id.startsWith(KINDS.question.prefix)) throw new PlanDocError(`${questionId} isn't a question`)
    const content = this.detailsOf(question)
    const old = content.querySelector(":scope > .plan-answer-block")
    const id = old?.getAttribute("id")
    // an ivory card titled by the answer, its details inside (Owen, 2026-10-04)
    const title = `<div class="plan-answer-title"><b>${PlanItem.answerLabel(id)}</b> · ${PlanMarkup.text(answer)}</div>`
    const card = this.fragment(`<div class="plan-answer-block">${title}${details ?? ""}</div>`).firstElementChild!
    if (old) {
      old.replaceWith(card)
      old.removeAttribute("id")
      // the answer it replaces is kept, unless it said the same
      if (PlanMarkup.bare(old.outerHTML) !== PlanMarkup.bare(card.outerHTML)) this.keepOriginal(question, [old])
      if (id) card.setAttribute("id", id)
    } else content.prepend(card)
    question.setAttribute("data-answered", "")
    this.layoutAnswer(question)
    if (option) this.chooseOption(question, option)
    question.setAttribute("data-status", "decided")
    question.setAttribute("data-answered", "")
    this.placeQuestion(question)
    this.stamp(question)
    this.markUpdate(question)
    return question.id
  }

  /**
   * Mark option `letter` (`A`, `B` ...) of question `item` as the one chosen:  `data-chosen` on it, taken off the
   * others (`PlanItem.optionsOf()`).
   * - an answered question's option is a panel of its Choices accordion (`QUESTION`):  `data-chosen` on the panel's
   *   `ui-title`, and the accordion opens on it (`open="2"`);  the page marks it with a check
   * - an open question's (or an old doc's) is an option card:  `data-chosen` on its `ui-column` in the
   *   `ui-grid.spell-pros-cons`
   * - the label starts with the letter:  `A · Inbox file (recommended)` (older docs:  `A. Inbox file`)
   * - throws when no option has that letter
   * - never one in the item's Original Discussion (`ORIGINAL`):  that's history
   */
  chooseOption(item: Element, letter: string): void {
    const options = PlanItem.optionsOf(item)
    const want = String(letter).trim().toUpperCase()
    const chosen = options.find((option) => option.letter === want)
    if (!chosen) throw new PlanDocError(`${item.id.toUpperCase()} has no option ${want}`)
    for (const option of options) option.holder.toggleAttribute("data-chosen", option === chosen)
    const accordion = chosen.holder.closest(OPTIONS)
    if (accordion) PlanItem.openOn(accordion)
  }

  /**
   * Lay out answered question `item`'s details in the order it happened (`QUESTION`):  its text in a
   * `div.plan-question`, its option cards as a folded Choices accordion, the answer card, then its replies, Original
   * Discussion and commits.  Returns `{ changed, notes }`, or `{ skipped }` (why:  no answer card, so born
   * answered).
   * - idempotent:  a question laid out already is left as it is
   * - an old layout (the answer card first, before 2026-10-05):  everything after the card is the question's text,
   *   but its replies (`.plan-reply`), which stay after the answer
   * - the new layout:  what's before the answer card is the question's text, what's after it stays after it
   * - the option cards:  the ONE `ui-grid.spell-pros-cons` at the top of the question's text whose labels name
   *   options (a letter, or "(recommended)");  each card becomes a panel (`choicesFrom()`), `data-chosen` kept.  A
   *   grid that isn't options (pros / cons), or a second one, stays in the text, as a note says
   * - nothing is dropped:  every node lands in one of the parts;  whitespace between them goes (oxfmt rewrites it)
   * - a card with a migrated decision's id still titled "Answer" is retitled `D7` (`PlanItem.answerLabel()`)
   */
  layoutAnswer(item: Element): LayoutResult {
    const content = item.querySelector(":scope > ui-accordion.plan-item > ui-content")
    const card = content?.querySelector(":scope > .plan-answer-block")
    if (!content || !card) return { skipped: "born answered (no answer card:  its title is the answer)" }
    const before = PlanMarkup.bare(content.innerHTML)
    const notes: string[] = []
    const original = content.querySelector(`:scope > ${ORIGINAL}`)
    const commits = content.querySelector(":scope > .plan-commits")
    let choices = content.querySelector(`:scope > ${CHOICES}`)
    let question = content.querySelector(`:scope > ${QUESTION}`)
    const laidOut = Boolean(question || choices)
    const body: ChildNode[] = []
    const tail: ChildNode[] = []
    let afterCard = false
    for (const node of Array.from(content.childNodes)) {
      if (node === card) afterCard = true
      else if (node === question) body.push(...Array.from(question.childNodes))
      else if (node === original || node === commits || node === choices) continue
      else if (PlanMarkup.isBlank(node)) node.remove()
      // an open question's "Original Reply" (`addMore()`):  its text is the question's now
      else if (PlanMarkup.isElement(node) && node.matches(FIRST)) {
        body.push(...Array.from(node.childNodes))
        node.remove()
      } else if (laidOut ? afterCard : PlanMarkup.isElement(node) && node.matches(`.plan-reply, ${MORE}`))
        tail.push(node)
      else body.push(node)
    }
    if (!choices) {
      const grids = body.filter(
        (node): node is Element => PlanMarkup.isElement(node) && node.matches("ui-grid.spell-pros-cons")
      )
      const options = grids.filter((grid) => PlanItem.isOptionGrid(grid))
      if (grids.length > options.length) notes.push(`kept ${grids.length - options.length} grid(s) that aren't options`)
      if (options.length > 1) notes.push(`kept ${options.length} option grids in the question:  which is the choice?`)
      else if (options.length === 1) {
        const [grid] = options
        body.splice(body.indexOf(grid), 1)
        grid.remove()
        choices = this.choicesFrom(grid)
        const unlettered = PlanItem.optionsOf(choices).length < choices.querySelectorAll(`${OPTIONS} > ui-title`).length
        if (unlettered) notes.push("options without letters:  can't be picked by letter")
      }
    }
    if (body.some((node) => node.nodeType !== 3 || node.textContent?.trim())) {
      question ??= this.element("div", { class: "plan-question" })
      question.replaceChildren(...body)
      PlanMarkup.trimWhitespace(question)
    } else {
      question?.remove()
      question = null
      for (const node of body) node.remove()
    }
    const label = card.querySelector(":scope > .plan-answer-title > b:first-child")
    if (label && card.id && label.textContent?.trim() === "Answer") label.textContent = PlanItem.answerLabel(card.id)
    for (const node of Array.from(content.childNodes)) if (PlanMarkup.isBlank(node)) node.remove()
    content.append(...[question, choices, card, ...tail, original, commits].filter((node) => node !== null))
    return { changed: PlanMarkup.bare(content.innerHTML) !== before, notes }
  }

  /**
   * Option card grid `grid` (a `ui-grid.spell-pros-cons`, out of the doc) as an answered question's Choices aside
   * (`QUESTION`):  `<ui-accordion class="spell-aside plan-choices" styled>` titled "Choices", folded, holding
   * `<ui-accordion class="plan-options" styled fluid exclusive="no">`, a `ui-title` + `ui-content` per card.
   * - the title:  the card's top label's markup (`A · Push main first (recommended)`);  a card without one:
   *   `Option 2`
   * - the content:  the card's segment but its label, then anything else in its column
   * - a chosen card (`data-chosen`):  its title carries it, and the accordion opens on it (`PlanItem.openOn()`)
   * - `exclusive="no"`:  the reader may open several to compare;  `styled` / `fluid` are UI's own look, for a
   *   page where the accordion isn't nested (in an item it takes its parent's:  `plan-doc.css` styles it)
   */
  choicesFrom(grid: Element): Element {
    const options = this.element("ui-accordion", { class: "plan-options", styled: "", fluid: "", exclusive: "no" })
    for (const [index, column] of Array.from(grid.querySelectorAll(":scope > ui-column")).entries()) {
      const segment = column.querySelector(":scope > ui-segment")
      const label = (segment ?? column).querySelector(":scope > ui-label[attached]")
      const title = this.element("ui-title", column.hasAttribute("data-chosen") ? { "data-chosen": "" } : {})
      title.innerHTML = label ? label.innerHTML.trim() : `Option ${index + 1}`
      const panel = this.element("ui-content")
      for (const child of Array.from(column.childNodes))
        if (child === segment) panel.append(...Array.from(segment.childNodes).filter((node) => node !== label))
        else panel.append(child)
      PlanMarkup.trimWhitespace(panel)
      options.append(title, panel)
    }
    PlanItem.openOn(options)
    const aside = this.element("ui-accordion", { class: "spell-aside plan-choices", styled: "" })
    aside.innerHTML = `<ui-title>${CHOICES_TITLE}</ui-title><ui-content></ui-content>`
    aside.querySelector(":scope > ui-content")!.append(options)
    return aside
  }

  /**
   * Lay out every answered question in the doc (`layoutAnswer()`):  `{ changed, skipped, notes, oldDecisions }`.
   * - `changed`:  the ids laid out anew;  `skipped`:  `{ id, why }` for answered questions left as they are;
   *   `notes`:  `{ id, note }` for what a converted one kept in its text
   * - `oldDecisions`:  an old doc's `D` items, which `migrate` merges into their questions first
   */
  relayout(): RelayoutResult {
    const result: RelayoutResult = { changed: [], skipped: [], notes: [], oldDecisions: 0 }
    for (const item of this.document.querySelectorAll('.plan-items[data-kind="decision"] > [id]')) {
      if (OLD_DECISION.test(item.id)) result.oldDecisions++
      if (!/^q\d+$/.test(item.id) || !item.hasAttribute("data-answered")) continue
      const id = item.id.toUpperCase()
      const done = this.layoutAnswer(item)
      if ("skipped" in done) {
        result.skipped.push({ id, why: done.skipped })
        continue
      }
      if (done.changed) result.changed.push(id)
      for (const note of done.notes) result.notes.push({ id, note })
    }
    return result
  }

  /**
   * Put question `item` where it belongs in its list:  an open one after the open questions on top;  an answered
   * (or dropped) one among the answered, in id order.
   * - an old doc's struck question, beside the decision that answers it (`→ D7`), isn't counted:  it stays put
   */
  placeQuestion(item: Element): void {
    const list = item.parentElement!
    if (item.getAttribute("data-status") === "open") {
      const last = this.openQuestions(list)
        .filter((other) => other !== item)
        .at(-1)
      if (last) last.after(item)
      else list.prepend(item)
      return
    }
    const n = PlanItem.idNumber(item.id)
    const later = Array.from(list.children).find(
      (other) =>
        other !== item &&
        /^q\d+$/.test(other.id) &&
        other.getAttribute("data-status") !== "open" &&
        !other.querySelector(".plan-answer") &&
        PlanItem.idNumber(other.id) > n
    )
    if (later) later.before(item)
    else list.append(item)
  }

  /**
   * Item `item`'s details (its panel's `ui-content`);  an item without any gets a collapsed panel, its line the
   * panel's title, as `addItem()` makes with `details`.
   */
  detailsOf(item: Element): Element {
    const panel = item.querySelector(":scope > ui-accordion.plan-item")
    if (panel) return panel.querySelector(":scope > ui-content") ?? panel.appendChild(this.element("ui-content"))
    const accordion = this.element("ui-accordion", { class: "plan-item" })
    const title = this.element("ui-title")
    const content = this.element("ui-content")
    title.append(...Array.from(item.childNodes))
    PlanMarkup.trimWhitespace(title)
    accordion.append(title, content)
    item.append(accordion)
    return content
  }

  /**
   * Set item `id` open, done or canceled;  closed items stay (`canceled` ones struck through).  Returns its title.
   * - "open" means the kind's live status:  a reopened answered question (or an old doc's decision) is `decided`
   *   again, an unanswered one `open`
   * - `canceled`:  made moot by another decision (J16 of `review-review`);  `reopen` undoes it as it undoes `done`
   * - a question moves to its place (`placeQuestion()`);  stamped (`stamp()`)
   * - throws on any other status, or an id the doc doesn't have
   */
  setItem(id: string, status: string): string {
    if (!(ITEM_STATUSES as readonly string[]).includes(status))
      throw new PlanDocError(`item status must be open / done / canceled`)
    const item = this.item(id)
    const question = /^q\d+$/.test(item.id)
    let live: string =
      Object.values(KINDS).find((spec) => new RegExp(`^${spec.prefix}\\d+$`).test(item.id))?.live ?? "open"
    if (question) live = item.hasAttribute("data-answered") ? "decided" : "open"
    else if (OLD_DECISION.test(item.id)) live = "decided"
    item.setAttribute("data-status", status === "open" ? live : status)
    if (question && item.parentElement!.matches('[data-kind="decision"]')) this.placeQuestion(item)
    this.stamp(item)
    this.markUpdate(item)
    return item.querySelector(".plan-title")?.textContent?.trim() ?? id
  }

  /**
   * Stamp `item` as changed now:  `data-changed` (ISO local time, with offset), which `updateStates()` compares
   * with `<body data-recent-since>`;  during a `/bedtime` run also `data-bedtime`, until it's reviewed.
   * - `at`:  when, if not now (`review()`'s backfilled date);  `bedtime`:  `false` for a change Owen made
   */
  stamp(item: Element, { at = this.now, bedtime = this.bedtime }: { at?: Date; bedtime?: boolean } = {}): void {
    item.setAttribute("data-changed", PlanTime.isoTime(at))
    if (bedtime) item.setAttribute("data-bedtime", "")
  }

  /**
   * The item with `id` (any case);  throws when there's none.
   * - a migrated old decision (`d7`) is the question its answer card is in (`findItem()`)
   */
  item(id: string): Element {
    const item = this.findItem(id)
    if (!item) throw new PlanDocError(`no item "${id}"`)
    return item
  }

  /**
   * The item with `id` (any case), or `null`.
   * - an old decision's id (`d7`) that `migrate` moved onto an answer card (`PlanMigration.mergeDecisions()`) finds
   *   the question holding the card:  `close d7`, `Fix D7:` commits still reach it
   */
  findItem(id: string): Element | null {
    const key = String(id).toLowerCase()
    let item = this.document.getElementById(key)
    if (item && OLD_DECISION.test(key) && item.matches(".plan-answer-block")) item = item.closest(".plan-items > [id]")
    return item?.parentElement?.matches(".plan-items") ? item : null
  }

  /**
   * Items of `kind`, in order:  `{ id, title, status }`.
   * - `list`:  where to look;  default `listOf(kind)`, which adds or requires it.  `null`:  none.
   */
  items(kind: ItemKind, list: Element | null = this.listOf(kind)): ItemSummary[] {
    const pattern = new RegExp(`^${KINDS[kind].prefix}\\d+$`)
    return Array.from(list?.children ?? [])
      .filter((item) => pattern.test(item.id))
      .map((item) => ({
        id: item.id,
        title: item.querySelector(".plan-title")?.textContent?.trim() ?? "",
        status: item.getAttribute("data-status") ?? "open"
      }))
  }

  /**
   * The list `kind`'s items live in:  its own (a doc not yet migrated), else the one it shares.
   * - `test` in a doc from before "To test" (2026-10-03):  the section is added first (`addTestsSection()`)
   */
  listOf(kind: ItemKind): Element {
    const found = this.findList(kind)
    if (found) return found
    if (kind === "test") return this.addTestsSection()
    return this.require(`.plan-items[data-kind="${KINDS[kind].list}"]`)
  }

  /**
   * `listOf()` for READING:  the list `kind`'s items live in, or `null`;  never adds a section, never throws.
   * - a doc older than a kind's section (`#judgements`, `#tests`:  2026-10-03) has none of that kind open
   */
  findList(kind: ItemKind): Element | null {
    return (
      this.document.querySelector(`.plan-items[data-kind="${kind}"]`) ??
      this.document.querySelector(`.plan-items[data-kind="${KINDS[kind].list}"]`)
    )
  }

  /**
   * Add the "To test" section, `#tests`, just before the Log (else last), and renumber;  returns its list.
   * - for docs from before it was in the template (2026-10-03)
   */
  addTestsSection(): Element {
    const section = this.element("ui-section", {
      id: "tests",
      // numbered by `orderSections()` below:  its place, and the Log the next
      header: "0. To test",
      sticky: "",
      collapsible: "",
      dividing: "",
      collapsed: ""
    })
    section.innerHTML =
      `\n<ui-icon slot="icon" name="${SECTION_ICONS.tests}"></ui-icon>\n<p class="meta">${TESTS_NOTE}</p>\n` +
      `<ui-list class="plan-items" data-kind="test" divided relaxed></ui-list>\n`
    const log = PlanSections.sectionOf(this.document, "log")
    if (log) log.before(section, this.document.createTextNode("\n\n"))
    else this.require("main").append(section)
    this.orderSections()
    return section.querySelector(".plan-items")!
  }

  /** The open questions at the top of `list`, in order. */
  openQuestions(list: Element): Element[] {
    const run: Element[] = []
    for (const item of list.children) {
      if (!/^q\d+$/.test(item.id) || item.getAttribute("data-status") !== "open") break
      run.push(item)
    }
    return run
  }

  /**
   * While a phase is active, flag `item` as changed in it (once).
   * - the label goes on the item's line:  in its panel's title when it has details
   */
  markUpdate(item: Element): void {
    const n = this.activePhase
    const line = item.querySelector(":scope > ui-accordion > ui-title") ?? item
    if (!n || line.querySelector(":scope > .plan-update")) return
    line.append(
      this.fragment(` <ui-label class="plan-update" size="mini" color="orange" data-phase="${n}">UPDATE</ui-label>`)
    )
  }

  ////////////////
  // ## Review
  ////////////////

  /**
   * Mark item `id` reviewed today (`/epic review`, or any session that talked it through with Owen);  returns its
   * title.
   * - `data-reviewed="YYYY-MM-DD"`;  clears `data-deferred`:  it's been gone through now
   * - the outcome goes in the log, not on the item
   * - `date`:  when it was reviewed, `YYYY-MM-DD`, if not today (`backfill`:  the day of the evidence);  the change
   *   stamp is that day too, so a backfill doesn't make old items "recent"
   * - Owen has seen it now:  `data-bedtime` goes
   */
  review(id: string, { date = this.today }: { date?: string } = {}): string {
    const item = this.item(id)
    item.setAttribute("data-reviewed", date)
    item.removeAttribute("data-deferred")
    this.stamp(item, { at: date === this.today ? this.now : PlanTime.localDay(date), bedtime: false })
    item.removeAttribute("data-bedtime")
    this.updateReviewLabel(item)
    return PlanItem.titleOf(item)
  }

  /** Put item `id` off (`data-deferred`, today):  still outstanding, shown as such next review;  returns its title. */
  defer(id: string): string {
    const item = this.item(id)
    item.setAttribute("data-deferred", this.today)
    this.stamp(item)
    this.updateReviewLabel(item)
    return PlanItem.titleOf(item)
  }

  /**
   * Queue `work` for item `id`:  a review decided it should be done, and it isn't yet;  returns its title.
   * - `data-queued` (today) + `data-work`;  also marks it reviewed (so `data-bedtime` goes, as `review()`)
   * - survives sessions:  the next `/epic review` offers it first, `unqueue()` once it's started or dropped
   */
  queue(id: string, work: string): string {
    const item = this.item(id)
    item.setAttribute("data-queued", this.today)
    item.setAttribute("data-work", String(work))
    item.setAttribute("data-reviewed", this.today)
    item.removeAttribute("data-deferred")
    this.stamp(item, { bedtime: false })
    item.removeAttribute("data-bedtime")
    this.updateReviewLabel(item)
    return PlanItem.titleOf(item)
  }

  /** Take item `id` off the queue (started, or dropped);  it stays reviewed.  Returns its title. */
  unqueue(id: string): string {
    const item = this.item(id)
    item.removeAttribute("data-queued")
    item.removeAttribute("data-work")
    this.stamp(item)
    this.updateReviewLabel(item)
    return PlanItem.titleOf(item)
  }

  /**
   * Item `item`'s (an element) review state:
   * - `queued`:  reviewed, work waiting
   * - `reviewed`:  marked, closed (`CLOSED`:  done, canceled, an answered question, an old doc's decision), or
   *   linked from a decision (`href="#c4"` in its details)
   * - `deferred`:  put off for now;  still outstanding
   * - `outstanding`:  none of the above
   */
  reviewState(item: Element): ReviewState {
    if (item.hasAttribute("data-queued")) return "queued"
    const status = item.getAttribute("data-status") ?? ""
    if (item.hasAttribute("data-reviewed") || CLOSED.has(status)) return "reviewed"
    if (this.linkedFromDecision(item.id)) return "reviewed"
    return item.hasAttribute("data-deferred") ? "deferred" : "outstanding"
  }

  /**
   * Does a decision (other than the item itself) link to `#id`?
   * - a decision, either shape:  an answered question (`q3`, `decided` or since struck), or an old doc's `d7`
   * - its own id link, an old struck question's `→ D7`, and a link in its Original Discussion don't count
   */
  linkedFromDecision(id: string): boolean {
    const list = this.document.querySelector('.plan-items[data-kind="decision"]')
    if (!list) return false
    return Array.from(list.children).some(
      (decision) =>
        decision.id !== id &&
        (OLD_DECISION.test(decision.id) || (/^q\d+$/.test(decision.id) && decision.hasAttribute("data-answered"))) &&
        PlanItem.current(decision.querySelectorAll(`a[href="#${id}"]:not(.plan-id, .plan-answer)`)).length > 0
    )
  }

  /**
   * The sections a review walks, in page order:  `{ kind, label, total, notReviewed, items }`, `items` filtered by
   * `filter`:
   * - `unreviewed` (default):  outstanding and deferred
   * - `open`:  not struck, reviewed or not
   * - `reviewed`:  reviewed and queued
   * - `queued`:  work waiting
   * - `all`
   * - each item:  `reviewItem()`'s view
   * - Questions are the `Q` items, open and answered (the decisions since D13);  never an old doc's `D` items
   * - throws on any other filter
   */
  reviewSections({ filter = "unreviewed" }: { filter?: string } = {}): ReviewSection[] {
    if (!isReviewFilter(filter)) throw new PlanDocError(`filter must be ${Object.keys(REVIEW_FILTERS).join(" / ")}`)
    const keep: (item: ReviewItem) => boolean = REVIEW_FILTERS[filter]
    return REVIEW_SECTIONS.map(({ kind, label }) => {
      const pattern = new RegExp(`^${KINDS[kind].prefix}\\d+$`)
      const all = Array.from(this.findList(kind)?.children ?? [])
        .filter((item) => pattern.test(item.id))
        .map((item) => this.reviewItem(item))
      const notReviewed = all.filter((item) => REVIEW_FILTERS.unreviewed(item)).length
      return { kind, label, total: all.length, notReviewed, items: all.filter(keep) }
    })
  }

  /**
   * `reviewSections()`'s view of one item (an element):  dates are `YYYY-MM-DD` or `null`;  `docState`:  its color
   * on the page (`itemState()`).
   * - `details` / `detailsHtml`:  its CURRENT text, its Original Discussion left out;  `original`:  that, as text, or
   *   `null` when it has none
   */
  reviewItem(item: Element): ReviewItem {
    const content = item.querySelector(":scope > ui-accordion > ui-content")
    const details = content && PlanItem.withoutOriginal(content)
    const original = content?.querySelector(`:scope > ${ORIGINAL} > ui-content`)
    return {
      id: item.id.toUpperCase(),
      title: PlanItem.titleOf(item),
      status: item.getAttribute("data-status") ?? "open",
      state: this.reviewState(item),
      docState: this.itemState(item),
      reviewed: item.getAttribute("data-reviewed"),
      deferred: item.getAttribute("data-deferred"),
      queued: item.getAttribute("data-queued"),
      work: item.getAttribute("data-work"),
      details: details ? (details.textContent ?? "").replace(/\s+/g, " ").trim() : "",
      // the details as written, for a page that shows them whole (`pickerSpec()`)
      detailsHtml: details ? details.innerHTML.trim() : "",
      original: original ? (original.textContent ?? "").replace(/\s+/g, " ").trim() : null,
      recommendation: PlanItem.recommendation(details)
    }
  }

  /**
   * Where reviews stand, for someone who remembers nothing:  `{ last, reviewedThen, deferred, queued }`.
   * - `last`:  the latest `data-reviewed` date, or `null` (never reviewed);  `reviewedThen`:  how many items carry it
   * - `deferred`:  items deferred;  `queued`:  `{ id, title, work, queued }` for each piece of work waiting
   */
  reviewStatus(): ReviewStatus {
    const items = Array.from(this.document.querySelectorAll(".plan-items > [id]"))
    const dates = items.map((item) => item.getAttribute("data-reviewed")).filter((date) => Boolean(date)) as string[]
    // `YYYY-MM-DD` sorts as text
    const last = dates.reduce((latest, date) => (date > latest ? date : latest), "") || null
    return {
      last,
      reviewedThen: last ? dates.filter((date) => date === last).length : 0,
      deferred: items.filter((item) => item.hasAttribute("data-deferred")).length,
      queued: items
        .filter((item) => item.hasAttribute("data-queued"))
        .map((item) => ({
          id: item.id.toUpperCase(),
          title: PlanItem.titleOf(item),
          work: item.getAttribute("data-work"),
          queued: item.getAttribute("data-queued")
        }))
    }
  }

  /**
   * The review label on `item`'s line (`ui-label.plan-review`), from its marks:  "to do" (queued, orange:  work in
   * progress), else "deferred" (grey, its date on hover), else "reviewed 10-02" (green while recent, then grey:
   * `PlanItem.reviewLabelColor()`);  none when unmarked.
   * - on the line, right after the id (`I7 [deferred 10-02] title`):  in its panel's title when it has details
   */
  updateReviewLabel(item: Element): void {
    const line = item.querySelector(":scope > ui-accordion > ui-title") ?? item
    const old = line.querySelector(":scope > .plan-review")
    // the space written before it goes too, or each relabel leaves one behind
    const space = old?.previousSibling
    if (space?.nodeType === 3) space.textContent = (space.textContent ?? "").trimEnd()
    old?.remove()
    const queued = item.hasAttribute("data-queued")
    const deferred = item.getAttribute("data-deferred")
    const reviewed = item.getAttribute("data-reviewed")
    let label: [string, (string | null)?] | undefined
    if (queued) label = ["to do", item.getAttribute("data-work")]
    else if (deferred) label = ["deferred", `deferred ${deferred}`]
    else if (reviewed) label = [`reviewed ${reviewed.slice(5)}`]
    if (!label) return
    const [words, tip] = label
    const color = PlanItem.reviewLabelColor(words, this.itemState(item))
    const title = tip ? ` title="${PlanMarkup.escapeAll(tip)}"` : ""
    const html = `<ui-label class="plan-review" size="mini" basic color="${color}"${title}>${PlanMarkup.text(words)}</ui-label>`
    line.querySelector(":scope > .plan-id")!.after(this.fragment(` ${html}`))
  }

  ////////////////
  // ## Review inbox
  ////////////////

  /**
   * Item `id`, as `plan-doc inbox` shows it:  `{ id, kind, status, title }` (`id` upper-case), or `null` when the
   * doc has no such item.
   * - `kind`:  `PlanItem.itemKind()`'s, e.g. `judgement`
   */
  describeItem(id: string): ItemDescription | null {
    const item = this.findItem(id)
    if (!item) return null
    return {
      id: item.id.toUpperCase(),
      kind: PlanItem.itemKind(item),
      status: item.getAttribute("data-status") ?? "open",
      title: PlanItem.titleOf(item)
    }
  }

  /**
   * Question `item`'s options (`PlanItem.optionsOf()`:  an open question's option cards, an answered one's Choices
   * panels):  `[{ letter, title, recommended }]`.
   * - `title`:  the label after its letter, "(recommended)" left out:  `A · Inbox file (recommended)` -> `Inbox file`
   * - labels without a letter are skipped, and the options in its Original Discussion (`ORIGINAL`)
   */
  optionCards(item: Element): OptionCard[] {
    return PlanItem.optionsOf(item).map(({ letter, title, recommended }) => ({ letter, title, recommended }))
  }

  /**
   * Apply one mark Owen SENT from the page (`inbox.js`), when it's mechanical:  returns `{ applied: true, did }`, or
   * `{ applied: false, left }` (why it's left for Claude), plus `gone: true` for an item the doc no longer has (the
   * caller drops its mark).
   * - `approve`:
   *   - an open question:  answered with its recommended option (`decide()`, that card chosen), and reviewed;  no
   *     card marked "(recommended)":  left, "needs talk"
   *   - an open judgement call:  closed (accepted);  an open test:  closed (it passed);  both reviewed
   *   - anything else (an open caveat, issue or todo;  a closed or answered item):  reviewed
   * - `pick`:  the question answered with that option card (its title the answer), and reviewed
   * - `todo`:  a new todo, "Follow up:  <title>", linking back;  the item reviewed
   * - `revisit` soon:  left, for Claude to talk over in the chat;  `details`, revisit `now`:  left, an agent's
   *   (`plan-doc inbox done`)
   *   - a revisit carrying a `pick` ("pick B, but ..."):  left too, NOT answered:  the note may change the pick
   *     (`picks B · <card title>, asks:  "<note>"`)
   * - an applied mark adds ONE log line (`J9 approved:  closed (accepted)`);  the methods it calls stamp the item
   */
  applyMark(mark: PlanMark): MarkResult {
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
   * Record on `item` how Owen's review mark was handled (`data-review-as`:  `approve`, `todo`, `revisit`), once
   * Claude applied it or talked it over:  the inbox forgets the mark, the doc keeps it, and the page keeps that
   * review button coloured after a reload (epic `windows-and-review` P2, Q8).  A pick counts as approve (decided).
   */
  reviewedAs(item: Element, action: string): void {
    item.setAttribute("data-review-as", action)
  }

  /** `applyMark()`'s work on `item`, the log line aside. */
  applyAction(item: Element, { action, pick, when, note }: PlanMark): MarkResult {
    const kind = PlanItem.itemKind(item)
    const open = item.getAttribute("data-status") === "open"
    switch (action) {
      case "approve": {
        if (kind === "question" && open) {
          const option = this.optionCards(item).find((card) => card.recommended)
          if (!option) return { applied: false, left: "needs talk:  no option is marked (recommended)" }
          this.answerWith(item, option)
          return { applied: true, did: `approved:  answered ${option.letter} · ${option.title} (recommended)` }
        }
        if (open && (kind === "judgement" || kind === "test")) {
          this.setItem(item.id, "done")
          this.review(item.id)
          return { applied: true, did: `approved:  closed (${kind === "test" ? "passed" : "accepted"})` }
        }
        this.review(item.id)
        return { applied: true, did: "approved:  reviewed" }
      }
      case "pick": {
        if (kind !== "question") return { applied: false, left: `not a question:  can't pick ${pick}` }
        const option = this.optionCards(item).find((card) => card.letter === pick)
        if (!option) return { applied: false, left: `no option ${pick}` }
        this.answerWith(item, option)
        return { applied: true, did: `picked ${option.letter}:  ${option.title}` }
      }
      case "todo": {
        const id = item.id.toUpperCase()
        const title = PlanItem.titleOf(item)
        // Owen's note (Make Todo's box, epic `windows-and-review` P2) goes in as his words
        const said = note ? `<p><b>Owen:</b>  ${PlanMarkup.text(note)}</p>` : ""
        const details = `<p>From <a href="#${item.id}">${id}</a> (${kind}), marked "Make Todo" on the page:  ${PlanMarkup.text(title)}</p>${said}`
        const todo = this.addItem("todo", `Follow up:  ${title}`, { details })
        this.review(item.id)
        return { applied: true, did: `to todo ${todo.toUpperCase()}` }
      }
      case "revisit": {
        if (when === "now") return { applied: false, left: "revisit now:  an agent's (`inbox done` once answered)" }
        if (!pick) return { applied: false, left: `to talk over${note ? `:  "${note}"` : ""}` }
        // "pick B, but ...":  never applied, the remark may change the pick
        const option = this.optionCards(item).find((card) => card.letter === pick)
        return { applied: false, left: `to talk over:  ${PlanItem.pickAsks(pick, option, note)}` }
      }
      case "details":
        return { applied: false, left: "Add Details:  an agent's (`inbox done` once written)" }
      default:
        return { applied: false, left: `no such action:  ${action}` }
    }
  }

  /** Answer question `item` with option card `option` (`optionCards()`'s):  `decide()`, the card chosen;  reviewed. */
  answerWith(item: Element, option: OptionCard): void {
    this.decide(item.id, option.title, { option: option.letter })
    this.review(item.id)
  }

  /**
   * Replace item `id`'s details with `html`, or (`append`) add `html` after them;  returns its title.
   * - for Claude's background agents during `/epic review`:  fuller details (Add Details), or a reply to Owen's
   *   revisit note (a `div.plan-reply`, appended)
   * - the answer card (`.plan-answer-block`), the Original Discussion (`ORIGINAL`) and the commits (`.plan-commits`)
   *   stay;  appended HTML goes before the Original Discussion and the commits (after the answer card, on an
   *   answered question:  a reply comes after the answer)
   * - replacing NEVER drops the text it replaces (Owen, 2026-10-04):  it moves into the item's Original Discussion
   *   (`keepOriginal()`);  appending moves nothing
   * - replacing an ANSWERED question's text:  the new HTML is the question's, before its answer card, laid out again
   *   (`layoutAnswer()`:  its option cards become the Choices);  the option chosen before stays chosen when the new
   *   options still have its letter
   * - an item without details gets a panel (`detailsOf()`);  stamped (`data-changed`) and flagged UPDATE
   */
  setDetails(id: string, html: string, { append = false }: { append?: boolean } = {}): string {
    const item = this.item(id)
    const content = this.detailsOf(item)
    const answer = content.querySelector(":scope > .plan-answer-block")
    const kept: Node[] = [
      answer,
      content.querySelector(":scope > .plan-commits"),
      content.querySelector(`:scope > ${ORIGINAL}`)
    ].filter((node) => node !== null)
    const fragment = this.fragment(html)
    if (!append) {
      const chosen =
        answer && PlanItem.optionsOf(item).find((option) => option.holder.hasAttribute("data-chosen"))?.letter
      const replaced = Array.from(content.childNodes).filter((node) => !kept.includes(node))
      for (const node of replaced) node.remove()
      this.keepOriginal(item, replaced)
      if (answer) {
        answer.before(fragment)
        this.layoutAnswer(item)
        if (chosen && PlanItem.optionsOf(item).some((option) => option.letter === chosen))
          this.chooseOption(item, chosen)
      }
    }
    const next = content.querySelector(`:scope > ${ORIGINAL}, :scope > .plan-commits`)
    if (append || !answer) {
      if (next) next.before(fragment)
      else content.append(fragment)
    }
    this.stamp(item)
    this.markUpdate(item)
    return PlanItem.titleOf(item)
  }

  /**
   * Add Details (`details --more`):  item `id`'s text stays on top, labelled "Original Reply", and `html` goes under
   * it in a "More Details" card, open and foldable (`MORE`);  returns its title.
   * - the item's text:  what its details hold but the answer card, Choices, replies, More Details, Original
   *   Discussion and commits;  wrapped ONCE in `FIRST` (an answered question's `QUESTION` is labelled already)
   * - the card goes after the text and the answer card, before replies, the Original Discussion and the commits
   * - a second Add Details replaces the card:  the old card's text moves into the Original Discussion
   *   (`keepOriginal()`), as a rewrite's does
   * - an item without details gets a panel (`detailsOf()`);  stamped (`data-changed`) and flagged UPDATE
   */
  addMore(id: string, html: string): string {
    const item = this.item(id)
    const content = this.detailsOf(item)
    const old = content.querySelector(`:scope > ${MORE}`)
    if (old) {
      const oldContent = old.querySelector(":scope > ui-content")
      old.remove()
      this.keepOriginal(item, Array.from(oldContent?.childNodes ?? []))
    }
    const apart = `.plan-answer-block, ${CHOICES}, ${QUESTION}, ${FIRST}, .plan-reply, ${ORIGINAL}, .plan-commits`
    const loose = Array.from(content.childNodes).filter((node) =>
      PlanMarkup.isElement(node) ? !node.matches(apart) : node.nodeType === 3 && Boolean(node.textContent?.trim())
    )
    if (loose.length) {
      const first = this.element("div", { class: "plan-first" })
      loose[0].before(first)
      first.append(...loose)
      PlanMarkup.trimWhitespace(first)
    }
    const card = this.element("ui-accordion", { class: "plan-more", styled: "", open: "0" })
    card.innerHTML = `<ui-title>${MORE_TITLE}</ui-title><ui-content></ui-content>`
    card.querySelector("ui-content")!.append(this.fragment(html))
    const next = content.querySelector(`:scope > :is(.plan-reply, ${ORIGINAL}, .plan-commits)`)
    if (next) next.before(card)
    else content.append(card)
    this.stamp(item)
    this.markUpdate(item)
    return PlanItem.titleOf(item)
  }

  /**
   * Keep Owen's note -- `mark.note`, a mark Claude took and is clearing (`inbox done | clear`) -- in item `id`, as his
   * own reply card:  `div.plan-reply.plan-reply-owen`, "Owen · 2026-10-06 10:42 · revisit soon", then the note.
   * - placed before the first reply dated at or after the note (Claude's answer to it), else where an appended
   *   reply goes (before the Original Discussion and the commits)
   * - a card with the same time and note already there:  nothing (`done` after `clear`, a retry)
   * - stamped (`data-changed`);  no UPDATE flag:  nothing about the item changed but the record
   */
  keepNote(id: string, { note, action, when, at }: KeptNote): void {
    const item = this.item(id)
    const content = this.detailsOf(item)
    const stamp = PlanTime.clockTime(at ? new Date(at) : this.now)
    const replies = Array.from(content.querySelectorAll(":scope > .plan-reply"))
    if (replies.some(isSame)) return
    const how = action === "revisit" ? `revisit ${when === "now" ? "now" : "soon"}` : action
    const card = this.fragment(
      `<div class="plan-reply plan-reply-owen"><div class="plan-reply-title"><b>Owen</b> · <time>${PlanMarkup.text(stamp)}</time>` +
        ` · ${PlanMarkup.text(how)}</div><p>${PlanMarkup.text(note)}</p></div>`
    )
    const next =
      replies.find((reply) => (reply.querySelector("time")?.textContent ?? "") >= stamp) ??
      content.querySelector(`:scope > ${ORIGINAL}, :scope > .plan-commits`)
    if (next) next.before(card)
    else content.append(card)
    this.stamp(item)

    /** Is `reply` this note's card already:  Owen's, at the same time, saying the same? */
    function isSame(reply: Element): boolean {
      return (
        reply.classList.contains("plan-reply-owen") &&
        reply.querySelector("time")?.textContent === stamp &&
        reply.querySelector(":scope > p")?.textContent === note
      )
    }
  }

  /**
   * Keep `nodes` -- item `item`'s text being replaced, already out of the doc -- in its Original Discussion
   * (`ORIGINAL`), made when it has none;  returns `"added"`, `"unchanged"` (a version saying the same is there) or
   * `"empty"` (nothing but whitespace:  no section).
   * - a new `div.plan-version`:  undated while it's the first (as first written);  else dated `asOf` (default now,
   *   `YYYY-MM-DD HH:MM`) under an h5, in date order, and the undated first one gets "As first written"
   * - ids inside renamed (`PlanItem.stripIds()`);  the section goes before the commits, else last
   */
  keepOriginal(item: Element, nodes: Node[], { asOf }: OriginalOptions = {}): OriginalResult {
    if (!nodes.some((node) => node.nodeType === 1 || node.textContent?.trim())) return "empty"
    const content = this.detailsOf(item)
    let original = content.querySelector(`:scope > ${ORIGINAL}`)
    const versions = Array.from(original?.querySelectorAll(":scope > ui-content > .plan-version") ?? [])
    const when = asOf ?? PlanTime.clockTime(this.now)
    const dated = versions.length > 0 || asOf !== undefined
    const version = this.element("div", { class: "plan-version", ...(dated ? { "data-as-of": when } : {}) })
    version.append(...nodes)
    PlanMarkup.trimWhitespace(version)
    PlanItem.stripIds(version)
    if (versions.some((other) => PlanMarkup.bare(PlanItem.versionBody(other)) === PlanMarkup.bare(version.innerHTML)))
      return "unchanged"
    if (dated) version.prepend(this.fragment(`<h5>As of ${PlanMarkup.text(when)}</h5>`))
    if (!original) {
      original = this.element("ui-accordion", { class: "spell-aside plan-original", styled: "" })
      original.innerHTML = `<ui-title>${ORIGINAL_TITLE}</ui-title><ui-content></ui-content>`
      const commits = content.querySelector(":scope > .plan-commits")
      if (commits) commits.before(original)
      else content.append(original)
    }
    // oldest first:  the undated first version never sorts after a date
    const later = versions.find((other) => (other.getAttribute("data-as-of") ?? "") > when)
    if (later) later.before(version)
    else original.querySelector(":scope > ui-content")!.append(version)
    const first = original.querySelector(":scope > ui-content > .plan-version")!
    if (first !== version && !first.hasAttribute("data-as-of") && !first.querySelector(":scope > h5"))
      first.prepend(this.fragment("<h5>As first written</h5>"))
    return "added"
  }

  /**
   * Put `html` -- item `id`'s earlier text, e.g. recovered from git -- into its Original Discussion, as
   * `keepOriginal()` keeps replaced text;  returns `"added"`, `"unchanged"` or `"empty"`.
   * - `asOf`:  when that text was replaced, `YYYY-MM-DD HH:MM`;  none:  as first written while the item has no
   *   Original Discussion, else now
   * - left out of `html`:  commits (the item keeps its own), and an answer card that says what the item's says
   * - an Original Discussion inside `html`:  each of its versions kept on its own, with its date
   * - NOT stamped or flagged UPDATE:  restoring history doesn't make an item recent
   */
  restoreOriginal(id: string, html: string, { asOf }: OriginalOptions = {}): OriginalResult {
    const item = this.item(id)
    const fragment = this.fragment(html)
    const answer = item.querySelector(":scope > ui-accordion > ui-content > .plan-answer-block")
    let result: OriginalResult = "empty"
    for (const nested of Array.from(fragment.querySelectorAll(ORIGINAL))) {
      nested.remove()
      for (const version of nested.querySelectorAll(":scope > ui-content > .plan-version")) {
        version.querySelector(":scope > h5")?.remove()
        const when = version.getAttribute("data-as-of") ?? undefined
        result = merge(result, this.keepOriginal(item, Array.from(version.childNodes), { asOf: when }))
      }
    }
    for (const node of Array.from(fragment.children)) {
      const sameAnswer =
        node.matches(".plan-answer-block") &&
        answer &&
        PlanMarkup.bare(node.textContent ?? "") === PlanMarkup.bare(answer.textContent ?? "")
      if (node.matches(".plan-commits") || sameAnswer) node.remove()
    }
    return merge(result, this.keepOriginal(item, Array.from(fragment.childNodes), { asOf }))

    /** The stronger of two results:  added, else unchanged, else empty. */
    function merge(a: OriginalResult, b: OriginalResult): OriginalResult {
      return [a, b].includes("added") ? "added" : [a, b].includes("unchanged") ? "unchanged" : "empty"
    }
  }

  ////////////////
  // ## States
  ////////////////

  /**
   * The whole-doc pass every edit ends with (the command line's `edit()`;  `migrate()` too):  one item's change can
   * change others' standing, so everything is worked out again;  returns how many things it changed.
   * - `<body data-recent-since>`:  from `recentSince` when it was passed in
   * - each item's `data-state` (`itemState()`):  what the page colors its id badge by
   * - each review label's color (`PlanItem.reviewLabelColor()`)
   * - each phase's "To review" line (`updateToReview()`)
   * - the "Plan changes" list atop the phases (`updatePlanChanges()`)
   */
  updateStates(): number {
    let changed = 0
    const body = this.document.body
    if (body && this.recentSince !== undefined) {
      const before = body.getAttribute("data-recent-since")
      if (this.recentSince) body.setAttribute("data-recent-since", this.recentSince)
      else body.removeAttribute("data-recent-since")
      if (before !== body.getAttribute("data-recent-since")) changed++
    }
    for (const item of this.document.querySelectorAll(".plan-items > [id]")) {
      const state = this.itemState(item)
      if (item.getAttribute("data-state") !== state) {
        item.setAttribute("data-state", state)
        changed++
      }
      const label = item.querySelector(":scope > .plan-review, :scope > ui-accordion > ui-title > .plan-review")
      if (!label) continue
      const color = PlanItem.reviewLabelColor((label.textContent ?? "").trim(), state)
      if (label.getAttribute("color") !== color) {
        label.setAttribute("color", color)
        changed++
      }
    }
    for (const section of this.phaseSections) if (this.updateToReview(section)) changed++
    if (this.updatePlanChanges()) changed++
    return changed
  }

  /**
   * Item `item`'s (an element) standing, the `data-state` the page colors it by (`STATE_COLORS`):
   * - closed (`CLOSED`, an old doc's `d7`):  `recent` when changed since `<body data-recent-since>` or
   *   during a `/bedtime` run (`data-bedtime`), else `old`
   * - work under way (`data-queued`, `data-working`):  `progress`
   * - waiting on Owen:  `attention`:  an open question;  an open judgement call or issue not reviewed
   * - else `recent` when reviewed recently (green, then blue) or touched by a `/bedtime` run;  else `open`
   */
  itemState(item: Element): ItemState {
    const status = item.getAttribute("data-status") ?? "open"
    const since = Date.parse(this.document.body?.getAttribute("data-recent-since") ?? "")
    const changed = Date.parse(item.getAttribute("data-changed") ?? "")
    const bedtime = item.hasAttribute("data-bedtime")
    const recent = bedtime || (changed >= since && !Number.isNaN(since))
    if (CLOSED.has(status) || OLD_DECISION.test(item.id)) return recent ? "recent" : "old"
    if (item.hasAttribute("data-queued") || item.hasAttribute("data-working")) return "progress"
    if (/^q\d+$/.test(item.id)) return "attention"
    if (/^[ij]\d+$/.test(item.id) && !item.hasAttribute("data-reviewed")) return "attention"
    if (recent && (bedtime || item.hasAttribute("data-reviewed"))) return "recent"
    return "open"
  }

  /**
   * Phase `section`'s "To review" line, last in its body:  its items (`data-phase=N`) still open and not reviewed,
   * not under way, in page order;  none:  no line.  Changed?
   * - `<ui-item icon="list check" class="plan-to-review"><b>To review:</b>  <a href="#i3">I3</a>, ...</ui-item>`
   *   (an old `ul` body:  an `li`)
   * - an old doc's hand-written "Judgement calls:" line stays (J14 of `review-review`):  this goes after it
   */
  updateToReview(section: Element): boolean {
    const body = section.querySelector(":scope > .plan-phase-body")
    if (!body) return false
    const n = section.getAttribute("data-phase")
    const old = body.querySelector(":scope > .plan-to-review")
    const items = Array.from(this.document.querySelectorAll(`.plan-items > [data-phase="${n}"]`)).filter((item) => {
      const status = item.getAttribute("data-status") ?? "open"
      if (CLOSED.has(status) || OLD_DECISION.test(item.id)) return false
      return !["data-reviewed", "data-queued", "data-working"].some((mark) => item.hasAttribute(mark))
    })
    const links = items.map((item) => `<a href="#${item.id}">${item.id.toUpperCase()}</a>`).join(", ")
    const html = `<b>To review:</b>  ${links}`
    if (!items.length) {
      old?.remove()
      return Boolean(old)
    }
    // as oxfmt left it:  only the whitespace may differ
    if (old && PlanMarkup.squeeze(old.innerHTML) === PlanMarkup.squeeze(html) && !old.nextElementSibling) return false
    old?.remove()
    const tag = body.localName === "ul" ? "li" : "ui-item"
    const line = this.element(tag, { ...(tag === "ui-item" ? { icon: "list check" } : {}), class: "plan-to-review" })
    line.innerHTML = html
    body.append(line)
    return true
  }

  ////////////////
  // ## Commits
  ////////////////

  /**
   * List commit `sha` (full) under phase `phase` or item `item` (an id), with `sentence`;  replaces the entry
   * already there for it.  Returns `"added"` or `"replaced"`.
   * - `base`:  the repo's GitHub page (`https://github.com/spell-app/spell-app`):  the short sha links to the
   *   commit there;  `null`:  plain `<code>`
   * - a phase:  a "Commits" field in its body, after Done (else Goal);  an item:  a "Commits" block at the end of its
   *   details (`detailsOf()`, which gives it a panel when it has none)
   * - each entry:  `<li data-sha><a class="plan-commit" href target="github">abc1234</a>  sentence</li>`, oldest
   *   first
   */
  addCommit(
    { phase, item }: CommitTarget,
    sha: string,
    sentence: string,
    { base = null }: CommitOptions = {}
  ): "added" | "replaced" {
    const list = phase !== undefined ? this.phaseCommitList(phase) : this.itemCommitList(item!)
    const entry = this.fragment(PlanCommits.commitEntry(sha, sentence, base)).firstElementChild!
    const old = PlanCommits.findCommit(list, sha)
    if (old) {
      old.replaceWith(entry)
      return "replaced"
    }
    list.append(entry)
    return "added"
  }

  /** Is commit `sha` listed under phase `phase` / item `item` already? */
  hasCommit({ phase, item }: CommitTarget, sha: string): boolean {
    const where = phase !== undefined ? this.phaseSection(phase) : this.item(item!)
    const list = where.querySelector(".plan-commits > .plan-commit-list")
    return Boolean(list && PlanCommits.findCommit(list, sha))
  }

  /**
   * Fill in commits from the doc's git history:  `log` is `{ sha, subject }`s, newest first (`git log`);  returns
   * what it added, `{ sha, phase }` / `{ sha, item }`, oldest first.
   * - subjects `PlanCommits.parseCommitSubject()` reads:  phase commits (`P3:  Name -- summary`) and item fixes
   *   (`Fix I3:  ...`)
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

  /** Does the doc have item `id` (any case;  a migrated `d7` too:  `findItem()`)? */
  hasItem(id: string): boolean {
    return Boolean(this.findItem(id))
  }

  /**
   * Phase `n`'s commit list, its "Commits" field made when there's none, in its place (`FIELD_ORDER`).
   * - `<ui-item icon="code branch" class="plan-commits"><b>Commits:</b>  <ul class="plan-commit-list">`;  an old
   *   `ul` body:  an `li`
   */
  phaseCommitList(n: number): Element {
    const body = this.phaseSection(n).querySelector(":scope > .plan-phase-body")
    if (!body) throw new PlanDocError(`phase ${n} has no body (\`.plan-phase-body\`)`)
    const found = body.querySelector(":scope > .plan-commits > .plan-commit-list")
    if (found) return found
    const tag = body.localName === "ul" ? "li" : "ui-item"
    const field = this.element(tag, { ...(tag === "ui-item" ? { icon: "code branch" } : {}), class: "plan-commits" })
    field.innerHTML = `<b>Commits:</b>  <ul class="plan-commit-list"></ul>`
    PlanSections.insertField(body, "Commits", field)
    return field.querySelector(".plan-commit-list")!
  }

  /**
   * Item `id`'s commit list, at the end of its details:  `<div class="plan-commits"><b>Commits:</b>  <ul
   * class="plan-commit-list">`, made when there's none.
   */
  itemCommitList(id: string): Element {
    const content = this.detailsOf(this.item(id))
    const found = content.querySelector(":scope > .plan-commits > .plan-commit-list")
    if (found) return found
    const block = this.element("div", { class: "plan-commits" })
    block.innerHTML = `<b>Commits:</b>  <ul class="plan-commit-list"></ul>`
    content.append(block)
    return block.querySelector(".plan-commit-list")!
  }

  ////////////////
  // ## Log, stamps, summary
  ////////////////

  /**
   * Add a line to the log, stamped with the local date and time.
   * - the log is a `<ui-feed class="plan-log">` of events;  docs made before 2026-10-01 have a `<ul>`
   */
  log(line: string): void {
    const list = this.require(".plan-log")
    if (list.localName === "ui-feed") {
      const event = this.element("ui-event", { icon: "pen to square" })
      event.innerHTML = `<ui-content><ui-summary><ui-date>${PlanTime.timeTag(this.now)}</ui-date> ${PlanMarkup.text(line)}</ui-summary></ui-content>`
      list.append(event)
      return
    }
    const li = this.element("li")
    li.innerHTML = `${PlanTime.timeTag(this.now)} ${PlanMarkup.text(line)}`
    list.append(li)
  }

  /** Stamp "updated" with today. */
  touch(): void {
    const updated = this.document.getElementById("plan-updated")
    if (updated) updated.textContent = this.today
  }

  /**
   * What needs attention:  the phases, the next one to do, and the open questions / issues / caveats / todos.
   * - feeds the end-of-phase reply and its AskUserQuestion options
   */
  summary(): PlanSummary {
    const phases = this.phases
    const open = Object.fromEntries(
      // `findList()`:  a doc not yet migrated still reads, as `/epics` reads every plan doc
      OPEN_KINDS.map((kind) => [kind, this.items(kind, this.findList(kind)).filter((item) => item.status === "open")])
    ) as Record<OpenKind, ItemSummary[]>
    return {
      title: this.title,
      phases,
      active: phases.find((phase) => phase.status === "active"),
      next: phases.find((phase) => phase.status === "todo"),
      estimate: this.document
        .querySelector("p.plan-estimate")
        ?.textContent?.replace(/^Estimate:\s*/, "")
        .trim(),
      bedtime: this.bedtimeRun,
      future: this.future,
      open
    }
  }

  ////////////////
  // ## Future epics
  ////////////////

  /**
   * Is this a FUTURE epic (`/epic future <name>`, epic `epic-future`):  an idea written down, not planned yet?
   * `<body data-future>`:  no worktree, no phases;  its analysis page (`details/analysis.html`) holds the high-level
   * open questions.  The first phase added (`addPhase()`), or `new` again (`promote()`), makes it an ordinary epic.
   */
  get future(): boolean {
    return Boolean(this.document.body?.hasAttribute("data-future"))
  }

  /**
   * Make this new doc a future epic:  `<body data-future>`, the "Future epic" notice in place of "Plan hung?" (`HUNG`:
   * there's no plan to hang), and meta lines that say there's no branch or worktree yet.
   */
  makeFuture(name: string): void {
    this.document.body.setAttribute("data-future", "")
    const notice = this.fragment(
      `<ui-message class="plan-future" state="info" size="small" header="Future epic:  not planned yet">` +
        `<p>No worktree, no phases yet.  Its high-level open questions are on its ` +
        `<a href="details/analysis.html">analysis page</a>, answered in the side bar's Review tab;  the answers land ` +
        `here as decided questions.  <code>/epic ${PlanMarkup.text(name)}</code> plans it, from the kickoff prompt and those ` +
        `answers.</p></ui-message>`
    ).firstElementChild!
    const hung = this.document.querySelector(HUNG)
    if (hung) hung.replaceWith(notice)
    else this.document.querySelector("ui-list.plan-meta")?.after(notice)
    this.setMeta({ branch: null, worktree: null })
    this.updateStep()
  }

  /**
   * A future epic, planned at last (`/epic <name>` reusing it):  an ordinary epic;  the notice goes, the meta lines
   * name `branch` and `worktree`.  Returns whether it was a future one.
   */
  promote({ branch, worktree }: { branch: string | null; worktree: string | null }): boolean {
    if (!this.future) return false
    this.document.body.removeAttribute("data-future")
    this.document.querySelector("ui-message.plan-future")?.remove()
    this.setMeta({ branch, worktree })
    this.updateStep()
    this.log("planned:  no longer a future epic")
    return true
  }

  /** The meta lines' branch and worktree (`null`:  none yet, a future epic). */
  setMeta({ branch, worktree }: { branch: string | null; worktree: string | null }): void {
    const name = this.document.body.getAttribute("data-plan") ?? ""
    const lines = this.document.querySelector("ui-list.plan-meta")
    const branchLine = lines?.querySelector(':scope > ui-item[icon="code branch"]')
    const folderLine = lines?.querySelector(':scope > ui-item[icon="folder"]')
    if (branchLine)
      branchLine.innerHTML = branch
        ? `Plan doc for <code>/epic ${PlanMarkup.text(name)}</code>, branch <code>${PlanMarkup.text(branch)}</code>`
        : `Future epic:  <code>/epic future ${PlanMarkup.text(name)}</code>, no branch yet`
    if (folderLine)
      folderLine.innerHTML = worktree ? `Worktree:  <code>${PlanMarkup.text(worktree)}</code>` : "Worktree:  none yet"
  }

  ////////////////
  // ## Bedtime
  ////////////////

  /**
   * The phases a `/bedtime` run is on (`P3-P6`), from `<body data-bedtime>`;  `null` when none is.
   * - how a compacted session knows it's still in bedtime mode (`summary().bedtime`)
   * - NOTE:  no report section any more (D5 of `review-review`):  the night's judgement calls and issues show red
   *   in their own sections, each phase its Done list and Commits
   */
  get bedtimeRun(): string | null {
    return this.document.body?.getAttribute("data-bedtime") || null
  }

  /** A `/bedtime` run starts:  bedtime mode on, `phases` (`P3-P6`) what it runs. */
  startBedtime(phases: string): void {
    this.document.body.setAttribute("data-bedtime", phases)
  }

  /** The run is over:  bedtime mode off;  was it on? */
  finishBedtime(): boolean {
    const was = this.bedtime
    this.document.body?.removeAttribute("data-bedtime")
    return was
  }

  /**
   * Remove an older doc's `#overnight` section;  was there one?
   * - `/bedtime` wrote a report section on top of the doc until 2026-10-05 (D5 of `review-review` dropped it);
   *   a doc that still has one keeps it until Owen has read it and runs `overnight <name> remove`
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
   * Set the prompt that started the plan:  a `blockquote.plan-prompt` near the top of the Overview, one `<p>` per
   * paragraph (blank lines split them, single newlines become `<br>`).  Replaces any earlier one;  "" removes it.
   * - folded away in an aside titled "Kickoff prompt" (`ui-accordion.plan-prompt-panel`):  the doc's history, not
   *   what a reader comes for;  a bare quote (docs before 2026-10-04) moves into one (`foldPrompt()`)
   * - the "Plan hung?" notice's copy of it too (`setHungPrompt()`)
   */
  setPrompt(prompt: string | null | undefined): void {
    this.setHungPrompt(prompt)
    const quote = this.document.querySelector("blockquote.plan-prompt")
    const html = PlanSections.promptHTML(prompt)
    if (!html) {
      ;(quote?.closest(".plan-prompt-panel") ?? quote)?.remove()
      return
    }
    if (quote) {
      quote.innerHTML = html
      this.foldPrompt()
      return
    }
    const panel = this.fragment(PlanSections.promptPanel(html)).firstElementChild!
    const overview = this.section("overview")
    const summary = overview.querySelector(":scope > .plan-summary")
    if (summary) summary.after(panel)
    else PlanSections.prependContent(overview, panel)
  }

  /**
   * A bare `blockquote.plan-prompt` (docs before 2026-10-04) into the folded "Kickoff prompt" aside, where it
   * stood;  moved?
   */
  foldPrompt(): boolean {
    const quote = this.document.querySelector("blockquote.plan-prompt")
    if (!quote || quote.closest(".plan-prompt-panel")) return false
    const panel = this.fragment(PlanSections.promptPanel("")).firstElementChild!
    quote.replaceWith(panel)
    panel.querySelector("blockquote.plan-prompt")!.replaceWith(quote)
    return true
  }

  /**
   * The "Plan hung?" notice's copy of the kickoff prompt:  a `ui-code` with a copy button, so a restart can paste
   * it back.  "" (or no notice:  planning is over) removes it.
   * - the text exact, in a `<script type="text/plain">`;  NOTE:  `</script` in it is written `<\/script`
   */
  setHungPrompt(prompt: string | null | undefined): void {
    const notice = this.document.querySelector(HUNG)
    notice?.querySelector("ui-code.plan-hung-prompt")?.remove()
    const trimmed = (prompt ?? "").trim()
    if (!notice || !trimmed) return
    const code = this.element("ui-code", { class: "plan-hung-prompt", language: "text", wrap: "", copy: "" })
    const script = this.element("script", { type: "text/plain" })
    script.textContent = trimmed.replace(/<\/script/gi, "<\\/script")
    code.append(script)
    ;(notice.querySelector(":scope > ui-content") ?? notice).append(code)
  }

  /**
   * An old "Plan hung?" notice (`ui-message.plan-hung`, before P3 of `windows-and-review`) into the folded one
   * (`HUNG`), its text and prompt kept;  folded?
   */
  foldHungNotice(): boolean {
    const old = this.document.querySelector("ui-message.plan-hung")
    if (!old) return false
    const notice = this.fragment(
      `<ui-accordion class="plan-hung spell-aside" styled><ui-title>Plan hung?</ui-title><ui-content></ui-content></ui-accordion>`
    ).firstElementChild!
    const content = notice.querySelector("ui-content")!
    content.append(...Array.from(old.childNodes))
    PlanMarkup.trimWhitespace(content)
    old.replaceWith(notice)
    return true
  }

  ////////////////
  // ## Layout
  ////////////////

  /**
   * Bring an older doc up to date;  returns what changed, as lines (none:  already current).  The steps:
   * `PlanMigration.migrate()`.
   */
  migrate(): string[] {
    return new PlanMigration(this).migrate()
  }

  /**
   * Sections in `SECTION_ORDER`, each title numbered by its place, the sub-numbers in it too (`3.1` -> `1.1`:  nested
   * sections' titles, h3s, h4s);  changed?
   */
  orderSections(): boolean {
    const sections = SECTION_ORDER.map((id) => PlanSections.sectionOf(this.document, id)).filter(
      (section) => section !== null
    )
    if (!sections.length) return false
    const before = sections.map((section) => section.outerHTML).join("")
    // moved only when out of order:  a move leaves the whitespace between sections behind, so each gets a newline
    const inOrder = sections.every(
      (section, index) => !index || PlanMarkup.followsInDocument(sections[index - 1], section)
    )
    if (!inOrder) {
      const anchor = this.document.createComment("sections")
      sections[0].before(anchor)
      for (const section of sections) anchor.before(this.document.createTextNode("\n"), section)
      anchor.remove()
    }
    sections.forEach((section, index) => {
      const old = PlanSections.renumber(section, /^(\s*)\d+\./, `$1${index + 1}.`)
      if (old === undefined) return
      const sub = new RegExp(`^(\\s*)${old}\\.`)
      const inner = section.localName === "ui-section" ? "ui-section, h3, h4" : "h3, h4"
      for (const heading of section.querySelectorAll(inner)) PlanSections.renumber(heading, sub, `$1${index + 1}.`)
    })
    return sections.map((section) => section.outerHTML).join("") !== before
  }

  /** The epic's title:  the h1's text without `TITLE_PREFIX`;  "" when there's no h1. */
  get title(): string {
    return PlanSections.docTitle(this.document) ?? ""
  }

  /**
   * Structural problems, as text:  duplicate ids, `#id` links to nowhere, phases without a valid status, list and
   * sections out of step.
   */
  check(): string[] {
    const problems: string[] = []
    const seen = new Map<string, number>()
    for (const el of this.document.querySelectorAll("[id]")) seen.set(el.id, (seen.get(el.id) ?? 0) + 1)
    for (const [id, count] of seen) if (count > 1) problems.push(`id "${id}" used ${count} times`)
    // a link in an Original Discussion is history:  what it pointed at may be gone (`ORIGINAL`)
    for (const a of PlanItem.current(this.document.querySelectorAll('a[href^="#"]'))) {
      const id = a.getAttribute("href")!.slice(1)
      if (id && !seen.has(id)) problems.push(`link to missing #${id} ("${(a.textContent ?? "").trim()}")`)
    }
    for (const phase of this.phases) {
      if (!isPhaseStatus(phase.status)) problems.push(`P${phase.n} has status "${phase.status}"`)
      if (!this.document.getElementById(`p${phase.n}`)) problems.push(`P${phase.n} has no heading #p${phase.n}`)
    }
    // a doc not yet migrated:  its phase list must match the sections
    const listed = this.document.querySelectorAll(".plan-phases > [data-phase]").length
    if (this.document.querySelector(".plan-phases") && listed !== this.phases.length)
      problems.push(`${listed} phases listed, ${this.phases.length} phase sections`)
    return problems
  }

  ////////////////
  // ## DOM helpers
  ////////////////

  /** The element matching `selector`;  throws if the doc doesn't have it (not a plan doc, or a broken one). */
  require(selector: string): Element {
    const found = this.document.querySelector(selector)
    if (!found) throw new PlanDocError(`no ${selector} in the doc:  is it a plan doc?`)
    return found
  }

  /** The section `id` titles (`PlanSections.sectionOf()`);  throws if the doc doesn't have it. */
  section(id: string): Element {
    const found = PlanSections.sectionOf(this.document, id)
    if (!found) throw new PlanDocError(`no section #${id} in the doc:  is it a plan doc?`)
    return found
  }

  /** New element with attributes, in order (`""`:  a bare boolean attribute). */
  element(tag: string, attributes: Record<string, string | number> = {}): Element {
    return PlanMarkup.createElement(this.document, tag, Object.entries(attributes))
  }

  /** Nodes of an HTML snippet, as a fragment to insert. */
  fragment(html: string): DocumentFragment {
    const template = this.document.createElement("template")
    template.innerHTML = html
    return template.content
  }
}
