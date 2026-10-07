import { parseHTML } from "linkedom"

import {
  OLD_DECISION,
  QUESTION_ID,
  TITLE_PREFIX,
  isPhaseStatus,
  type ItemFacts,
  type ItemKind,
  type ItemText,
  type OptionCard,
  type Phase,
  type PlanDocOptions
} from "./planDoc.types"

import { PlanItem } from "./PlanItem"
import { PlanMarkup } from "./PlanMarkup"
import { PlanReader } from "./PlanReader"

/****************
 * ### `OldPlanReader`
 * A plan doc in the markup BEFORE the switch (`ui-section`s, `ui-item[data-status]` in `.plan-items` lists ...),
 * READ ONLY:  so `summary`, `list`, `items`, `check` and the inbox's listings keep working on the real docs from a
 * branch on the new tool, until they're converted (P12).  Every editing command refuses such a doc
 * (`PlanDocFiles.read()`).
 * - REFACTOR: drop after the switch (P12):  the converter (`$/epics/convert`) rewrites every doc once, and this goes
 *   with the old markup.
 * - What each element says, the old way (P7's `PlanDoc`'s readers, trimmed to reading);  the reckoning on top is
 *   `PlanReader`'s, shared with `PlanDoc`.
 * - Reads every layout the old tool still read:  `<ui-section>`s (2026-10-02 on) and the `section.s2|s3` before,
 *   an old doc's `D` items (`d7`, 2026-10-04) and its struck questions.
 ****************/
export class OldPlanReader extends PlanReader {
  /** Which markup the doc is in:  the old `ui-*`. */
  readonly markup = "old" as const

  /** `OldPlanReader` of HTML text;  `options` as the constructor's. */
  static parse(html: string, now?: Date, options?: PlanDocOptions): OldPlanReader {
    return new OldPlanReader(parseHTML(html).document as unknown as Document, now, options)
  }

  /** The doc as HTML text. */
  toString(): string {
    return PlanMarkup.serializePage(this.document)
  }

  ////////////////
  // ## The page
  ////////////////

  /** The h1's text without `Epic: `;  `""` without an h1. */
  get title(): string {
    const heading = this.document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim() ?? ""
    return heading.startsWith(TITLE_PREFIX) ? heading.slice(TITLE_PREFIX.length) : heading
  }

  /** `<body data-future>`. */
  get future(): boolean {
    return Boolean(this.document.body?.hasAttribute("data-future"))
  }

  /** `<body data-bedtime>`, `null` when none. */
  get bedtimeRun(): string | null {
    return this.document.body?.getAttribute("data-bedtime") || null
  }

  /** `p.plan-estimate`'s text, without `Estimate:`. */
  get estimate(): string | undefined {
    return this.document
      .querySelector("p.plan-estimate")
      ?.textContent?.replace(/^\s*Estimate:\s*/, "")
      .trim()
  }

  /** `<body data-recent-since>`. */
  get recentSinceMark(): string | undefined {
    return this.document.body?.getAttribute("data-recent-since") ?? undefined
  }

  ////////////////
  // ## Phases
  ////////////////

  /** Every phase:  `<ui-section data-phase>` in `#phases`, or `section[data-phase]` in `#phases-section`. */
  get phases(): Phase[] {
    return Array.from(this.document.querySelectorAll(PHASE_SECTIONS), (section) => ({
      n: Number(section.getAttribute("data-phase")),
      name: titleText(section)
        .replace(/^\s*P\d+\s*·\s*/, "")
        .trim(),
      status: section.getAttribute("data-status") ?? "todo",
      estimate: estimateOf(section)
    }))
  }

  ////////////////
  // ## Items
  ////////////////

  /** Every item:  `.plan-items > [id]`, an old `d7` too. */
  get allItems(): Element[] {
    return Array.from(this.document.querySelectorAll(".plan-items > [id]"))
  }

  /** Its own list (`.plan-items[data-kind="judgement"]`), else the one it shares (questions:  `decision`). */
  protected sectionChildren(kind: ItemKind): Element[] {
    const list =
      this.document.querySelector(`.plan-items[data-kind="${kind}"]`) ??
      this.document.querySelector(`.plan-items[data-kind="${LISTS[kind] ?? kind}"]`)
    return Array.from(list?.children ?? [])
  }

  /** What `item` says:  its `data-*` marks, its `.plan-title`. */
  facts(item: Element): ItemFacts {
    const mark = (name: string) => item.getAttribute(`data-${name}`) ?? undefined
    const phase = mark("phase")
    return {
      id: item.id,
      title: item.querySelector(".plan-title")?.textContent?.trim() ?? item.id,
      status: mark("status") ?? "open",
      changed: mark("changed"),
      phase: phase === undefined ? undefined : Number(phase),
      answered: item.hasAttribute("data-answered"),
      reviewed: mark("reviewed"),
      deferred: mark("deferred"),
      queued: mark("queued"),
      work: mark("work"),
      working: item.hasAttribute("data-working"),
      bedtime: item.hasAttribute("data-bedtime"),
      // the old markup has no urgency:  every open call is urgent
      calm: false
    }
  }

  /** The item with `id`;  an old decision's id moved onto an answer card (`d7`) finds its question. */
  findItem(id: string): Element | null {
    const key = String(id).toLowerCase()
    let item = this.document.getElementById(key)
    if (item && OLD_DECISION.test(key) && item.matches(".plan-answer-block")) item = item.closest(".plan-items > [id]")
    return item?.parentElement?.matches(".plan-items") ? item : null
  }

