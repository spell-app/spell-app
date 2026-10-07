import {
  DECISIONS_NOTE,
  ITEM_MARKS,
  JUDGEMENTS_SECTION,
  OLD_DECISION,
  OLD_DECISIONS_NOTES,
  OLD_SECTION_ICONS,
  PHASE_FIELDS,
  SECTION_ICONS,
  SECTION_ORDER,
  TITLE_PREFIX
} from "./planDoc.types"

// Type only:  `PlanDoc` makes this, so a value import would be circular
import type { PlanDoc } from "./PlanDoc"
import { PlanItem } from "./PlanItem"
import { PlanMarkup } from "./PlanMarkup"
import { PlanSections } from "./PlanSections"
import { SectionConverter } from "./SectionConverter"

/****************
 * ### `PlanMigration`
 * Brings an OLDER plan doc up to date, in place:  `PlanDoc.migrate()` makes one per run.  Every step is idempotent,
 * so a current doc comes back unchanged and the run says so (no lines).
 * - What it converts, by date:  the layout before 2026-10-01 (`#plan`, `ol.plan-items`), the `section.s2` markup
 *   before 2026-10-02, `D` items before 2026-10-04 (D13), answer cards first before 2026-10-05 (I9), and the folds,
 *   tips, icons, titles and fields that came since.
 * - Knows `PlanDoc` only as the doc it works on (`plan`):  everything it reads or edits goes through it.
 * - Apart from `PlanDoc` because none of it is needed by a current doc:  the conversions of history, in one place.
 * - From `packages/docs/tools/plan-doc.js` `PlanDoc`'s "Migrate" group (epic `epic-components`, P7).
 ****************/
export class PlanMigration {
  /** The doc it brings up to date:  STATIC for the run;  another doc is another `PlanMigration`. */
  readonly plan: PlanDoc

  constructor(plan: PlanDoc) {
    this.plan = plan
  }

  /** The doc's parsed document. */
  get document(): Document {
    return this.plan.document
  }

