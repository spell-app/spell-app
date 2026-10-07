import { Formats } from "$/epics/definitions"

import { Chrome, isScriptUpdate, Old, replyTitleParts } from "./convert.types"

import type { Converter } from "./Converter"
import { isBlank, isElement, squeeze, stripEdges, takeChildren, titleOf } from "./domEdits"

/****************
 * ### `CardConverter`
 * An item's details, for `Converter`:  its text, then its cards -- `<epic-choices>` (from the Choices accordion, or a
 * QUESTION's own option grid), `<epic-answer>`, `<epic-more>`, `<epic-reply>`s, `<epic-original>`, `<epic-commit>`s
 * -- in the content model's order (`layout()`).  Phases' commits come through here too (`commits()`).
 * - Old layouts read:  the question's text wrapped (`div.plan-question`, `div.plan-first`:  unwrapped);  the answer
 *   card FIRST (claude-design, before 2026-10-05:  moved after the question and its choices);  option cards as a
 *   grid (`ui-grid.spell-pros-cons`) or an accordion;  an answer card keeping an old decision's id (`#d7`, kept).
 * - Text after a card:  into the card before it when that one takes prose (an answer, More Details, a reply);  else
 *   (after the choices) moved up with the item's text, as `decide` lays an answered question out.
 * - Dropped, as chrome:  `Choices`, `More Details`, `Original Discussion` and version headings, an answer's
 *   `Answer` / `D7`, an option's `A · ` and ` (recommended)`, a reply's title line (into `from` / `at` / `re`).
 ****************/
export class CardConverter {
  /** The converter it works for:  STATIC for its life. */
  readonly owner: Converter

  constructor(owner: Converter) {
    this.owner = owner
  }

  /** The working document. */
  get document(): Document {
    return this.owner.document
  }

  /**
   * An item's details (`nodes`, its panel's content) as the new item's children, in order:  its text, then its cards.
   * - `item`:  the old `<ui-item>`, for its id and in messages
   */
  layout(item: Element, nodes: ChildNode[]): Node[] {
    const entries = nodes.flatMap((node) => this.classify(item, node))
    const early =
      entries[0]?.kind === "answer" && entries.some((entry) => entry.kind === "flow") ? entries[0] : undefined
    const text: Node[] = []
    const cards: Card[] = []
    let hoisted = 0
    let joined = 0
    for (const entry of entries) {
      if (entry.kind !== "flow") {
        cards.push(entry)
        continue
      }
      const host = cards.findLast((card) => TAKES_PROSE.has(card.kind) && card !== early)
      if (host) {
        host.elements.at(-1)!.append(...entry.nodes)
        joined++
      } else {
        if (cards.some((card) => card !== early)) hoisted++
        text.push(...entry.nodes)
      }
    }
    if (early) this.owner.note(`#${item.id}:  its answer card, first in the old layout, now after its question`)
    if (hoisted) this.owner.note(`#${item.id}:  ${hoisted} block(s) after its options moved up, before them`)
    if (joined) this.owner.note(`#${item.id}:  ${joined} block(s) after a card joined that card`)
    const ordered = cards.toSorted((a, b) => CARD_ORDER.indexOf(a.kind) - CARD_ORDER.indexOf(b.kind))
    for (const kind of SINGLE_CARDS) {
      if (ordered.filter((card) => card.kind === kind).length > 1) throw this.owner.error(`two ${kind} cards`, item)
    }
    return [...text, ...ordered.flatMap((card) => card.elements)]
  }

  /** `<epic-commit sha>`s from a commit list's holder (`div.plan-commits`, a phase's `ui-item.plan-commits`). */
  commits(holder: Element): Element[] {
    const list = holder.querySelector(`:scope > ${Old.commitList}`)
    const label = holder.querySelector(":scope > b:first-child")
    if (!list) throw this.owner.error("commits without their list", holder)
    list.remove()
    label?.remove()
    if (holder.textContent?.trim() || holder.children.length)
      throw this.owner.error("commits holding more than a list", holder)
    return Array.from(list.children, (line) => {
      const link = line.querySelector(`:scope > ${Old.commitLink}`)
      const sha = line.getAttribute("data-sha") ?? /\/commit\/([0-9a-f]+)$/.exec(link?.getAttribute("href") ?? "")?.[1]
      if (!sha) throw this.owner.error("a commit without its sha", line)
      if (link && squeeze(link.textContent ?? "") !== sha.slice(0, 7))
        this.owner.note(
          `commit ${sha.slice(0, 7)}:  shown as \`${squeeze(link.textContent ?? "")}\` before, drawn as its sha now`
        )
      link?.remove()
      return this.owner.element("epic-commit", { sha }, takeChildren(line), line)
    })
  }

