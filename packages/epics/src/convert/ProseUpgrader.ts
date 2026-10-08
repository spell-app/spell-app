import { Formats, type EpicData } from "$/epics/definitions"
import { PlanMarkup } from "$/epics/tool/PlanMarkup"

import { Chrome, Counted, Drawn, LABELLED_BLOCK, Prose, replyTitleParts } from "./convert.types"

import { ProseShapes } from "./ProseShapes"
import type { Upgrader } from "./Upgrader"

/****************
 * ### `ProseUpgrader`
 * The prose blocks of a converted doc, for `Upgrader`:  each in the shape its P14 element takes (`ProseShapes`)
 * becomes that element, wherever it sits (an item, a reply, an option card, an Overview sub-section, a phase field):
 * - `<p><b>Net effect (A):</b></p><ul>` => `<epic-net-effect option="A"><ul>`;  `<b>Net effect:</b> a sentence` =>
 *   `<epic-net-effect><p>a sentence</p>`
 * - `ui-accordion.spell-code` => `<epic-code title language [open]><pre>`;  `ui-accordion.spell-aside` =>
 *   `<epic-aside title>`
 * - a hand-written `ui-message.plan-update` => `<epic-note state title>`;  a phase's bare `UPDATE` (`data-phase`)
 *   => `<epic-update phase>`, as the tool's way in does (`ProseRewrite`, J74)
 * - `<p><b>Where:</b> ...` (`What should happen:`, `Step:`) => `<epic-field label="Where">`, once `<epic-field>` takes
 *   a `label` (p14-writers);  until then kept
 * - an option grid (`ui-grid.spell-pros-cons`, lettered cards) => `<epic-choices>` of `<epic-option>`s, on any item
 * - a hand-written `div.plan-answer-block` / `div.plan-reply` => `<epic-answer>` / `<epic-reply>`, where its parent
 *   takes that element
 * - a block in another shape stays prose, counted `kept: ...` (and noted, but for the labelled blocks)
 * - Works on its owner's document, IN PLACE:  the prose inside MOVES into the new elements, never re-made.
 ****************/
export class ProseUpgrader {
  /** The pass it works for:  STATIC for its life. */
  readonly owner: Upgrader

  constructor(owner: Upgrader) {
    this.owner = owner
  }

  /** Upgrade every block under `root`. */
  upgrade(root: Element): void {
    for (const grid of root.querySelectorAll(Prose.grid)) this.choices(grid)
    for (const accordion of root.querySelectorAll(Prose.code)) this.code(accordion)
    for (const accordion of root.querySelectorAll(Prose.aside)) this.aside(accordion)
    for (const message of root.querySelectorAll(Prose.note)) this.note(message)
    for (const card of root.querySelectorAll(`${Prose.answer}, ${Prose.reply}`)) this.card(card)
    for (const paragraph of root.querySelectorAll("p")) this.netEffect(paragraph)
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
          Counted.keptNetEffect,
          paragraph,
          `"${PlanMarkup.squeeze(paragraph.textContent ?? "").slice(0, 40)}"`
        )
      } else if (LABELLED_BLOCK.test(text) && !this.field(paragraph)) this.owner.count(Counted.keptLabel)
      return
    }
    const { form, label, list, option, recommended } = shape
    const made = this.owner.element("epic-net-effect", { option, recommended: recommended || undefined }, [], paragraph)
    paragraph.replaceWith(made)
    if (form === "list") {
      // the white space between the label and its list goes too:  else a blank line stays where the list was
      while (made.nextSibling !== list && PlanMarkup.isBlank(made.nextSibling)) made.nextSibling!.remove()
      made.append(list!)
      this.owner.count(option || recommended ? Counted.optionNetEffect : Counted.netEffect)
    } else {
      label.remove()
      PlanMarkup.stripEdges(paragraph, { first: /^\s+/ })
      made.append(paragraph)
      this.owner.count(Counted.inlineNetEffect)
    }
  }

  /** `<epic-code title language [open]>` holding ONE `<pre>` of the code's text. */
  private code(accordion: Element) {
    const shape = ProseShapes.code(accordion)
    if (!shape) return this.owner.keep(Counted.keptCode, accordion)
    const pre = this.owner.document.createElement("pre")
    pre.append(...Array.from(shape.text.childNodes))
    const { title, language, open } = shape
    accordion.replaceWith(
      this.owner.element("epic-code", { title, language, open: open || undefined }, [pre], accordion)
    )
    this.owner.count(Counted.code)
  }

  /** `<epic-aside title>` holding the aside's content. */
  private aside(accordion: Element) {
    const shape = ProseShapes.aside(accordion)
    if (!shape) return this.owner.keep(Counted.keptAside, accordion)
    const made = this.owner.element(
      "epic-aside",
      { title: shape.title },
      PlanMarkup.takeChildren(shape.body),
      accordion
    )
    accordion.replaceWith(made)
    this.owner.count(Counted.aside)
  }

  /** `<epic-note state title>` from a hand-written UPDATE / DONE note. */
  private note(message: Element) {
    const shape = ProseShapes.note(message)
    if (!shape) return this.owner.keep(Counted.keptNote, message, `"${message.getAttribute("header")}"`)
    const { state, title, phase } = shape
    const children = PlanMarkup.takeChildren(message)
    if (phase) {
      message.replaceWith(this.owner.element("epic-update", { phase }, children, message))
      return this.owner.count(Counted.update)
    }
    if (message.hasAttribute("data-phase")) {
      this.owner.note(
        `${this.owner.where(message)}:  a note's \`data-phase="${message.getAttribute("data-phase")}"\`, dropped (an <epic-note> stays)`
      )
    }
    message.replaceWith(this.owner.element("epic-note", { state, title }, children, message))
    this.owner.count(Counted.note)
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
    this.owner.count(Counted.field)
    return true
  }

  /**
   * `<epic-choices [chosen]>` from an option grid:  each card an `<epic-option letter title [recommended]>`, its
   * label's `A · ` and ` (recommended)` / ` (chosen)` into data, a label with markup a `slot="title"` child.
   */
  private choices(grid: Element) {
    const cards = ProseShapes.options(grid)
    if (!cards) return this.owner.keep(Counted.keptGrid, grid)
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
    this.owner.count(Counted.choices)
  }

  /** `<epic-answer>` / `<epic-reply>` from a hand-written card, where its parent takes that element. */
  private card(card: Element) {
    const tag = ProseShapes.handCard(card)
    if (!tag) return this.owner.keep(Counted.keptCard, card)
    const made = tag === "epic-answer" ? this.answer(card) : this.reply(card)
    card.replaceWith(made)
    this.owner.count(tag === "epic-answer" ? Counted.answer : Counted.reply)
  }

  /** `<epic-answer id title>` from `div.plan-answer-block`:  its title without `Answer` / `D7` and the `·`. */
  private answer(block: Element): Element {
    const titleBox = block.querySelector(`:scope > ${Prose.answerTitle}`)
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

  /** `<epic-reply from at re>` from `div.plan-reply`:  its title line into attributes, when it's in the usual shape. */
  private reply(reply: Element): Element {
    const titleBox = reply.querySelector(`:scope > ${Prose.replyTitle}`)
    const parts = titleBox ? replyTitleParts(titleBox) : undefined
    const usable = parts && Formats.time.test(parts.at)
    if (usable) titleBox!.remove()
    else if (titleBox)
      this.owner.note(`${this.owner.where(reply)}:  a reply's title line in another shape:  kept as its text`)
    return this.owner.element("epic-reply", usable ? parts : {}, PlanMarkup.takeChildren(reply), reply)
  }
}