  /** Its details' text without the Original Discussion, the Original Discussion's text, its recommendation. */
  textOf(item: Element): ItemText {
    const content = item.querySelector(":scope > ui-accordion > ui-content")
    const copy = content?.cloneNode(true) as Element | undefined
    for (const original of copy?.querySelectorAll(`:scope > ${ORIGINAL}`) ?? []) original.remove()
    const original = content?.querySelector(`:scope > ${ORIGINAL} > ui-content`)
    return {
      details: copy ? PlanMarkup.squeeze(copy.textContent ?? "") : "",
      detailsHtml: copy ? copy.innerHTML.trim() : "",
      original: original ? PlanMarkup.squeeze(original.textContent ?? "") : null,
      recommendation: PlanItem.recommendationIn(copy)
    }
  }

  /** A decision (an answered question, or an old `d7`) linking to `#id`, not its own chip nor an old `→ D7`. */
  linkedFromDecision(id: string): boolean {
    const list = this.document.querySelector('.plan-items[data-kind="decision"]')
    return Array.from(list?.children ?? []).some(
      (decision) =>
        decision.id !== id &&
        (OLD_DECISION.test(decision.id) || (QUESTION_ID.test(decision.id) && decision.hasAttribute("data-answered"))) &&
        current(decision.querySelectorAll(`a[href="#${id}"]:not(.plan-id, .plan-answer)`)).length > 0
    )
  }

  /** An open question's option cards, an answered one's Choices panels:  each lettered label. */
  optionCards(item: Element): OptionCard[] {
    const cards: OptionCard[] = []
    for (const holder of current(item.querySelectorAll(`ui-grid.spell-pros-cons > ui-column, ${OPTIONS} > ui-title`))) {
      const label =
        holder.localName === "ui-title"
          ? holder
          : holder.querySelector(":scope > ui-segment > ui-label[attached], ui-label[attached]")
      const match = label?.textContent?.trim().match(/^([A-Z])\s*(?:[·.:)]\s*|\s+)(.*)$/s)
      if (!match) continue
      const title = match[2]!.replace(RECOMMENDED, "").replace(/\s+/g, " ").trim()
      cards.push({ letter: match[1]!, title, recommended: RECOMMENDED.test(match[2]!) })
    }
    return cards
  }

  /** Duplicate ids, `#id` links to nowhere (outside an Original Discussion), phases without a valid status or heading. */
  check(): string[] {
    const problems: string[] = []
    const seen = new Map<string, number>()
    for (const el of this.document.querySelectorAll("[id]")) seen.set(el.id, (seen.get(el.id) ?? 0) + 1)
    for (const [id, count] of seen) if (count > 1) problems.push(`id "${id}" used ${count} times`)
    for (const a of current(this.document.querySelectorAll('a[href^="#"]'))) {
      const id = a.getAttribute("href")!.slice(1)
      if (id && !seen.has(id)) problems.push(`link to missing #${id} ("${(a.textContent ?? "").trim()}")`)
    }
    for (const phase of this.phases) {
      if (!isPhaseStatus(phase.status)) problems.push(`P${phase.n} has status "${phase.status}"`)
      if (!this.document.getElementById(`p${phase.n}`)) problems.push(`P${phase.n} has no heading #p${phase.n}`)
    }
    return problems
  }
}

/** Phase sections, either layout:  `<ui-section data-phase>` in `#phases`, or `section[data-phase]` (older). */
const PHASE_SECTIONS = "ui-section#phases ui-section[data-phase], #phases-section section[data-phase]"

/** An item's Original Discussion. */
const ORIGINAL = "ui-accordion.plan-original"

/** An answered question's Choices:  a panel per option. */
const OPTIONS = "ui-accordion.plan-options"

/** The mark an option's label carries. */
const RECOMMENDED = /\(recommended\)/i

/** The list a kind's items share, when it has none of its own:  questions live in `data-kind="decision"`. */
const LISTS: Partial<Record<ItemKind, string>> = { question: "decision", decision: "decision" }

/** `elements` outside every Original Discussion. */
function current(elements: Iterable<Element>): Element[] {
  return Array.from(elements).filter((element) => !element.closest(".plan-original"))
}

/** A section's title:  a `<ui-section>`'s `header` (else its `slot="header"`), an old one's h2 / h3;  labels left out. */
function titleText(section: Element): string {
  const header = section.localName === "ui-section" ? section.getAttribute("header") : null
  if (header !== null) return header.replace(/\s+/g, " ").trim()
  const source =
    section.localName === "ui-section"
      ? section.querySelector(':scope > [slot="header"]')
      : section.querySelector(":scope > ui-sticky > :is(h2, h3)")
  const clone = source?.cloneNode(true) as Element | undefined
  for (const label of clone?.querySelectorAll("ui-label") ?? []) label.remove()
  return PlanMarkup.squeeze(clone?.textContent ?? "")
}

/** A phase's estimate:  its title's badge, else an old Estimate field;  `undefined` while missing or `TBD`. */
function estimateOf(section: Element): string | undefined {
  const badge = section.localName === "ui-section" ? section.getAttribute("badge") : null
  if (badge) return badge
  const body = section.querySelector(":scope > .plan-phase-body")
  const field = Array.from(body?.children ?? []).find((item) => /^Estimate:/.test((item.textContent ?? "").trim()))
  const value = field?.textContent?.trim().replace(/^Estimate:\s*/, "")
  return value && value !== "TBD" ? value : undefined
}
