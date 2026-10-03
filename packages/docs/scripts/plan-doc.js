/**
 * `yarn plan-doc <command> <name> ...`:  edit the structured parts of a plan doc, `epics/<name>/<name>.html`.
 * Rules, ids and markup:  `templates/epics/plan-doc.md`.  Used by the `/epic` skill and its agents.
 * - Commands:  `new`, `add-phase`, `phase`, `estimate`, `add`, `close`, `reopen`, `log`, `prompt`, `summary`, `check`,
 *   `open`, `migrate` (`node scripts/plan-doc.js` with no command lists them).
 * - Every edit:  takes the doc's lock (parallel agents queue instead of clobbering each other), parses it with
 *   linkedom, changes it through `PlanDoc`, stamps "updated", writes it, then tidies it (link targets, oxfmt).
 * - `PlanDoc` is pure (a parsed document in, changes on it):  `plan-doc.test.js` drives it directly.
 * - Sections are `<ui-section>`s;  docs not yet migrated (`section.s2|s3`, cli-additions) are still read and edited
 *   as they are, so every helper here takes either markup ("Sections, either markup").
 */
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, relative } from "node:path"
import { pathToFileURL } from "node:url"

import { parseHTML } from "linkedom"

import { SRV } from "$/server"

import { DOCS, openInVSCode, serialize, tidy } from "./pages.js"
import { convertSections, createElement } from "./to-ui-section.js"

/** The template `new` copies, relative to `DOCS`. */
const TEMPLATE = "templates/epics/plan.html"

/** Phase status -> its icon and color (UI's `color` attribute, so themes and dark mode just work). */
export const STATUS = {
  todo: { icon: "circle outline", color: "grey" },
  active: { icon: "circle half stroke", color: "orange" },
  done: { icon: "circle check", color: "green" }
}

/**
 * Item kind -> its id prefix (`c3`), the list it lives in (`.plan-items[data-kind=list]`) and its status while it
 * counts:  a question waits (`open`), a decision is in force (`decided`) -- only `open` items are "open" in the
 * section's count.
 * - questions share the decisions' list since 2026-10-01:  open questions first, an answered one just before the
 *   decision that answers it.  Docs not yet migrated still have their own question list.
 * - `test`:  something Owen checks by hand before merging (`V1`, "verify":  `t` is taken), in "To test";  `close`
 *   one once it passes
 */
export const KINDS = {
  question: { prefix: "q", list: "decision", live: "open" },
  caveat: { prefix: "c", list: "caveat", live: "open" },
  issue: { prefix: "i", list: "issue", live: "open" },
  todo: { prefix: "t", list: "todo", live: "open" },
  test: { prefix: "v", list: "test", live: "open" },
  decision: { prefix: "d", list: "decision", live: "decided" },
  judgement: { prefix: "j", list: "judgement", live: "open" }
}

/**
 * Kinds `summary` reports while open, in the order a reader should act on them.
 * - `judgement`:  a choice Claude made without Owen (a `/bedtime` run, an agent mid-phase);  open until he reviews
 *   it, then `close`d (accepted), or turned into a question.
 */
const OPEN_KINDS = ["question", "judgement", "issue", "caveat", "todo", "test"]

/**
 * The sections, in page order, by id (the `<ui-section>`'s, or an old doc's h2's):  `migrate` puts an older doc's
 * sections in this order and renumbers their titles.  `#plan` (summary + phase list) was dropped on 2026-10-01, and `#questions` merged into
 * `#decisions` ("Questions & Decisions").
 */
const SECTION_ORDER = ["overview", "phases", "decisions", "judgements", "caveats", "todos", "issues", "tests", "log"]

/** Each section's icon, by its id (the template's):  `migrate` gives one to a section that has none. */
const SECTION_ICONS = {
  overview: "lightbulb",
  phases: "layer group",
  decisions: "gavel",
  judgements: "compass",
  caveats: "triangle exclamation",
  todos: "list check",
  issues: "bug",
  tests: "flask",
  log: "clock rotate left"
}

/** The note under "To test" (the template's, which `addTestsSection()` writes into older docs). */
const TESTS_NOTE =
  "What to check by hand before merging:  each a step, and what should happen.  Struck through once it passes."

/** Phase sections, either markup:  `<ui-section data-phase>` in `#phases`, or `section[data-phase]` (old). */
const PHASE_SECTIONS = "ui-section#phases ui-section[data-phase], #phases-section section[data-phase]"

/** The note under "Questions & Decisions" (the template's, which `migrate` writes into older docs). */
const DECISIONS_NOTE =
  "Open questions first: waiting on you, each also asked in Claude Code. Then what was decided, and why: settled, " +
  "don't re-argue without new facts. An answered question sits just above its decision."

