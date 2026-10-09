import { Formats, type EpicData, type EpicTag } from "$/epics/definitions"
import { Markup, type MarkupContent } from "$/epics/markup"

import { Chrome, Drawn, LABELLED_BLOCK, ProseBlocks, ProseCounted, replyTitleParts } from "./planDoc.types"

import { PlanMarkup } from "./PlanMarkup"
import { ProseShapes } from "./ProseShapes"

/****************
 * ### `ProseRewrite`
 * The hand-written prose blocks of the old docs (and of agents taught by them), each in the shape its P14 element
 * takes (`ProseShapes`, the ONE set of rules), made that element, IN PLACE, wherever it sits (an item, a reply, an
 * option card, an Overview sub-section, a phase field):
 * - `<p><b>Net effect (A):</b></p><ul>` => `<epic-net-effect option="A"><ul>`;  `<b>Net effect:</b> a sentence` =>
 *   `<epic-net-effect><p>a sentence</p>`
 * - `ui-accordion.spell-code` => `<epic-code title language [open]><pre>`;  `ui-accordion.spell-aside` =>
 *   `<epic-aside title>`
 * - a hand-written `ui-message.plan-update` => `<epic-note state title>`;  a phase's bare `UPDATE` (`data-phase`)
 *   => `<epic-update phase>`, the phase's marker, which `phase 2 done` removes (J74)
 * - `<p><b>Where:</b> ...` (`What should happen:`, `Step:`) => `<epic-field label="Where">`, once `<epic-field>` takes
 *   a `label` (p14-writers);  until then kept
 * - an option grid (`ui-grid.spell-pros-cons`, lettered cards) => `<epic-choices>` of `<epic-option>`s
 * - a hand-written `div.plan-answer-block` / `div.plan-reply` => `<epic-answer>` / `<epic-reply>`, where its parent
 *   takes that element
 * - a block in another shape stays prose, as it is, and its owner is told (`keep()`)
 * - Two owners:  the plan-doc tool's way in (`IncomingHtml`, through `plain()`:  the elements made through `Markup`,
 *   nothing counted) and the converter's second pass (`$/epics/convert` `Upgrader`, which counts and notes each).
 *   One class, so both turn every shape the same way (epic `epic-components` T23).
 * - Works on its owner's document:  the prose inside MOVES into the new elements, never re-made.
 ****************/
export class ProseRewrite {
  /** Who it works for:  makes the elements, hears what was done.  STATIC for its life. */
  readonly owner: ProseOwner

  constructor(owner: ProseOwner) {
    this.owner = owner
  }

  /** A rewrite of `document`'s blocks that makes the elements through `Markup` and keeps no record:  the tool's. */
  static plain(document: Document): ProseRewrite {
    return new ProseRewrite({
      document,
      element: (tag, data, children) => Markup.element(document, tag, data, children),
      count: () => undefined,
      keep: () => undefined,
      note: () => undefined,
      where: () => ""
    })
  }

  /**
   * Rewrite every block under `root` (not `root` itself).
   * - never inside code (`<pre>`, `<code>`, `<epic-code>`)
   * - `history`:  inside an Original Discussion (`<epic-original>`) too;  default `true`, as the converter upgrades a
   *   doc whole.  The tool's way in passes `false`:  history stays as it was written.
   */
  rewrite(root: Element, { history = true }: { history?: boolean } = {}): void {
    const skip = history ? KEEP_INSIDE : `${KEEP_INSIDE}, ${HISTORY}`
    const blocks = (selector: string) =>
      Array.from(root.querySelectorAll(selector)).filter((block) => {
        const keeper = block.parentElement?.closest(skip)
        return !keeper || !root.contains(keeper)
      })
    for (const grid of blocks(ProseBlocks.grid)) this.choices(grid)
    for (const accordion of blocks(ProseBlocks.code)) this.code(accordion)
    for (const accordion of blocks(ProseBlocks.aside)) this.aside(accordion)
    for (const message of blocks(ProseBlocks.note)) this.note(message)
    for (const card of blocks(`${ProseBlocks.answer}, ${ProseBlocks.reply}`)) this.card(card)
    for (const paragraph of blocks("p")) this.netEffect(paragraph)
  }

