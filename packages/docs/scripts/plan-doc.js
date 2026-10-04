/**
 * `yarn plan-doc <command> <name> ...`:  edit the structured parts of a plan doc, `epics/<name>/<name>.html`.
 * Rules, ids and markup:  `templates/epics/plan-doc.md`.  Used by the `/epic` skill and its agents.
 * - Commands:  `new`, `add-phase`, `phase`, `estimate`, `add`, `decide`, `close`, `reopen`, `commit`, `commits`,
 *   `log`, `overnight`, `prompt`, `summary`, `check`, `open`, `migrate` (`node scripts/plan-doc.js` with no command
 *   lists them).
 * - Every edit:  takes the doc's lock (parallel agents queue instead of clobbering each other), parses it with
 *   linkedom, changes it through `PlanDoc`, recolors every item (`updateStates()`), stamps "updated", writes it,
 *   then tidies it (link targets, oxfmt).
 * - `PlanDoc` is pure (a parsed document in, changes on it):  `plan-doc.test.js` drives it directly.
 * - Sections are `<ui-section>`s;  docs not yet migrated (`section.s2|s3`, cli-additions) are still read and edited
 *   as they are, so every helper here takes either markup ("Sections, either markup").
 */
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { basename, dirname, join, relative, resolve } from "node:path"
import { pathToFileURL } from "node:url"

import { parseHTML } from "linkedom"

import { SRV } from "$/server"

import { DOCS, openInVSCode, serialize, tidy } from "./pages.js"
import { findEvidence, sessionsOf } from "./review-backfill.js"
import { convertSections, createElement } from "./to-ui-section.js"

/** The template `new` copies, relative to `DOCS`. */
const TEMPLATE = "templates/epics/plan.html"

/** What a plan doc's h1 and `<title>` start with, before its title:  `Epic: Review Review`. */
export const TITLE_PREFIX = "Epic: "

/** Phase status -> its icon and color (UI's `color` attribute, so themes and dark mode just work). */
export const STATUS = {
  todo: { icon: "circle outline", color: "grey" },
  active: { icon: "circle half stroke", color: "orange" },
  done: { icon: "circle check", color: "green" }
}

/**
 * Item kind -> its id prefix (`c3`), the list it lives in (`.plan-items[data-kind=list]`) and its status while it
 * counts:  a question waits (`open`), an answered one is in force (`decided`) -- only `open` items are "open" in the
 * section's count.
 * - questions and decisions are ONE kind of item since 2026-10-04 (D13):  a decision is an answered question, so
 *   `decision` makes a question born answered (`q` id, `decided`).  The list is still
 *   `.plan-items[data-kind="decision"]`, in `#decisions` ("Questions").
 * - docs from before keep their `D` items (`d7`) and struck question + decision pairs until P4 of `review-review`
 *   migrates them:  readers take both (`OLD_DECISION`)
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
}

/** An old doc's decision id (`d7`):  a decision kept apart from its question, before D13 (2026-10-04). */
const OLD_DECISION = /^d\d+$/

/**
 * An item's `data-state` (`updateStates()`) -> its color, as UI's `color` attribute:  what the page paints its id
 * badge with, and the review picker its state icon (`pickerState()`).
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
}

/**
 * The sections `/epic review` walks, in page order:  the kind and what Owen calls it.
 * - Questions:  the `Q` items in "Questions", open and answered;  never an old doc's `D` items
 */
const REVIEW_SECTIONS = [
  { kind: "question", label: "Questions" },
  { kind: "judgement", label: "Judgement calls" },
  { kind: "caveat", label: "Caveats" },
  { kind: "todo", label: "Todos" },
  { kind: "issue", label: "Issues" },
  { kind: "test", label: "To test" }
]

/**
 * `reviewSections()`'s filters, by name:  which items (`reviewItem()`s) a review list shows.
 * - `unreviewed`:  what a review hasn't gone through:  outstanding, or deferred
 */
const REVIEW_FILTERS = {
  unreviewed: (item) => item.state === "outstanding" || item.state === "deferred",
  open: (item) => item.status === "open",
  reviewed: (item) => item.state === "reviewed" || item.state === "queued",
  queued: (item) => item.state === "queued",
  all: () => true
}

/**
 * Kinds `summary` reports while open, in the order a reader should act on them.
 * - `judgement`:  a choice Claude made without Owen (a `/bedtime` run, an agent mid-phase);  open until he reviews
 *   it, then `close`d (accepted), or turned into a question.
 */
const OPEN_KINDS = ["question", "judgement", "issue", "caveat", "todo", "test"]

/**
 * The sections, in page order, by id (the `<ui-section>`'s, or an old doc's h2's):  `migrate` puts an older doc's
 * sections in this order and renumbers their titles.
 * - `#plan` (summary + phase list) was dropped on 2026-10-01
 * - `#questions` merged into `#decisions` the same day:  "Questions & Decisions", just "Questions" since D13
 */
const SECTION_ORDER = ["overview", "phases", "decisions", "judgements", "caveats", "todos", "issues", "tests", "log"]

