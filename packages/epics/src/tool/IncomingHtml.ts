import { Markup } from "$/epics/markup"

import { ProseBlocks } from "./planDoc.types"

import { PathTooltips } from "./PathTooltips"
import { PlanMarkup } from "./PlanMarkup"
import { ProseRewrite } from "./ProseRewrite"

/****************
 * ### `IncomingHtml`
 * HTML a command was handed (`add --details`, `decide --details`, `details --file`, `updated`), as nodes for the
 * doc:  written in `<epic-*>` markup it goes in as it is;  the shapes agents wrote for the OLD markup become elements
 * on the way in, so a doc never holds them:
 * - a reply (`div.plan-reply`, its title line `<b>Claude</b> · <time>...</time> · re:  "..."`), at the top ->
 *   `<epic-reply from at re>`
 * - the prose shapes, by the converter's own rules (`ProseRewrite`, on `ProseShapes`):  an option grid
 *   (`ui-grid.spell-pros-cons`, lettered cards) -> `<epic-choices>`;  a `Net effect` paragraph and its list ->
 *   `<epic-net-effect>`;  `ui-accordion.spell-code` -> `<epic-code>`;  `ui-accordion.spell-aside` -> `<epic-aside>`;
 *   `ui-message.plan-update` -> `<epic-note>`;  a labelled block (`<b>Where:</b>`) -> `<epic-field label>`
 * - a name and its file's path (`<code>buildTsx()</code>, <code>packages/.../buildTsx.ts</code>`) -> the name with
 *   its path as its tooltip, `<code title="path">name</code>` (`PathTooltips`, which says exactly which forms)
 * - anything else:  prose, as it is (a pros / cons grid without letters stays a grid, a `<ui-code>` in a code
 *   accordion stays one)
 * - never inside code (`<pre>`, `<code>`, `<epic-code>`) or an Original Discussion:  history stays as it was
 * - STATIC and instance-free:  a pure rewrite of a snippet into the document it's for.
 ****************/
export class IncomingHtml {
  /** `html`, parsed into `document`'s nodes (out of it), old shapes made elements;  blank text at the ends dropped. */
  static nodes(document: Document, html: string): Node[] {
    const box = document.createElement("div")
    box.innerHTML = html
    const rewrite = ProseRewrite.plain(document)
    for (const child of Array.from(box.children)) {
      if (child.matches(ProseBlocks.reply)) child.replaceWith(rewrite.reply(child))
    }
    rewrite.rewrite(box, { history: false })
    PathTooltips.rewrite(box)
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
}

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
