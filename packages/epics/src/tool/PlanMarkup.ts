/****************
 * ### `PlanMarkup`
 * Small helpers over HTML text and a parsed (linkedom) document, shared by `PlanDoc` and its helpers and by the
 * converter (`$/epics/convert`):  escaping, serializing, building elements with their attributes in order, small DOM
 * edits (moving children, stripping their text, a title as `<epic-*>` data), comparing markup however oxfmt wrapped
 * it.
 * - STATIC and instance-free on purpose:  no state, and nothing here knows what a plan doc is, beyond
 *   `slot="title"`.
 * - Imports nothing:  the DOM it works on is whatever document it's handed (linkedom under node).  Plain DOM, no
 *   globals (`nodeType`, never `instanceof`).
 * - From `packages/docs/tools/plan-doc.js`, `pages.js` (`serialize()`, `serializeHTML()`) and `to-ui-section.js`
 *   (`createElement()`), epic `epic-components` P7:  `epics` can't import `docs`.  The DOM edits were the
 *   converter's `domEdits.ts` (I5).
 ****************/
export class PlanMarkup {
  ////////////////
  // ## Escaping
  ////////////////

  /** `value` escaped for HTML text. */
  static text(value: unknown): string {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  }

  /** `value` escaped for HTML text AND a double-quoted attribute:  placeholders sit in both. */
  static escapeAll(value: unknown): string {
    return PlanMarkup.text(value).replace(/"/g, "&quot;")
  }

  /** `value` escaped for a double-quoted attribute value. */
  static attribute(value: unknown): string {
    return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  }

  ////////////////
  // ## Serializing
  ////////////////

  /**
   * A parsed (linkedom) document as page HTML, ready to write.
   * - `<!doctype html>` lowercase, and boolean attributes bare (`styled`, not `styled=""`), as written by hand and by
   *   oxfmt
   */
  static serialize(document: Document): string {
    // oxlint-disable-next-line typescript/no-base-to-string -- linkedom's `Document.toString()` is the page's HTML;  lib.dom doesn't declare it
    return PlanMarkup.serializeHTML(String(document).replace(/^<!DOCTYPE html>/i, "<!doctype html>"))
  }

  /**
   * A parsed (linkedom) document as page HTML, ready to write, `&` in attribute values ESCAPED:  what the tool writes.
   * - `serialize()`, with the fix for linkedom (0.18), which writes `title="A &amp; B"`'s `&` bare, so a title
   *   holding `&lt;` reads back as `<` (I2 of epic `epic-components`)
   * - the document is left as it was:  each value is escaped for the write, then put back (`escapeAmpersands()`)
   */
  static serializePage(document: Document): string {
    const restore = PlanMarkup.escapeAmpersands(document)
    try {
      return PlanMarkup.serialize(document)
    } finally {
      restore()
    }
  }

  /**
   * Write every `&` in `document`'s attribute values as `&amp;`, IN PLACE, just before it's serialized:  linkedom
   * (0.18) escapes only `"` in an attribute, so a title saying `&lt;x&gt;` would be written `title="&lt;x&gt;"` and
   * read back as `<x>` (I2 of epic `epic-components`).  Returns a function that puts every value back.
   * - HACK: the values are WRONG in the DOM until then (escaped twice):  serialize, never read it in between
   * - for a document split into parts (`EpicParts.split()` serializes each part itself):  escape, split, serialize;
   *   one written whole:  `serializePage()`
   */
  static escapeAmpersands(document: Document): () => void {
    const changed: [Element, string, string][] = []
    for (const element of document.querySelectorAll("*")) {
      for (const { name, value } of Array.from(element.attributes)) {
        if (!value.includes("&")) continue
        changed.push([element, name, value])
        element.setAttribute(name, value.replaceAll("&", "&amp;"))
      }
    }
    return () => {
      for (const [element, name, value] of changed) element.setAttribute(name, value)
    }
  }

  /**
   * Serialized `html` (a document's, or a fragment's `innerHTML`) with boolean attributes bare (`styled`, not
   * `styled=""`), as `serialize()` writes a page;  a plan doc's part files too.
   * - repeated until stable:  one pass fixes one attribute per tag, and `ui-table` has four
   */
  static serializeHTML(html: string): string {
    let before: string | undefined
    while (before !== html) {
      before = html
      html = html.replace(/(<[a-z][\w-]*\b[^<>]*?) ([a-z][\w-]*)=""(?=[\s/>])/g, "$1 $2")
    }
    return html
  }

  ////////////////
  // ## Building
  ////////////////

  /**
   * A new element of `document` with `attributes` (`[name, value]` pairs) IN THAT ORDER, as written by hand.
   * - `""`:  a bare boolean attribute
   * - parsed from HTML:  linkedom's `setAttribute` puts each new attribute FIRST, so a built element's would come
   *   out reversed
   */
  static createElement(document: Document, tag: string, attributes: [string, string | number][] = []): Element {
    const template = document.createElement("template")
    const list = attributes.map(([name, value]) =>
      value === "" ? ` ${name}` : ` ${name}="${PlanMarkup.attribute(value)}"`
    )
    template.innerHTML = `<${tag}${list.join("")}></${tag}>`
    return template.content.firstChild as Element
  }

  /** Set or remove boolean attribute `name` on `element`. */
  static toggle(element: Element, name: string, on: boolean): void {
    if (on) element.setAttribute(name, "")
    else element.removeAttribute(name)
  }

  /** Drop whitespace-only text at the start and end of `element`. */
  static trimWhitespace(element: Element): void {
    while (PlanMarkup.isBlank(element.firstChild)) element.firstChild!.remove()
    while (PlanMarkup.isBlank(element.lastChild)) element.lastChild!.remove()
  }

  /** A new element of `node`'s document, `tag`, holding `nodes`;  `attributes` set in order. */
  static wrap(node: Node, tag: string, nodes: Node[], attributes: Record<string, string> = {}): Element {
    const document = node.ownerDocument ?? (node as unknown as Document)
    const made = document.createElement(tag)
    for (const [name, value] of Object.entries(attributes)) made.setAttribute(name, value)
    made.append(...nodes)
    return made
  }

  ////////////////
  // ## Moving children
  ////////////////

  /** `element`'s child nodes, detached from it, whitespace at both ends dropped. */
  static takeChildren(element: Element): ChildNode[] {
    const nodes = Array.from(element.childNodes)
    for (const node of nodes) node.remove()
    while (nodes.length && PlanMarkup.isBlank(nodes[0])) nodes.shift()
    while (nodes.length && PlanMarkup.isBlank(nodes.at(-1))) nodes.pop()
    return nodes
  }

  /**
   * Strip `first` from the start of `element`'s first text and `last` from the end of its last, IN PLACE, when that
   * child IS text (not inside markup);  returns what `first` matched, if it did.
   */
  static stripEdges(element: Element, { first, last }: { first?: RegExp; last?: RegExp }): RegExpExecArray | null {
    PlanMarkup.joinText(element)
    let match: RegExpExecArray | null = null
    const head = firstText(element)
    if (head && first) {
      match = first.exec(head.data)
      if (match) head.data = head.data.slice(match[0].length)
    }
    const tail = lastText(element)
    if (tail && last) tail.data = tail.data.replace(last, "")
    return match
  }

  /**
   * The title `element`'s children make, as `<epic-*>` data:  plain text => `{ title }` (whitespace squeezed);  any
   * markup => `{ slot }`, a new `<span slot="title">` holding the children (moved).
   * - `extra`:  elements that ride in the title too (an `<epic-update>` marker), forcing a slot
   */
  static titleOf(element: Element, extra: Element[] = []): { title?: string; slot?: Element } {
    const hasMarkup = Array.from(element.children).length > 0 || extra.length > 0
    if (!hasMarkup) {
      const title = PlanMarkup.squeeze(element.textContent ?? "")
      return title ? { title } : {}
    }
    const slot = element.ownerDocument.createElement("span")
    slot.setAttribute("slot", "title")
    slot.append(
      ...PlanMarkup.takeChildren(element),
      ...extra.flatMap((it) => [element.ownerDocument.createTextNode(" "), it])
    )
    return { slot }
  }

  /**
   * Join `element`'s adjacent text children into one, IN PLACE:  linkedom parses one run of text as several nodes
   * (` ` then `· Named palette`), so a prefix may start in one and end in the next.
   */
  static joinText(element: Element): void {
    let previous: Text | undefined
    for (const node of Array.from(element.childNodes)) {
      if (node.nodeType !== 3) {
        previous = undefined
        continue
      }
      if (previous) {
        previous.data += (node as Text).data
        node.remove()
      } else previous = node as Text
    }
  }

  ////////////////
  // ## Reading
  ////////////////

  /** Is `node` an element?  (`nodeType` 1:  linkedom's nodes aren't the global `Element`'s instances.) */
  static isElement(node: Node | null | undefined): node is Element {
    return node?.nodeType === 1
  }

  /** Is `node` a text node holding only whitespace (or nothing)? */
  static isBlank(node: Node | null | undefined): boolean {
    return node?.nodeType === 3 && !node.textContent?.trim()
  }

  /** Is `node` an element, or text that isn't only whitespace?  Comments never count. */
  static isSignificant(node: Node): boolean {
    return PlanMarkup.isElement(node) || (node.nodeType === 3 && !PlanMarkup.isBlank(node))
  }

  /** Does `later` come after `earlier` in document order? */
  static followsInDocument(earlier: Node, later: Node): boolean {
    return !!(earlier.compareDocumentPosition(later) & 4) /* Node.DOCUMENT_POSITION_FOLLOWING */
  }

  /** `text` with its whitespace runs as one space, trimmed:  a title's text, or markup oxfmt may have rewrapped. */
  static squeeze(text: string): string {
    return text.replace(/\s+/g, " ").trim()
  }

  /**
   * `html` with NO whitespace:  to tell whether two versions of an item's text say the same, however oxfmt wrapped
   * them (`</ui-content\n>`);  text differing only in spacing counts as the same.
   */
  static bare(html: string): string {
    return html.replace(/\s+/g, "")
  }
}

/** `element`'s first child, when it's text. */
function firstText(element: Element): Text | undefined {
  const node = element.firstChild
  return node?.nodeType === 3 ? (node as Text) : undefined
}

/** `element`'s last child, when it's text. */
function lastText(element: Element): Text | undefined {
  const node = element.lastChild
  return node?.nodeType === 3 ? (node as Text) : undefined
}