  ////////////////
  // ## Reading the details
  ////////////////

  /** What `node` is, among an item's details:  text, or a card (converted). */
  private classify(item: Element, node: ChildNode): Card[] {
    if (node.nodeType === 8 && /^\s*plan-doc part\b/.test(node.textContent ?? "")) return []
    if (isBlank(node)) return []
    if (!isElement(node)) return [{ kind: "flow", nodes: [node], elements: [] }]
    if (node.matches(`${Old.question}, ${Old.first}`)) {
      return [{ kind: "flow", nodes: takeChildren(node), elements: [] }]
    }
    if (node.matches(Old.choices)) return [this.card("choices", this.accordionChoices(node))]
    if (node.matches(Old.grid) && item.id.startsWith("q")) return [this.card("choices", this.gridChoices(node))]
    if (node.matches(Old.answer)) return [this.card("answer", this.answer(node))]
    if (node.matches(Old.more)) return [this.card("more", this.more(node))]
    if (node.matches(Old.reply)) return [this.card("reply", this.reply(node))]
    if (node.matches(Old.original)) return [this.card("original", this.original(node))]
    if (node.matches(Old.commits)) return [{ kind: "commits", nodes: [], elements: this.commits(node) }]
    if (node.matches(Old.updateMessage) && isScriptUpdate(node)) {
      const phase = Number(node.getAttribute("data-phase"))
      return [
        { kind: "flow", nodes: [this.owner.element("epic-update", { phase }, takeChildren(node), node)], elements: [] }
      ]
    }
    if (node.matches(Old.updateLabel) && /^\d+$/.test(node.getAttribute("data-phase") ?? "")) {
      const phase = Number(node.getAttribute("data-phase"))
      return [{ kind: "flow", nodes: [this.owner.element("epic-update", { phase }, [], node)], elements: [] }]
    }
    return [{ kind: "flow", nodes: [node], elements: [] }]
  }

  /** A card of one element. */
  private card(kind: CardKind, element: Element): Card {
    return { kind, nodes: [], elements: [element] }
  }

  ////////////////
  // ## Choices
  ////////////////

  /** `<epic-choices>` from an answered question's Choices accordion:  a title and a body per option. */
  private accordionChoices(choices: Element): Element {
    const options = choices.querySelector(`:scope > ui-content > ${Old.options}`)
    if (!options) throw this.owner.error("Choices without its options", choices)
    const sources: OptionSource[] = []
    for (const child of Array.from(options.children)) {
      if (child.localName === "ui-title")
        sources.push({ title: child, body: [], chosen: child.hasAttribute("data-chosen") })
      else if (child.localName === "ui-content" && sources.length) sources.at(-1)!.body = takeChildren(child)
      else throw this.owner.error("an option that isn't a title and its content", child)
    }
    return this.choices(sources, choices)
  }

  /** `<epic-choices>` from a question's option grid:  a column per option, its top label the title. */
  private gridChoices(grid: Element): Element {
    const sources = Array.from(grid.children, (column): OptionSource => {
      const segment = column.querySelector(":scope > ui-segment")
      const label = segment?.querySelector(":scope > ui-label:first-child")
      if (!segment || !label || column.children.length !== 1)
        throw this.owner.error("an option card of another shape", column)
      label.remove()
      return { title: label, body: takeChildren(segment), chosen: column.hasAttribute("data-chosen") }
    })
    return this.choices(sources, grid)
  }