/** The `#judgements` section as the template has it:  `migrate` adds it to older docs (`addJudgements()`). */
const JUDGEMENTS_SECTION = `<ui-section id="judgements" header="4. Judgement calls" sticky collapsible dividing>
          <ui-icon slot="icon" name="compass"></ui-icon>
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
   * - `now`:  when edits happen (a `Date`):  the log's timestamps and the "updated" date, in LOCAL time
   */
  constructor(document, now = new Date()) {
    this.document = document
    this.now = now
  }

  /** `PlanDoc` of HTML text. */
  static parse(html, now) {
    return new PlanDoc(parseHTML(html).document, now)
  }

  /** `now`'s date, `YYYY-MM-DD`. */
  get today() {
    return isoDate(this.now)
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
   * - `goal` / `files` / `verify` / `estimate`:  its body's bullets, as HTML;  omitted ones get a placeholder to
   *   fill in
   * - `<ui-section id="p3" data-phase data-status header="P3 · Name" ...>`, its status icon slotted;  old markup:
   *   `section.s3` > `ui-sticky.spell-h3` > `h3#p3`
   */
  addPhase(name, { goal, files, verify, estimate } = {}) {
    const section = this.section("phases")
    const n = this.phases.length + 1
    const label = `P${n} · ${name}`
    this.addOldListEntry(n, label)
    const values = { Goal: goal, Files: files, Verify: verify, Estimate: estimate }
    const body = PHASE_FIELDS.map(
      ([field, glyph]) => `<ui-item icon="${glyph}"><b>${field}:</b>  ${values[field] ?? "TBD"}</ui-item>`
    )
    const list = `<ui-list class="plan-phase-body">${body.join("")}</ui-list>`
    if (section.localName === "ui-section") {
      const phase = this.element("ui-section", {
        id: `p${n}`,
        "data-phase": n,
        "data-status": "todo",
        header: label,
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
   * Set phase `n`'s estimate (`2h`, `1-2h`), adding the field to a phase made before it existed;  then the
   * Overview's total.
   */
  setEstimate(n, estimate) {
    const section = this.phaseSection(n)
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
        overview.querySelector(":scope > blockquote.plan-prompt") ?? overview.querySelector(":scope > .plan-summary")
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
   * - any phase leaving `todo` removes the "Plan hung?" notice (`ui-message.plan-hung`):  planning is over
   * - SIDE EFFECT:  logs the change
   */
  setPhase(n, status) {
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
    } else setFolded(section, false)
    if (status !== "todo") this.document.querySelector("ui-message.plan-hung")?.remove()
    this.updateProgress()
    this.updateEstimate()
    this.log(`P${n} ${status}`)
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
    else step.innerHTML = stepLabel(next, "grey", "circle outline", "next:  ")
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
   * - `titleHTML`:  `title` is HTML, not text (`decide()`'s link back to its question)
   * - a question in the shared list goes after the open questions at its top;  everything else at the end
   * - while a phase is active, the item gets that phase's UPDATE label
   */
  addItem(kind, title, { details, titleHTML = false } = {}) {
    const spec = KINDS[kind]
    if (!spec) throw new PlanDocError(`kind must be ${Object.keys(KINDS).join(" / ")}, not "${kind}"`)
    const list = this.listOf(kind)
    const id = `${spec.prefix}${Math.max(0, ...this.items(kind).map((item) => idNumber(item.id))) + 1}`
    const item = this.element(list.localName === "ol" ? "li" : "ui-item", { id, "data-status": spec.live })
    const label = titleHTML ? title : text(title)
    const line = `<a class="plan-id" href="#${id}">${id.toUpperCase()}</a> <span class="plan-title">${label}</span>`
    item.innerHTML = details
      ? `<ui-accordion class="plan-item"><ui-title>${line}</ui-title><ui-content>${details}</ui-content></ui-accordion>`
      : line
    const shared = list.getAttribute("data-kind") !== kind
    if (kind === "question" && shared) {
      const last = this.openQuestions(list).at(-1)
      if (last) last.after(item)
      else list.prepend(item)
    } else list.append(item)
    this.markUpdate(item)
    return id
  }

  /**
   * Answer question `questionId` with a decision titled `title`;  returns the decision's id (`d7`).
   * - the decision goes at the end, its title ending in a link back (`(Q3)`), its details saying what was asked
   * - the question closes (struck through), gets a link on to the decision (`-> D7`) and moves to just before it,
   *   so each answered question sits with its answer
   */
  decide(questionId, title, { details } = {}) {
    const question = this.item(questionId)
    if (!question.id.startsWith(KINDS.question.prefix)) throw new PlanDocError(`${questionId} isn't a question`)
    const asked = question.querySelector(".plan-title")?.textContent.trim() ?? ""
    const q = question.id.toUpperCase()
    const html = (details ?? "") + `<p class="meta">Answers <a href="#${question.id}">${q}</a>:  ${text(asked)}</p>`
    const id = this.addItem("decision", `${text(title)} (<a href="#${question.id}">${q}</a>)`, {
      details: html,
      titleHTML: true
    })
    const decision = this.document.getElementById(id)
    question.setAttribute("data-status", "done")
    const line = question.querySelector(":scope > ui-accordion > ui-title") ?? question
    const onward = this.fragment(` <a class="plan-answer" href="#${id}">→ ${id.toUpperCase()}</a>`)
    line.querySelector(":scope > .plan-title").after(onward)
    if (question.parentElement === decision.parentElement) decision.before(question)
    return id
  }

  /**
   * Set item `id` open or done;  done items stay, struck through.  Returns its title.
   * - "open" means the kind's live status:  a reopened decision is `decided` again
   */
  setItem(id, status) {
    if (status !== "open" && status !== "done") throw new PlanDocError(`item status must be open / done`)
    const item = this.item(id)
    const kind = Object.values(KINDS).find((spec) => new RegExp(`^${spec.prefix}\\d+$`).test(item.id))
    item.setAttribute("data-status", status === "open" ? (kind?.live ?? "open") : "done")
    this.markUpdate(item)
    return item.querySelector(".plan-title")?.textContent.trim() ?? id
  }

  /** The item with `id` (any case);  throws when there's none. */
  item(id) {
    const item = this.document.getElementById(String(id).toLowerCase())
    if (!item?.parentElement?.matches(".plan-items")) throw new PlanDocError(`no item "${id}"`)
    return item
  }

  /** Items of `kind`, in order:  `{ id, title, status }`. */
  items(kind) {
    const pattern = new RegExp(`^${KINDS[kind].prefix}\\d+$`)
    return Array.from(this.listOf(kind).children)
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
    const spec = KINDS[kind]
    const own = this.document.querySelector(`.plan-items[data-kind="${kind}"]`)
    if (own) return own
    if (kind === "test") return this.addTestsSection()
    return this.require(`.plan-items[data-kind="${spec.list}"]`)
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
      OPEN_KINDS.map((kind) => [kind, this.items(kind).filter((item) => item.status === "open")])
    )
    return {
      title: this.document.querySelector("h1")?.textContent.trim() ?? "",
      phases,
      active: phases.find((phase) => phase.status === "active"),
      next: phases.find((phase) => phase.status === "todo"),
      estimate: this.document
        .querySelector("p.plan-estimate")
        ?.textContent.replace(/^Estimate:\s*/, "")
        .trim(),
      open
    }
  }

  /**
   * Set the prompt that started the plan:  a `blockquote.plan-prompt` near the top of the Overview, one `<p>` per
   * paragraph (blank lines split them, single newlines become `<br>`).  Replaces any earlier one;  "" removes it.
   * - the "Plan hung?" notice's copy of it too (`setHungPrompt()`)
   */
  setPrompt(prompt) {
    this.setHungPrompt(prompt)
    const quote = this.document.querySelector("blockquote.plan-prompt")
    const html = promptHTML(prompt)
    if (!html) return quote?.remove()
    if (quote) {
      quote.innerHTML = html
      return
    }
    const added = this.element("blockquote", { class: "plan-prompt" })
    added.innerHTML = html
    const overview = this.section("overview")
    const summary = overview.querySelector(":scope > .plan-summary")
    if (summary) summary.after(added)
    else prependContent(overview, added)
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
   * - the h1 goes into the sticky page header, with the step label
   * - item lists become `ui-list`s of `ui-item`s;  an item's "details" panel takes the item's line as its title
   * - phase bodies become `ui-list`s with an icon per field;  every done phase but the last folds
   * - links to `#plan` go to `#overview`
   * - every `section.s2|s3` becomes a `<ui-section>` (`to-ui-section.js` `convertSections()`);  a standard section
   *   without an icon gets the template's
   * - each step works on either markup, so a doc converted by `to-ui-section.js` alone still migrates
   */
  migrate() {
    const changes = []
    if (this.migrateHeader()) changes.push("h1 in the sticky page header, with the step label")
    if (this.migratePlanSection()) changes.push("#plan dropped:  summary to Overview, progress bar to Phases")
    if (this.orderSections()) changes.push(`sections ordered ${SECTION_ORDER.join(", ")}, renumbered`)
    const items = this.migrateItems()
    if (items) changes.push(`${items} items as ui-item, details titled by their line`)
    changes.push(...this.mergeQuestions())
    if (this.addJudgements()) changes.push("#judgements (Judgement calls) added after Questions & Decisions")
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
    const done = this.phases.filter((phase) => phase.status === "done")
    if (done.length && !this.phaseSections.some(isFolded)) {
      this.foldDonePhases(done.at(-1).n)
      if (done.length > 1) changes.push(`${done.length - 1} done phases folded`)
    }
    this.updateProgress()
    return changes
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
   * Questions into "Questions & Decisions";  returns what changed, as lines.
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
    replaceInTitle(target, /\bDecisions\s*$/, "Questions & Decisions")
    const note = target.querySelector(":scope > p.meta")
    if (note) note.textContent = DECISIONS_NOTE
    changes.push(`${questions.length} questions merged into Questions & Decisions (${paired} next to their answers)`)
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

/** `q12` -> `12`;  0 for an id without a number. */
function idNumber(id) {
  return Number(id.match(/\d+$/)?.[0]) || 0
}

/** The header's step label for `phase`:  a link to it, `prefix` before its name. */
function stepLabel(phase, color, glyph, prefix) {
  const label = text(`${prefix}P${phase.n} · ${phase.name}`)
  return `<ui-label basic color="${color}" icon="${glyph}" href="#p${phase.n}">${label}</ui-label>`
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

/** Phase `section`'s estimate, as text;  `undefined` while missing or `TBD`. */
function estimateText(section) {
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
  phase <name> <N> todo|active|done [--no-open]    set a phase's status;  done drops its UPDATE markers;
                                                   reloads the doc's VS Code tab
  add <name> question|judgement|caveat|issue|todo|test|decision "title" [--details html]    prints the new id
  decide <name> <Q id> "decision" [--details html]  answer a question:  a decision, the question struck beside it
  close <name> <id>  /  reopen <name> <id>         strike / unstrike an item
  log <name> "text"                                timestamped line in the log
  prompt <name> "text" | --file path               set the prompt that started the plan ("" removes it)
  summary <name> [--json]                          open questions, issues, caveats, todos;  the next phase
  check <name> [--no-browser]                      ids, links, phases;  then check-spell.js
  open <name>                                      show in VS Code, beside the editor (reloads its tab)
  migrate <name>                                   bring an older doc (any layout) into the current one`

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
  if (!command || !name) return usage()
  const file = docPath(name)
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
      edit(file, (plan) => plan.setPhase(Number(need(rest[0], "a phase number")), need(rest[1], "a status")))
      reindex()
      // a new stage:  show it to the user (their tab reloads), unless told not to
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
        const decided = plan.decide(question, need(rest[1], "the decision"), flags)
        plan.log(`${question.toUpperCase()} answered:  ${decided.toUpperCase()} ${rest[1]}`)
        return decided
      })
      return console.log(id.toUpperCase())
    }
    case "close":
    case "reopen":
      return edit(file, (plan) => {
        const title = plan.setItem(need(rest[0], "an item id"), command === "close" ? "done" : "open")
        plan.log(`${rest[0].toUpperCase()} ${command === "close" ? "closed" : "reopened"}:  ${title}`)
      })
    case "log":
      return edit(file, (plan) => plan.log(need(rest[0], "the text")))
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

/** The plan doc at `file`, parsed. */
function read(file) {
  if (!existsSync(file)) throw new PlanDocError(`no plan doc ${relative(DOCS, file)}:  \`yarn plan-doc new\` first`)
  return PlanDoc.parse(readFileSync(file, "utf8"))
}

/**
 * Change the doc at `file` with `change(plan)`, under its lock (`SRV.FileLock`:  parallel agents, and the page
 * server's page edits, take turns);  returns what `change` returned.
 * - stamps "updated", writes, tidies (link targets + oxfmt)
 */
function edit(file, change) {
  return SRV.FileLock.run(file, () => {
    const plan = read(file)
    const result = change(plan)
    plan.touch()
    writeFileSync(file, plan.toString())
    if (!tidy([relative(DOCS, file)])) throw new PlanDocError("tidy failed (see above)")
    return result
  })
}

/**
 * `new`:  copy the template to `file`, fill in name, title, date, branch and worktree, then update the index.
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
  plan.document.querySelector("title").textContent = title
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
  const run = spawnSync("git", args, { cwd: DOCS, encoding: "utf8" })
  return run.status === 0 ? run.stdout.trim() : ""
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