/** Each section's icon, by its id (the template's):  `migrate` gives one to a section that has none. */
const SECTION_ICONS = {
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
const OLD_SECTION_ICONS = {
  decisions: "gavel",
  judgements: "compass"
}

/** The note under "To test" (the template's, which `addTestsSection()` writes into older docs). */
const TESTS_NOTE =
  "What to check by hand before merging:  each a step, and what should happen.  Struck through once it passes."

/** Phase sections, either markup:  `<ui-section data-phase>` in `#phases`, or `section[data-phase]` (old). */
const PHASE_SECTIONS = "ui-section#phases ui-section[data-phase], #phases-section section[data-phase]"

/** `#decisions`' note, "Questions" (the template's `data-tip`, which `migrate` writes into older docs). */
const DECISIONS_NOTE =
  "Open questions first: waiting on you, each also asked in Claude Code. Then the answered ones, each with its " +
  "answer: settled, don't re-argue without new facts."

/** The notes "Questions & Decisions" had (2026-10-01 to 2026-10-04):  `migrate` replaces one with `DECISIONS_NOTE`. */
const OLD_DECISIONS_NOTES = [
  "Open questions first: waiting on you, each also asked in Claude Code. Then what was decided, and why: settled, " +
    "don't re-argue without new facts. An answered question sits just above its decision."
]

/** The `#judgements` section as the template has it:  `migrate` adds it to older docs (`addJudgements()`). */
const JUDGEMENTS_SECTION = `<ui-section id="judgements" header="4. Judgement calls" sticky collapsible dividing>
          <ui-icon slot="icon" name="gavel"></ui-icon>
          <p class="meta">
            Choices made without you (a bedtime run, an agent mid-phase):  what was chosen, over what, and why.
            Open until you review it;  struck = accepted.  Disagree:  say so, and it becomes a question.
          </p>
          <ui-list class="plan-items" data-kind="judgement" divided relaxed></ui-list>
        </ui-section>`

/**
 * A phase body's fields:  label and icon.
 * - `Estimate`:  wall-clock time for Claude to do the phase, agents included, Owen's review not;  `30m`, `2h`,
 *   `1h30m`, `1-2h`.  The Overview totals them (`updateEstimate()`).
 */
const PHASE_FIELDS = [
  ["Goal", "bullseye"],
  ["Files", "folder"],
  ["Verify", "flask"],
  ["Estimate", "clock"]
]

////////////////
// ## PlanDoc
////////////////

/****************
 * ### `PlanDoc`
 * A parsed plan doc and the edits `plan-doc.js` makes to it.  Pure:  no files, no clock unless passed one.
 ****************/
export class PlanDoc {
  /**
   * - `document`:  linkedom (or browser) document of the plan doc
   * - `now`:  when edits happen (a `Date`):  the log's timestamps, the items' change stamps and the "updated" date,
   *   in LOCAL time
   * - `recentSince`:  the commit time (ISO) of `HEAD~2` in the doc's checkout, which `updateStates()` writes to
   *   `<body data-recent-since>`:  an item changed since then is "recent" (D2).  `null`:  no git history, so the
   *   attribute goes;  `undefined` (default):  left as the doc has it
   *   - passed in, so `PlanDoc` stays pure:  the CLI asks git (`recentSince()`)
   */
  constructor(document, now = new Date(), { recentSince } = {}) {
    this.document = document
    this.now = now
    this.recentSince = recentSince
  }

  /** `PlanDoc` of HTML text;  `options` as the constructor's. */
  static parse(html, now, options) {
    return new PlanDoc(parseHTML(html).document, now, options)
  }

  /** `now`'s date, `YYYY-MM-DD`. */
  get today() {
    return isoDate(this.now)
  }

  /**
   * Is a `/bedtime` run going on?  Then every item a command changes also gets `data-bedtime` (`stamp()`), and
   * stays "recent" until reviewed.
   * - reads `#overnight`'s flag for now;  P7 of `review-review` moves it:  read it HERE only
   */
  get bedtime() {
    return this.overnight === "active"
  }

  /**
   * The doc as HTML text, ready to write.
   * - boolean attributes go back to bare (`styled`, not `styled=""`), as written by hand and by oxfmt
   */
  toString() {
    return serialize(this.document)
  }

  ////////////////
  // ## Phases
  ////////////////

  /**
   * Every phase, in order:  `{ n, name, status, estimate }`, from the phase sections in `#phases`.
   * - `estimate`:  its Estimate field's text;  `undefined` while missing or `TBD`
   * - docs not yet migrated also have a phase LIST (`.plan-phases`) under `#plan`:  `check()` keeps the two in step
   */
  get phases() {
    return this.phaseSections.map((section) => ({
      n: Number(section.getAttribute("data-phase")),
      name: phaseName(titleText(section)),
      status: section.getAttribute("data-status") ?? "todo",
      estimate: estimateText(section)
    }))
  }

  /**
   * The phase sections, in order:  `<ui-section data-phase>` in `ui-section#phases`, or (old markup)
   * `section[data-phase]` in `#phases-section`.
   */
  get phaseSections() {
    return Array.from(this.document.querySelectorAll(PHASE_SECTIONS))
  }

  /** Phase `n`'s section;  throws when there's none. */
  phaseSection(n) {
    const section = this.phaseSections.find((phase) => phase.getAttribute("data-phase") === String(n))
    if (!section) throw new PlanDocError(`no phase ${n} in the doc`)
    return section
  }

  /** Number of the phase in progress, if any. */
  get activePhase() {
    return this.phases.find((phase) => phase.status === "active")?.n
  }

  /**
   * Append phase `name` (2-4 words) to `#phases` (and an old doc's phase list);  returns its number.
   * - `goal` / `files` / `verify`:  its body's fields, as HTML (a `<ul>` of bullets for the goal);  omitted ones get
   *   a placeholder to fill in
   * - `estimate` (`1-2h`):  the phase title's BADGE, not a body field (Owen, 2026-10-04);  old markup:  the field
   * - `<ui-section id="p3" data-phase data-status header="P3 · Name" ...>`, its status icon slotted;  old markup:
   *   `section.s3` > `ui-sticky.spell-h3` > `h3#p3`
   * - removes the "Plan hung?" notice (`ui-message.plan-hung`):  a plan with a phase has been written, so a hung
   *   session no longer means starting over from the kickoff prompt
   */
  addPhase(name, { goal, files, verify, estimate } = {}) {
    const section = this.section("phases")
    this.document.querySelector("ui-message.plan-hung")?.remove()
    const n = this.phases.length + 1
    const label = `P${n} · ${name}`
    this.addOldListEntry(n, label)
    const values = { Goal: goal, Files: files, Verify: verify, Estimate: estimate }
    const sections = section.localName === "ui-section"
    const body = PHASE_FIELDS.filter(([field]) => !(sections && field === "Estimate")).map(
      ([field, glyph]) => `<ui-item icon="${glyph}"><b>${field}:</b>  ${values[field] ?? "TBD"}</ui-item>`
    )
    const list = `<ui-list class="plan-phase-body">${body.join("")}</ui-list>`
    if (sections) {
      const phase = this.element("ui-section", {
        id: `p${n}`,
        "data-phase": n,
        "data-status": "todo",
        header: label,
        ...(estimate && { badge: estimate }),
        sticky: "",
        collapsible: "",
        dividing: ""
      })
      // newlines around the parts:  oxfmt keeps a custom element's whitespace as it is
      phase.innerHTML = `\n${icon("todo", true)}\n${list}\n`
      section.append(this.document.createTextNode("\n"), phase)
    } else {
      const phase = this.element("section", { class: "s3", "data-phase": n, "data-status": "todo" })
      phase.innerHTML = `<ui-sticky class="spell-h3"><h3 id="p${n}">${icon("todo")} ${text(label)}</h3></ui-sticky>
${list}`
      section.append(phase)
    }
    this.updateProgress()
    this.updateEstimate()
    return n
  }

  /**
   * Set phase `n`'s estimate (`2h`, `1-2h`):  the phase title's badge (dropping an old Estimate field);  old markup:
   * the field, added to a phase made before it existed.  Then the Overview's total.
   */
  setEstimate(n, estimate) {
    const section = this.phaseSection(n)
    if (section.localName === "ui-section") {
      section.setAttribute("badge", estimate)
      estimateField(section)?.remove()
      return this.updateEstimate()
    }
    const body = section.querySelector(":scope > .plan-phase-body")
    if (!body) throw new PlanDocError(`phase ${n} has no body (\`.plan-phase-body\`)`)
    const html = `<b>Estimate:</b>  ${text(estimate)}`
    const field = estimateField(section)
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
  updateEstimate() {
    let line = this.document.querySelector("p.plan-estimate")
    const phases = this.phases
    const counted = phases.map((phase) => ({ ...phase, range: parseDuration(phase.estimate) }))
    const estimated = counted.filter((phase) => phase.range)
    if (!estimated.length) return line?.remove()
    const total = sumRanges(estimated.map((phase) => phase.range))
    const left = sumRanges(estimated.filter((phase) => phase.status !== "done").map((phase) => phase.range))
    const missing = counted.filter((phase) => !phase.range).map((phase) => `P${phase.n}`)
    let html = `<b>Estimate:</b>  ${formatRange(total)} in all, ${formatRange(left)} left`
    if (missing.length) html += ` (${missing.join(", ")} not estimated)`
    if (!line) {
      line = this.element("p", { class: "plan-estimate" })
      const overview = this.section("overview")
      const above =
        overview.querySelector(":scope > :is(.plan-prompt-panel, blockquote.plan-prompt)") ??
        overview.querySelector(":scope > .plan-summary")
      if (above) above.after(this.document.createTextNode("\n"), line)
      else prependContent(overview, line)
    }
    line.innerHTML = html
  }

  /** A doc not yet migrated keeps its phase list under `#plan` in step:  append phase `n` to it. */
  addOldListEntry(n, label) {
    const list = this.document.querySelector(".plan-phases")
    if (!list) return
    if (list.localName === "ui-steps") {
      list.append(this.element("ui-step", { "data-phase": n, "data-status": "todo", href: `#p${n}`, header: label }))
      return
    }
    const li = this.element("li", { "data-phase": n, "data-status": "todo" })
    li.innerHTML = `${icon("todo")} <a href="#p${n}">${text(label)}</a>`
    list.append(li)
  }

  /**
   * Set phase `n` to `status` (`todo` / `active` / `done`), on its section and heading (and an old doc's list).
   * - `done` removes the phase's UPDATE markers:  once it's finished, its changes are just the plan
   * - `done` also folds every OTHER done phase (`collapsed`;  old markup:  `data-fold="closed"`, read by the page
   *   runtime):  the phase just finished stays open, the older ones get out of the way
   * - `done` with `{ done }` (HTML:  a `<ul>` of what was built, what Owen will ask about first):  the phase's Done
   *   field, after its Goal (`setDone()`)
   * - SIDE EFFECT:  logs the change
   */
  setPhase(n, status, { done } = {}) {
    if (!STATUS[status]) throw new PlanDocError(`status must be ${Object.keys(STATUS).join(" / ")}, not "${status}"`)
    const section = this.phaseSection(n)
    const entry = this.document.querySelector(`.plan-phases > [data-phase="${n}"]`)
    for (const node of [entry, section]) {
      if (!node) continue
      node.setAttribute("data-status", status)
      if (node.localName !== "ui-section") {
        node.querySelector("ui-icon")?.replaceWith(this.fragment(icon(status)))
        continue
      }
      const glyph = node.querySelector(':scope > ui-icon[slot="icon"]')
      if (glyph) glyph.replaceWith(this.fragment(icon(status, true)))
      else node.prepend(this.fragment(icon(status, true)))
    }
    if (entry?.localName === "ui-step") {
      toggle(entry, "selected", status === "active")
      toggle(entry, "completed", status === "done")
    }
    if (status === "done") {
      for (const marker of this.updateMarkers(n)) marker.remove()
      this.foldDonePhases(n)
      if (done) this.setDone(n, done)
    } else setFolded(section, false)
    this.updateProgress()
    this.updateEstimate()
    this.log(`P${n} ${status}`)
  }

  /**
   * Phase `n`'s Done field:  what was built, as HTML (a `<ul>`, most-asked-about first), just after its Goal;
   * replaces an earlier one.
   */
  setDone(n, html) {
    const body = this.phaseSection(n).querySelector(":scope > .plan-phase-body")
    if (!body) throw new PlanDocError(`phase ${n} has no body (\`.plan-phase-body\`)`)
    const old = Array.from(body.children).find((item) => /^Done:/.test(item.textContent.trim()))
    const field = this.fragment(`<ui-item icon="circle check"><b>Done:</b>  ${html}</ui-item>`)
    if (old) return old.replaceWith(field)
    const goal = Array.from(body.children).find((item) => /^Goal:/.test(item.textContent.trim()))
    if (goal) goal.after(field)
    else body.prepend(field)
  }

  /**
   * Each phase's Estimate field (`ui-item[icon=clock]`) into its title's badge (`badge="1-2h"`);  how many.
   * - why:  Owen wants the estimate in the title, beside the status (2026-10-04);  `TBD` just goes
   */
  estimatesToBadges() {
    let count = 0
    for (const section of this.phaseSections) {
      if (section.localName !== "ui-section") continue
      const field = estimateField(section)
      if (!field) continue
      const value = field.textContent.trim().replace(/^Estimate:\s*/, "")
      if (value && value !== "TBD") section.setAttribute("badge", value)
      field.remove()
      count++
    }
    return count
  }

  /** Fold every done phase but `latest` (the one finished last), which unfolds. */
  foldDonePhases(latest) {
    for (const section of this.phaseSections) {
      const n = Number(section.getAttribute("data-phase"))
      setFolded(section, n !== latest && section.getAttribute("data-status") === "done")
    }
  }

  /**
   * The phases' progress bar (`ui-progress.plan-progress`):  done of all, hidden while none.  Then the header's
   * step label (`updateStep()`).
   */
  updateProgress() {
    const bar = this.document.querySelector("ui-progress.plan-progress")
    const phases = this.phases
    if (bar) {
      bar.setAttribute("value", String(phases.filter((phase) => phase.status === "done").length))
      bar.setAttribute("total", String(phases.length))
      toggle(bar, "hidden", phases.length === 0)
    }
    this.updateStep()
  }

  /**
   * The step label in the sticky page header (`.plan-step`):  where the plan is, at a glance.
   * - the active phase (orange, links to it);  else "DONE" (green) once every phase is;  else the next one (grey)
   * - hidden while there are no phases
   */
  updateStep() {
    const step = this.document.querySelector(".plan-step")
    if (!step) return
    const phases = this.phases
    const active = phases.find((phase) => phase.status === "active")
    const next = phases.find((phase) => phase.status === "todo")
    toggle(step, "hidden", phases.length === 0)
    if (!phases.length) step.innerHTML = ""
    else if (active) step.innerHTML = stepLabel(active, "orange", "circle half stroke", "")
    else if (!next) step.innerHTML = `<ui-label color="green" icon="check">DONE</ui-label>`
    else step.innerHTML = stepLabel(next, "grey", "circle right", "Next:  ")
  }

  /** UPDATE markers of phase `n`. */
  updateMarkers(n) {
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
   */
  addItem(kind, title, { details, titleHTML = false } = {}) {
    const spec = KINDS[kind]
    if (!spec) throw new PlanDocError(`kind must be ${Object.keys(KINDS).join(" / ")}, not "${kind}"`)
    const list = this.listOf(kind)
    const id = `${spec.prefix}${Math.max(0, ...this.items(kind).map((item) => idNumber(item.id))) + 1}`
    const phase = this.activePhase
    const item = this.element(list.localName === "ol" ? "li" : "ui-item", {
      id,
      "data-status": spec.live,
      ...(phase && { "data-phase": phase }),
      ...(kind === "decision" && { "data-answered": "" })
    })
    const label = titleHTML ? title : text(title)
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
   * - its details start with the answer, an ivory card:  `<div class="plan-answer-block"><div
   *   class="plan-answer-title"><b>Answer</b> · ...</div>` + `details` (HTML) `</div>`;  a question without details
   *   gets a panel (`detailsOf()`).  Answering again replaces the answer and its details
   * - `option` (`A`):  that option card is the chosen one (`chooseOption()`)
   * - moves among the answered questions, in id order:  open ones stay on top
   */
  decide(questionId, answer, { details, option } = {}) {
    const question = this.item(questionId)
    if (!question.id.startsWith(KINDS.question.prefix)) throw new PlanDocError(`${questionId} isn't a question`)
    const content = this.detailsOf(question)
    content.querySelector(":scope > .plan-answer-block")?.remove()
    // an ivory card titled by the answer, its details inside (Owen, 2026-10-04)
    const title = `<div class="plan-answer-title"><b>Answer</b> · ${text(answer)}</div>`
    content.prepend(this.fragment(`<div class="plan-answer-block">${title}${details ?? ""}</div>`))
    if (option) this.chooseOption(question, option)
    question.setAttribute("data-status", "decided")
    question.setAttribute("data-answered", "")
    this.placeQuestion(question)
    this.stamp(question)
    this.markUpdate(question)
    return question.id
  }

  /**
   * Mark option `letter` (`A`, `B` ...) of question `item` as the one chosen:  `data-chosen` on its card's
   * `ui-column` (in the question's `ui-grid.spell-pros-cons`), taken off the others.  The page opens that card
   * and frames it green (`spell-doc-runtime.js` `wireOptions()`).
   * - the card's label starts with the letter:  `A · Inbox file (recommended)`
   * - throws when no card has that letter
   */
  chooseOption(item, letter) {
    const columns = Array.from(item.querySelectorAll("ui-grid.spell-pros-cons > ui-column"))
    const want = String(letter).trim().toUpperCase()
    const chosen = columns.find((column) => {
      const label = column.querySelector("ui-label[attached]")?.textContent.trim() ?? ""
      return label.toUpperCase().startsWith(`${want} `) || label.toUpperCase().startsWith(`${want}·`)
    })
    if (!chosen) throw new PlanDocError(`${item.id.toUpperCase()} has no option ${want}`)
    for (const column of columns) column.toggleAttribute("data-chosen", column === chosen)
  }

  /**
   * Put question `item` where it belongs in its list:  an open one after the open questions on top;  an answered
   * (or dropped) one among the answered, in id order.
   * - an old doc's struck question, beside the decision that answers it (`→ D7`), isn't counted:  it stays put
   */
  placeQuestion(item) {
    const list = item.parentElement
    if (item.getAttribute("data-status") === "open") {
      const last = this.openQuestions(list)
        .filter((other) => other !== item)
        .at(-1)
      if (last) last.after(item)
      else list.prepend(item)
      return
    }
    const n = idNumber(item.id)
    const later = Array.from(list.children).find(
      (other) =>
        other !== item &&
        /^q\d+$/.test(other.id) &&
        other.getAttribute("data-status") !== "open" &&
        !other.querySelector(".plan-answer") &&
        idNumber(other.id) > n
    )
    if (later) later.before(item)
    else list.append(item)
  }

  /**
   * Item `item`'s details (its panel's `ui-content`);  an item without any gets a collapsed panel, its line the
   * panel's title, as `addItem()` makes with `details`.
   */
  detailsOf(item) {
    const panel = item.querySelector(":scope > ui-accordion.plan-item")
    if (panel) return panel.querySelector(":scope > ui-content") ?? panel.appendChild(this.element("ui-content"))
    const accordion = this.element("ui-accordion", { class: "plan-item" })
    const title = this.element("ui-title")
    const content = this.element("ui-content")
    title.append(...Array.from(item.childNodes))
    trimWhitespace(title)
    accordion.append(title, content)
    item.append(accordion)
    return content
  }

  /**
   * Set item `id` open or done;  done items stay, struck through.  Returns its title.
   * - "open" means the kind's live status:  a reopened answered question (or an old doc's decision) is `decided`
   *   again, an unanswered one `open`
   * - a question moves to its place (`placeQuestion()`);  stamped (`stamp()`)
   */
  setItem(id, status) {
    if (status !== "open" && status !== "done") throw new PlanDocError(`item status must be open / done`)
    const item = this.item(id)
    const question = /^q\d+$/.test(item.id)
    let live = Object.values(KINDS).find((spec) => new RegExp(`^${spec.prefix}\\d+$`).test(item.id))?.live ?? "open"
    if (question) live = item.hasAttribute("data-answered") ? "decided" : "open"
    else if (OLD_DECISION.test(item.id)) live = "decided"
    item.setAttribute("data-status", status === "open" ? live : "done")
    if (question && item.parentElement.matches('[data-kind="decision"]')) this.placeQuestion(item)
    this.stamp(item)
    this.markUpdate(item)
    return item.querySelector(".plan-title")?.textContent.trim() ?? id
  }

  /**
   * Stamp `item` as changed now:  `data-changed` (ISO local time, with offset), which `updateStates()` compares
   * with `<body data-recent-since>`;  during a `/bedtime` run also `data-bedtime`, until it's reviewed.
   * - `at`:  when, if not now (`review()`'s backfilled date);  `bedtime`:  `false` for a change Owen made
   */
  stamp(item, { at = this.now, bedtime = this.bedtime } = {}) {
    item.setAttribute("data-changed", isoTime(at))
    if (bedtime) item.setAttribute("data-bedtime", "")
  }

  /** The item with `id` (any case);  throws when there's none. */
  item(id) {
    const item = this.document.getElementById(String(id).toLowerCase())
    if (!item?.parentElement?.matches(".plan-items")) throw new PlanDocError(`no item "${id}"`)
    return item
  }

  /**
   * Items of `kind`, in order:  `{ id, title, status }`.
   * - `list`:  where to look;  default `listOf(kind)`, which adds or requires it.  `null`:  none.
   */
  items(kind, list = this.listOf(kind)) {
    const pattern = new RegExp(`^${KINDS[kind].prefix}\\d+$`)
    return Array.from(list?.children ?? [])
      .filter((item) => pattern.test(item.id))
      .map((item) => ({
        id: item.id,
        title: item.querySelector(".plan-title")?.textContent.trim() ?? "",
        status: item.getAttribute("data-status") ?? "open"
      }))
  }

  /**
   * The list `kind`'s items live in:  its own (a doc not yet migrated), else the one it shares.
   * - `test` in a doc from before "To test" (2026-10-03):  the section is added first (`addTestsSection()`)
   */
  listOf(kind) {
    const found = this.findList(kind)
    if (found) return found
    if (kind === "test") return this.addTestsSection()
    return this.require(`.plan-items[data-kind="${KINDS[kind].list}"]`)
  }

  /**
   * `listOf()` for READING:  the list `kind`'s items live in, or `null`;  never adds a section, never throws.
   * - a doc older than a kind's section (`#judgements`, `#tests`:  2026-10-03) has none of that kind open
   */
  findList(kind) {
    return (
      this.document.querySelector(`.plan-items[data-kind="${kind}"]`) ??
      this.document.querySelector(`.plan-items[data-kind="${KINDS[kind].list}"]`)
    )
  }

  /**
   * Add the "To test" section, `#tests`, just before the Log (else last), and renumber;  returns its list.
   * - for docs from before it was in the template (2026-10-03)
   */
  addTestsSection() {
    const section = this.element("ui-section", {
      id: "tests",
      // numbered by `orderSections()` below:  its place, and the Log the next
      header: "0. To test",
      sticky: "",
      collapsible: "",
      dividing: ""
    })
    section.innerHTML =
      `\n<ui-icon slot="icon" name="${SECTION_ICONS.tests}"></ui-icon>\n<p class="meta">${TESTS_NOTE}</p>\n` +
      `<ui-list class="plan-items" data-kind="test" divided relaxed></ui-list>\n`
    const log = sectionOf(this.document, "log")
    if (log) log.before(section, this.document.createTextNode("\n\n"))
    else this.require("main").append(section)
    this.orderSections()
    return section.querySelector(".plan-items")
  }

  /** The open questions at the top of `list`, in order. */
  openQuestions(list) {
    const run = []
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
  markUpdate(item) {
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
  review(id, { date = this.today } = {}) {
    const item = this.item(id)
    item.setAttribute("data-reviewed", date)
    item.removeAttribute("data-deferred")
    this.stamp(item, { at: date === this.today ? this.now : localDay(date), bedtime: false })
    item.removeAttribute("data-bedtime")
    this.updateReviewLabel(item)
    return titleOf(item)
  }

  /** Put item `id` off (`data-deferred`, today):  still outstanding, shown as such next review;  returns its title. */
  defer(id) {
    const item = this.item(id)
    item.setAttribute("data-deferred", this.today)
    this.stamp(item)
    this.updateReviewLabel(item)
    return titleOf(item)
  }

  /**
   * Queue `work` for item `id`:  a review decided it should be done, and it isn't yet;  returns its title.
   * - `data-queued` (today) + `data-work`;  also marks it reviewed (so `data-bedtime` goes, as `review()`)
   * - survives sessions:  the next `/epic review` offers it first, `unqueue()` once it's started or dropped
   */
  queue(id, work) {
    const item = this.item(id)
    item.setAttribute("data-queued", this.today)
    item.setAttribute("data-work", String(work))
    item.setAttribute("data-reviewed", this.today)
    item.removeAttribute("data-deferred")
    this.stamp(item, { bedtime: false })
    item.removeAttribute("data-bedtime")
    this.updateReviewLabel(item)
    return titleOf(item)
  }

  /** Take item `id` off the queue (started, or dropped);  it stays reviewed.  Returns its title. */
  unqueue(id) {
    const item = this.item(id)
    item.removeAttribute("data-queued")
    item.removeAttribute("data-work")
    this.stamp(item)
    this.updateReviewLabel(item)
    return titleOf(item)
  }

  /**
   * Item `item`'s (an element) review state:
   * - `queued`:  reviewed, work waiting
   * - `reviewed`:  marked, struck / decided (an answered question, an old doc's decision), or linked from a
   *   decision (`href="#c4"` in its details)
   * - `deferred`:  put off for now;  still outstanding
   * - `outstanding`:  none of the above
   */
  reviewState(item) {
    if (item.hasAttribute("data-queued")) return "queued"
    const status = item.getAttribute("data-status")
    if (item.hasAttribute("data-reviewed") || status === "done" || status === "decided") return "reviewed"
    if (this.linkedFromDecision(item.id)) return "reviewed"
    return item.hasAttribute("data-deferred") ? "deferred" : "outstanding"
  }

  /**
   * Does a decision (other than the item itself) link to `#id`?
   * - a decision, either shape:  an answered question (`q3`, `decided` or since struck), or an old doc's `d7`
   * - its own id link and an old struck question's `→ D7` don't count
   */
  linkedFromDecision(id) {
    const list = this.document.querySelector('.plan-items[data-kind="decision"]')
    if (!list) return false
    return Array.from(list.children).some(
      (decision) =>
        decision.id !== id &&
        (OLD_DECISION.test(decision.id) || (/^q\d+$/.test(decision.id) && decision.hasAttribute("data-answered"))) &&
        decision.querySelector(`a[href="#${id}"]:not(.plan-id, .plan-answer)`)
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
   * - each item:  `{ id, title, status, state, docState, reviewed, deferred, queued, work, details,
   *   recommendation }`;  dates are `YYYY-MM-DD` or `null`;  `docState`:  its color on the page (`itemState()`)
   * - Questions are the `Q` items, open and answered (the decisions since D13);  never an old doc's `D` items
   */
  reviewSections({ filter = "unreviewed" } = {}) {
    if (!REVIEW_FILTERS[filter]) throw new PlanDocError(`filter must be ${Object.keys(REVIEW_FILTERS).join(" / ")}`)
    return REVIEW_SECTIONS.map(({ kind, label }) => {
      const pattern = new RegExp(`^${KINDS[kind].prefix}\\d+$`)
      const all = Array.from(this.findList(kind)?.children ?? [])
        .filter((item) => pattern.test(item.id))
        .map((item) => this.reviewItem(item))
      const notReviewed = all.filter((item) => REVIEW_FILTERS.unreviewed(item)).length
      return { kind, label, total: all.length, notReviewed, items: all.filter(REVIEW_FILTERS[filter]) }
    })
  }

  /** `reviewSections()`'s view of one item (an element). */
  reviewItem(item) {
    const details = item.querySelector(":scope > ui-accordion > ui-content")
    return {
      id: item.id.toUpperCase(),
      title: titleOf(item),
      status: item.getAttribute("data-status") ?? "open",
      state: this.reviewState(item),
      docState: this.itemState(item),
      reviewed: item.getAttribute("data-reviewed"),
      deferred: item.getAttribute("data-deferred"),
      queued: item.getAttribute("data-queued"),
      work: item.getAttribute("data-work"),
      details: details ? details.textContent.replace(/\s+/g, " ").trim() : "",
      // the details as written, for a page that shows them whole (`pickerSpec()`)
      detailsHtml: details ? details.innerHTML.trim() : "",
      recommendation: recommendation(details)
    }
  }

  /**
   * Where reviews stand, for someone who remembers nothing:  `{ last, reviewedThen, deferred, queued }`.
   * - `last`:  the latest `data-reviewed` date, or `null` (never reviewed);  `reviewedThen`:  how many items carry it
   * - `deferred`:  items deferred;  `queued`:  `{ id, title, work, queued }` for each piece of work waiting
   */
  reviewStatus() {
    const items = Array.from(this.document.querySelectorAll(".plan-items > [id]"))
    const dates = items.map((item) => item.getAttribute("data-reviewed")).filter(Boolean)
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
          title: titleOf(item),
          work: item.getAttribute("data-work"),
          queued: item.getAttribute("data-queued")
        }))
    }
  }

  /**
   * The review label on `item`'s line (`ui-label.plan-review`), from its marks:  "to do" (queued, orange:  work in
   * progress), else "deferred" (grey, its date on hover), else "reviewed 10-02" (green while recent, then grey:
   * `reviewLabelColor()`);  none when unmarked.
   * - on the line, right after the id (`I7 [deferred 10-02] title`):  in its panel's title when it has details
   */
  updateReviewLabel(item) {
    const line = item.querySelector(":scope > ui-accordion > ui-title") ?? item
    const old = line.querySelector(":scope > .plan-review")
    // the space written before it goes too, or each relabel leaves one behind
    if (old?.previousSibling?.nodeType === 3)
      old.previousSibling.textContent = old.previousSibling.textContent.trimEnd()
    old?.remove()
    const queued = item.hasAttribute("data-queued")
    const deferred = item.getAttribute("data-deferred")
    const reviewed = item.getAttribute("data-reviewed")
    let label
    if (queued) label = ["to do", item.getAttribute("data-work")]
    else if (deferred) label = ["deferred", `deferred ${deferred}`]
    else if (reviewed) label = [`reviewed ${reviewed.slice(5)}`]
    if (!label) return
    const [words, tip] = label
    const color = reviewLabelColor(words, this.itemState(item))
    const title = tip ? ` title="${escapeAll(tip)}"` : ""
    const html = `<ui-label class="plan-review" size="mini" basic color="${color}"${title}>${text(words)}</ui-label>`
    line.querySelector(":scope > .plan-id").after(this.fragment(` ${html}`))
  }

  ////////////////
  // ## States
  ////////////////

  /**
   * The whole-doc pass every edit ends with (`edit()`;  `migrate()` too):  one item's change can change others'
   * standing, so everything is worked out again;  returns how many things it changed.
   * - `<body data-recent-since>`:  from `recentSince` when it was passed in
   * - each item's `data-state` (`itemState()`):  what the page colors its id badge by
   * - each review label's color (`reviewLabelColor()`)
   * - each phase's "To review" line (`updateToReview()`)
   */
  updateStates() {
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
      const color = label && reviewLabelColor(label.textContent.trim(), state)
      if (label && label.getAttribute("color") !== color) {
        label.setAttribute("color", color)
        changed++
      }
    }
    for (const section of this.phaseSections) if (this.updateToReview(section)) changed++
    return changed
  }

  /**
   * Item `item`'s (an element) standing, the `data-state` the page colors it by (`STATE_COLORS`):
   * - closed (`done`, `decided`, an old doc's `d7`):  `recent` when changed since `<body data-recent-since>` or
   *   during a `/bedtime` run (`data-bedtime`), else `old`
   * - work under way (`data-queued`, `data-working`):  `progress`
   * - waiting on Owen:  `attention`:  an open question;  an open judgement call or issue not reviewed
   * - else `recent` when reviewed recently (green, then blue) or touched by a `/bedtime` run;  else `open`
   */
  itemState(item) {
    const status = item.getAttribute("data-status") ?? "open"
    const since = Date.parse(this.document.body?.getAttribute("data-recent-since") ?? "")
    const changed = Date.parse(item.getAttribute("data-changed") ?? "")
    const bedtime = item.hasAttribute("data-bedtime")
    const recent = bedtime || (changed >= since && !Number.isNaN(since))
    if (status === "done" || status === "decided" || OLD_DECISION.test(item.id)) return recent ? "recent" : "old"
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
   * - replaces the hand-written "Judgement calls:" line (`removeJudgementLines()`)
   */
  updateToReview(section) {
    const body = section.querySelector(":scope > .plan-phase-body")
    if (!body) return false
    const n = section.getAttribute("data-phase")
    const old = body.querySelector(":scope > .plan-to-review")
    const items = Array.from(this.document.querySelectorAll(`.plan-items > [data-phase="${n}"]`)).filter((item) => {
      const status = item.getAttribute("data-status") ?? "open"
      if (status === "done" || status === "decided" || OLD_DECISION.test(item.id)) return false
      return !["data-reviewed", "data-queued", "data-working"].some((mark) => item.hasAttribute(mark))
    })
    const links = items.map((item) => `<a href="#${item.id}">${item.id.toUpperCase()}</a>`).join(", ")
    const html = `<b>To review:</b>  ${links}`
    if (!items.length) {
      old?.remove()
      return Boolean(old)
    }
    // as oxfmt left it:  only the whitespace may differ
    if (old && squeeze(old.innerHTML) === squeeze(html) && !old.nextElementSibling) return false
    old?.remove()
    const tag = body.localName === "ul" ? "li" : "ui-item"
    const line = this.element(tag, { ...(tag === "ui-item" && { icon: "list check" }), class: "plan-to-review" })
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
  addCommit({ phase, item }, sha, sentence, { base = null } = {}) {
    const list = phase !== undefined ? this.phaseCommitList(phase) : this.itemCommitList(item)
    const entry = this.fragment(commitEntry(sha, sentence, base)).firstElementChild
    const old = findCommit(list, sha)
    if (old) {
      old.replaceWith(entry)
      return "replaced"
    }
    list.append(entry)
    return "added"
  }

  /** Is commit `sha` listed under phase `phase` / item `item` already? */
  hasCommit({ phase, item }, sha) {
    const where = phase !== undefined ? this.phaseSection(phase) : this.item(item)
    const list = where.querySelector(".plan-commits > .plan-commit-list")
    return Boolean(list && findCommit(list, sha))
  }

  /**
   * Fill in commits from the doc's git history:  `log` is `{ sha, subject }`s, newest first (`git log`);  returns
   * what it added, `{ sha, phase }` / `{ sha, item }`, oldest first.
   * - subjects `parseCommitSubject()` reads:  phase commits (`P3:  Name -- summary`) and item fixes (`Fix I3:  ...`)
   * - only phases and items the doc has;  a commit already listed there is skipped, so it can run again
   */
  backfillCommits(log, { base = null } = {}) {
    const added = []
    for (const { sha, subject } of Array.from(log).reverse()) {
      const parsed = parseCommitSubject(subject)
      if (!parsed) continue
      const targets = [
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

  /** Does the doc have item `id` (any case)? */
  hasItem(id) {
    return Boolean(this.document.getElementById(id.toLowerCase())?.parentElement?.matches(".plan-items"))
  }

  /**
   * Phase `n`'s commit list, its "Commits" field made when there's none:  after Done, else after Goal, else first.
   * - `<ui-item icon="code branch" class="plan-commits"><b>Commits:</b>  <ul class="plan-commit-list">`;  an old
   *   `ul` body:  an `li`
   */
  phaseCommitList(n) {
    const body = this.phaseSection(n).querySelector(":scope > .plan-phase-body")
    if (!body) throw new PlanDocError(`phase ${n} has no body (\`.plan-phase-body\`)`)
    const found = body.querySelector(":scope > .plan-commits > .plan-commit-list")
    if (found) return found
    const tag = body.localName === "ul" ? "li" : "ui-item"
    const field = this.element(tag, { ...(tag === "ui-item" && { icon: "code branch" }), class: "plan-commits" })
    field.innerHTML = `<b>Commits:</b>  <ul class="plan-commit-list"></ul>`
    const fields = Array.from(body.children)
    const after =
      fields.find((child) => /^Done:/.test(child.textContent.trim())) ??
      fields.find((child) => /^Goal:/.test(child.textContent.trim()))
    if (after) after.after(field)
    else body.prepend(field)
    return field.querySelector(".plan-commit-list")
  }

  /**
   * Item `id`'s commit list, at the end of its details:  `<div class="plan-commits"><b>Commits:</b>  <ul
   * class="plan-commit-list">`, made when there's none.
   */
  itemCommitList(id) {
    const content = this.detailsOf(this.item(id))
    const found = content.querySelector(":scope > .plan-commits > .plan-commit-list")
    if (found) return found
    const block = this.element("div", { class: "plan-commits" })
    block.innerHTML = `<b>Commits:</b>  <ul class="plan-commit-list"></ul>`
    content.append(block)
    return block.querySelector(".plan-commit-list")
  }

  ////////////////
  // ## Log, stamps, summary
  ////////////////

  /**
   * Add a line to the log, stamped with the local date and time.
   * - the log is a `<ui-feed class="plan-log">` of events;  docs made before 2026-10-01 have a `<ul>`
   */
  log(line) {
    const list = this.require(".plan-log")
    if (list.localName === "ui-feed") {
      const event = this.element("ui-event", { icon: "pen to square" })
      event.innerHTML = `<ui-content><ui-summary><ui-date>${timeTag(this.now)}</ui-date> ${text(line)}</ui-summary></ui-content>`
      list.append(event)
      return
    }
    const li = this.element("li")
    li.innerHTML = `${timeTag(this.now)} ${text(line)}`
    list.append(li)
  }

  /** Stamp "updated" with today. */
  touch() {
    const updated = this.document.getElementById("plan-updated")
    if (updated) updated.textContent = this.today
  }

  /**
   * What needs attention:  the phases, the next one to do, and the open questions / issues / caveats / todos.
   * - feeds the end-of-phase reply and its AskUserQuestion options
   */
  summary() {
    const phases = this.phases
    const open = Object.fromEntries(
      // `findList()`:  a doc not yet migrated still reads, as `/epics` reads every plan doc
      OPEN_KINDS.map((kind) => [kind, this.items(kind, this.findList(kind)).filter((item) => item.status === "open")])
    )
    return {
      title: this.title,
      phases,
      active: phases.find((phase) => phase.status === "active"),
      next: phases.find((phase) => phase.status === "todo"),
      estimate: this.document
        .querySelector("p.plan-estimate")
        ?.textContent.replace(/^Estimate:\s*/, "")
        .trim(),
      overnight: this.overnight,
      open
    }
  }

  ////////////////
  // ## Overnight
  ////////////////

  /**
   * The `#overnight` section's state:  `"active"` while a `/bedtime` run goes on, `"done"` once it's over, `null`
   * when there's none.
   * - how a compacted session knows it's still in bedtime mode
   */
  get overnight() {
    return this.document.getElementById("overnight")?.getAttribute("data-bedtime") ?? null
  }

  /**
   * Start a `/bedtime` run's report:  a fresh `#overnight` section, UNNUMBERED, first in `main` (above the Overview),
   * with Phases and Problems lists.
   * - `phases`:  what the night runs (`P3-P6`);  `branch`:  where its commits go
   * - TEMPORARY:  `/epic review` removes it (`removeOvernight()`) once Owen has gone through the night;  the record
   *   stays in the items (judgement calls, issues, todos) and the log
   * - SIDE EFFECT:  replaces an earlier run's section
   */
  startOvernight(phases, branch) {
    this.removeOvernight()
    const section = this.element("ui-section", {
      id: "overnight",
      header: `Overnight · ${this.today}`,
      "data-bedtime": "active",
      sticky: "",
      collapsible: "",
      dividing: ""
    })
    const on = branch ? ` on branch <code>${text(branch)}</code>` : ""
    section.innerHTML = `
      <ui-icon slot="icon" name="calendar"></ui-icon>
      <p class="overnight-summary">Running ${text(phases)} unattended${on}, since ${timeTag(this.now)}.</p>
      <ui-section id="overnight-phases" header="Phases" sticky collapsible dividing>
        <ul class="overnight-phases"><li class="overnight-none">None yet.</li></ul>
      </ui-section>
      <ui-section id="overnight-problems" header="Problems" sticky collapsible dividing>
        <ul class="overnight-problems"><li class="overnight-none">None.</li></ul>
      </ui-section>
    `
    this.section("overview").before(section, this.document.createTextNode("\n"))
  }

  /** A line under Phases:  `P<n>` and what came of it;  ids in `line` (`J4`) link to their items. */
  overnightPhase(n, line) {
    this.overnightLine(".overnight-phases", `<b>P${Number(n)}</b>  ${this.linkIds(line)}`)
  }

  /** A line under Problems;  ids in `line` (`I3`) link to their items. */
  overnightProblem(line) {
    this.overnightLine(".overnight-problems", this.linkIds(line))
  }

  /** The run is over:  `data-bedtime="done"`, and `summary` replaces the "Running ..." line. */
  finishOvernight(summary) {
    const section = this.overnightSection()
    section.setAttribute("data-bedtime", "done")
    section.querySelector(".overnight-summary").innerHTML = this.linkIds(summary)
  }

  /** Remove the `#overnight` section;  was there one? */
  removeOvernight() {
    const section = this.document.getElementById("overnight")
    section?.remove()
    return Boolean(section)
  }

  /** Append `html` to list `selector` in `#overnight`, dropping its "None" placeholder. */
  overnightLine(selector, html) {
    const list = this.overnightSection().querySelector(selector)
    list.querySelector(":scope > .overnight-none")?.remove()
    const li = this.element("li")
    li.innerHTML = html
    list.append(li)
  }

  /** The `#overnight` section;  throws when no run started one. */
  overnightSection() {
    const section = this.document.getElementById("overnight")
    if (!section) throw new PlanDocError("no overnight section:  `overnight <name> start` first")
    return section
  }

  /** `line`, escaped, each item id in it (`J4`, `I12`) a link to that item when the doc has it. */
  linkIds(line) {
    return text(line).replace(/\b([A-Z])(\d+)\b/g, (whole, letter, n) => {
      const id = `${letter.toLowerCase()}${n}`
      return this.document.getElementById(id) ? `<a href="#${id}">${whole}</a>` : whole
    })
  }

  /**
   * Set the prompt that started the plan:  a `blockquote.plan-prompt` near the top of the Overview, one `<p>` per
   * paragraph (blank lines split them, single newlines become `<br>`).  Replaces any earlier one;  "" removes it.
   * - folded away in an aside titled "Kickoff prompt" (`ui-accordion.plan-prompt-panel`):  the doc's history, not
   *   what a reader comes for;  a bare quote (docs before 2026-10-04) moves into one (`foldPrompt()`)
   * - the "Plan hung?" notice's copy of it too (`setHungPrompt()`)
   */
  setPrompt(prompt) {
    this.setHungPrompt(prompt)
    const quote = this.document.querySelector("blockquote.plan-prompt")
    const html = promptHTML(prompt)
    if (!html) return (quote?.closest(".plan-prompt-panel") ?? quote)?.remove()
    if (quote) {
      quote.innerHTML = html
      this.foldPrompt()
      return
    }
    const panel = this.fragment(promptPanel(html)).firstElementChild
    const overview = this.section("overview")
    const summary = overview.querySelector(":scope > .plan-summary")
    if (summary) summary.after(panel)
    else prependContent(overview, panel)
  }

  /**
   * A bare `blockquote.plan-prompt` (docs before 2026-10-04) into the folded "Kickoff prompt" aside, where it
   * stood;  moved?
   */
  foldPrompt() {
    const quote = this.document.querySelector("blockquote.plan-prompt")
    if (!quote || quote.closest(".plan-prompt-panel")) return false
    const panel = this.fragment(promptPanel("")).firstElementChild
    quote.replaceWith(panel)
    panel.querySelector("blockquote.plan-prompt").replaceWith(quote)
    return true
  }

  /**
   * The "Plan hung?" notice's copy of the kickoff prompt:  a `ui-code` with a copy button, so a restart can paste
   * it back.  "" (or no notice:  planning is over) removes it.
   * - the text exact, in a `<script type="text/plain">`;  NOTE:  `</script` in it is written `<\/script`
   */
  setHungPrompt(prompt) {
    const notice = this.document.querySelector("ui-message.plan-hung")
    notice?.querySelector(":scope > ui-code.plan-hung-prompt")?.remove()
    const text = (prompt ?? "").trim()
    if (!notice || !text) return
    const code = this.element("ui-code", { class: "plan-hung-prompt", language: "text", wrap: "", copy: "" })
    const script = this.element("script", { type: "text/plain" })
    script.textContent = text.replace(/<\/script/gi, "<\\/script")
    code.append(script)
    notice.append(code)
  }

  ////////////////
  // ## Migrate
  ////////////////

  /**
   * Bring an older doc up to date (the layout before 2026-10-01, the `section.s2` markup before 2026-10-02);
   * returns what changed, as lines (none:  already current).
   * - `#plan` goes:  its summary moves to the top of the Overview, its progress bar to `#phases`, its phase list away
   * - sections in `SECTION_ORDER`, titles renumbered, and the numbers in them with them (`3.1` -> `1.1`)
   * - the h1 goes into the sticky page header, with the step label;  it and `<title>` read `Epic: <title>`
   * - the kickoff prompt folds into its "Kickoff prompt" aside
   * - item lists become `ui-list`s of `ui-item`s;  an item's "details" panel takes the item's line as its title
   * - phase bodies become `ui-list`s with an icon per field;  every done phase but the last folds
   * - links to `#plan` go to `#overview`
   * - every `section.s2|s3` becomes a `<ui-section>` (`to-ui-section.js` `convertSections()`);  a standard section
   *   without an icon gets the template's
   * - each step works on either markup, so a doc converted by `to-ui-section.js` alone still migrates
   * - "Questions & Decisions" is "Questions" (D13), with its new icon and note;  "Judgement calls" gets the gavel
   * - a phase's hand-written "Judgement calls:" line goes:  the "To review" line replaces it (`updateStates()`, the
   *   last step), and the items it linked get the phase (`data-phase`) so they're still listed
   * - NOT yet:  merging an old doc's question + decision pairs into one answered question (P4 of `review-review`)
   */
  migrate() {
    const changes = []
    if (this.migrateHeader()) changes.push("h1 in the sticky page header, with the step label")
    if (this.migrateTitle()) changes.push(`page title "${TITLE_PREFIX}<title>"`)
    if (this.foldPrompt()) changes.push('kickoff prompt folded into a "Kickoff prompt" aside')
    if (this.migratePlanSection()) changes.push("#plan dropped:  summary to Overview, progress bar to Phases")
    if (this.orderSections()) changes.push(`sections ordered ${SECTION_ORDER.join(", ")}, renumbered`)
    const items = this.migrateItems()
    if (items) changes.push(`${items} items as ui-item, details titled by their line`)
    changes.push(...this.mergeQuestions())
    if (this.addJudgements()) changes.push("#judgements (Judgement calls) added after Questions")
    const bodies = this.migratePhaseBodies()
    if (bodies) changes.push(`${bodies} phase bodies as ui-list`)
    const sections = convertSections(this.document)
    if (sections.converted) {
      const dropped = sections.droppedIds.map((id) => `#${id}`).join(", ")
      changes.push(`${sections.converted} sections as <ui-section>${dropped ? ` (${dropped} gone)` : ""}`)
    }
    if (!this.document.querySelector('.plan-items[data-kind="test"]') && sectionOf(this.document, "log")) {
      this.addTestsSection()
      changes.push('"To test" section added')
    }
    const icons = this.migrateSectionIcons()
    if (icons) changes.push(`${icons} sections given their icon`)
    const swapped = this.swapOldIcons()
    if (swapped)
      changes.push(`${swapped} sections' old icon swapped (Questions:  file circle question, Judgement calls:  gavel)`)
    const lines = this.removeJudgementLines()
    if (lines) changes.push(`${lines} "Judgement calls:" lines removed:  each phase's "To review" line lists them`)
    const done = this.phases.filter((phase) => phase.status === "done")
    if (done.length && !this.phaseSections.some(isFolded)) {
      this.foldDonePhases(done.at(-1).n)
      if (done.length > 1) changes.push(`${done.length - 1} done phases folded`)
    }
    const badges = this.estimatesToBadges()
    if (badges) changes.push(`${badges} phase estimates moved into their titles' badges`)
    // last:  the steps above may add sections with an intro (`section.s2` converted, "To test")
    const tips = this.introsToTips()
    if (tips) changes.push(`${tips} section intros as title tooltips (data-tip)`)
    // after the intros:  an old note is a `data-tip` by now
    if (this.renameQuestions()) changes.push('"Questions & Decisions" titled "Questions", its note too')
    this.updateProgress()
    const states = this.updateStates()
    if (states) changes.push(`${states} item states, review labels and "To review" lines updated`)
    return changes
  }

  /** Section icons the template had before 2026-10-04 (`OLD_SECTION_ICONS`) into today's;  how many. */
  swapOldIcons() {
    let count = 0
    for (const [id, name] of Object.entries(OLD_SECTION_ICONS)) {
      const glyph = this.document.querySelector(`ui-section#${id} > ui-icon[slot="icon"]`)
      if (glyph?.getAttribute("name") !== name) continue
      glyph.setAttribute("name", SECTION_ICONS[id])
      count++
    }
    return count
  }

  /**
   * Each phase's hand-written "Judgement calls:" line (`<ui-item icon="compass"><b>Judgement calls:</b>  <a
   * href="#j2">J2</a></ui-item>`, any icon) goes;  how many.
   * - the items it links get `data-phase` (unless they have one), so the "To review" line lists them while open
   */
  removeJudgementLines() {
    let count = 0
    for (const section of this.phaseSections) {
      const body = section.querySelector(":scope > .plan-phase-body")
      for (const line of Array.from(body?.children ?? [])) {
        if (!/^Judgement calls:/.test(line.textContent.trim())) continue
        for (const link of line.querySelectorAll('a[href^="#"]')) {
          const item = this.document.getElementById(link.getAttribute("href").slice(1))
          if (item?.parentElement?.matches(".plan-items") && !item.hasAttribute("data-phase"))
            item.setAttribute("data-phase", section.getAttribute("data-phase"))
        }
        line.remove()
        count++
      }
    }
    return count
  }

  /** "Questions & Decisions" -> "Questions" (D13), and its old note (`data-tip`) -> `DECISIONS_NOTE`;  changed? */
  renameQuestions() {
    const section = sectionOf(this.document, "decisions")
    if (!section) return false
    const renamed = replaceInTitle(section, /\bQuestions & Decisions\s*$/, "Questions") !== undefined
    const tip = section.getAttribute("data-tip")
    const retipped = tip !== null && OLD_DECISIONS_NOTES.includes(squeeze(tip))
    if (retipped) section.setAttribute("data-tip", DECISIONS_NOTE)
    return renamed || retipped
  }

  /** A doc made before 2026-10-03 gets the template's `#judgements` section, just after `#decisions`, numbered;  added? */
  addJudgements() {
    if (this.document.getElementById("judgements")) return false
    const decisions = this.document.getElementById("decisions")
    if (!decisions) return false
    decisions.after(this.document.createTextNode("\n\n        "), this.fragment(JUDGEMENTS_SECTION))
    this.orderSections()
    return true
  }

  /** A `<ui-section>` among `SECTION_ICONS`' with no icon gets its icon (the template's);  how many. */
  migrateSectionIcons() {
    let count = 0
    for (const [id, name] of Object.entries(SECTION_ICONS)) {
      const section = this.document.getElementById(id)
      if (section?.localName !== "ui-section" || section.hasAttribute("icon")) continue
      if (section.querySelector(':scope > [slot="icon"]')) continue
      const glyph = this.fragment(`<ui-icon slot="icon" name="${name}"></ui-icon>`)
      section.prepend(this.document.createTextNode("\n"), glyph)
      count++
    }
    return count
  }

  /** The h1 into `<ui-sticky class="spell-h1"><header class="spell-page-head">` with a `.plan-step`;  done? */
  migrateHeader() {
    const h1 = this.document.querySelector("main h1")
    if (!h1 || h1.closest("ui-sticky")) return false
    const sticky = this.element("ui-sticky", { class: "spell-h1" })
    const header = this.element("header", { class: "spell-page-head" })
    h1.replaceWith(sticky)
    sticky.append(header)
    header.append(h1, this.element("span", { class: "plan-step", hidden: "" }))
    return true
  }

  /**
   * Each top-level section's intro (a `p.meta` first in it, after its icon) becomes its title's tooltip:  `data-tip`
   * on the section, which the runtime puts on the title (`wireTips()`);  how many.
   * - why:  the intros are the same on every doc and cost a line each in a narrow side bar (Owen, 2026-10-04)
   */
  introsToTips() {
    let count = 0
    for (const section of this.document.querySelectorAll("main > ui-section")) {
      const note = section.querySelector(":scope > p.meta")
      if (!note) continue
      section.setAttribute("data-tip", note.textContent.replace(/\s+/g, " ").trim())
      note.remove()
      count++
    }
    return count
  }

  /** The h1 and `<title>` as `Epic: <title>` (`TITLE_PREFIX`), from the h1;  done? */
  migrateTitle() {
    const h1 = this.document.querySelector("main h1")
    if (!h1) return false
    const title = `${TITLE_PREFIX}${this.title}`
    const head = this.document.querySelector("title")
    if (h1.textContent.trim() === title && (!head || head.textContent === title)) return false
    h1.textContent = title
    if (head) head.textContent = title
    return true
  }

  /** The epic's title:  the h1's text without `TITLE_PREFIX`;  "" when there's no h1. */
  get title() {
    return docTitle(this.document) ?? ""
  }

  /** Drop `#plan`:  summary to the Overview's top, progress bar to `#phases`;  done? */
  migratePlanSection() {
    const plan = sectionOf(this.document, "plan")
    if (!plan) return false
    const summary = plan.querySelector(".plan-summary")
    if (summary) {
      summary.classList.add("lede")
      prependContent(this.section("overview"), summary)
    }
    const bar = plan.querySelector("ui-progress.plan-progress")
    if (bar) prependContent(this.section("phases"), bar)
    plan.remove()
    for (const link of this.document.querySelectorAll('a[href="#plan"]')) link.setAttribute("href", "#overview")
    return true
  }

  /**
   * Sections in `SECTION_ORDER`, each title numbered by its place, the sub-numbers in it too (`3.1` -> `1.1`:  nested
   * sections' titles, h3s, h4s);  changed?
   */
  orderSections() {
    const sections = SECTION_ORDER.map((id) => sectionOf(this.document, id)).filter(Boolean)
    if (!sections.length) return false
    const before = sections.map((section) => section.outerHTML).join("")
    // moved only when out of order:  a move leaves the whitespace between sections behind, so each gets a newline
    const inOrder = sections.every((section, index) => !index || followsInDocument(sections[index - 1], section))
    if (!inOrder) {
      const anchor = this.document.createComment("sections")
      sections[0].before(anchor)
      for (const section of sections) anchor.before(this.document.createTextNode("\n"), section)
      anchor.remove()
    }
    sections.forEach((section, index) => {
      const old = renumber(section, /^(\s*)\d+\./, `$1${index + 1}.`)
      if (old === undefined) return
      const sub = new RegExp(`^(\\s*)${old}\\.`)
      const inner = section.localName === "ui-section" ? "ui-section, h3, h4" : "h3, h4"
      for (const heading of section.querySelectorAll(inner)) renumber(heading, sub, `$1${index + 1}.`)
    })
    return sections.map((section) => section.outerHTML).join("") !== before
  }

  /** `ol.plan-items` -> `ui-list`, `li` -> `ui-item`, "details" panels titled by the item's line;  how many items. */
  migrateItems() {
    let count = 0
    for (const list of this.document.querySelectorAll("ol.plan-items")) {
      const replacement = this.element("ui-list", {
        class: "plan-items",
        "data-kind": list.getAttribute("data-kind"),
        divided: "",
        relaxed: ""
      })
      for (const li of Array.from(list.children)) {
        const item = this.element("ui-item", Object.fromEntries(Array.from(li.attributes, (a) => [a.name, a.value])))
        // an item added to the old list since this script changed is already titled by its line
        const aside = li.querySelector(":scope > ui-accordion:not(.plan-item)")
        if (aside) {
          aside.remove()
          const content = aside.querySelector(":scope > ui-content")
          const panel = this.element("ui-accordion", { class: "plan-item" })
          const title = this.element("ui-title")
          const body = this.element("ui-content")
          title.append(...Array.from(li.childNodes))
          if (content) body.append(...Array.from(content.childNodes))
          panel.append(title, body)
          item.append(panel)
        } else item.append(...Array.from(li.childNodes))
        trimWhitespace(item.querySelector(":scope > ui-accordion > ui-title") ?? item)
        replacement.append(item)
        count++
      }
      list.replaceWith(replacement)
    }
    return count
  }

  /**
   * An old doc's own `#questions` into `#decisions` ("Questions");  returns what changed, as lines.
   * - decisions in force become `decided` (they were `open`, which now means "waiting")
   * - open questions go to the top of the decisions' list;  an answered one goes just before the decision whose
   *   title names it (`(Q8)`), with a link on to it, else after the open ones
   * - `#questions` goes;  links to it go to `#decisions`;  the h2 and its note say what the section holds now
   */
  mergeQuestions() {
    const changes = []
    const decisions = this.document.querySelector('ui-list.plan-items[data-kind="decision"]')
    if (!decisions) return changes
    let decided = 0
    for (const item of decisions.children) {
      if (!/^d\d+$/.test(item.id) || item.getAttribute("data-status") !== "open") continue
      item.setAttribute("data-status", "decided")
      decided++
    }
    if (decided) changes.push(`${decided} decisions marked decided`)
    const section = sectionOf(this.document, "questions")
    if (!section) return changes
    const questions = Array.from(section.querySelectorAll(".plan-items > [id]"))
    const open = questions.filter((question) => question.getAttribute("data-status") === "open")
    decisions.prepend(...open)
    let paired = 0
    for (const question of questions.filter((item) => !open.includes(item))) {
      const q = question.id.toUpperCase()
      const answer = Array.from(decisions.children).find(
        (item) =>
          /^d\d+$/.test(item.id) && new RegExp(`\\b${q}\\b`).test(item.querySelector(".plan-title")?.textContent ?? "")
      )
      if (!answer) {
        const last = open.at(-1)
        if (last) last.after(question)
        else decisions.prepend(question)
        continue
      }
      answer.before(question)
      const line = question.querySelector(":scope > ui-accordion > ui-title") ?? question
      if (!line.querySelector(":scope > .plan-answer"))
        line
          .querySelector(":scope > .plan-title")
          ?.after(this.fragment(` <a class="plan-answer" href="#${answer.id}">→ ${answer.id.toUpperCase()}</a>`))
      paired++
    }
    section.remove()
    for (const link of this.document.querySelectorAll('a[href="#questions"]')) link.setAttribute("href", "#decisions")
    const target = this.section("decisions")
    replaceInTitle(target, /\bDecisions\s*$/, "Questions")
    const note = target.querySelector(":scope > p.meta")
    if (note) note.textContent = DECISIONS_NOTE
    else target.setAttribute("data-tip", DECISIONS_NOTE)
    changes.push(`${questions.length} questions merged into Questions (${paired} next to their answers)`)
    return changes
  }

  /** `ul.plan-phase-body` -> `ui-list` of `ui-item`s with an icon per field;  how many. */
  migratePhaseBodies() {
    const icons = Object.fromEntries(PHASE_FIELDS)
    let count = 0
    for (const list of this.document.querySelectorAll("ul.plan-phase-body")) {
      const replacement = this.element("ui-list", { class: "plan-phase-body" })
      for (const li of Array.from(list.children)) {
        const field = li.querySelector(":scope > b")?.textContent.replace(/:\s*$/, "").trim()
        const item = this.element("ui-item", icons[field] ? { icon: icons[field] } : {})
        item.append(...Array.from(li.childNodes))
        replacement.append(item)
      }
      list.replaceWith(replacement)
      count++
    }
    return count
  }

  /**
   * Structural problems, as text:  duplicate ids, `#id` links to nowhere, phases without a valid status, list and
   * sections out of step.
   */
  check() {
    const problems = []
    const seen = new Map()
    for (const el of this.document.querySelectorAll("[id]")) seen.set(el.id, (seen.get(el.id) ?? 0) + 1)
    for (const [id, count] of seen) if (count > 1) problems.push(`id "${id}" used ${count} times`)
    for (const a of this.document.querySelectorAll('a[href^="#"]')) {
      const id = a.getAttribute("href").slice(1)
      if (id && !seen.has(id)) problems.push(`link to missing #${id} ("${a.textContent.trim()}")`)
    }
    for (const phase of this.phases) {
      if (!STATUS[phase.status]) problems.push(`P${phase.n} has status "${phase.status}"`)
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
  require(selector) {
    const found = this.document.querySelector(selector)
    if (!found) throw new PlanDocError(`no ${selector} in the doc:  is it a plan doc?`)
    return found
  }

  /** The section `id` titles (`sectionOf()`);  throws if the doc doesn't have it. */
  section(id) {
    const found = sectionOf(this.document, id)
    if (!found) throw new PlanDocError(`no section #${id} in the doc:  is it a plan doc?`)
    return found
  }

  /** New element with attributes, in order (`""`:  a bare boolean attribute). */
  element(tag, attributes = {}) {
    return createElement(this.document, tag, Object.entries(attributes))
  }

  /** Nodes of an HTML snippet, as a fragment to insert. */
  fragment(html) {
    const template = this.document.createElement("template")
    template.innerHTML = html
    return template.content
  }
}

/** A problem the user should see as a message, not a stack trace. */
export class PlanDocError extends Error {}

/** An item's (element's) title text. */
function titleOf(item) {
  return item.querySelector(".plan-title")?.textContent.trim() ?? item.id
}

/**
 * The option an item's details mark "(recommended)", without the mark;  `null` when none.
 * - the innermost element saying it (a pros-cons label, a bold lead, a list item), so the text stays short
 * - `details`:  the item's `ui-content`, or `null`
 */
function recommendation(details) {
  if (!details) return null
  const marked = Array.from(details.querySelectorAll("*")).filter(
    (el) =>
      RECOMMENDED.test(el.textContent) && !Array.from(el.children).some((child) => RECOMMENDED.test(child.textContent))
  )
  const best = marked.sort((a, b) => rank(a) - rank(b) || a.textContent.length - b.textContent.length)[0]
  if (!best) return null
  return best.textContent
    .replace(/\s*\(recommended\)\s*/i, " ")
    .replace(/\s+/g, " ")
    .trim()

  /** An option's own label beats a bold lead, which beats any other mention ("yes (recommended)" in a cell). */
  function rank(el) {
    if (el.localName === "ui-label") return 0
    return ["b", "strong"].includes(el.localName) ? 1 : 2
  }
}

/** The mark `recommendation()` looks for. */
const RECOMMENDED = /\(recommended\)/i

/**
 * A review label's color (`updateReviewLabel()`):  "to do" orange (work in progress), "deferred" grey, "reviewed
 * 10-02" green while its item is `recent` (`state`), then grey.
 */
function reviewLabelColor(words, state) {
  if (words === "to do") return STATE_COLORS.progress
  if (words.startsWith("deferred")) return "grey"
  return state === "recent" ? STATE_COLORS.recent : STATE_COLORS.old
}

/** `html` with its whitespace runs as one space, trimmed:  to compare markup oxfmt may have rewrapped. */
function squeeze(html) {
  return html.replace(/\s+/g, " ").trim()
}

////////////////
// ## Commits
////////////////

/**
 * A phase commit's subject:  `P3:`, `P4 + P5:`, `WIP P3:`, `<epic> P3:`, `P6a:` (phase 6), `P1 follow-up:`.
 * - `P052 fonts` isn't one:  a phase number has no leading 0, and the colon follows at once
 */
const PHASE_SUBJECT =
  /^(?:WIP\s+)?(?:[a-z][a-z0-9-]*\s+)?(P[1-9]\d*[a-z]?(?:\s*\+\s*P[1-9]\d*[a-z]?)*)(?:\s+follow-up)?\s*:\s*(.*)$/

/** An item fix's subject:  `Fix I3:`, `<epic> I3:`, `Fix I3 + I4:`;  ids of any item kind. */
const ITEM_SUBJECT =
  /^(?:WIP\s+)?(?:[a-z][a-z0-9-]*\s+)?(?:[Ff]ix\s+)?([QCITVJD]\d+(?:\s*[+,]\s*[QCITVJD]\d+)*)\s*:\s*(.*)$/

/**
 * What a commit subject says it did:  `{ phases, items, sentence }`, or `null` when it names neither.
 * - `phases`:  numbers (`P6a` -> 6);  `items`:  ids, lower case (`i3`)
 * - `sentence`:  the subject after ` -- ` (`P3:  Name -- what it did`), else after the colon
 */
export function parseCommitSubject(subject) {
  const phase = subject.match(PHASE_SUBJECT)
  const item = phase ? null : subject.match(ITEM_SUBJECT)
  const match = phase ?? item
  if (!match) return null
  const names = match[1].split(/\s*[+,]\s*/)
  const rest = match[2].trim()
  const dash = rest.indexOf(" -- ")
  return {
    phases: phase ? names.map((name) => Number(name.match(/\d+/)[0])) : [],
    items: item ? names.map((name) => name.toLowerCase()) : [],
    sentence: (dash >= 0 ? rest.slice(dash + 4) : rest).trim()
  }
}

/**
 * The GitHub page of a repo, from its remote's URL (`git remote get-url origin`);  `null` when it isn't GitHub.
 * - `https://github.com/o/r.git`, `git@github.com:o/r.git`, `ssh://git@github.com/o/r` -> `https://github.com/o/r`
 */
export function githubBase(remote) {
  const match = String(remote ?? "")
    .trim()
    .match(/github\.com[:/]([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/)
  return match ? `https://github.com/${match[1]}/${match[2]}` : null
}

/** One entry of a commit list:  the short sha (a link to `base`'s commit page, else `<code>`) and `sentence`. */
function commitEntry(sha, sentence, base) {
  const short = sha.slice(0, 7)
  const link = base
    ? `<a class="plan-commit" href="${escapeAll(`${base}/commit/${sha}`)}" target="github">${short}</a>`
    : `<code class="plan-commit">${short}</code>`
  return `<li data-sha="${escapeAll(sha)}">${link}  ${text(sentence)}</li>`
}

/**
 * The entry for commit `sha` in commit list `list`, if any:  by its `data-sha`, else (written by hand) by its short
 * sha.
 */
function findCommit(list, sha) {
  return Array.from(list.children).find((entry) => {
    const listed = entry.getAttribute("data-sha")
    if (listed) return listed === sha || sha.startsWith(listed) || listed.startsWith(sha)
    const short = entry.querySelector(".plan-commit")?.textContent.trim()
    return Boolean(short) && sha.startsWith(short)
  })
}

/** `q12` -> `12`;  0 for an id without a number. */
function idNumber(id) {
  return Number(id.match(/\d+$/)?.[0]) || 0
}

/** The header's step label for `phase`:  a link to it, `prefix` before its name. */
function stepLabel(phase, color, glyph, prefix) {
  // just `<icon> P4` (Owen, 2026-10-04);  the phase's name in the tooltip
  const tip = text(`${prefix}P${phase.n} · ${phase.name}`)
  return `<ui-label basic color="${color}" icon="${glyph}" href="#p${phase.n}" title="${tip}">P${phase.n}</ui-label>`
}

/**
 * The folded "Kickoff prompt" aside around a `blockquote.plan-prompt` holding `html`:  a styled accordion, as the
 * docs' asides (`spell-aside`), no `open`
 */
function promptPanel(html) {
  return (
    `<ui-accordion class="plan-prompt-panel spell-aside" styled><ui-title>Kickoff prompt</ui-title>` +
    `<ui-content><blockquote class="plan-prompt">${html}</blockquote></ui-content></ui-accordion>`
  )
}

/** A plan doc's title:  its h1's text, `TITLE_PREFIX` dropped;  `undefined` without an h1. */
function docTitle(document) {
  const heading = document.querySelector("h1")?.textContent.replace(/\s+/g, " ").trim()
  if (heading === undefined) return undefined
  return heading.startsWith(TITLE_PREFIX) ? heading.slice(TITLE_PREFIX.length) : heading
}

/** A prompt's text as `<p>`s:  blank lines split paragraphs, single newlines become `<br>`;  "" for none. */
function promptHTML(prompt) {
  return String(prompt ?? "")
    .trim()
    .split(/\n\s*\n/)
    .filter((paragraph) => paragraph.trim())
    .map((paragraph) => `<p>${text(paragraph.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("")
}

////////////////
// ## Sections, either markup
////////////////

/**
 * The section titled `id`:  the `<ui-section id>` itself, else (old markup) the `section` around the heading `#id`;
 * `null` when there's none.
 */
function sectionOf(document, id) {
  const element = document.getElementById(id)
  if (!element) return null
  return element.localName === "ui-section" ? element : element.closest("section")
}

/** The old heading of `section.s2|s3` (`ui-sticky > h2|h3`), else null. */
function oldHeading(section) {
  return section.querySelector(":scope > ui-sticky > :is(h2, h3)")
}

/**
 * A section's title as text, whitespace collapsed, badges (`ui-label`) left out:  a `<ui-section>`'s `header`, else
 * its `slot="header"`;  an old section's h2 / h3.
 */
function titleText(section) {
  const header = section.localName === "ui-section" ? section.getAttribute("header") : null
  const source =
    header === null
      ? section.localName === "ui-section"
        ? section.querySelector(':scope > [slot="header"]')
        : oldHeading(section)
      : null
  let value = header ?? ""
  if (source) {
    const clone = source.cloneNode(true)
    for (const label of clone.querySelectorAll("ui-label")) label.remove()
    value = clone.textContent
  }
  return value.replace(/\s+/g, " ").trim()
}

/**
 * Replace `pattern` in the title of `element`:  a `<ui-section>`'s `header` (else its `slot="header"`), an old
 * section's heading, or a plain h3 / h4;  returns the match, or `undefined` when the title doesn't match.
 */
function replaceInTitle(element, pattern, replacement) {
  if (element.localName === "ui-section") {
    const header = element.getAttribute("header")
    if (header === null)
      return replaceInHeading(element.querySelector(':scope > [slot="header"]'), pattern, replacement)
    const match = header.match(pattern)
    if (match) element.setAttribute("header", header.replace(pattern, replacement))
    return match ?? undefined
  }
  if (element.localName === "section") return replaceInHeading(oldHeading(element), pattern, replacement)
  return replaceInHeading(element, pattern, replacement)
}

/**
 * Replace `pattern` in the title of `element` (`replaceInTitle()`);  returns the number it replaced (`3` for
 * `3.`), or `undefined` when it didn't match.
 */
function renumber(element, pattern, replacement) {
  return replaceInTitle(element, pattern, replacement)?.[0].match(/\d+/)?.[0]
}

/**
 * Put `node` first in `section`'s content:  after its title -- a `<ui-section>`'s slotted children at its start
 * (icon, header), an old section's `ui-sticky`.
 */
function prependContent(section, node) {
  let title = null
  for (const child of section.children) {
    if (!child.matches("ui-sticky, [slot]")) break
    title = child
  }
  const space = section.ownerDocument.createTextNode("\n")
  if (title) title.after(space, node)
  else section.prepend(space, node)
}

/** Does `later` come after `earlier` in document order? */
function followsInDocument(earlier, later) {
  return !!(earlier.compareDocumentPosition(later) & 4) /* Node.DOCUMENT_POSITION_FOLLOWING */
}

/** Fold or unfold a phase section in the markup:  `collapsed` (`<ui-section>`), `data-fold="closed"` (old). */
function setFolded(section, folded) {
  if (section.localName === "ui-section") toggle(section, "collapsed", folded)
  else if (folded) section.setAttribute("data-fold", "closed")
  else section.removeAttribute("data-fold")
}

/** Is a phase section folded in the markup?  (`setFolded()`) */
function isFolded(section) {
  return section.localName === "ui-section" ? section.hasAttribute("collapsed") : section.hasAttribute("data-fold")
}

/**
 * Replace `pattern` in the first non-blank text node of `heading` (after its icons);  returns the match, or
 * `undefined` when that text doesn't match.
 */
function replaceInHeading(heading, pattern, replacement) {
  if (!heading) return undefined
  const walker = heading.ownerDocument.createTreeWalker(heading, 4 /* NodeFilter.SHOW_TEXT */)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent.trim()) continue
    const match = node.textContent.match(pattern)
    if (!match) return undefined
    node.textContent = node.textContent.replace(pattern, replacement)
    return match
  }
  return undefined
}

/** Drop whitespace-only text at the start and end of `element`. */
function trimWhitespace(element) {
  while (element.firstChild?.nodeType === 3 && !element.firstChild.textContent.trim()) element.firstChild.remove()
  while (element.lastChild?.nodeType === 3 && !element.lastChild.textContent.trim()) element.lastChild.remove()
}

/** A phase's status icon;  `slotted`:  a `<ui-section>`'s (`slot="icon"`). */
function icon(status, slotted = false) {
  const { icon: name, color } = STATUS[status]
  return `<ui-icon${slotted ? ' slot="icon"' : ""} name="${name}" color="${color}"></ui-icon>`
}

/** Set or remove boolean attribute `name` on `element`. */
function toggle(element, name, on) {
  if (on) element.setAttribute(name, "")
  else element.removeAttribute(name)
}

/** `P2 · Short Name` -> `Short Name`. */
function phaseName(label) {
  return label.replace(/^\s*P\d+\s*·\s*/, "").trim()
}

/** Phase `section`'s Estimate field (`ui-item[icon=clock]`, or an old doc's `li`), if any. */
function estimateField(section) {
  const body = section.querySelector(":scope > .plan-phase-body")
  return Array.from(body?.children ?? []).find((item) => /^Estimate:/.test(item.textContent.trim()))
}

/**
 * Phase `section`'s estimate, as text:  its title's badge, else (old docs) its field;  `undefined` while missing or
 * `TBD`.
 */
function estimateText(section) {
  const badge = section.localName === "ui-section" ? section.getAttribute("badge") : null
  if (badge) return badge
  const value = estimateField(section)
    ?.textContent.trim()
    .replace(/^Estimate:\s*/, "")
  return value && value !== "TBD" ? value : undefined
}

/**
 * An estimate as minutes, `{ min, max }`;  `undefined` when it won't parse.
 * - `30m`, `45 min`, `2h`, `1.5h`, `1h30m`, `~2h`;  a range:  `1-2h`, `30m-1h`
 */
export function parseDuration(estimate) {
  const value = estimate?.toLowerCase().replace(/~/g, "").trim()
  if (!value) return undefined
  const range = value.match(/^([\d.]+)\s*-\s*([\d.]+)\s*(h|m|min)$/)
  if (range) return { min: toMinutes(range[1], range[3]), max: toMinutes(range[2], range[3]) }
  const ends = value.split(/\s*-\s*/)
  if (ends.length > 2) return undefined
  const [min, max] = ends.map(sumUnits)
  if (min === undefined || (ends.length === 2 && max === undefined)) return undefined
  return { min, max: max ?? min }
}

/** `1h30m` -> 90;  `undefined` unless the whole of `value` is hours and minutes. */
function sumUnits(value) {
  const parts = Array.from(value.matchAll(/([\d.]+)\s*(h|min|m)(?![a-z])\s*/g))
  if (
    !parts.length ||
    parts
      .map((part) => part[0])
      .join("")
      .trim() !== value.trim()
  )
    return undefined
  return parts.reduce((total, part) => total + toMinutes(part[1], part[2]), 0)
}

/** `count` `unit`s (`h` / `m` / `min`) in minutes. */
function toMinutes(count, unit) {
  return Math.round(Number(count) * (unit === "h" ? 60 : 1))
}

/** `ranges` added up. */
function sumRanges(ranges) {
  return ranges.reduce((total, range) => ({ min: total.min + range.min, max: total.max + range.max }), {
    min: 0,
    max: 0
  })
}

/** `{ min: 60, max: 150 }` -> `1h-2h 30m`;  one value when they're equal. */
function formatRange({ min, max }) {
  return min === max ? formatMinutes(min) : `${formatMinutes(min)}-${formatMinutes(max)}`
}

/** 90 -> `1h 30m`, 45 -> `45m`, 120 -> `2h`, 0 -> `0m`. */
function formatMinutes(total) {
  const hours = Math.floor(total / 60)
  const rest = total % 60
  return [hours && `${hours}h`, (rest || !hours) && `${rest}m`].filter(Boolean).join(" ")
}

/** Escape for HTML text. */
function text(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/**
 * `<time>` for `date`, local:  shows `YYYY-MM-DD HH:MM`, `datetime` carries the offset (`2026-09-30T23:30-07:00`).
 */
export function timeTag(date = new Date()) {
  const clock = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  const minutes = -date.getTimezoneOffset()
  const offset = `${minutes < 0 ? "-" : "+"}${String(Math.floor(Math.abs(minutes) / 60)).padStart(2, "0")}:${String(
    Math.abs(minutes) % 60
  ).padStart(2, "0")}`
  return `<time datetime="${isoDate(date)}T${clock}${offset}">${isoDate(date)} ${clock}</time>`
}

/**
 * `date` as ISO local time with its offset, to the second:  `2026-10-04T12:46:05-04:00`.
 * - an item's change stamp (`data-changed`):  compared with a commit time (`git log --format=%cI`), same form
 */
export function isoTime(date = new Date()) {
  const minutes = -date.getTimezoneOffset()
  const sign = minutes < 0 ? "-" : "+"
  const offset = `${sign}${pad(Math.floor(Math.abs(minutes) / 60))}:${pad(Math.abs(minutes) % 60)}`
  const clock = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  return `${isoDate(date)}T${clock}${offset}`

  /** `7` -> `07`. */
  function pad(value) {
    return String(value).padStart(2, "0")
  }
}

/** `YYYY-MM-DD` as a `Date`:  local midnight that day. */
function localDay(day) {
  const [year, month, date] = day.split("-").map(Number)
  return new Date(year, month - 1, date)
}

/** `date`'s local date, `YYYY-MM-DD`. */
export function isoDate(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

////////////////
// ## Command line
////////////////

/** Usage, printed with no command or a bad one. */
const USAGE = `usage:  yarn plan-doc <command> <name> ...    (doc:  packages/docs/epics/<name>/<name>.html)
  new <name> [--title "Title"] [--prompt "text" | --prompt-file path]
                                                   copy the template, fill it in, update the docs index
  add-phase <name> "Short Name" [--goal html] [--files html] [--verify html] [--estimate 2h]
  estimate <name> <N> "1-2h"                       set a phase's estimate;  the Overview's total follows
  phase <name> <N> todo|active|done [--done html] [--no-open]
                                                   set a phase's status;  done drops its UPDATE markers, and
                                                   --done writes its Done field (a <ul> of what was built);
                                                   brings the doc forward in VS Code (it updates itself)
  add <name> question|judgement|caveat|issue|todo|test|decision "title" [--details html]    prints the new id
                                                   (a decision:  a question born answered, Q7)
  decide <name> <Q id> "answer" [--details html] [--option A]
                                                   answer a question:  the answer goes INTO it (an ivory card);
                                                   --option marks the chosen option card;  prints its id
  close <name> <id>  /  reopen <name> <id>         strike / unstrike an item
  commit <name> <sha> --phase N | --item <id> "sentence"
                                                   list a commit under a phase or an item (replaces its entry)
  commits <name> --backfill                        list every phase / item commit in the doc's git history
                                                   (subjects "P3:  Name -- summary", "Fix I3:  ...")
  log <name> "text"                                timestamped line in the log
  overnight <name> start "P3-P6" [--branch b]       a /bedtime run's report:  an "Overnight" section on top
  overnight <name> phase <N> "text"  /  problem "text"  /  done "summary"  /  remove
                                                   a line under Phases / Problems;  the run is over;  gone
  prompt <name> "text" | --file path               set the prompt that started the plan ("" removes it)
  summary <name> [--json]                          open questions, issues, caveats, todos;  the next phase
  review <name> <id> ["outcome"]                   mark an item reviewed today;  the outcome goes in the log
  defer <name> <id>                                put an item off:  still not reviewed, dated
  queue <name> <id> "work"  /  unqueue <name> <id> work a review decided on, waiting  /  started or dropped
  items <name> [--section issues] [--filter unreviewed|open|reviewed|queued|all] [--json]
                                                   what a review walks:  sections, counts, items, the queue
  items <name> --section issues --spec <file>      the review's item picker, a details page spec:
                                                   \`yarn details new <slug> --from <file>\`
  list [--json]                                    every epic, main and worktrees:  status, not reviewed / all
  backfill <name> | --all [--apply]                items Owen already went through, from past sessions;
                                                   a dry run unless --apply (review-backfill.js)
  summaries <file.html> ...                        \`summary --json\` of each doc, by path (worktrees' too):
                                                   JSON \`{ <file>: summary | { error } }\`;  for \`/epics\`
  check <name> [--no-browser]                      ids, links, phases;  then check-spell.js
  open <name>                                      show in VS Code's doc preview (right side bar)
  migrate <name>                                   bring an older doc (any layout) into the current one
Every command but \`new\` edits the epic's LIVE doc:  its own worktree's, else main's, else any worktree's.`

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    await main(process.argv.slice(2))
  } catch (error) {
    if (!(error instanceof PlanDocError)) throw error
    console.error(`plan-doc:  ${error.message}`)
    process.exit(1)
  }
}

/** Run one command;  may return a promise (`phase` and `open` show the doc in VS Code). */
function main(argv) {
  const { positional, flags } = parseArgs(argv)
  const [command, name, ...rest] = positional
  if (command === "list") return printEpics(listEpics(), flags.json)
  if (command === "backfill") return backfill(name, flags)
  if (!command || !name) return usage()
  if (command === "summaries") return printSummaries(positional.slice(1))
  // the epic's LIVE doc, wherever it is (its worktree, else main:  `findDoc()`);  `new` makes one HERE
  const file = command === "new" ? docPath(name) : findDoc(name)
  switch (command) {
    case "new":
      return create(name, file, flags)
    case "add-phase": {
      const n = edit(file, (plan) => {
        const added = plan.addPhase(need(rest[0], "a short name"), flags)
        plan.log(`P${added} added:  ${rest[0]}`)
        return added
      })
      return console.log(`P${n}`)
    }
    case "phase":
      edit(file, (plan) =>
        plan.setPhase(Number(need(rest[0], "a phase number")), need(rest[1], "a status"), { done: flags.done })
      )
      reindex()
      // a new stage:  bring the doc forward, unless told not to.  No reload, nor a second one:  the edit reaches the
      // page by the live client (it updates itself in place, `spell-doc-runtime.js` `wireLiveUpdate()`), and showing
      // the page the view already has only reveals it (`packages/vscode/src/DocView.ts`)
      return flags.noOpen ? undefined : openInVSCode(file)
    case "estimate":
      return edit(file, (plan) => {
        const n = Number(need(rest[0], "a phase number"))
        plan.setEstimate(n, need(rest[1], "the estimate"))
        plan.log(`P${n} estimate:  ${rest[1]}`)
      })
    case "add": {
      const id = edit(file, (plan) => plan.addItem(need(rest[0], "a kind"), need(rest[1], "a title"), flags))
      return console.log(id.toUpperCase())
    }
    case "decide": {
      const question = need(rest[0], "a question id")
      const id = edit(file, (plan) => {
        const decided = plan.decide(question, need(rest[1], "the answer"), flags)
        plan.log(`${decided.toUpperCase()} answered:  ${rest[1]}`)
        return decided
      })
      return console.log(id.toUpperCase())
    }
    case "commit":
      return commit(file, rest, flags)
    case "commits":
      if (!flags.backfill) throw new PlanDocError(`commits what?  --backfill\n${USAGE}`)
      return backfillCommits(file)
    case "close":
    case "reopen":
      return edit(file, (plan) => {
        const title = plan.setItem(need(rest[0], "an item id"), command === "close" ? "done" : "open")
        plan.log(`${rest[0].toUpperCase()} ${command === "close" ? "closed" : "reopened"}:  ${title}`)
      })
    case "review":
      return edit(file, (plan) => {
        const id = need(rest[0], "an item id")
        const title = plan.review(id)
        plan.log(`${id.toUpperCase()} reviewed:  ${rest[1] ?? title}`)
      })
    case "defer":
      return edit(file, (plan) => {
        const id = need(rest[0], "an item id")
        plan.log(`${id.toUpperCase()} deferred:  ${plan.defer(id)}`)
      })
    case "queue":
      return edit(file, (plan) => {
        const id = need(rest[0], "an item id")
        plan.queue(id, need(rest[1], "the work to do"))
        plan.log(`${id.toUpperCase()} to do:  ${rest[1]}`)
      })
    case "unqueue":
      return edit(file, (plan) => {
        const id = need(rest[0], "an item id")
        plan.log(`${id.toUpperCase()} off the to-do list:  ${plan.unqueue(id)}`)
      })
    case "items":
      return printItems(read(file), file, flags)
    case "log":
      return edit(file, (plan) => plan.log(need(rest[0], "the text")))
    case "overnight":
      return edit(file, (plan) => overnight(plan, rest, flags))
    case "prompt": {
      const prompt = flags.file ? readFileSync(flags.file, "utf8") : need(rest[0], "the prompt text")
      return edit(file, (plan) => plan.setPrompt(prompt))
    }
    case "migrate": {
      const changes = edit(file, (plan) => plan.migrate())
      return console.log(changes.length ? changes.map((line) => `- ${line}`).join("\n") : "already current")
    }
    case "summary":
      return printSummary(read(file).summary(), flags.json)
    case "check":
      return check(file, flags)
    case "open":
      return open(file)
    default:
      return usage()
  }
}

/** `overnight <name> <action> ...`:  the `/bedtime` run's temporary report section (`PlanDoc.startOvernight()`). */
function overnight(plan, [action, ...args], flags) {
  switch (action) {
    case "start": {
      const phases = need(args[0], "the phases, e.g. P3-P6")
      plan.startOvernight(phases, flags.branch)
      return plan.log(`Bedtime started:  ${phases}`)
    }
    case "phase":
      return plan.overnightPhase(need(args[0], "a phase number"), need(args[1], "what came of it"))
    case "problem":
      return plan.overnightProblem(need(args[0], "the problem"))
    case "done": {
      const summary = need(args[0], "a one-line summary")
      plan.finishOvernight(summary)
      return plan.log(`Bedtime done:  ${summary}`)
    }
    case "remove":
      if (plan.removeOvernight()) plan.log("Overnight report gone through:  section removed")
      return
    default:
      throw new PlanDocError(`overnight what?  start | phase | problem | done | remove (not '${action ?? ""}')`)
  }
}

/** `--key value` flags and `--key` switches, plus everything else in order. */
function parseArgs(argv) {
  const positional = []
  const flags = {}
  for (let i = 0; i < argv.length; i++) {
    const match = argv[i].match(/^--([\w-]+)$/)
    if (!match) positional.push(argv[i])
    else if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) flags[camel(match[1])] = argv[++i]
    else flags[camel(match[1])] = true
  }
  return { positional, flags }
}

/** `no-browser` -> `noBrowser`. */
function camel(flag) {
  return flag.replace(/-(\w)/g, (_, letter) => letter.toUpperCase())
}

/** `value`, or a usage error naming what's missing. */
function need(value, what) {
  if (value === undefined || value === "") throw new PlanDocError(`missing ${what}\n${USAGE}`)
  return value
}

/** Print usage and fail. */
function usage() {
  console.error(USAGE)
  process.exit(2)
}

/** The doc of plan `name`;  names are lower-kebab-case, as the folder and file. */
function docPath(name) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) throw new PlanDocError(`name "${name}" must be lower-kebab-case`)
  return join(DOCS, "epics", name, `${name}.html`)
}

/**
 * The doc of epic `name` in whichever checkout holds the live one:  its own worktree (`.claude/worktrees/<name>`),
 * else the main checkout, else the first worktree that has it.
 * - why not this checkout first:  every worktree has a COPY of every merged epic, from when it branched;  editing
 *   that copy would fork the record
 */
function findDoc(name) {
  docPath(name)
  const found = epicFile(name)
  if (!found) throw new PlanDocError(`no plan doc for "${name}" in the main checkout or any worktree`)
  return found
}

/** `findDoc()`'s file for `name`, or `undefined`. */
function epicFile(name) {
  return checkouts(name)
    .map((root) => join(root, "packages/docs/epics", name, `${name}.html`))
    .find((file) => existsSync(file))
}

/** The main checkout's root:  the parent of git's common dir (`.git`), the same from any worktree. */
function mainRoot() {
  const common = git("rev-parse", "--path-format=absolute", "--git-common-dir")
  return common ? dirname(common) : join(DOCS, "../..")
}

/** Checkout roots, in `findDoc()`'s order:  `name`'s own worktree (if given), the main checkout, the others. */
function checkouts(name) {
  const main = mainRoot()
  const trees = join(main, ".claude/worktrees")
  const worktrees = existsSync(trees)
    ? readdirSync(trees, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => join(trees, entry.name))
    : []
  const own = worktrees.filter((root) => basename(root) === name)
  return [...own, main, ...worktrees.filter((root) => basename(root) !== name)]
}

/**
 * Every epic, once each:  `{ name, title, status, checkout, notReviewed, total, file }`, in progress first, then
 * most not reviewed.
 * - `status`:  `in progress` while any phase isn't done (or there are none yet), else `done`
 * - `checkout`:  `main`, or `.claude/worktrees/<w>`:  where its live doc is (`findDoc()`)
 */
function listEpics() {
  const main = mainRoot()
  const names = new Set()
  for (const root of checkouts()) {
    const epics = join(root, "packages/docs/epics")
    if (!existsSync(epics)) continue
    for (const entry of readdirSync(epics, { withFileTypes: true })) {
      if (entry.isDirectory() && existsSync(join(epics, entry.name, `${entry.name}.html`))) names.add(entry.name)
    }
  }
  const epics = Array.from(names, (name) => {
    const file = epicFile(name)
    const plan = read(file)
    const sections = plan.reviewSections()
    const phases = plan.phases
    const root = file.slice(0, file.indexOf(`${join("packages", "docs", "epics")}`) - 1)
    return {
      name,
      title: docTitle(plan.document) ?? name,
      status: phases.length && phases.every((phase) => phase.status === "done") ? "done" : "in progress",
      checkout: root === main ? "main" : relative(main, root),
      notReviewed: sections.reduce((sum, section) => sum + section.notReviewed, 0),
      total: sections.reduce((sum, section) => sum + section.total, 0),
      file
    }
  })
  return epics.sort(
    (a, b) =>
      (a.status === "done") - (b.status === "done") || b.notReviewed - a.notReviewed || a.name.localeCompare(b.name)
  )
}

/** The plan doc at `file`, parsed;  `options` as `PlanDoc`'s constructor's. */
function read(file, options) {
  if (!existsSync(file)) throw new PlanDocError(`no plan doc ${relative(DOCS, file)}:  \`yarn plan-doc new\` first`)
  return PlanDoc.parse(readFileSync(file, "utf8"), undefined, options)
}

/**
 * Change the doc at `file` with `change(plan)`, under its lock (`SRV.FileLock`:  parallel agents, and the page
 * server's page edits, take turns);  returns what `change` returned.
 * - then the whole-doc pass (`updateStates()`), with `<body data-recent-since>` from the doc's checkout
 *   (`recentSince()`), stamps "updated", writes, tidies (link targets + oxfmt)
 */
function edit(file, change) {
  return SRV.FileLock.run(file, () => {
    const plan = read(file, { recentSince: recentSince(file) })
    const result = change(plan)
    plan.updateStates()
    plan.touch()
    writeFileSync(file, plan.toString())
    if (!tidy([relative(DOCS, file)])) throw new PlanDocError("tidy failed (see above)")
    return result
  })
}

/**
 * `new`:  copy the template to `file`, fill in name, title, date, branch and worktree, then update the index.
 * - the page's title and h1:  `Epic: <title>` (`TITLE_PREFIX`;  the template's h1 has it)
 * - refuses to overwrite:  the skill asks the user whether to reuse an existing doc
 */
function create(name, file, { title = titleCase(name), prompt, promptFile }) {
  if (existsSync(file)) throw new PlanDocError(`${relative(DOCS, file)} already exists`)
  const now = new Date()
  const today = isoDate(now)
  const fill = {
    name,
    title,
    date: today,
    timestamp: timeTag(now),
    branch: git("branch", "--show-current") || "(detached)",
    worktree: git("rev-parse", "--show-toplevel") || DOCS
  }
  const html = readFileSync(join(DOCS, TEMPLATE), "utf8")
    .replace(/\{\{(\w+)\}\}/g, (whole, key) =>
      key === "timestamp" ? fill.timestamp : key in fill ? escapeAll(fill[key]) : key === "prompt" ? "" : whole
    )
    .replace(/\n\s*<!--\s*PLAN DOC TEMPLATE\.[\s\S]*?-->/, "")
  const plan = PlanDoc.parse(html, now)
  plan.document.querySelector("title").textContent = `${TITLE_PREFIX}${title}`
  plan.document.querySelector('meta[name="description"]').setAttribute("content", `Plan doc:  ${title}.`)
  // the prompt that started the plan, quoted at the top of the Overview;  none:  the empty quote goes
  plan.setPrompt(promptFile ? readFileSync(promptFile, "utf8") : (prompt ?? ""))
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, plan.toString())
  if (!tidy([relative(DOCS, file)])) throw new PlanDocError("tidy failed (see above)")
  reindex()
  console.log(relative(process.cwd(), file))
}

/** `kebab-name` -> `Kebab Name`. */
function titleCase(name) {
  return name.replace(/(^|-)(\w)/g, (_, dash, letter) => `${dash ? " " : ""}${letter.toUpperCase()}`)
}

/** Escape for HTML text AND a double-quoted attribute:  placeholders sit in both. */
function escapeAll(value) {
  return text(value).replace(/"/g, "&quot;")
}

/** `git <args>` in `DOCS`, trimmed stdout ("" on failure). */
function git(...args) {
  return gitIn(DOCS, ...args)
}

/** `git <args>` in folder `cwd` (a checkout:  the doc's own, which may be another worktree), trimmed stdout ("" on failure). */
function gitIn(cwd, ...args) {
  const run = spawnSync("git", args, { cwd, encoding: "utf8" })
  return run.status === 0 ? run.stdout.trim() : ""
}

/**
 * When "recent" starts for the doc at `file` (D2):  the commit time of `HEAD~2` in its checkout, ISO with offset;
 * `null` without one (no git, or a history that short).
 * - so green means changed in this commit or the last:  everything since the commit before those
 */
function recentSince(file) {
  return gitIn(dirname(file), "log", "-1", "--format=%cI", "HEAD~2") || null
}

/** The GitHub page of the doc's repo (`githubBase()` of `origin`), or `null`. */
function commitBase(file) {
  return githubBase(gitIn(dirname(file), "remote", "get-url", "origin"))
}

/**
 * `commit <name> <sha> --phase N | --item <id> "sentence"`:  list commit `sha` (resolved to its full sha in the
 * doc's checkout) under a phase or an item, replacing its entry there.
 */
function commit(file, [sha, sentence], { phase, item }) {
  need(sha, "a commit sha")
  need(sentence, "a sentence:  what the commit did")
  if ((phase === undefined) === (item === undefined)) throw new PlanDocError(`commit needs --phase N or --item <id>`)
  const full = gitIn(dirname(file), "rev-parse", "--verify", "--quiet", `${sha}^{commit}`)
  if (!full) throw new PlanDocError(`no commit "${sha}" in ${dirname(file)}`)
  const target = phase !== undefined ? { phase: Number(phase) } : { item: String(item) }
  const base = commitBase(file)
  const done = edit(file, (plan) => plan.addCommit(target, full, sentence, { base }))
  const where = target.phase !== undefined ? `P${target.phase}` : target.item.toUpperCase()
  console.log(`${where}:  ${full.slice(0, 7)} ${done}`)
}

/**
 * `commits <name> --backfill`:  the doc's git history (`git log --follow`:  every phase commit touches the plan doc)
 * into its phases' and items' commit lists (`PlanDoc.backfillCommits()`);  prints what it added.
 */
function backfillCommits(file) {
  const raw = gitIn(dirname(file), "log", "--follow", "--format=%H%x09%s", "--", basename(file))
  const log = raw
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [sha, ...subject] = line.split("\t")
      return { sha, subject: subject.join("\t") }
    })
  const base = commitBase(file)
  const added = edit(file, (plan) => plan.backfillCommits(log, { base }))
  for (const entry of added) {
    const where = entry.phase !== undefined ? `P${entry.phase}` : entry.item.toUpperCase()
    console.log(`  ${where.padEnd(4)} ${entry.sha.slice(0, 7)}`)
  }
  console.log(`${added.length} commit${added.length === 1 ? "" : "s"} added (${log.length} in the doc's history)`)
}

/**
 * Rewrite the docs index:  a plan's status badge follows its phases.
 * - NOT in a worktree:  every phase change there would rewrite the committed `index.html`, and two epics' worktrees
 *   then conflict on merge.  The main checkout's page server lists running epics live instead (`$/server/page`
 *   `RunningEpics`);  the epic's card comes with Doc Review's `yarn docs:index`.
 */
function reindex() {
  if (/[\\/]\.claude[\\/]worktrees[\\/]/.test(DOCS)) return
  const run = spawnSync("node", ["scripts/index.js"], { cwd: DOCS, encoding: "utf8" })
  if (run.status !== 0) process.stderr.write(`plan-doc:  docs index not updated\n${run.stdout}${run.stderr}`)
}

/** `summary`:  bullets for a reply (or JSON for a script). */
function printSummary(summary, json) {
  if (json) return console.log(JSON.stringify(summary, null, 2))
  const lines = [`${summary.title}`]
  for (const phase of summary.phases) {
    const mark = { todo: "[ ]", active: "[~]", done: "[x]" }[phase.status] ?? "[?]"
    lines.push(`  ${mark} P${phase.n} · ${phase.name}${phase.estimate ? `  (${phase.estimate})` : ""}`)
  }
  if (summary.estimate) lines.push(`estimate:  ${summary.estimate}`)
  if (summary.next) lines.push(`next:  P${summary.next.n} · ${summary.next.name}`)
  for (const kind of OPEN_KINDS) {
    const open = summary.open[kind]
    if (!open.length) continue
    lines.push(`open ${kind}s:`)
    for (const item of open) lines.push(`  - ${item.id.toUpperCase()}  ${item.title}`)
  }
  console.log(lines.join("\n"))
}

/**
 * `backfill`:  for epic `name` (or every epic, `--all`), the items not reviewed that Owen named in a past session
 * of it (`review-backfill.js`);  prints each with its first evidence, and with `--apply` marks them reviewed, dated
 * that day, logging the evidence.
 */
function backfill(name, { all, apply }) {
  if (!name && !all) throw new PlanDocError(`backfill needs a name, or --all\n${USAGE}`)
  const epics = all ? listEpics() : [{ name, file: findDoc(name) }]
  const main = mainRoot()
  let total = 0
  for (const epic of epics) {
    const plan = read(epic.file)
    const ids = plan.reviewSections().flatMap((section) => section.items.map((item) => item.id))
    if (!ids.length) continue
    const sessions = sessionsOf(epic.name, main)
    const evidence = findEvidence(sessions, ids)
    const found = ids.filter((id) => evidence[id])
    console.log(
      `${epic.name}:  ${found.length} of ${ids.length} not reviewed have evidence  (${sessions.length} sessions)`
    )
    for (const id of found) {
      const [first] = evidence[id]
      const more = evidence[id].length > 1 ? `  (+${evidence[id].length - 1} more)` : ""
      console.log(`  ${id.padEnd(4)} ${first.date} ${first.kind.padEnd(7)} ${first.quote}${more}`)
    }
    total += found.length
    if (!apply || !found.length) continue
    edit(epic.file, (doc) => {
      for (const id of found) {
        const [first] = evidence[id]
        doc.review(id, { date: first.date ?? doc.today })
        doc.log(
          `${id} reviewed:  backfill, ${first.kind} ${first.date} (session ${first.session.slice(0, 8)}):  ${first.quote}`
        )
      }
    })
  }
  console.log(apply ? `marked ${total} reviewed` : `dry run:  ${total} to mark;  --apply marks them`)
}

/** `list`:  every epic, grouped in progress / done (or JSON). */
function printEpics(epics, json) {
  if (json) return console.log(JSON.stringify(epics, null, 2))
  const lines = []
  for (const status of ["in progress", "done"]) {
    const group = epics.filter((epic) => epic.status === status)
    if (!group.length) continue
    lines.push(`${status}:  (not reviewed / items)`)
    for (const epic of group) {
      const where = epic.checkout === "main" ? "" : `  (${epic.checkout})`
      lines.push(`  ${epic.name.padEnd(24)} ${String(epic.notReviewed).padStart(3)} / ${epic.total}${where}`)
    }
  }
  console.log(lines.join("\n"))
}

/**
 * `items`:  where reviews stand, then each section with items (or `--section <kind or label>` only), its counts
 * and the items `--filter` picks;  `--json`:  `{ file, status, sections }`.
 */
function printItems(plan, file, { section, filter = "unreviewed", json, spec }) {
  let sections = plan.reviewSections({ filter: spec ? "open" : filter })
  if (section) {
    const wanted = String(section).toLowerCase().replace(/s$/, "")
    sections = sections.filter((s) => s.kind === wanted || s.label.toLowerCase().replace(/s$/, "") === wanted)
    if (!sections.length) {
      throw new PlanDocError(`no section "${section}":  ${REVIEW_SECTIONS.map((s) => s.label).join(", ")}`)
    }
  }
  const status = plan.reviewStatus()
  if (spec) {
    if (sections.length !== 1) throw new PlanDocError("--spec needs one --section")
    writeFileSync(spec, JSON.stringify(pickerSpec(plan, file, sections[0], status), null, 2))
    return console.log(spec)
  }
  if (json) return console.log(JSON.stringify({ file, status, sections }, null, 2))
  const lines = [
    status.last
      ? `last reviewed ${status.last}:  ${status.reviewedThen} item${status.reviewedThen === 1 ? "" : "s"};  ${status.deferred} deferred`
      : "never reviewed"
  ]
  if (status.queued.length) {
    lines.push("to do:")
    for (const item of status.queued) lines.push(`  - ${item.id}  ${item.work}  (${item.title})`)
  }
  const marks = { deferred: (item) => `  (deferred ${item.deferred})`, queued: () => "  (to do)" }
  for (const s of sections) {
    if (!s.total) continue
    lines.push(`${s.label} · ${s.notReviewed}/${s.total} not reviewed  (showing:  ${filter})`)
    for (const item of s.items) lines.push(`  - ${item.id}  ${item.title}${marks[item.state]?.(item) ?? ""}`)
  }
  console.log(lines.join("\n"))
}

/**
 * `summaries`:  `summary` of each doc at `files`, as one JSON object keyed by file.
 * - by PATH, so it reads a worktree's copy too, with no `node_modules/` there;  one run for every epic
 * - a doc that won't read gets `{ error }`, and the rest still print
 */
function printSummaries(files) {
  const found = {}
  for (const file of files) {
    try {
      found[file] = read(resolve(file)).summary()
    } catch (error) {
      if (!(error instanceof PlanDocError)) throw error
      found[file] = { error: error.message }
    }
  }
  console.log(JSON.stringify(found, null, 2))
}

/**
 * `items --section <s> --spec <file>`:  `/epic review`'s item picker, as a details page spec (`details.js`
 * `DetailsSpec`, for `yarn details new --from`):  one checkbox per open item of `section` (`reviewSections()`'s,
 * filter `open`), the not-reviewed ones ticked.
 * - each option's letter is the item's id (`I4`), so the answer names the ids
 * - written for Owen coming cold ("Writing for Owen" in the details skill):  where reviews stand, and each item's
 *   WHOLE text, as the plan doc has it (the page clamps long ones, "Show more"), its state a badge
 * - the page:  no site header (`bare`), "Select all / none", "Open | All" (Open:  only the not-reviewed)
 * - `pageDir`:  where the page will live (the scratch `details/`), so the item's links still work from there
 */
export function pickerSpec(plan, file, section, status, pageDir = join(DOCS, "details")) {
  const name = basename(file, ".html")
  const title = docTitle(plan.document) ?? name
  const label = section.label.toLowerCase()
  const last = status.last
    ? `You last reviewed this epic on ${status.last}${status.queued.length ? `;  ${status.queued.length} decided to do, not done yet` : ""}.`
    : "This epic hasn't been reviewed before."
  return {
    bare: true,
    lede: `Tick the ${label} to go through.  Each comes up in chat, one at a time, and what you decide goes into the plan doc.`,
    askedBy: `<code>/epic review ${name}</code>`,
    where: {
      epic: `${text(title)} (<code>${name}</code>)`,
      justNow: `${last}  ${section.label}:  ${section.notReviewed} of ${section.total} not reviewed yet;  those are ticked.`,
      decides: `Which ${label} to go through now.  Unticked ones stay as they are, for another review.`
    },
    questions: [
      {
        id: "items",
        title: `${section.label} (${section.notReviewed}/${section.total})`,
        multiple: true,
        selectAll: true,
        filter: true,
        moreDetails: true,
        options: section.items.map((item) => ({
          letter: item.id,
          // "Review:  ..." is how some docs file their review notes;  on a review page it says nothing
          title: item.title.replace(/^review:\s*/i, ""),
          body: rehome(item.detailsHtml, file, pageDir) || "<p><i>No details in the plan doc.</i></p>",
          state: pickerState(item),
          checked: item.state === "outstanding" || item.state === "deferred",
          done: item.state === "reviewed" || item.state === "queued"
        }))
      }
    ]
  }
}

/**
 * A picker option's review state, as the icon under its tick box:  `{ icon, color, label }` (`label` on hover).
 * - the icon says the review state:  not reviewed, an empty circle;  deferred, a pause;  reviewed, a check;  to do,
 *   a list
 * - the color is the item's on the plan doc (`docState`, `STATE_COLORS`):  red waits on Owen, orange in progress,
 *   blue open, green recent, grey older
 * - every icon in `bundle-spell-ui.js` `ICONS`
 */
function pickerState(item) {
  const color = STATE_COLORS[item.docState] ?? STATE_COLORS.open
  if (item.state === "deferred") return { icon: "circle pause", color, label: `Deferred ${item.deferred}` }
  if (item.state === "queued") return { icon: "list check", color, label: `To do:  ${item.work}` }
  if (item.state === "reviewed") {
    const label = item.reviewed ? `Reviewed ${item.reviewed}` : "Settled:  closed, decided, or a decision links it"
    return { icon: "circle check", color, label }
  }
  return { icon: "circle outline", color, label: "Not reviewed yet" }
}

/**
 * `html` from the plan doc at `file`, its links made to work from `pageDir` instead:
 * - `#c3` -> the plan doc's `#c3`
 * - a relative `href` / `src` -> the same file, relative to `pageDir`
 * - absolute ones (`https:`, `/x`) as they are
 */
function rehome(html, file, pageDir) {
  const docDir = dirname(file)
  return html.replace(/\b(href|src)="([^"]*)"/g, (whole, name, value) => {
    if (/^([a-z][a-z0-9+.-]*:|\/)/i.test(value)) return whole
    const [path, hash = ""] = value.split("#")
    const target = path ? resolve(docDir, path) : file
    return `${name}="${relative(pageDir, target)}${hash ? `#${hash}` : ""}"`
  })
}

/** `check`:  structural problems, then the browser check;  exits 1 on any. */
function check(file, { noBrowser }) {
  const problems = read(file).check()
  for (const problem of problems) console.error(`PROBLEM:  ${problem}`)
  if (!problems.length) console.log(`${relative(DOCS, file)}:  structure ok`)
  let browserOk = true
  if (!noBrowser) {
    const run = spawnSync("node", ["scripts/check-spell.js", relative(DOCS, file)], { cwd: DOCS, encoding: "utf8" })
    browserOk = run.status === 0
    process.stderr.write(run.stderr ?? "")
    console.log(browserOk ? "check-spell:  ok" : "check-spell:  FAILED (problems above)")
  }
  if (problems.length || !browserOk) process.exit(1)
}

/** `open`:  show the doc rendered in VS Code, reusing its tab (`pages.js` `openInVSCode()`). */
function open(file) {
  read(file)
  return openInVSCode(file)
}