  /**
   * `<epic-choices chosen>` of `<epic-option letter title recommended>`s.
   * - the letter from the title's `A · ` (or `A.`, `A:`);  a title without one gets its position's (`A`, `B` ...)
   * - ` (recommended)` at the title's end:  `recommended`;  a title with markup:  `slot="title"`
   */
  private choices(sources: OptionSource[], source: Element): Element {
    let chosen: string | undefined
    let lettered = 0
    const options = sources.map(({ title, body, chosen: isChosen }, index) => {
      const recommended = Chrome.recommended.test(title.lastChild?.nodeType === 3 ? title.lastChild.textContent! : "")
      const match = stripEdges(title, { first: Chrome.optionLetter, last: Chrome.recommended })
      const letter = match?.[1] ?? String.fromCharCode(65 + index)
      if (!match) lettered++
      if (isChosen) chosen = letter
      const { title: text, slot } = titleOf(title)
      const data = { letter, title: text, recommended: recommended || undefined }
      return this.owner.element("epic-option", data, slot ? [slot, ...body] : body, title)
    })
    const letters = options.map((option) => option.getAttribute("letter"))
    if (new Set(letters).size !== letters.length)
      throw this.owner.error(`options lettered ${letters.join(", ")}`, source)
    if (lettered) this.owner.note(`${lettered} option(s) without a letter, given their position's`)
    return this.owner.element("epic-choices", { chosen }, options, source)
  }

  ////////////////
  // ## Cards
  ////////////////

  /**
   * `<epic-answer id title>` from an answer card:  its title without `Answer` / `D7` (its own id) and the `·`.
   * - a title with markup can't be an attribute:  it's a `slot="title"` child instead, first, as an option's
   */
  private answer(block: Element): Element {
    const titleBox = block.querySelector(`:scope > ${Old.answerTitle}`)
    let title: { title?: string; slot?: Element } = {}
    if (titleBox) {
      titleBox.remove()
      const bold = titleBox.querySelector(":scope > b:first-child")
      const word = squeeze(bold?.textContent ?? "")
      if (bold && (word === "Answer" || (Chrome.answerWord.test(word) && word === block.id.toUpperCase())))
        bold.remove()
      stripEdges(titleBox, { first: Chrome.answerSeparator })
      title = titleOf(titleBox)
    }
    const data = { id: block.id || undefined, title: title.title }
    const body = takeChildren(block)
    return this.owner.element("epic-answer", data, title.slot ? [title.slot, ...body] : body, block)
  }

  /** `<epic-more>` from the More Details card:  its content. */
  private more(more: Element): Element {
    const content = more.querySelector(":scope > ui-content")
    return this.owner.element("epic-more", {}, content ? takeChildren(content) : [], more)
  }

  /** `<epic-reply from at re>` from a reply:  its title line into attributes, when it's in the usual shape. */
  private reply(reply: Element): Element {
    const titleBox = reply.querySelector(`:scope > ${Old.replyTitle}`)
    const parts = titleBox ? replyTitleParts(titleBox) : undefined
    const usable = parts && Formats.time.test(parts.at)
    if (usable) titleBox!.remove()
    else if (titleBox) this.owner.note("a reply's title line in another shape:  kept as its text")
    return this.owner.element("epic-reply", usable ? parts : {}, takeChildren(reply), reply)
  }

  /** `<epic-original>` from the Original Discussion:  an `<epic-version as-of>` per version, its heading dropped. */
  private original(original: Element): Element {
    const content = original.querySelector(":scope > ui-content")
    const versions: Element[] = []
    for (const child of content ? takeChildren(content) : []) {
      if (isBlank(child)) continue
      if (!isElement(child) || !child.matches(Old.version))
        throw this.owner.error("Original Discussion holds a non-version", original)
      const heading = child.querySelector(":scope > h5:first-child")
      if (heading && Chrome.versionHeading.test(squeeze(heading.textContent ?? ""))) heading.remove()
      const asOf = child.getAttribute("data-as-of") || undefined
      versions.push(this.owner.element("epic-version", { asOf }, takeChildren(child), child))
    }
    return this.owner.element("epic-original", {}, versions, original)
  }
}

/** What an item's details hold, by kind:  its text (`flow`), or a card. */
type CardKind = "flow" | "choices" | "answer" | "more" | "reply" | "original" | "commits"

/** One piece of an item's details:  text `nodes`, or a card's new `elements`. */
type Card = { kind: CardKind; nodes: Node[]; elements: Element[] }

/** An option card, read:  its title element (letter and all), its body, whether it's the chosen one. */
type OptionSource = { title: Element; body: Node[]; chosen: boolean }

/** The cards' order (`<epic-item>`'s content model). */
const CARD_ORDER: CardKind[] = ["choices", "answer", "more", "reply", "original", "commits"]

/** Cards an item has at most one of. */
const SINGLE_CARDS: CardKind[] = ["choices", "answer", "more", "original"]

/** Cards that take prose:  text after one joins it. */
const TAKES_PROSE = new Set<CardKind>(["answer", "more", "reply"])