  /**
   * Bring the doc up to date;  returns what changed, as lines (none:  already current).
   * - `#plan` goes:  its summary moves to the top of the Overview, its progress bar to `#phases`, its phase list away
   * - sections in `SECTION_ORDER`, titles renumbered, and the numbers in them with them (`3.1` -> `1.1`)
   * - the h1 goes into the sticky page header, with the step label;  it and `<title>` read `Epic: <title>`
   * - the kickoff prompt folds into its "Kickoff prompt" aside
   * - item lists become `ui-list`s of `ui-item`s;  an item's "details" panel takes the item's line as its title
   * - phase bodies become `ui-list`s with an icon per field;  every done phase but the last folds
   * - links to `#plan` go to `#overview`
   * - every `section.s2|s3` becomes a `<ui-section>` (`SectionConverter.convertSections()`);  a standard section
   *   without an icon gets the template's
   * - each step works on either markup, so a doc converted by `to-ui-section.js` alone still migrates
   * - "Questions & Decisions" is "Questions" (D13), with its new icon and note;  "Judgement calls" gets the gavel
   * - an old doc's `D` items merge into its questions (`mergeDecisions()`):  each answer goes INTO the question it
   *   answers, a stand-alone one becomes a question born answered
   * - answered questions read in the order they happened (`PlanDoc.relayout()`):  the question, its options as a
   *   folded Choices accordion, then the answer card
   * - a phase's hand-written "Judgement calls:" line STAYS (J14 of `review-review`, "keep 'em"):  the "To review"
   *   line goes after it
   */
  migrate(): string[] {
    const plan = this.plan
    const changes: string[] = []
    if (this.migrateHeader()) changes.push("h1 in the sticky page header, with the step label")
    if (this.migrateTitle()) changes.push(`page title "${TITLE_PREFIX}<title>"`)
    if (plan.foldPrompt()) changes.push('kickoff prompt folded into a "Kickoff prompt" aside')
    if (plan.foldHungNotice()) changes.push('"Plan hung?" notice folded')
    if (this.migratePlanSection()) changes.push("#plan dropped:  summary to Overview, progress bar to Phases")
    if (plan.orderSections()) changes.push(`sections ordered ${SECTION_ORDER.join(", ")}, renumbered`)
    const items = this.migrateItems()
    if (items) changes.push(`${items} items as ui-item, details titled by their line`)
    changes.push(...this.mergeQuestions())
    changes.push(...this.mergeDecisions())
    const relaid = plan.relayout().changed.length
    if (relaid) changes.push(`${relaid} answered questions laid out:  question, Choices, answer`)
    if (this.addJudgements()) changes.push("#judgements (Judgement calls) added after Questions")
    const bodies = this.migratePhaseBodies()
    if (bodies) changes.push(`${bodies} phase bodies as ui-list`)
    const framed = this.frameGoals()
    if (framed) changes.push(`${framed} phase goals split into Symptom / Changes fields`)
    const sections = SectionConverter.convertSections(this.document)
    if (sections.converted) {
      const dropped = sections.droppedIds.map((id) => `#${id}`).join(", ")
      changes.push(`${sections.converted} sections as <ui-section>${dropped ? ` (${dropped} gone)` : ""}`)
    }
    if (!this.document.querySelector('.plan-items[data-kind="test"]') && PlanSections.sectionOf(this.document, "log")) {
      plan.addTestsSection()
      changes.push('"To test" section added')
    }
    const icons = this.migrateSectionIcons()
    if (icons) changes.push(`${icons} sections given their icon`)
    const swapped = this.swapOldIcons()
    if (swapped)
      changes.push(`${swapped} sections' old icon swapped (Questions:  file circle question, Judgement calls:  gavel)`)
    const done = plan.phases.filter((phase) => phase.status === "done")
    if (done.length && !plan.phaseSections.some((section) => PlanSections.isFolded(section))) {
      plan.foldDonePhases()
      changes.push(`${done.length} done phases folded`)
    }
    const badges = plan.estimatesToBadges()
    if (badges) changes.push(`${badges} phase estimates moved into their titles' badges`)
    // last:  the steps above may add sections with an intro (`section.s2` converted, "To test")
    const tips = this.introsToTips()
    if (tips) changes.push(`${tips} section intros as title tooltips (data-tip)`)
    // after the intros:  an old note is a `data-tip` by now
    if (this.renameQuestions()) changes.push('"Questions & Decisions" titled "Questions", its note too')
    plan.updateProgress()
    const states = plan.updateStates()
    if (states) changes.push(`${states} item states, review labels and "To review" lines updated`)
    return changes
  }

  ////////////////
  // ## Page and sections
  ////////////////

  /** The h1 into `<ui-sticky class="spell-h1"><header class="spell-page-head">` with a `.plan-step`;  done? */
  migrateHeader(): boolean {
    const h1 = this.document.querySelector("main h1")
    if (!h1 || h1.closest("ui-sticky")) return false
    const sticky = this.plan.element("ui-sticky", { class: "spell-h1" })
    const header = this.plan.element("header", { class: "spell-page-head" })
    h1.replaceWith(sticky)
    sticky.append(header)
    header.append(h1, this.plan.element("span", { class: "plan-step", hidden: "" }))
    return true
  }

  /** The h1 and `<title>` as `Epic: <title>` (`TITLE_PREFIX`), from the h1;  done? */
  migrateTitle(): boolean {
    const h1 = this.document.querySelector("main h1")
    if (!h1) return false
    const title = `${TITLE_PREFIX}${this.plan.title}`
    const head = this.document.querySelector("title")
    if ((h1.textContent ?? "").trim() === title && (!head || head.textContent === title)) return false
    h1.textContent = title
    if (head) head.textContent = title
    return true
  }

