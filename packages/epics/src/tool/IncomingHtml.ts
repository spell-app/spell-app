import { Formats } from "$/epics/definitions"
import { Markup } from "$/epics/markup"

import { Chrome, replyTitleParts } from "./planDoc.types"

import { PlanMarkup } from "./PlanMarkup"

/****************
 * ### `IncomingHtml`
 * HTML a command was handed (`add --details`, `decide --details`, `details --file`), as nodes for an `<epic-item>`:
 * written in `<epic-*>` markup it goes in as it is;  the two shapes agents wrote for the OLD markup become elements on
 * the way in, by the converter's own rules (`Chrome`, `replyTitleParts()`, `PlanMarkup`'s DOM edits:  shared, never
 * imported from `$/epics/convert`), so a doc never holds them:
 * - an option grid (`ui-grid.spell-pros-cons`, each card's top label `A · Title (recommended)`) -> `<epic-choices>` of
 *   `<epic-option letter title recommended>`, `chosen` from a card's `data-chosen`
 * - a reply (`div.plan-reply`, its title line `<b>Claude</b> · <time>...</time> · re:  "..."`) -> `<epic-reply from
 *   at re>`
 * - anything else:  prose, as it is (a pros / cons grid without letters stays a grid)
 * - REFACTOR: drop once the skills and `templates/epics/plan-doc.md` teach the `<epic-*>` shapes (after the switch,
 *   P12):  then `PlanDoc` takes its HTML as it comes.
 * - STATIC and instance-free:  a pure rewrite of a snippet into the document it's for.
 ****************/
export class IncomingHtml {
  /**
   * `html`, parsed into `document`'s nodes (out of it), old shapes made elements;  blank text at the ends dropped.
   * - `cards`:  false for text that holds no cards (an answer, More Details):  only replies are turned
   */
  static nodes(document: Document, html: string, { cards = true }: { cards?: boolean } = {}): Node[] {
    const box = document.createElement("div")
    box.innerHTML = html
    for (const child of Array.from(box.children)) {
      if (child.matches("div.plan-reply")) child.replaceWith(IncomingHtml.reply(child))
      else if (cards && child.matches("ui-grid.spell-pros-cons") && IncomingHtml.isOptionGrid(child))
        child.replaceWith(IncomingHtml.choices(child))
    }
    PlanMarkup.trimWhitespace(box)
    return Array.from(box.childNodes)
  }

  /** Is `grid` a question's option cards:  every card one segment, its top label lettered (`A · ...`)? */
  static isOptionGrid(grid: Element): boolean {
    const columns = Array.from(grid.children)
    return (
      columns.length > 0 &&
      columns.every((column) => {
        const segment = column.querySelector(":scope > ui-segment")
        const label = segment?.querySelector(":scope > ui-label:first-child")
        return column.children.length === 1 && Chrome.optionLetter.test(label?.textContent ?? "")
      })
    )
  }

  /** `<epic-choices>` from option grid `grid` (`isOptionGrid()`):  a card's label its title, its segment its body. */
  private static choices(grid: Element): Element {
    const document = grid.ownerDocument
    let chosen: string | undefined
    const options = Array.from(grid.children, (column) => {
      const segment = column.querySelector(":scope > ui-segment")!
      const label = segment.querySelector(":scope > ui-label:first-child")!
      label.remove()
      const recommended = Chrome.recommended.test(label.lastChild?.nodeType === 3 ? label.lastChild.textContent! : "")
      const letter = PlanMarkup.stripEdges(label, { first: Chrome.optionLetter, last: Chrome.recommended })![1]!
      if (column.hasAttribute("data-chosen")) chosen = letter
      const { title, slot } = PlanMarkup.titleOf(label)
      const body = PlanMarkup.takeChildren(segment)
      return Markup.element(
        document,
        "epic-option",
        { letter, title, recommended: recommended || undefined },
        slot ? [slot, ...body] : body
      )
    })
    return Markup.element(document, "epic-choices", { chosen }, options)
  }

  /** `<epic-reply from at re>` from `div.plan-reply`:  its title line into attributes, when it's in the usual shape. */
  private static reply(reply: Element): Element {
    const titleBox = reply.querySelector(":scope > div.plan-reply-title")
    const parts = titleBox ? replyTitleParts(titleBox) : undefined
    const usable = parts && Formats.time.test(parts.at)
    if (usable) titleBox!.remove()
    return Markup.element(reply.ownerDocument, "epic-reply", usable ? parts : {}, PlanMarkup.takeChildren(reply))
  }
}
