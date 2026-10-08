import { Formats } from "$/epics/definitions"
import { Markup, ProseRewrite } from "$/epics/markup"

import { Chrome, replyTitleParts } from "./planDoc.types"

import { PlanMarkup } from "./PlanMarkup"

/****************
 * ### `IncomingHtml`
 * HTML a command was handed (`add --details`, `decide --details`, `details --file`, `updated`), as nodes for the
 * doc:  written in `<epic-*>` markup it goes in as it is;  the shapes agents wrote for the OLD markup become elements
 * on the way in, so a doc never holds them:
 * - an option grid (`ui-grid.spell-pros-cons`, each card's top label `A · Title (recommended)`), wherever it sits (an
 *   item's text, a reply, a list) -> `<epic-choices>` of `<epic-option letter title recommended>`, `chosen` from a
 *   card's `data-chosen`;  by the converter's own rules (`Chrome`, `PlanMarkup`'s DOM edits:  shared, never imported
 *   from `$/epics/convert`)
 * - a reply (`div.plan-reply`, its title line `<b>Claude</b> · <time>...</time> · re:  "..."`), at the top -> `<epic-reply
 *   from at re>`
 * - the prose shapes (P14:  `ProseRewrite`):  a `Net effect` paragraph and its list -> `<epic-net-effect>`,
 *   `ui-accordion.spell-code` -> `<epic-code>`, `ui-accordion.spell-aside` -> `<epic-aside>`,
 *   `ui-message.plan-update` -> `<epic-note>`
 * - anything else:  prose, as it is (a pros / cons grid without letters stays a grid)
 * - never inside code (`<pre>`, `<code>`, `<epic-code>`) or an Original Discussion:  history stays as it was
 * - STATIC and instance-free:  a pure rewrite of a snippet into the document it's for.
 ****************/
export class IncomingHtml {
  /** `html`, parsed into `document`'s nodes (out of it), old shapes made elements;  blank text at the ends dropped. */
  static nodes(document: Document, html: string): Node[] {
    const box = document.createElement("div")
    box.innerHTML = html
    for (const child of Array.from(box.children)) {
      if (child.matches("div.plan-reply")) child.replaceWith(IncomingHtml.reply(child))
    }
    for (const grid of Array.from(box.querySelectorAll("ui-grid.spell-pros-cons"))) {
      if (!grid.parentElement?.closest(KEEP_INSIDE) && IncomingHtml.isOptionGrid(grid))
        grid.replaceWith(IncomingHtml.choices(grid))
    }
    ProseRewrite.rewrite(box)
    PlanMarkup.trimWhitespace(box)
    return Array.from(box.childNodes)
  }

  /**
   * `nodes` (a question's text, as `nodes()` made them) with their LEAD -- the question as asked -- in an
   * `<epic-question>`, so the page labels it `Question` and the tool finds it by its tag (P14).
   * - the lead:  the prose up to the first `<epic-*>` element (Net effect, Choices, code ...) or bold label line
   *   (`<p><b>The options:</b></p>`);  none (the text starts with one), or an `<epic-question>` already there:
   *   `nodes` as they are
   */
  static asQuestion(document: Document, nodes: Node[]): Node[] {
    if (nodes.some((node) => PlanMarkup.isElement(node) && node.localName === QUESTION_TAG)) return nodes
    const end = nodes.findIndex((node) => PlanMarkup.isElement(node) && endsLead(node))
    const lead = end < 0 ? nodes : nodes.slice(0, end)
    if (!lead.some((node) => PlanMarkup.isSignificant(node))) return nodes
    const question = Markup.element(document, QUESTION_TAG, {}, lead)
    PlanMarkup.trimWhitespace(question)
    return [question, ...(end < 0 ? [] : nodes.slice(end))]
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

/** Where old shapes stay as they are:  code, and an Original Discussion's history. */
const KEEP_INSIDE = "pre, code, epic-code, epic-original"

/** A question's text as first asked. */
const QUESTION_TAG = "epic-question"

/** A line that's only a bold label:  `<p><b>The options:</b></p>`. */
const LABEL_LINE = /^[^:]{1,60}:$/

/** Does `element` end a question's lead:  an `<epic-*>` element, or a bold label line? */
function endsLead(element: Element): boolean {
  if (element.localName.startsWith("epic-")) return true
  const lead = element.firstElementChild
  return (
    element.localName === "p" &&
    element.childElementCount === 1 &&
    !!lead &&
    ["b", "strong"].includes(lead.localName) &&
    LABEL_LINE.test(PlanMarkup.squeeze(element.textContent ?? ""))
  )
}