  /**
   * `<epic-reply from at re>` from `div.plan-reply`:  its title line into attributes, when it's in the usual shape;
   * not put in its place.
   * - public for the tool's way in, which takes a reply at the top of what it's handed wherever it goes
   */
  reply(reply: Element): Element {
    const titleBox = reply.querySelector(`:scope > ${ProseBlocks.replyTitle}`)
    const parts = titleBox ? replyTitleParts(titleBox) : undefined
    const usable = parts && Formats.time.test(parts.at)
    if (usable) titleBox!.remove()
    else if (titleBox)
      this.owner.note(`${this.owner.where(reply)}:  a reply's title line in another shape:  kept as its text`)
    return this.owner.element("epic-reply", usable ? parts : {}, PlanMarkup.takeChildren(reply), reply)
  }

  ////////////////
  // ## The blocks
  ////////////////

  /** `<epic-net-effect [option] [recommended]>` from a Net effect paragraph, and its list. */
  private netEffect(paragraph: Element) {
    const shape = ProseShapes.netEffect(paragraph)
    if (!shape) {
      const lead = ProseShapes.boldLead(paragraph)
      const text = PlanMarkup.squeeze(lead?.textContent ?? "")
      if (ProseShapes.netEffectLead(paragraph)) {
        this.owner.keep(
          ProseCounted.keptNetEffect,
          paragraph,
          `"${PlanMarkup.squeeze(paragraph.textContent ?? "").slice(0, 40)}"`
        )
      } else if (LABELLED_BLOCK.test(text) && !this.field(paragraph)) this.owner.count(ProseCounted.keptLabel)
      return
    }
    const { form, label, list, option, recommended } = shape
    const made = this.owner.element("epic-net-effect", { option, recommended: recommended || undefined }, [], paragraph)
    paragraph.replaceWith(made)
    if (form === "list") {
      // the white space between the label and its list goes too:  else a blank line stays where the list was
      while (made.nextSibling !== list && PlanMarkup.isBlank(made.nextSibling)) made.nextSibling!.remove()
      made.append(list!)
      this.owner.count(option || recommended ? ProseCounted.optionNetEffect : ProseCounted.netEffect)
    } else {
      label.remove()
      PlanMarkup.stripEdges(paragraph, { first: /^\s+/ })
      made.append(paragraph)
      this.owner.count(ProseCounted.inlineNetEffect)
    }
  }

  /** `<epic-code title language [open]>` holding ONE `<pre>` of the code's text. */
  private code(accordion: Element) {
    const shape = ProseShapes.code(accordion)
    if (!shape) return this.owner.keep(ProseCounted.keptCode, accordion)
    const pre = this.owner.document.createElement("pre")
    pre.append(...Array.from(shape.text.childNodes))
    const { title, language, open } = shape
    accordion.replaceWith(
      this.owner.element("epic-code", { title, language, open: open || undefined }, [pre], accordion)
    )
    this.owner.count(ProseCounted.code)
  }

  /** `<epic-aside title>` holding the aside's content. */
  private aside(accordion: Element) {
    const shape = ProseShapes.aside(accordion)
    if (!shape) return this.owner.keep(ProseCounted.keptAside, accordion)
    const made = this.owner.element(
      "epic-aside",
      { title: shape.title },
      PlanMarkup.takeChildren(shape.body),
      accordion
    )
    accordion.replaceWith(made)
    this.owner.count(ProseCounted.aside)
  }

  /** `<epic-note state title>` from a hand-written UPDATE / DONE note;  a phase's bare UPDATE:  `<epic-update>`. */
  private note(message: Element) {
    const shape = ProseShapes.note(message)
    if (!shape) return this.owner.keep(ProseCounted.keptNote, message, `"${message.getAttribute("header")}"`)
    const { state, title, phase } = shape
    const children = PlanMarkup.takeChildren(message)
    if (phase) {
      message.replaceWith(this.owner.element("epic-update", { phase }, children, message))
      return this.owner.count(ProseCounted.update)
    }
    if (message.hasAttribute("data-phase")) {
      this.owner.note(
        `${this.owner.where(message)}:  a note's \`data-phase="${message.getAttribute("data-phase")}"\`, dropped (an <epic-note> stays)`
      )
    }
    message.replaceWith(this.owner.element("epic-note", { state, title }, children, message))
    this.owner.count(ProseCounted.note)
  }