  /** Drop `#plan`:  summary to the Overview's top, progress bar to `#phases`;  done? */
  migratePlanSection(): boolean {
    const plan = PlanSections.sectionOf(this.document, "plan")
    if (!plan) return false
    const summary = plan.querySelector(".plan-summary")
    if (summary) {
      summary.classList.add("lede")
      PlanSections.prependContent(this.plan.section("overview"), summary)
    }
    const bar = plan.querySelector("ui-progress.plan-progress")
    if (bar) PlanSections.prependContent(this.plan.section("phases"), bar)
    plan.remove()
    for (const link of this.document.querySelectorAll('a[href="#plan"]')) link.setAttribute("href", "#overview")
    return true
  }

  /** A doc made before 2026-10-03 gets the template's `#judgements` section, just after `#decisions`, numbered;  added? */
  addJudgements(): boolean {
    if (this.document.getElementById("judgements")) return false
    const decisions = this.document.getElementById("decisions")
    if (!decisions) return false
    decisions.after(this.document.createTextNode("\n\n        "), this.plan.fragment(JUDGEMENTS_SECTION))
    this.plan.orderSections()
    return true
  }

  /** A `<ui-section>` among `SECTION_ICONS`' with no icon gets its icon (the template's);  how many. */
  migrateSectionIcons(): number {
    let count = 0
    for (const [id, name] of Object.entries(SECTION_ICONS)) {
      const section = this.document.getElementById(id)
      if (section?.localName !== "ui-section" || section.hasAttribute("icon")) continue
      if (section.querySelector(':scope > [slot="icon"]')) continue
      const glyph = this.plan.fragment(`<ui-icon slot="icon" name="${name}"></ui-icon>`)
      section.prepend(this.document.createTextNode("\n"), glyph)
      count++
    }
    return count
  }

