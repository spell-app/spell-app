import { ELEMENT_NODE, TEXT_NODE } from "./markup.types"
import { Markup } from "./Markup"

/****************
 * ### `ProseRewrite`
 * The hand-shaped prose blocks older plan docs (and agents taught by them) wrote, turned into the elements that
 * draw them now (epic `epic-components` P14):
 * - `<p><b>Net effect (A, recommended):</b></p><ul>...</ul>` -> `<epic-net-effect option="A" recommended><ul>`
 *   (also `<b>Net effect</b> (A):`, and a sentence after the label instead of a list)
 * - `ui-accordion.spell-code` (its `<pre><code class="language-ts">`, or `<ui-code language>` around a
 *   `<script type="text/plain">`) -> `<epic-code title language [open]><pre>the code</pre></epic-code>`
 * - `ui-accordion.spell-aside` (`Aside:  <title>`) -> `<epic-aside title>`
 * - `ui-message.plan-update` (`UPDATE`, `DONE · <title>`) -> `<epic-note state title>`;  a phase's bare `UPDATE`
 *   (`data-phase="2"`) -> `<epic-update phase="2">`, the marker `phase 2 done` removes
 * - a shape it can't read for sure stays prose, as it is:  a Net effect worded otherwise (`(once fixed)`), a code
 *   accordion holding two blocks, a note headed `DEFERRED`
 * - Shared by the plan-doc tool's way in (`IncomingHtml`) and anything else turning old prose into the elements;
 *   the option grid (`ui-grid.spell-pros-cons`) is `IncomingHtml`'s, since it reads the tool's card rules.
 * - REFACTOR: the second conversion pass reads the same shapes by rules of its own (`$/epics/convert`, P14):  one
 *   rule for both once both are merged (it maps a phase's bare UPDATE to `<epic-note>`;  this, to `<epic-update>`).
 * - STATIC, plain DOM (linkedom or the browser's), no globals.
 ****************/
export class ProseRewrite {
  /**
   * Turn every old shape inside `root` (not `root` itself) into its element, in place;  returns how many.
   * - never inside code (`<pre>`, `<code>`, `<epic-code>`) or an Original Discussion (history, as it was)
   */
  static rewrite(root: Element): number {
    let count = 0
    for (const element of Array.from(root.querySelectorAll(SHAPES))) {
      // gone with an earlier shape (a list a Net effect took stays in `root`), or inside code or history
      if (!root.contains(element) || element.parentElement?.closest(KEEP_INSIDE)) continue
      if (ProseRewrite.elementFor(element)) count++
    }
    return count
  }

  /** The element old shape `element` becomes, put in its place;  `undefined` (left as it is) when it can't be read. */
  static elementFor(element: Element): Element | undefined {
    if (element.matches(NET_EFFECT_PARAGRAPH)) return ProseRewrite.netEffect(element)
    if (element.matches(CODE_ACCORDION)) return ProseRewrite.code(element)
    if (element.matches(ASIDE_ACCORDION)) return ProseRewrite.aside(element)
    if (element.matches(UPDATE_MESSAGE)) return ProseRewrite.note(element)
    return undefined
  }

  ////////////////
  // ## The shapes
  ////////////////

  /**
   * `<epic-net-effect>` from a `<p>` led by a bold `Net effect`:  the list after it (a `<ul>` / `<ol>`) moves in;  a
   * sentence after the label instead becomes its `<p>`.  `undefined` for any other wording, or no content.
   */
  static netEffect(paragraph: Element): Element | undefined {
    const lead = paragraph.firstElementChild
    if (!lead || !BOLD.includes(lead.localName) || !NET_EFFECT_WORD.test(lead.textContent ?? "")) return undefined
    if (leadingText(paragraph).trim()) return undefined
    const label = NET_EFFECT_LABEL.exec(paragraph.textContent ?? "")
    if (!label) return undefined
    const [whole, letter1, recommended1, letter2, recommended2] = label
    const rest = (paragraph.textContent ?? "").slice(whole.length).trim()
    if (rest.startsWith("(")) return undefined
    // the label alone:  the list after it;  a sentence after the label:  the paragraph, label dropped
    const list = rest ? undefined : nextElement(paragraph)
    if (!rest && (!list || !LISTS.includes(list.localName))) return undefined
    if (!dropLeadingText(paragraph, whole.length)) return undefined
    const data = { option: letter1 ?? letter2, recommended: Boolean(recommended1 ?? recommended2) || undefined }
    const made = Markup.element(paragraph.ownerDocument, "epic-net-effect", data)
    paragraph.before(made)
    if (list) {
      made.append(list)
      paragraph.remove()
    } else {
      made.append(paragraph)
      trimEnds(paragraph)
    }
    return made
  }

