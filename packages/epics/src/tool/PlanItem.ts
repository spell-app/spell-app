import {
  KINDS,
  OLD_DECISION,
  OPTIONS,
  ORIGINAL,
  STATE_COLORS,
  type ItemState,
  type OptionCard,
  type OptionLabel,
  type PlanOption
} from "./planDoc.types"

/****************
 * ### `PlanItem`
 * Reading one plan item's markup (`<ui-item id="c3">` in a `.plan-items` list):  its title and kind, its options
 * (an open question's option cards, an answered one's Choices panels), its recommendation, its Original Discussion.
 * - STATIC and instance-free on purpose:  each takes the element it reads;  `PlanDoc` does the editing.
 * - From `packages/docs/tools/plan-doc.js` (epic `epic-components`, P7).
 ****************/
export class PlanItem {
  ////////////////
  // ## Title and kind
  ////////////////

  /** An item's (element's) title text;  its id when it has none. */
  static titleOf(item: Element): string {
    return item.querySelector(".plan-title")?.textContent?.trim() ?? item.id
  }

  /**
   * An item's (element's) kind, from its id:  `question`, `judgement`, `caveat`, `issue`, `todo`, `test`;  an old
   * doc's `d7`:  `decision`;  `item` for an id of no kind.
   * - an answered question is still a `question` (its status says `decided`)
   */
  static itemKind(item: Element): string {
    if (OLD_DECISION.test(item.id)) return "decision"
    const prefix = item.id.match(/^[a-z]+/)?.[0]
    return Object.entries(KINDS).find(([kind, spec]) => kind !== "decision" && spec.prefix === prefix)?.[0] ?? "item"
  }

  /** `q12` -> `12`;  0 for an id without a number. */
  static idNumber(id: string): number {
    return Number(id.match(/\d+$/)?.[0]) || 0
  }

  /** An answer card's label:  a migrated decision's id (`d4` -> `D4`), else `Answer`. */
  static answerLabel(id: string | null | undefined): string {
    return id && OLD_DECISION.test(id) ? id.toUpperCase() : "Answer"
  }

  /**
   * A review label's color (`PlanDoc.updateReviewLabel()`):  "to do" orange (work in progress), "deferred" grey,
   * "reviewed 10-02" green while its item is `recent` (`state`), then grey.
   */
  static reviewLabelColor(words: string, state: ItemState): string {
    if (words === "to do") return STATE_COLORS.progress
    if (words.startsWith("deferred")) return "grey"
    return state === "recent" ? STATE_COLORS.recent : STATE_COLORS.old
  }

  ////////////////
  // ## Options
  ////////////////

  /**
   * Question `item`'s options, in page order, outside its Original Discussion (`ORIGINAL`):  `[{ holder, letter,
   * title, recommended, words }]`, only those whose label starts with a letter.
   * - an open question's option cards:  `holder` the `ui-column` of a `ui-grid.spell-pros-cons`, labelled by its top
   *   `ui-label[attached]`
   * - an answered question's Choices panels (`QUESTION`):  `holder` the panel's `ui-title`, its own label
   * - `holder` carries `data-chosen`;  labels as `optionLabel()` reads them
   * - `item` may be any element holding them (a Choices aside not yet in the doc, `PlanDoc.layoutAnswer()`)
   */
  static optionsOf(item: Element): PlanOption[] {
    const holders = PlanItem.current(
      item.querySelectorAll(`ui-grid.spell-pros-cons > ui-column, ${OPTIONS} > ui-title`)
    )
    const options: PlanOption[] = []
    for (const holder of holders) {
      const label =
        holder.localName === "ui-title"
          ? holder
          : holder.querySelector(":scope > ui-segment > ui-label[attached], ui-label[attached]")
      const option = PlanItem.optionLabel(label)
      if (option) options.push({ holder, ...option })
    }
    return options
  }