  /**
   * `<epic-field label>` from a labelled block (`<b>Where:</b> ...`):  the sentence after the label, or the block
   * after a label alone.
   */
  private field(paragraph: Element) {
    const shape = ProseShapes.labelledBlock(paragraph)
    if (!shape) return false
    const { form, label, name, block } = shape
    // `label` is p14-writers' attribute:  this runs only once the definitions have it (`labelledBlock()`)
    const data = { label: name } as unknown as EpicData<"epic-field">
    const made = this.owner.element("epic-field", data, [], paragraph)
    paragraph.replaceWith(made)
    if (form === "block") {
      while (made.nextSibling !== block && PlanMarkup.isBlank(made.nextSibling)) made.nextSibling!.remove()
      made.append(block!)
    } else {
      label.remove()
      PlanMarkup.stripEdges(paragraph, { first: /^\s+/ })
      made.append(paragraph)
    }
    this.owner.count(ProseCounted.field)
    return true
  }

  /**
   * `<epic-choices [chosen]>` from an option grid:  each card an `<epic-option letter title [recommended]>`, its
   * label's `A · ` and ` (recommended)` / ` (chosen)` into data, a label with markup a `slot="title"` child.
   */
  private choices(grid: Element) {
    const cards = ProseShapes.options(grid)
    if (!cards) return this.owner.keep(ProseCounted.keptGrid, grid)
    let chosen: string | undefined
    const options = cards.map(({ segment, label, letter, recommended, chosen: isChosen }) => {
      label.remove()
      PlanMarkup.stripEdges(label, { first: Chrome.optionLetter, last: Drawn.optionSuffix })
      if (isChosen) chosen = letter
      const { title, slot } = PlanMarkup.titleOf(label)
      const body = PlanMarkup.takeChildren(segment)
      const data = { letter, title, recommended: recommended || undefined }
      return this.owner.element("epic-option", data, slot ? [slot, ...body] : body, label)
    })
    grid.replaceWith(this.owner.element("epic-choices", { chosen }, options, grid))
    this.owner.count(ProseCounted.choices)
  }

  /** `<epic-answer>` / `<epic-reply>` from a hand-written card, where its parent takes that element. */
  private card(card: Element) {
    const tag = ProseShapes.handCard(card)
    if (!tag) return this.owner.keep(ProseCounted.keptCard, card)
    const made = tag === "epic-answer" ? this.answer(card) : this.reply(card)
    card.replaceWith(made)
    this.owner.count(tag === "epic-answer" ? ProseCounted.answer : ProseCounted.reply)
  }

  /** `<epic-answer id title>` from `div.plan-answer-block`:  its title without `Answer` / `D7` and the `·`. */
  private answer(block: Element): Element {
    const titleBox = block.querySelector(`:scope > ${ProseBlocks.answerTitle}`)
    let title: { title?: string; slot?: Element } = {}
    if (titleBox) {
      titleBox.remove()
      const bold = titleBox.firstElementChild
      const word = PlanMarkup.squeeze(bold?.textContent ?? "")
      if (
        bold?.localName === "b" &&
        (word === "Answer" || (Chrome.answerWord.test(word) && word === block.id.toUpperCase()))
      )
        bold.remove()
      PlanMarkup.stripEdges(titleBox, { first: Chrome.answerSeparator })
      title = PlanMarkup.titleOf(titleBox)
    }
    const body = PlanMarkup.takeChildren(block)
    const data = { id: block.id || undefined, title: title.title }
    return this.owner.element("epic-answer", data, title.slot ? [title.slot, ...body] : body, block)
  }
}

/**
 * What `ProseRewrite` works for:  the document, how to make an element, and what to tell of each block.
 * - the converter's `Upgrader` is one as it is;  the tool's way in:  `ProseRewrite.plain()`
 */
export type ProseOwner = {
  /** The document the blocks are in. */
  readonly document: Document
  /** A new `<tag>` from `data` and `children`;  `source`, the block it's made from (for an error). */
  element<T extends EpicTag>(tag: T, data: EpicData<T>, children: MarkupContent, source?: Element): Element
  /** One more of `ProseCounted`'s. */
  count(key: string): void
  /** `element` left as prose, for `key`'s reason (a `kept: ...` of `ProseCounted`);  `what`:  it, in a few words. */
  keep(key: string, element: Element, what?: string): void
  /** Something a reader should know (text kept, an attribute dropped). */
  note(message: string): void
  /** Where `element` is, for a note:  `#q7`. */
  where(element: Element): string
}

/** Where blocks stay as they are:  code. */
const KEEP_INSIDE = "pre, code, epic-code"

/** An Original Discussion:  history, left as it was written by the tool's way in. */
const HISTORY = "epic-original"