  /**
   * `<epic-code>` from a `ui-accordion.spell-code`:  its title, the code's language (`language-ts` on the
   * `<code>`, or `<ui-code language>`), `open` when the accordion was (`open="0"`), the code as a `<pre>`'s text.
   * `undefined` when its content isn't ONE code block.
   */
  static code(accordion: Element): Element | undefined {
    const content = accordion.querySelector(":scope > ui-content")
    const blocks = content ? Array.from(content.children) : []
    if (blocks.length !== 1 || hasLooseText(content!)) return undefined
    const block = blocks[0]!
    let code: string
    let language: string | undefined
    if (block.localName === "pre") {
      const inner = block.querySelector(":scope > code")
      code = (block.textContent ?? "").replace(/\n$/, "")
      language = LANGUAGE_CLASS.exec(`${inner?.className ?? ""} ${block.className}`)?.[1]
    } else if (block.localName === "ui-code") {
      code = dedent(block.querySelector(":scope > script")?.textContent ?? block.textContent ?? "")
      language = block.getAttribute("language") ?? undefined
    } else return undefined
    const document = accordion.ownerDocument
    const pre = document.createElement("pre")
    pre.textContent = code
    const made = Markup.element(
      document,
      "epic-code",
      { title: titleOf(accordion), language, open: accordion.hasAttribute("open") || undefined },
      [pre]
    )
    accordion.replaceWith(made)
    return made
  }

  /** `<epic-aside title>` from a `ui-accordion.spell-aside` titled `Aside:  ...`;  `undefined` for any other title. */
  static aside(accordion: Element): Element | undefined {
    const heading = ASIDE_TITLE.exec(titleOf(accordion) ?? "")
    const content = accordion.querySelector(":scope > ui-content")
    if (!heading || !content) return undefined
    const made = Markup.element(accordion.ownerDocument, "epic-aside", { title: heading[1] || undefined })
    made.append(...Array.from(content.childNodes))
    trimEnds(made)
    accordion.replaceWith(made)
    return made
  }

  /**
   * `<epic-note state title>` from a `ui-message.plan-update`:  its header `UPDATE` / `DONE`, then ` · <title>`;
   * `undefined` for another word (`DEFERRED`).
   * - a bare `UPDATE` of a phase (`data-phase="2"`):  `<epic-update phase="2">`, the phase's marker, which `phase 2
   *   done` removes, as it removed the message
   */
  static note(message: Element): Element | undefined {
    const header = NOTE_HEADER.exec(message.getAttribute("header") ?? "")
    if (!header) return undefined
    const state = header[1]!.toUpperCase() === "DONE" ? "done" : "update"
    const title = header[2]?.trim() || undefined
    const phase = Number(message.getAttribute("data-phase"))
    const made =
      state === "update" && !title && Number.isInteger(phase) && phase > 0
        ? Markup.element(message.ownerDocument, "epic-update", { phase })
        : Markup.element(message.ownerDocument, "epic-note", { state, title })
    made.append(...Array.from(message.childNodes))
    trimEnds(made)
    message.replaceWith(made)
    return made
  }
}

/** Every old shape `rewrite()` looks for. */
const NET_EFFECT_PARAGRAPH = "p"
const CODE_ACCORDION = "ui-accordion.spell-code"
const ASIDE_ACCORDION = "ui-accordion.spell-aside:not(.plan-choices)"
const UPDATE_MESSAGE = "ui-message.plan-update"
const SHAPES = [NET_EFFECT_PARAGRAPH, CODE_ACCORDION, ASIDE_ACCORDION, UPDATE_MESSAGE].join(", ")

/** Where old shapes stay as they are:  code, and an Original Discussion's history. */
const KEEP_INSIDE = "pre, code, epic-code, epic-original"

/** A bold lead's tags. */
const BOLD = ["b", "strong"]