  /**
   * An option's letter and title from its label (`optionsOf()`):  `{ letter, title, recommended, words }`, or `null`
   * when the label has no letter.
   * - labels:  `A · Inbox file (recommended)`;  older docs `A. Inbox file`, `A: Inbox file`
   * - `title`:  after the letter, "(recommended)" left out;  `words`:  its words (`words()`)
   */
  static optionLabel(label: Element | null | undefined): OptionLabel | null {
    const match = label?.textContent?.trim().match(/^([A-Z])\s*(?:[·.:)]\s*|\s+)(.*)$/s)
    if (!match) return null
    const title = match[2].replace(PlanItem.RECOMMENDED, "").replace(/\s+/g, " ").trim()
    return { letter: match[1], title, recommended: PlanItem.RECOMMENDED.test(match[2]), words: PlanItem.words(title) }
  }

  /**
   * Is `grid` (a `ui-grid.spell-pros-cons`) a question's option cards, not pros and cons?  Some card's label names an
   * option:  a letter first (`A · ...`), or "(recommended)" (the `markdown` epic's cards had no letters).
   */
  static isOptionGrid(grid: Element): boolean {
    return Array.from(grid.querySelectorAll(":scope > ui-column")).some((column) => {
      const label = column.querySelector(":scope > ui-segment > ui-label[attached], :scope > ui-label[attached]")
      return Boolean(PlanItem.optionLabel(label)) || PlanItem.RECOMMENDED.test(label?.textContent ?? "")
    })
  }

  /**
   * Open Choices accordion `options` (`OPTIONS`) on its chosen panel (`open="2"`, by index);  none chosen:  every
   * panel folded (no `open`).
   */
  static openOn(options: Element): void {
    const index = Array.from(options.querySelectorAll(":scope > ui-title")).findIndex((title) =>
      title.hasAttribute("data-chosen")
    )
    if (index < 0) options.removeAttribute("open")
    else options.setAttribute("open", String(index))
  }

  /**
   * The option an item's details mark "(recommended)", without the mark;  `null` when none.
   * - the innermost element saying it (a pros-cons label, a bold lead, a list item), so the text stays short
   * - `details`:  the item's `ui-content`, or `null`
   */
  static recommendation(details: Element | null | undefined): string | null {
    if (!details) return null
    const marked = Array.from(details.querySelectorAll("*")).filter(
      (el) =>
        PlanItem.RECOMMENDED.test(el.textContent ?? "") &&
        !Array.from(el.children).some((child) => PlanItem.RECOMMENDED.test(child.textContent ?? ""))
    )
    const best = marked.sort(
      (a, b) => rank(a) - rank(b) || (a.textContent ?? "").length - (b.textContent ?? "").length
    )[0]
    if (!best) return null
    return (best.textContent ?? "")
      .replace(/\s*\(recommended\)\s*/i, " ")
      .replace(/\s+/g, " ")
      .trim()

    /**
     * An option's own label (a card's `ui-label`, a Choices panel's `ui-title`) beats a bold lead, which beats any
     * other mention ("yes (recommended)" in a cell).
     */
    function rank(el: Element): number {
      if (el.localName === "ui-label" || el.localName === "ui-title") return 0
      return ["b", "strong"].includes(el.localName) ? 1 : 2
    }
  }

  /** `text`'s words, lower case, punctuation gone, `LITTLE_WORDS` left out:  "Bump ui to rc.13" -> bump ui rc 13. */
  static words(text: string | null | undefined): string[] {
    return String(text ?? "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word && !PlanItem.LITTLE_WORDS.has(word))
  }

  /**
   * "Pick B, but ...":  a revisit's pick and note as one phrase, `picks B · <card title>, asks:  "<note>"`.
   * - `option`:  the card (`PlanDoc.optionCards()`'s);  none with that letter:  "(no such option card)"
   * - the command line's `printWork()` (under "revisit, to talk over") and `PlanDoc.applyMark()` (what it left) say
   *   it the same way
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
  // ## Original Discussion
  ////////////////

  /** Is `node` inside an item's Original Discussion (`ORIGINAL`)?  Readers of an item's text skip it. */
  static inOriginal(node: Element): boolean {
    return Boolean(node.closest?.(".plan-original"))
  }

  /** `elements` (a node list) outside every Original Discussion, as an array. */
  static current(elements: Iterable<Element>): Element[] {
    return Array.from(elements).filter((element) => !PlanItem.inOriginal(element))
  }

  /** A copy of item details `content` (its `ui-content`) without its Original Discussion:  its current text. */
  static withoutOriginal(content: Element): Element {
    const copy = content.cloneNode(true) as Element
    for (const original of copy.querySelectorAll(`:scope > ${ORIGINAL}`)) original.remove()
    return copy
  }

  /** An Original Discussion version's text (`div.plan-version`), its heading left out, as HTML. */
  static versionBody(version: Element): string {
    const copy = version.cloneNode(true) as Element
    copy.querySelector(":scope > h5")?.remove()
    return copy.innerHTML
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
  // ## Words
  ////////////////

  /**
   * The mark `recommendation()` looks for.
   * - static:  one pattern every reader shares
   */
  private static readonly RECOMMENDED = /\(recommended\)/i

  /**
   * Words that say nothing about which option is meant:  `words()` drops them.
   * - static:  one set every reader shares
   */
  private static readonly LITTLE_WORDS = new Set([
    "a",
    "an",
    "the",
    "and",
    "or",
    "of",
    "to",
    "in",
    "on",
    "for",
    "with",
    "by",
    "is",
    "its",
    "at",
    "as",
    "be"
  ])
}
