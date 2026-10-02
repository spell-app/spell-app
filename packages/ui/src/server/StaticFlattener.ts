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
  }

  /** Replace one element with its flattened content. */
  private static replace(document: Document, { element, family, html }: StaticView) {
    const template = document.createElement("template")
    template.innerHTML = html
    const content = template.content
    for (const slot of [...content.querySelectorAll("slot")]) StaticFlattener.fill(slot, element)
    let root = content.firstElementChild
    if (root) root = StaticFlattener.listRoot(document, root)
    const listItem = ServerHost.state(element)?.internals.role === "listitem"
    if (root)
      StaticFlattener.decorate(
        root,
        element,
        family.definition.attributes.map((each) => each.attribute)
      )
    if (root) root.setAttribute("data-ui", family.definition.vocabulary.noun)
    let outer: Element | undefined = root ?? undefined
    if (listItem) {
      outer = document.createElement("li")
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
    const list = document.createElement("ul")
    for (const { name, value } of [...root.attributes]) list.setAttribute(name, value)
    list.append(...root.childNodes)
    root.replaceWith(list)
    return list
  }

  /** Replace `slot` with the nodes of `host` assigned to it, else keep its fallback content. */
  private static fill(slot: Element, host: Element) {
    const name = slot.getAttribute("name") ?? ""
    const assigned = [...host.childNodes].filter((node) => StaticFlattener.slotOf(node) === name)
    const nodes = assigned.length ? assigned : [...slot.childNodes]
    for (const node of assigned) if (node.nodeType === ELEMENT_NODE) (node as Element).removeAttribute("slot")
    slot.replaceWith(...nodes)
  }

  /** Slot name `node` is assigned to:  its `slot` attribute, `""` for text and unnamed elements. */
  private static slotOf(node: Node): string | undefined {
    if (node.nodeType === ELEMENT_NODE) return (node as Element).getAttribute("slot") ?? ""
    if (node.nodeType === TEXT_NODE) return ""
    return undefined
  }

  /**
   * Move what the host carried onto the root:  author attributes (`vocabulary` names skipped), owner states as
   * classes, internals ARIA as attributes.
   */
  private static decorate(root: Element, host: Element, vocabulary: readonly string[]) {
    const skip = new Set([...vocabulary, "slot"])
    for (const { name, value } of [...host.attributes]) {
      if (skip.has(name)) continue
      if (name === "class") root.setAttribute("class", `${root.getAttribute("class") ?? ""} ${value}`.trim())
      else if (name === "style") root.setAttribute("style", `${root.getAttribute("style") ?? ""};${value}`)
      else if (!root.hasAttribute(name)) root.setAttribute(name, value)
    }
    const state = ServerHost.state(host)
    if (!state) return
    for (const name of state.states) if (name.startsWith("in-")) root.classList.add(name)
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

/** Elements `<li>` may sit in. */
const LIST_TAGS = new Set(["ul", "ol", "menu"])

/** `Node.ELEMENT_NODE`, without the `Node` global. */
const ELEMENT_NODE = 1

/** `Node.TEXT_NODE`, without the `Node` global. */
const TEXT_NODE = 3
