import { Markup } from "$/epics/markup"

import { KINDS, OLD_DECISION, type OptionCard } from "./planDoc.types"

import { PlanMarkup } from "./PlanMarkup"

/****************
 * ### `PlanItem`
 * Reading one `<epic-item>`:  its title and kind, its options (`<epic-choices>` > `<epic-option>`), its
 * recommendation, its current text without its Original Discussion;  and an item's cards as plain prose, for where
 * an element can't go (an Original Discussion's versions, a details page).
 * - STATIC and instance-free on purpose:  each takes the element it reads;  `PlanDoc` does the editing.
 * - Attributes are read through `Markup` (the definitions);  children by tag.
 * - The markup-free bits (`kindOf()`, `idNumber()`, `pickAsks()`) serve the old-markup reader too.
 ****************/
export class PlanItem {
  ////////////////
  // ## Title and kind
  ////////////////

  /**
   * An item's (or phase's, option's, section's) title text:  its `title`, else its `slot="title"` child's text,
   * whitespace squeezed;  its id when it has neither.
   */
  static titleOf(element: Element): string {
    const title = element.getAttribute("title")
    if (title !== null) return title
    const slot = element.querySelector(':scope > [slot="title"]')
    return slot ? PlanMarkup.squeeze(slot.textContent ?? "") : element.id
  }

  /**
   * The kind an id names (`q7` -> `question`):  `question`, `judgement`, `caveat`, `issue`, `todo`, `test`;  an old
   * decision's `d7`:  `decision`;  an Overview sub-section's `o3`:  `overview` (Q14);  `item` for an id of no kind.
   * - an answered question is still a `question` (its status says `decided`)
   */
  static kindOf(id: string): string {
    if (OLD_DECISION.test(id)) return "decision"
    if (/^o\d+$/.test(id)) return "overview"
    const prefix = id.match(/^[a-z]+/)?.[0]
    return Object.entries(KINDS).find(([kind, spec]) => kind !== "decision" && spec.prefix === prefix)?.[0] ?? "item"
  }

  /** `q12` -> `12`;  0 for an id without a number. */
  static idNumber(id: string): number {
    return Number(id.match(/\d+$/)?.[0]) || 0
  }

  ////////////////
  // ## Options
  ////////////////

  /** Question `item`'s `<epic-choices>`, or `null`:  its own, never one in its Original Discussion. */
  static choicesOf(item: Element): Element | null {
    return item.querySelector(":scope > epic-choices")
  }

  /** Question `item`'s options, in order:  each `<epic-option>` with its letter, title and whether it's recommended. */
  static optionsOf(item: Element): (OptionCard & { option: Element })[] {
    const choices = PlanItem.choicesOf(item)
    return Array.from(choices?.querySelectorAll(":scope > epic-option") ?? [], (option) => {
      const data = Markup.read<"epic-option">(option)
      return {
        option,
        letter: data.letter,
        title: PlanItem.titleOf(option),
        recommended: Boolean(data.recommended)
      }
    })
  }

  /**
   * The option item `item` recommends, as its card was labelled:  `B · Unfold it`;  `null` when none.
   * - its `<epic-option recommended>`;  else (options written as prose, a pros / cons grid) the innermost element
   *   of its current text saying "(recommended)", mark dropped
   */
  static recommendation(item: Element): string | null {
    const option = PlanItem.optionsOf(item).find((each) => each.recommended)
    if (option) return `${option.letter} · ${option.title}`
    return PlanItem.recommendationIn(PlanItem.currentText(item))
  }

  /**
   * The option `details` (any element) marks "(recommended)", without the mark;  `null` when none.
   * - the innermost element saying it (a label, a bold lead, a list item), so the text stays short:  a label first,
   *   then a bold lead, then anything else
   * - STATIC and markup-free:  the old-markup reader reads its items' text with it too
   */
  static recommendationIn(details: Element | null | undefined): string | null {
    if (!details) return null
    const marked = Array.from(details.querySelectorAll("*")).filter(
      (el) =>
        RECOMMENDED.test(el.textContent ?? "") &&
        !Array.from(el.children).some((child) => RECOMMENDED.test(child.textContent ?? ""))
    )
    const best = marked.sort(
      (a, b) => rank(a) - rank(b) || (a.textContent ?? "").length - (b.textContent ?? "").length
    )[0]
    if (!best) return null
    return (best.textContent ?? "")
      .replace(/\s*\(recommended\)\s*/i, " ")
      .replace(/\s+/g, " ")
      .trim()

    /** An option's own label beats a bold lead, which beats any other mention ("yes (recommended)" in a cell). */
    function rank(el: Element): number {
      if (el.localName === "ui-label" || el.localName === "ui-title") return 0
      return ["b", "strong"].includes(el.localName) ? 1 : 2
    }
  }