  /** Section icons the template had before 2026-10-04 (`OLD_SECTION_ICONS`) into today's;  how many. */
  swapOldIcons(): number {
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
   * Each top-level section's intro (a `p.meta` first in it, after its icon) becomes its title's tooltip:  `data-tip`
   * on the section, which the runtime puts on the title (`wireTips()`);  how many.
   * - why:  the intros are the same on every doc and cost a line each in a narrow side bar (Owen, 2026-10-04)
   */
  introsToTips(): number {
    let count = 0
    for (const section of this.document.querySelectorAll("main > ui-section")) {
      const note = section.querySelector(":scope > p.meta")
      if (!note) continue
      section.setAttribute("data-tip", (note.textContent ?? "").replace(/\s+/g, " ").trim())
      note.remove()
      count++
    }
    return count
  }

  /** "Questions & Decisions" -> "Questions" (D13), and its old note (`data-tip`) -> `DECISIONS_NOTE`;  changed? */
  renameQuestions(): boolean {
    const section = PlanSections.sectionOf(this.document, "decisions")
    if (!section) return false
    const renamed = PlanSections.replaceInTitle(section, /\bQuestions & Decisions\s*$/, "Questions") !== undefined
    const tip = section.getAttribute("data-tip")
    const retipped = tip !== null && OLD_DECISIONS_NOTES.includes(PlanMarkup.squeeze(tip))
    if (retipped) section.setAttribute("data-tip", DECISIONS_NOTE)
    return renamed || retipped
  }

  ////////////////
  // ## Items
  ////////////////

  /** `ol.plan-items` -> `ui-list`, `li` -> `ui-item`, "details" panels titled by the item's line;  how many items. */
  migrateItems(): number {
    let count = 0
    for (const list of this.document.querySelectorAll("ol.plan-items")) {
      const replacement = this.plan.element("ui-list", {
        class: "plan-items",
        "data-kind": list.getAttribute("data-kind") ?? "null",
        divided: "",
        relaxed: ""
      })
      for (const li of Array.from(list.children)) {
        const item = this.plan.element(
          "ui-item",
          Object.fromEntries(Array.from(li.attributes, (a) => [a.name, a.value]))
        )
        // an item added to the old list since this script changed is already titled by its line
        const aside = li.querySelector(":scope > ui-accordion:not(.plan-item)")
        if (aside) {
          aside.remove()
          const content = aside.querySelector(":scope > ui-content")
          const panel = this.plan.element("ui-accordion", { class: "plan-item" })
          const title = this.plan.element("ui-title")
          const body = this.plan.element("ui-content")
          title.append(...Array.from(li.childNodes))
          if (content) body.append(...Array.from(content.childNodes))
          panel.append(title, body)
          item.append(panel)
        } else item.append(...Array.from(li.childNodes))
        PlanMarkup.trimWhitespace(item.querySelector(":scope > ui-accordion > ui-title") ?? item)
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
  mergeQuestions(): string[] {
    const changes: string[] = []
    const decisions = this.document.querySelector('ui-list.plan-items[data-kind="decision"]')
    if (!decisions) return changes
    let decided = 0
    for (const item of decisions.children) {
      if (!/^d\d+$/.test(item.id) || item.getAttribute("data-status") !== "open") continue
      item.setAttribute("data-status", "decided")
      decided++
    }
    if (decided) changes.push(`${decided} decisions marked decided`)
    const section = PlanSections.sectionOf(this.document, "questions")
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
          ?.after(this.plan.fragment(` <a class="plan-answer" href="#${answer.id}">→ ${answer.id.toUpperCase()}</a>`))
      paired++
    }
    section.remove()
    for (const link of this.document.querySelectorAll('a[href="#questions"]')) link.setAttribute("href", "#decisions")
    const target = this.plan.section("decisions")
    PlanSections.replaceInTitle(target, /\bDecisions\s*$/, "Questions")
    const note = target.querySelector(":scope > p.meta")
    if (note) note.textContent = DECISIONS_NOTE
    else target.setAttribute("data-tip", DECISIONS_NOTE)
    changes.push(`${questions.length} questions merged into Questions (${paired} next to their answers)`)
    return changes
  }

  /**
   * An old doc's decisions (`D` items, before D13) into its questions;  returns what changed, as lines.  Idempotent:
   * a doc without `D` items is left alone (but for the list's order).
   * - a decision that ANSWERS a question (the struck question links it, `→ D7`;  else the decision's title names a
   *   struck question, `(Q3)` or `Q3 ...`, not answered yet) goes INTO it as its answer card (`answerCard()`), first
   *   in its details:  `<div class="plan-answer-block" id="d7"><div class="plan-answer-title"><b>D7</b> · title
   *   </div>...the decision's details...</div>`
   *   - the question:  `decided`, `data-answered`, not struck;  its `→ D7` link goes
   *   - the card keeps `id="d7"`, so every old `#d7` link still lands (the runtime opens the question's panel)
   *   - the decision's marks (`ITEM_MARKS`) and UPDATE label go onto the question where it has none
   *   - its option card is chosen when the decision names one (`inferOption()`)
   * - a STAND-ALONE decision becomes a question born answered:  the next free `q` number, the decision's title, its
   *   answer card inside (`id="d7"` again)
   * - a struck decision (`done`:  superseded) is `canceled`, not a live answer (J16 of `review-review`)
   * - then the list's order rule:  open questions first, then the rest in id order (`orderQuestions()`)
   */
  mergeDecisions(): string[] {
    const list = this.document.querySelector('.plan-items[data-kind="decision"]')
    if (!list) return []
    const changes: string[] = []
    const decisions = Array.from(list.children).filter((item) => OLD_DECISION.test(item.id))
    const counts: OptionCounts = { answering: 0, alone: 0, chosen: 0, unchosen: 0 }
    for (const decision of decisions) {
      const question = this.questionAnsweredBy(decision, list)
      const status = decision.getAttribute("data-status") === "done" ? "canceled" : "decided"
      if (question) {
        this.mergeAnswer(decision, question, status, counts)
        counts.answering++
      } else {
        this.answerAlone(decision, status)
        counts.alone++
      }
    }
    if (decisions.length) {
      const { answering, alone, chosen, unchosen } = counts
      const options = chosen || unchosen ? `;  options chosen:  ${chosen}, not inferred:  ${unchosen}` : ""
      changes.push(
        `${decisions.length} decisions merged into questions:  ${answering} answering one, ${alone} stand-alone${options}`
      )
    }
    if (this.orderQuestions(list)) changes.push("questions ordered:  open first, then the rest by id")
    return changes
  }

  /**
   * The struck question decision `decision` answers, not yet answered, or `null`:  the one whose `→ D7` links it,
   * else one its title names (`(Q3)` at the end, or `Q3 ...` first).
   */
  questionAnsweredBy(decision: Element, list: Element): Element | null {
    const linked = list.querySelector(`:scope > [id] a.plan-answer[href="#${decision.id}"]`)
    const title = decision.querySelector(".plan-title")?.textContent?.replace(/\s+/g, " ").trim() ?? ""
    const named = title.match(/\((Q\d+)\)$/) ?? title.match(/^(Q\d+)\s/)
    const question =
      linked?.closest(".plan-items > [id]") ?? (named ? this.document.getElementById(named[1].toLowerCase()) : null)
    if (!question || question.parentElement !== list || !/^q\d+$/.test(question.id)) return null
    if (question.getAttribute("data-status") === "open" || question.hasAttribute("data-answered")) return null
    return question
  }

  /** Decision `decision` into `question` as its answer card;  the question `status`, answered.  `counts`' options. */
  mergeAnswer(decision: Element, question: Element, status: string, counts: OptionCounts): void {
    decision.remove()
    const card = this.answerCard(decision, { question })
    const content = this.plan.detailsOf(question)
    content.prepend(card)
    // the decision's own commits (`Fix D7:`) join the question's, at the end of its details
    const commits = card.querySelector(":scope > .plan-commits")
    if (commits) content.append(commits)
    const line = question.querySelector(":scope > ui-accordion > ui-title") ?? question
    for (const link of line.querySelectorAll(":scope > a.plan-answer")) {
      const space = link.previousSibling
      if (space?.nodeType === 3) space.textContent = (space.textContent ?? "").trimEnd()
      link.remove()
    }
    for (const mark of ITEM_MARKS)
      if (!question.hasAttribute(mark) && decision.hasAttribute(mark))
        question.setAttribute(mark, decision.getAttribute(mark)!)
    const update = decision.querySelector(".plan-update")
    if (update && !line.querySelector(":scope > .plan-update")) line.append(this.document.createTextNode(" "), update)
    question.setAttribute("data-status", status)
    question.setAttribute("data-answered", "")
    if (!line.querySelector(":scope > .plan-review")) this.plan.updateReviewLabel(question)
    const chosen = this.inferOption(question, card)
    if (chosen === true) counts.chosen++
    else if (chosen === false) counts.unchosen++
  }

  /**
   * Stand-alone decision `decision` into a question born answered, IN PLACE (its marks and labels stay):  the next
   * free `q` id, its line's id chip too, its title kept, its details inside its answer card;  `status`.
   */
  answerAlone(decision: Element, status: string): void {
    const old = decision.id
    const list = decision.parentElement!
    const n =
      Math.max(0, ...Array.from(list.children, (item) => (/^q\d+$/.test(item.id) ? PlanItem.idNumber(item.id) : 0))) + 1
    decision.setAttribute("id", `q${n}`)
    const chip = decision.querySelector(".plan-id")
    if (chip) {
      chip.setAttribute("href", `#q${n}`)
      chip.textContent = `Q${n}`
    }
    const content = this.plan.detailsOf(decision)
    const card = this.answerCard(decision, { id: old, nodes: Array.from(content.childNodes) })
    content.prepend(card)
    const commits = card.querySelector(":scope > .plan-commits")
    if (commits) content.append(commits)
    decision.setAttribute("data-status", status)
    decision.setAttribute("data-answered", "")
  }

  /**
   * The answer card for old decision `decision`:  `<div class="plan-answer-block" id="d7">` titled `<b>D7</b> ·
   * <its title>`, then its details.
   * - `question`:  the question it answers;  the title drops the question's id (`(Q3)`, `Q3 ...`), and the details a
   *   `p.meta` "Answers Q3:  ..." line that only pointed back to it:  the question's title, which it keeps.  A line
   *   saying more stays:  migrating never drops an item's text (I7 of `review-review`)
   * - `id` / `nodes`:  the decision's id and details when it has moved already (`answerAlone()`)
   */
  answerCard(
    decision: Element,
    { question, id = decision.id, nodes }: { question?: Element; id?: string; nodes?: Node[] } = {}
  ): Element {
    let title = decision.querySelector(".plan-title")?.innerHTML.trim() ?? ""
    if (question) {
      const q = question.id.toUpperCase()
      title = title
        .replace(new RegExp(`\\s*\\(\\s*(?:<a\\b[^>]*>)?\\s*${q}\\s*(?:</a>)?\\s*\\)\\s*$`), "")
        .replace(new RegExp(`^${q}\\s+`), "")
    }
    const card = this.plan.element("div", { class: "plan-answer-block", id })
    card.innerHTML = `<div class="plan-answer-title"><b>${id.toUpperCase()}</b> · ${title}</div>`
    const details = nodes ?? Array.from(decision.querySelector(":scope > ui-accordion > ui-content")?.childNodes ?? [])
    card.append(...details)
    PlanMarkup.trimWhitespace(card)
    if (question)
      for (const note of card.querySelectorAll(":scope > p.meta"))
        if (/^Answers\b/.test((note.textContent ?? "").trim()) && note.querySelector(`a[href="#${question.id}"]`)) {
          const said = (note.textContent ?? "").replace(/^\s*Answers\s+Q\d+\s*:?/, "")
          if (PlanMarkup.bare(said) === PlanMarkup.bare(PlanItem.titleOf(question))) note.remove()
        }
    return card
  }

  /**
   * Choose `question`'s option card when its answer card names one;  `true` chosen, `false` not inferred, `null` when
   * there's nothing to choose (no option cards, or one chosen already).
   * - the answer's title:  a letter first (`B: real URLs`, `B · ...`), `option B`, or every word of ONE option's
   *   title (`Merge at the end` for `B. Merge at the end`;  `(recommended)` and little words left out)
   * - else its details:  `option B`.  NOT an option's words there:  details discuss every option ("Language stays
   *   page-wide" chose ui-component-creation's Q13 A wrongly, 2026-10-04)
   */
  inferOption(question: Element, card: Element): boolean | null {
    const options = PlanItem.optionsOf(question)
    if (!options.length || options.some((option) => option.holder.hasAttribute("data-chosen"))) return null
    const letters = new Set(options.map((option) => option.letter))
    const titleText = card.querySelector(":scope > .plan-answer-title")?.textContent?.replace(/^\s*D\d+\s*·\s*/, "")
    const detailsText = Array.from(card.childNodes)
      .filter((node) => !(PlanMarkup.isElement(node) && node.matches(".plan-answer-title")))
      .map((node) => node.textContent)
      .join(" ")
    const letter = byLetter(titleText) ?? byWords(titleText) ?? byLetter(detailsText, { start: false })
    if (!letter) return false
    this.plan.chooseOption(question, letter)
    return true

    /** The letter `text` names:  first (`B:`, `B ·`, `B.`) unless `start` is false, or `option B` anywhere. */
    function byLetter(text: string | undefined, { start = true }: { start?: boolean } = {}): string | undefined {
      // `text` is always there:  the card always has its title
      const first = start ? text!.match(/^\s*([A-H])\s*[:.·)]\s/)?.[1] : undefined
      const named = text!.match(/\boption\s+([A-H])\b/i)?.[1]
      const letter = first ?? named
      return letter && letters.has(letter) ? letter : undefined
    }

    /** The ONE option every word of whose title is in `text` (the longest, when several are). */
    function byWords(text: string | undefined): string | undefined {
      const have = new Set(PlanItem.words(text))
      const fits = options.filter((option) => option.words.length && option.words.every((word) => have.has(word)))
      const most = Math.max(0, ...fits.map((option) => option.words.length))
      const best = fits.filter((option) => option.words.length === most)
      return best.length === 1 ? best[0].letter : undefined
    }
  }

  /**
   * Put the questions list `list` in order:  open questions first (as they stand), then every other question in id
   * order, then anything else;  changed?
   */
  orderQuestions(list: Element): boolean {
    const children = Array.from(list.children)
    const questions = children.filter((item) => /^q\d+$/.test(item.id))
    const open = questions.filter((item) => item.getAttribute("data-status") === "open")
    const rest = questions
      .filter((item) => !open.includes(item))
      .sort((a, b) => PlanItem.idNumber(a.id) - PlanItem.idNumber(b.id))
    const order = [...open, ...rest, ...children.filter((item) => !questions.includes(item))]
    if (order.every((item, index) => item === children[index])) return false
    for (const item of order) list.append(item)
    return true
  }

  ////////////////
  // ## Phase bodies
  ////////////////

  /** `ul.plan-phase-body` -> `ui-list` of `ui-item`s with an icon per field;  how many. */
  migratePhaseBodies(): number {
    const icons: Record<string, string> = Object.fromEntries(PHASE_FIELDS)
    let count = 0
    for (const list of this.document.querySelectorAll("ul.plan-phase-body")) {
      const replacement = this.plan.element("ui-list", { class: "plan-phase-body" })
      for (const li of Array.from(list.children)) {
        const field = li.querySelector(":scope > b")?.textContent?.replace(/:\s*$/, "").trim()
        const glyph = field === undefined ? undefined : icons[field]
        const item = this.plan.element("ui-item", glyph ? { icon: glyph } : {})
        item.append(...Array.from(li.childNodes))
        replacement.append(item)
      }
      list.replaceWith(replacement)
      count++
    }
    return count
  }

  /**
   * Goals written as Symptom / Changes paragraphs (`<b>Goal:</b> <p><b>Symptom:</b> ...</p><p><b>Changes:</b>
   * ...</p>`, before P3 of `windows-and-review`) into their own fields (`PHASE_FIELDS`);  the goal goes once nothing
   * else is left in it.  How many phases.
   */
  frameGoals(): number {
    const icons: Record<string, string> = Object.fromEntries(PHASE_FIELDS)
    let count = 0
    for (const body of this.document.querySelectorAll("ui-list.plan-phase-body")) {
      const goal = PlanSections.fieldOf(body, "Goal")
      if (!goal || PlanSections.fieldOf(body, "Symptom") || PlanSections.fieldOf(body, "Changes")) continue
      const parts = Array.from(goal.children).filter((child) =>
        /^(Symptom|Changes):$/.test(child.querySelector(":scope > b:first-child")?.textContent?.trim() ?? "")
      )
      if (!parts.length) continue
      for (const part of parts) {
        const label = part.querySelector(":scope > b:first-child")!
        const field = (label.textContent ?? "").trim().replace(/:$/, "")
        label.remove()
        const glyph = icons[field]
        const item = this.plan.fragment(`<ui-item icon="${glyph}"><b>${field}:</b>  ${part.innerHTML.trim()}</ui-item>`)
        part.remove()
        PlanSections.insertField(body, field, item.firstElementChild!)
      }
      const rest = goal.cloneNode(true) as Element
      rest.querySelector(":scope > b:first-child")?.remove()
      if (!rest.textContent?.trim() && !rest.querySelector("img, ui-code, pre")) goal.remove()
      count++
    }
    return count
  }
}

////////////////
// ## Types
////////////////

/** What `PlanMigration.mergeDecisions()` counts as it goes:  for its line in `migrate()`'s report. */
type OptionCounts = {
  /** decisions merged INTO the question they answer */
  answering: number
  /** decisions that answered nothing:  questions born answered now */
  alone: number
  /** questions whose option the decision named, chosen */
  chosen: number
  /** questions with options none of which could be inferred */
  unchosen: number
}
