import { NodeType } from "$/ui/util"
import type { StaticView } from "./server.types"
import { ServerHost } from "./ServerHost"

/****************
 * ### `StaticFlattener`
 * Replaces each rendered `ui-*` element with its shadow content in the light DOM:  no shadow roots, no hosts.
 * - Innermost first, so a parent's slots receive children that are already flat.
 * - Per element:
 *   - each `<slot>` becomes the children assigned to it (by `slot` attribute), else its fallback content
 *   - the host's non-vocabulary attributes (`id`, `class`, `style`, `title`, `data-*`, `aria-*` ...) move to the
 *     root;  vocabulary attributes are already in the root's classes
 *   - owner states (`:state(in-card)`) become classes (`in-card`), the parts' documented static form
 *   - internals ARIA becomes attributes;  a `listitem` host is wrapped in `<li>` instead
 *   - `data-ui="<noun>"` marks the root:  the static stylesheet's `@scope` boundary
 * - NOTE: the host's `slot` attribute moves to the outermost replacement node, for its parent's slots.
 ****************/
export class StaticFlattener {
  /** Flatten every view into `document`, innermost first. */
  static flatten(document: Document, views: readonly StaticView[]) {
    for (let index = views.length - 1; index >= 0; index--) StaticFlattener.replace(document, views[index]!)
    StaticFlattener.inParagraphs(document)
  }

  /**
   * Every rendered `<div>` anywhere inside a `<p>` becomes a `<span>`:  the parser closes a `<p>` at a `<div>`, so
   * `<p><ui-text><ui-label>` would split the paragraph (the direct-parent case is handled per root already).
   */
  private static inParagraphs(document: Document) {
    for (const div of [...document.querySelectorAll("p div")]) {
      if (div.closest("[data-ui]")) StaticFlattener.retag(document, div, "span")
    }
  }

  /** Replace one element with its flattened content. */
  private static replace(document: Document, { element, family, html }: StaticView) {
    const template = document.createElement("template")
    template.innerHTML = html
    const content = template.content
    for (const slot of [...content.querySelectorAll("slot")]) StaticFlattener.fill(slot, element)
    let root = content.firstElementChild
    if (root) root = StaticFlattener.listRoot(document, root)
    // a `<div>` where only phrasing content may go (`<p>`, `<a>` ...) would end the paragraph when a browser parses
    // the page:  a `<span>` (the element was an inline-level host there)
    if (root?.localName === "div" && PHRASING_ONLY.has(element.parentElement?.localName ?? "")) {
      root = StaticFlattener.retag(document, root, "span")
    }
    let listItem = ServerHost.state(element)?.internals.role === "listitem"
    // a `<div>` item root BECOMES the `<li>`:  no wrapper, so `:first-child` / `.item + .item` still see the items
    if (root && listItem && RETAGGABLE.has(root.localName)) {
      root = StaticFlattener.retag(document, root, "li")
      listItem = false
    }
    if (root)
      StaticFlattener.decorate(
        root,
        element,
        family.definition.attributes.map((each) => each.attribute)
      )
    if (root) root.setAttribute("data-ui", family.kind)
    let outer: Element | undefined = root ?? undefined
    if (listItem) {
      // `data-ui-li`:  `display: contents` in the static stylesheet, so the root stays the group's layout child
      outer = document.createElement("li")
      outer.setAttribute(LIST_ITEM_ATTRIBUTE, "")
      outer.append(...content.childNodes)
    }
    const slot = element.getAttribute("slot")
    if (outer && slot !== null) outer.setAttribute("slot", slot)
    if (listItem) element.replaceWith(outer!)
    else element.replaceWith(...content.childNodes)
  }

  /**
   * A `role=list` root holding `<li>`s (its items, wrapped above) becomes a `<ul>`:  `<li>` is only valid in a list.
   * - e.g. `<ui-cards>`' `<div role="list">`;  `<ul>` / `<ol>` roots (`<ui-list>`, `<ui-steps>`) stay.
   */
  private static listRoot(document: Document, root: Element): Element {
    if (root.getAttribute("role") !== "list" || LIST_TAGS.has(root.localName)) return root
    if (![...root.children].some((child) => child.localName === "li")) return root
    return StaticFlattener.retag(document, root, "ul")
  }

  /** Replace `element` with a `tag` element holding its attributes and children;  returns the new one. */
  private static retag(document: Document, element: Element, tag: string): Element {
    const replacement = document.createElement(tag)
    for (const { name, value } of [...element.attributes]) replacement.setAttribute(name, value)
    replacement.append(...element.childNodes)
    element.replaceWith(replacement)
    return replacement
  }

