/****************
 * ### `PlanMarkup`
 * Small helpers over HTML text and a parsed (linkedom) document, shared by `PlanDoc` and its helpers:  escaping,
 * serializing, building elements with their attributes in order, comparing markup however oxfmt wrapped it.
 * - STATIC and instance-free on purpose:  no state, and nothing here knows what a plan doc is.
 * - Imports nothing:  the DOM it works on is whatever document it's handed (linkedom under node).
 * - From `packages/docs/tools/plan-doc.js`, `pages.js` (`serialize()`, `serializeHTML()`) and `to-ui-section.js`
 *   (`createElement()`), epic `epic-components` P7:  `epics` can't import `docs`.
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

  ////////////////
  // ## Reading
  ////////////////

  /** Is `node` an element?  (`nodeType` 1:  linkedom's nodes aren't the global `Element`'s instances.) */
  static isElement(node: Node | null | undefined): node is Element {
    return node?.nodeType === 1
  }

  /** Is `node` a text node holding only whitespace? */
  static isBlank(node: Node | null | undefined): boolean {
    return node?.nodeType === 3 && !node.textContent?.trim()
  }

  /** Does `later` come after `earlier` in document order? */
  static followsInDocument(earlier: Node, later: Node): boolean {
    return !!(earlier.compareDocumentPosition(later) & 4) /* Node.DOCUMENT_POSITION_FOLLOWING */
  }

  /** `html` with its whitespace runs as one space, trimmed:  to compare markup oxfmt may have rewrapped. */
  static squeeze(html: string): string {
    return html.replace(/\s+/g, " ").trim()
  }

  /**
   * `html` with NO whitespace:  to tell whether two versions of an item's text say the same, however oxfmt wrapped
   * them (`</ui-content\n>`);  text differing only in spacing counts as the same.
   */
  static bare(html: string): string {
    return html.replace(/\s+/g, "")
  }
}