  /**
   * "Pick B, but ...":  a revisit's pick and note as one phrase, `picks B · <card title>, asks:  "<note>"`.
   * - `option`:  the card (`PlanReader.optionCards()`'s);  none with that letter:  "(no such option card)"
   * - the inbox's printout (under "revisit, to talk over") and `PlanDoc.applyMark()` (what it left) say it the same
   */
  static pickAsks(
    pick: string | undefined,
    option: (Partial<OptionCard> & { title: string }) | undefined,
    note: string | undefined
  ): string {
    const card = option ? `picks ${pick} · ${option.title}` : `picks ${pick} (no such option card)`
    return note ? `${card}, asks:  "${note}"` : `${card}, no note`
  }

  ////////////////
  // ## Text
  ////////////////

  /**
   * A copy of item `item`'s current text:  its children without its title slot and its Original Discussion, in a
   * `<div>` out of the doc.
   */
  static currentText(item: Element): Element {
    const copy = item.ownerDocument.createElement("div")
    for (const child of Array.from(item.childNodes)) {
      if (PlanMarkup.isElement(child) && (child.hasAttribute("slot") || child.localName === "epic-original")) continue
      copy.append(child.cloneNode(true))
    }
    return copy
  }

  /** Is `element` inside an Original Discussion (`<epic-original>`)?  Readers of an item's text skip it. */
  static inOriginal(element: Element): boolean {
    return Boolean(element.closest("epic-original"))
  }

  /** `elements` outside every Original Discussion, as an array. */
  static current(elements: Iterable<Element>): Element[] {
    return Array.from(elements).filter((element) => !PlanItem.inOriginal(element))
  }

  /**
   * Every `id` in `element` (itself too) renamed `data-original-id`:  text moved into an Original Discussion must not
   * make a second `#q3`, nor be what a link lands on.
   */
  static stripIds(element: Element): void {
    for (const node of [element, ...element.querySelectorAll("[id]")]) {
      if (!node.hasAttribute("id")) continue
      node.setAttribute("data-original-id", node.getAttribute("id")!)
      node.removeAttribute("id")
    }
  }

  ////////////////
  // ## Cards as prose
  ////////////////

  /**
   * `node`, an item's card (`<epic-choices>`, `<epic-answer>`, `<epic-more>`, `<epic-reply>`, `<epic-commit>`), as
   * the prose it says, where an element can't go:  an Original Discussion's version holds prose only, and a details
   * page has no `<epic-*>` elements.  Anything else comes back as it is.
   * - a `<div>`:  a bold line saying what the element would draw (`Answer · Named palette`, `A · Inbox file
   *   (recommended), chosen`, `Owen · 2026-10-06 10:42 · re:  revisit soon`), then its children, MOVED
   * - nested cards too (an answer inside a version being kept)
   */
  static asProse(node: Node): Node {
    if (!PlanMarkup.isElement(node) || !CARD_HEADINGS[node.localName]) return node
    const document = node.ownerDocument
    const box = document.createElement("div")
    const heading = CARD_HEADINGS[node.localName]!(node)
    if (heading) {
      const line = document.createElement("p")
      const bold = document.createElement("b")
      bold.textContent = heading
      line.append(bold)
      box.append(line)
    }
    for (const child of Array.from(node.childNodes)) {
      if (PlanMarkup.isElement(child) && child.getAttribute("slot") === "title") continue
      box.append(PlanItem.asProse(child))
    }
    return box
  }
}

/** The mark an option's title (or a prose option's label) carries. */
const RECOMMENDED = /\(recommended\)/i

/** Each card's heading as prose (`PlanItem.asProse()`):  what its element draws from its data. */
const CARD_HEADINGS: Record<string, (element: Element) => string | undefined> = {
  "epic-choices": () => "Choices",
  "epic-option": (option) => {
    const data = Markup.read<"epic-option">(option)
    const chosen = option.parentElement?.getAttribute("chosen") === data.letter
    const marks = [data.recommended ? " (recommended)" : "", chosen ? ", chosen" : ""].join("")
    return `${data.letter} · ${PlanItem.titleOf(option)}${marks}`
  },
  "epic-answer": (answer) => {
    const id = answer.getAttribute("id")
    const label = id && OLD_DECISION.test(id) ? id.toUpperCase() : "Answer"
    const title = answer.getAttribute("title")
    return title ? `${label} · ${title}` : label
  },
  "epic-more": () => "More Details",
  "epic-reply": (reply) => {
    const { from, at, re } = Markup.read<"epic-reply">(reply)
    return [from, at, re ? `re:  ${re}` : undefined].filter(Boolean).join(" · ") || "Reply"
  },
  "epic-commit": (commit) => (commit.getAttribute("sha") ?? "").slice(0, 7)
}