  /** Replace `slot` with the nodes of `host` assigned to it, else keep its fallback content. */
  private static fill(slot: Element, host: Element) {
    const name = slot.getAttribute("name") ?? ""
    const assigned = [...host.childNodes].filter((node) => StaticFlattener.slotOf(node) === name)
    const nodes = assigned.length ? assigned : [...slot.childNodes]
    for (const node of assigned) {
      if (node.nodeType !== NodeType.element) continue
      const element = node as Element
      element.removeAttribute("slot")
      // the static stylesheet's `@scope` stops inside it:  author content, as the shadow boundary kept it;  for a
      // wrapped list item, the item's root, so the group's sheet still reaches it as `::slotted()` did
      const slotted = element.hasAttribute(LIST_ITEM_ATTRIBUTE) ? (element.firstElementChild ?? element) : element
      slotted.setAttribute("data-ui-slotted", "")
    }
    slot.replaceWith(...nodes)
  }

  /** Slot name `node` is assigned to:  its `slot` attribute, `""` for text and unnamed elements. */
  private static slotOf(node: Node): string | undefined {
    if (node.nodeType === NodeType.element) return (node as Element).getAttribute("slot") ?? ""
    if (node.nodeType === NodeType.text) return ""
    return undefined
  }

  /**
   * Move what the host carried onto the root:  author attributes (`vocabulary` names skipped), owner states as
   * classes, internals ARIA as attributes.
   */
  private static decorate(root: Element, host: Element, vocabulary: readonly string[]) {
    const skip = new Set([...vocabulary, "slot"])
    // a form control's native element (marked by its render):  ids and names belong there, so `<label for>` and
    // `aria-labelledby` reach the control a browser submits and focuses
    const control = root.hasAttribute(CONTROL) ? root : root.querySelector(`[${CONTROL}]`)
    for (const { name, value } of [...host.attributes]) {
      if (skip.has(name)) continue
      if (control && CONTROL_ATTRIBUTES.has(name)) {
        const current = control.getAttribute(name)
        // the control's own id / label wins;  id lists merge (the host's hint AND the control's own text)
        if (current === null) control.setAttribute(name, value)
        else if (ID_LISTS.has(name))
          control.setAttribute(name, [...new Set(`${value} ${current}`.split(/\s+/))].join(" "))
      } else if (name === "class") root.setAttribute("class", `${root.getAttribute("class") ?? ""} ${value}`.trim())
      else if (name === "style") {
        const style = [root.getAttribute("style"), value].filter(Boolean).join(";")
        if (style) root.setAttribute("style", style)
      } else if (!root.hasAttribute(name)) root.setAttribute(name, value)
    }
    control?.removeAttribute(CONTROL)
    const state = ServerHost.state(host)
    if (!state) return
    for (const name of state.states) if (name.startsWith("in-")) root.classList.add(name)
    // every host state, for the static stylesheet's `[data-state~="x"]` (was `:state(x)`)
    if (state.states.size) root.setAttribute("data-state", [...state.states].join(" "))
    for (const [key, value] of Object.entries(state.internals)) {
      if (value === null || value === undefined || typeof value === "object") continue
      const name = key === "role" ? "role" : StaticFlattener.ariaAttribute(key)
      if (!name || (name === "role" && value === "listitem") || root.hasAttribute(name)) continue
      root.setAttribute(name, String(value as string | number | boolean))
    }
  }

  /** `ariaLabel` => `aria-label`;  `undefined` for anything but an ARIA property. */
  private static ariaAttribute(key: string): string | undefined {
    if (!key.startsWith("aria")) return undefined
    return "aria-" + key.slice(4).toLowerCase()
  }
}

/** Marks a form control's native element in its render (`data-ui-control`):  the host's ids go there. */
const CONTROL = "data-ui-control"

/** Host attributes that name or label the CONTROL, so they move to it rather than the root. */
const CONTROL_ATTRIBUTES = new Set(["id", "aria-label", "aria-labelledby", "aria-describedby"])

/** Of those, the ones holding id lists:  merged when both the host and the control have one. */
const ID_LISTS = new Set(["aria-labelledby", "aria-describedby"])

/** Marks the `<li>` the flattener wraps a list item in. */
const LIST_ITEM_ATTRIBUTE = "data-ui-li"

/** List item roots that become the `<li>` itself;  others (`<article>`, `<a>`, `<button>`) are wrapped in one. */
const RETAGGABLE = new Set(["div", "span"])

/** Elements whose content model is phrasing only:  a `<div>` there breaks out when the page is parsed. */
const PHRASING_ONLY = new Set([
  "p",
  "span",
  "a",
  "label",
  "button",
  "em",
  "strong",
  "small",
  "b",
  "i",
  "u",
  "s",
  "q",
  "code",
  "abbr",
  "cite",
  "dfn",
  "mark",
  "sub",
  "sup",
  "time",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6"
])

/** Elements `<li>` may sit in. */
const LIST_TAGS = new Set(["ul", "ol", "menu"])