/** A Net effect's bold word. */
const NET_EFFECT_WORD = /^\s*Net effect\b/i

/**
 * A Net effect's label, the option in or after the bold:  `Net effect:`, `Net effect (A, recommended):`,
 * `Net effect (A):`, `Net effect:  (A)`.  Groups:  letter and `recommended`, before the colon or after it.
 */
const NET_EFFECT_LABEL =
  /^\s*Net effect\s*(?:\(\s*([A-Z])\s*(,\s*recommended)?\s*\))?\s*:?\s*(?:\(\s*([A-Z])\s*(,\s*recommended)?\s*\)\s*:?)?\s*/

/** The list kinds a Net effect holds. */
const LISTS = ["ul", "ol"]

/** A code block's language class:  `language-ts`. */
const LANGUAGE_CLASS = /(?:^|\s)language-([\w+-]+)/

/** An aside's title:  `Aside:  <what>` (`Aside` alone:  no title). */
const ASIDE_TITLE = /^Aside\s*:?\s*(.*)$/i

/** A note's header:  `UPDATE` or `DONE`, then ` · <title>`. */
const NOTE_HEADER = /^\s*(UPDATE|DONE)\s*(?:·\s*(.*))?$/i

/** `accordion`'s `<ui-title>` text, whitespace squeezed;  `undefined` without one. */
function titleOf(accordion: Element): string | undefined {
  const text = accordion.querySelector(":scope > ui-title")?.textContent
  return text ? text.replace(/\s+/g, " ").trim() || undefined : undefined
}

/** The text before `element`'s first child element. */
function leadingText(element: Element): string {
  let text = ""
  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === ELEMENT_NODE) break
    text += node.textContent ?? ""
  }
  return text
}

/**
 * Drop the first `count` characters of `element`'s text:  whole nodes, and the start of the text node it ends in.
 * Returns false (changing nothing) when it would cut into an element.
 */
function dropLeadingText(element: Element, count: number): boolean {
  let left = count
  const gone: ChildNode[] = []
  let cut: { node: Text; at: number } | undefined
  for (const node of Array.from(element.childNodes)) {
    if (left <= 0) break
    const length = (node.textContent ?? "").length
    if (length <= left) {
      gone.push(node)
      left -= length
    } else if (node.nodeType === TEXT_NODE) {
      cut = { node: node as Text, at: left }
      left = 0
    } else return false
  }
  for (const node of gone) node.remove()
  if (cut) cut.node.textContent = (cut.node.textContent ?? "").slice(cut.at)
  return true
}

/** The element after `element`, past blank text;  `null` when something else comes first. */
function nextElement(element: Element): Element | null {
  let node = element.nextSibling
  while (node && node.nodeType === TEXT_NODE && !/\S/.test(node.textContent ?? "")) node = node.nextSibling
  return node?.nodeType === ELEMENT_NODE ? (node as Element) : null
}

/** Does `element` hold text of its own, outside its child elements? */
function hasLooseText(element: Element): boolean {
  return Array.from(element.childNodes).some((node) => node.nodeType === TEXT_NODE && /\S/.test(node.textContent ?? ""))
}

/** Blank text at `element`'s ends dropped, and the edges of the text left there trimmed. */
function trimEnds(element: Element) {
  while (element.firstChild?.nodeType === TEXT_NODE && !/\S/.test(element.firstChild.textContent ?? ""))
    element.firstChild.remove()
  while (element.lastChild?.nodeType === TEXT_NODE && !/\S/.test(element.lastChild.textContent ?? ""))
    element.lastChild.remove()
  if (element.firstChild?.nodeType === TEXT_NODE)
    element.firstChild.textContent = (element.firstChild.textContent ?? "").trimStart()
}

/** `text`'s lines with their common indent removed, blank lines at the ends dropped (`<ui-code>`'s own rule). */
function dedent(text: string): string {
  const lines = text.replace(/\t/g, "  ").split("\n")
  while (lines.length && !lines[0]!.trim()) lines.shift()
  while (lines.length && !lines.at(-1)!.trim()) lines.pop()
  const indent = Math.min(...lines.filter((line) => line.trim()).map((line) => line.match(/^ */)![0].length))
  return lines.map((line) => line.slice(Number.isFinite(indent) ? indent : 0)).join("\n")
}
