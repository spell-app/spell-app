import { parseHTML } from "linkedom"

import { REPORT, SectionIds } from "$/epics/definitions"
import { EpicParts } from "$/epics/tool/EpicParts"
import { PART_EXT, type PartReader } from "$/epics/tool/PlanParts"
import { PlanMarkup } from "$/epics/tool/PlanMarkup"
import { ProseRewrite } from "$/epics/tool/ProseRewrite"
import { ProseShapes } from "$/epics/tool/ProseShapes"

import { Counted, Drawn, KEPT, PLAN_DOC_CSS, Prose, type Conversion } from "./convert.types"

import { ConversionProof } from "./ConversionProof"
import { ConvertedReading } from "./ConvertedReading"
import type { ConverterProps } from "./Converter"
import { DocPass } from "./DocPass"

/****************
 * ### `Upgrader`
 * The SECOND pass (epic `epic-components` P14):  takes ONE converted doc (`<epic-page>` markup) on to the elements P14
 * added, and proves it lost nothing, as the first pass does (`DocPass`, `ConversionProof` with `ConvertedReading`).
 * - the page:  the old crumbs before `<epic-page>` and the `plan-doc.css` link go (the page draws its crumbs, the
 *   elements style themselves);  an `#overnight` report outside the page becomes `<epic-section kind="report">`
 *   after its Overview
 * - the Overview:  `<p slot="summary">` => `<epic-summary>`, `<blockquote slot="prompt">` => `<epic-prompt>`
 * - a question's text as asked, its leading prose (`questions()`) => `<epic-question>`, first in its item, and in
 *   each version of its Original Discussion
 * - the prose blocks, anywhere:  `ProseRewrite` (the tool's way in turns them the same way)
 * - counts what it did, and what it left as prose (`counts`, `Counted`);  a doc with nothing to do has no counts but
 *   `kept: ...` (`changed()`), and a second run over its output does nothing
 ****************/
export class Upgrader extends DocPass {
  /** What it did, and what it kept as prose:  `Counted`'s text => how many. */
  readonly counts: Record<string, number> = {}

  /** The prose blocks' helper. */
  readonly prose = new ProseRewrite(this)

  constructor({ name, skeleton, readPart = () => undefined }: ConverterProps) {
    const before = Upgrader.assembled(skeleton, readPart)
    super({
      name,
      before: before.document,
      document: Upgrader.assembled(skeleton, readPart).document,
      wasSplit: before.split
    })
    for (const id of before.missing) this.note(`part \`parts/${id}${PART_EXT}\` is missing:  its host upgrades empty`)
  }

  /**
   * Upgrade the doc:  the P14 markup, validated, split, formatted, and proved against the converted doc.
   * - throws `ConvertError` for a doc not in `<epic-page>` markup (the first pass first)
   */
  async upgrade(): Promise<Conversion> {
    this.upgradeMarkup()
    const { skeleton, parts, problems, after } = await this.output()
    const proof = new ConversionProof({ before: this.before, after, reading: ConvertedReading }).report
    const { name, notes, wasSplit, counts } = this
    return { name, skeleton, parts, notes, problems, proof, wasSplit, pass: 2, counts }
  }

  /**
   * Did the pass change anything?  Its `counts` hold more than `kept: ...`.
   * - STATIC:  reads a `Conversion`'s counts
   */
  static changed(counts: Record<string, number>): boolean {
    return Object.entries(counts).some(([key, count]) => !key.startsWith(KEPT) && count > 0)
  }

  ////////////////
  // ## For the helper
  ////////////////

  /** Count one of `Counted`. */
  count(key: string): void {
    this.counts[key] = (this.counts[key] ?? 0) + 1
  }

  /** Count `element`, left as prose for `key`'s reason, and note where. */
  keep(key: string, element: Element, what = DocPass.describe(element)): void {
    this.count(key)
    this.note(`${this.where(element)}:  ${what} kept as prose (${key.slice(KEPT.length)})`)
  }

  /** Where `element` is, for a note:  its item, phase or section (`#q7`), or `the page`. */
  where(element: Element): string {
    const unit = element.closest("epic-item[id], epic-phase[id], epic-section[id], epic-overview")
    return unit ? `#${unit.id}` : "the page"
  }

  ////////////////
  // ## The upgrade
  ////////////////

  /** Make the working document over into P14's markup, IN PLACE. */
  private upgradeMarkup() {
    const main = this.document.querySelector("main")
    const page = main?.querySelector(":scope > epic-page")
    if (!main || !page) throw this.error("not in <epic-page> markup:  the first pass converts it (`plan-doc convert`)")
    const sheet = this.document.querySelector(PLAN_DOC_CSS)
    if (sheet) {
      sheet.remove()
      this.count(Counted.css)
    }
    for (const crumbs of main.querySelectorAll(`:scope > ${Prose.crumbs}`)) {
      crumbs.remove()
      this.count(Counted.crumbs)
    }
    for (const report of main.querySelectorAll(`:scope > ${Prose.report}`)) this.report(report, page)
    for (const child of main.children) if (child !== page) this.keep(Counted.keptOutside, child)
    this.overview(page)
    this.prose.rewrite(page)
    this.questions(page)
  }

  /** `<epic-section kind="report" title>` from markdown's `#overnight` report outside the page:  after the Overview. */
  private report(section: Element, page: Element) {
    section.remove()
    const header = section.querySelector(":scope > span[slot='header']")
    let title: { title?: string; slot?: Element } = {}
    if (header) {
      header.remove()
      title = PlanMarkup.titleOf(header)
    } else title = { title: PlanMarkup.squeeze(section.getAttribute("header") ?? "") || undefined }
    const body = PlanMarkup.takeChildren(section).filter(
      (node) => !(PlanMarkup.isElement(node) && node.matches("ui-icon[slot='icon']"))
    )
    const data = { id: section.id, kind: REPORT, title: title.title } as const
    const made = this.element("epic-section", data, title.slot ? [title.slot, ...body] : body, section)
    const after = page.querySelectorAll(`:scope > epic-overview, :scope > epic-section[kind='${REPORT}']`)
    if (after.length) after[after.length - 1]!.after(made)
    else page.prepend(made)
    this.count(Counted.report)
  }

  /** `<epic-summary>` and `<epic-prompt>` from the Overview's slotted summary and prompt:  first, in that order. */
  private overview(page: Element) {
    const overview = page.querySelector(":scope > epic-overview")
    if (!overview) return
    const made: Element[] = []
    const summary = overview.querySelector(`:scope > ${Prose.summary}`)
    if (summary) {
      summary.remove()
      made.push(this.element("epic-summary", {}, PlanMarkup.takeChildren(summary), summary))
      this.count(Counted.summary)
    }
    const prompt = overview.querySelector(`:scope > ${Prose.prompt}`)
    if (prompt) {
      prompt.remove()
      made.push(this.element("epic-prompt", {}, PlanMarkup.takeChildren(prompt), prompt))
      this.count(Counted.prompt)
    }
    overview.prepend(...made)
  }

  /**
   * `<epic-question>` around each question's text as asked:  in its item, and in each version of its Original
   * Discussion.
   * - a question born answered (`answered`, no choices, no answer card:  its title IS the decision, its text the why)
   *   asks nothing:  left as it is
   */
  private questions(page: Element) {
    const section = page.querySelector(`:scope > epic-section#${SectionIds.questions}`)
    for (const item of section?.querySelectorAll(":scope > epic-item") ?? []) {
      const asks = !item.hasAttribute("answered") || item.querySelector(":scope > :is(epic-choices, epic-answer)")
      if (!asks) continue
      if (this.question(item)) this.count(Counted.question)
      for (const version of item.querySelectorAll(":scope > epic-original > epic-version"))
        if (this.question(version)) this.count(Counted.versionQuestion)
    }
  }

  /**
   * Wrap `holder`'s leading prose (an item's, a version's) in `<epic-question>`;  whether it did.
   * - the question ends at its Net effect, its options, or a card (`endsQuestion()`);  slotted children (a title)
   *   stay where they are
   * - none:  when `holder` has its `<epic-question>` already, or no prose leads it
   */
  private question(holder: Element): boolean {
    if (holder.querySelector(":scope > epic-question")) return false
    const nodes: ChildNode[] = []
    for (const node of Array.from(holder.childNodes)) {
      if (PlanMarkup.isElement(node) && node.hasAttribute("slot") && !nodes.length) continue
      if (PlanMarkup.isElement(node) && (node.hasAttribute("slot") || endsQuestion(node))) break
      nodes.push(node)
    }
    while (nodes.length && !PlanMarkup.isSignificant(nodes.at(-1)!)) nodes.pop()
    while (nodes.length && !PlanMarkup.isSignificant(nodes[0]!)) nodes.shift()
    if (!nodes.length) return false
    const question = this.element("epic-question", {}, [], holder)
    nodes[0]!.before(question)
    question.append(...nodes)
    return true
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** `skeleton` parsed, its parts put back (`EpicParts.assemble()`). */
  private static assembled(skeleton: string, readPart: PartReader) {
    const document = parseHTML(skeleton).document as unknown as Document
    const parts = new EpicParts(document)
    const split = parts.hosts.some((host) => host.hasAttribute("source"))
    const missing = parts.assemble(readPart)
    return { document, split, missing }
  }
}

/** The prose of a question's text:  `<epic-*>` tags that are part of it, not after it. */
const QUESTION_PROSE = new Set(["epic-update", "epic-code", "epic-aside", "epic-note"])

/**
 * Does `element`, among an item's (a version's) children, end its question's text:  its Net effect, its options, a
 * card, a hand-written card, a `The options:` lead?
 */
function endsQuestion(element: Element): boolean {
  const tag = element.localName
  if (tag.startsWith("epic-")) return !QUESTION_PROSE.has(tag)
  if (element.matches(`${Prose.grid}, ${Prose.answer}, ${Prose.reply}`)) return true
  const lead = PlanMarkup.squeeze(ProseShapes.boldLead(element)?.textContent ?? "")
  return Drawn.netEffectLead.test(lead) || OPTIONS_LEAD.test(lead)
}

/** A paragraph leading a question's options:  `The options:`. */
const OPTIONS_LEAD = /^The options\b/
