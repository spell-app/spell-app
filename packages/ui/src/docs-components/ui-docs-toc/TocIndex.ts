import {
  EXAMPLE_TAG,
  HEADING_SELECTOR,
  READING_LINE,
  SECTION_SELECTOR,
  TABS_TAG,
  type TocEntry,
  type TocSection
} from "./ui-docs-toc.types"

/****************
 * ### `TocIndex`
 * The page side of `<ui-docs-toc>`:  which content it follows, the sections and entries in it, the one in view.
 * - Plain DOM, no Solid:  the element and its native fallback both use it.
 * - SIDE EFFECT:  `scan()` gives every listed heading / example without an `id` one (a slug of its text, made unique
 *   in the document), so the links have targets and other pages can link to them.
 ****************/
export class TocIndex {
  /**
   * The element named by `forId` (else the page's `<main>`, else `<body>`), and the tab set when it is one.
   * - `undefined` while a named element doesn't exist yet (the toc may come first in the page).
   */
  static followed(document: Document, forId: string | undefined): { root: Element; tabs?: Element } | undefined {
    const root = forId ? document.getElementById(forId) : (document.querySelector("main") ?? document.body)
    if (!root) return undefined
    return root.localName === TABS_TAG ? { root, tabs: root } : { root }
  }

  /** The pane of `tabs` on show:  `:state(selected)`, else the first child with a box. */
  static shownPane(tabs: Element): Element | undefined {
    const panes = TocIndex.panes(tabs)
    return (
      panes.find((pane) => TocIndex.hasState(pane, "selected")) ?? panes.find((pane) => pane.getClientRects().length)
    )
  }

  /** The pane of `tabs` holding `target`, if any. */
  static paneOf(tabs: Element, target: Element): Element | undefined {
    return TocIndex.panes(tabs).find((pane) => pane.contains(target))
  }

  /** A pane's value, as `<ui-tabs value>` takes it:  its `value`, else its index. */
  static paneValue(tabs: Element, pane: Element): string {
    return pane.getAttribute("value") ?? String(TocIndex.panes(tabs).indexOf(pane))
  }

  /**
   * The sections of `root`, in page order:  each level 2 heading with the examples / level 3 headings after it.
   * - Headings before the first section become sections with no entries.
   * - Skipped:  headings inside an example's live markup (a header page's demos), inside templates.
   * - `reserved`:  ids a new id must not take (the tab values, which the URL hash also names).
   */
  static scan(root: Element, reserved: ReadonlySet<string> = new Set()): TocSection[] {
    const sections: { id: string; text: string; target: Element; entries: TocEntry[] }[] = []
    for (const heading of root.querySelectorAll(HEADING_SELECTOR)) {
      if (TocIndex.insideExample(heading, root)) continue
      const text = TocIndex.text(heading)
      if (!text) continue
      const entry = { id: TocIndex.idOf(heading, text, reserved), text, target: heading }
      const last = sections.at(-1)
      if (heading.matches(SECTION_SELECTOR) || !last) sections.push({ ...entry, entries: [] })
      else last.entries.push(entry)
    }
    return sections
  }

  /**
   * The id of the entry in view:  the last one whose top has passed the reading line (the document's scroll padding
   * plus a fifth of the viewport);  the last one at the page's end;  the first one above everything.
   * - Entries without a box (a hidden pane) are skipped.
   */
  static current(sections: readonly TocSection[], document: Document): string | undefined {
    const view = document.defaultView
    if (!view) return undefined
    const all = sections
      .flatMap((section) => [section, ...section.entries])
      .filter((entry) => entry.target.getClientRects().length)
    if (!all.length) return undefined
    const scroller = document.scrollingElement ?? document.documentElement
    if (scroller.scrollTop > 0 && scroller.scrollTop + view.innerHeight >= scroller.scrollHeight - 2)
      return all.at(-1)!.id
    const padding = parseFloat(view.getComputedStyle(document.documentElement).scrollPaddingTop) || 0
    const line = padding + view.innerHeight * READING_LINE
    let current = all[0]!
    for (const entry of all) {
      if (entry.target.getBoundingClientRect().top <= line) current = entry
      else break
    }
    return current.id
  }

  /** The section holding the entry `id` (or being it). */
  static sectionOf(sections: readonly TocSection[], id: string | undefined): TocSection | undefined {
    if (!id) return undefined
    return sections.find((section) => section.id === id || section.entries.some((entry) => entry.id === id))
  }

  /** A URL hash (without `#`) as the id it names. */
  static decode(hash: string): string {
    try {
      return decodeURIComponent(hash)
    } catch {
      return hash
    }
  }

  /**
   * Run `then` once the `<ui-root>` around `element` is ready (every component drawn), or on the next frame when
   * it already is or there is none.
   */
  static whenReady(element: Element, then: () => void): void {
    const root = element.closest("ui-root")
    if (!root || TocIndex.hasState(root, "ready")) requestAnimationFrame(then)
    else root.addEventListener("ui-ready", () => requestAnimationFrame(then), { once: true })
  }

  /** `text` as an id:  lowercase words joined by `-`, e.g. `Labeled Icon` => `labeled-icon`. */
  static slug(text: string): string {
    return (
      text
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "section"
    )
  }

  /** `element`'s id, giving it one first if it has none (SIDE EFFECT). */
  private static idOf(element: Element, text: string, reserved: ReadonlySet<string>): string {
    if (element.id) return element.id
    const base = TocIndex.slug(text)
    const document = element.ownerDocument
    let id = base
    for (let n = 2; reserved.has(id) || document.getElementById(id); n++) id = `${base}-${n}`
    element.id = id
    return id
  }

  /** A heading's link text:  an example's `header`, else its text, whitespace collapsed. */
  private static text(heading: Element): string {
    const text = heading.localName === EXAMPLE_TAG ? heading.getAttribute("header") : heading.textContent
    return (text ?? "").replace(/\s+/g, " ").trim()
  }

  /** `heading` is part of an example's live markup (or a template), below `root`. */
  private static insideExample(heading: Element, root: Element): boolean {
    const example = heading.parentElement?.closest(`${EXAMPLE_TAG}, template`)
    return !!example && root.contains(example)
  }

  /** The `<ui-tab>` children of `tabs` (any child with a `value` or the pane state). */
  private static panes(tabs: Element): Element[] {
    return [...tabs.children].filter((child) => child.localName !== "template")
  }

  /** `element` has custom state `name` (`false` where `:state()` isn't supported). */
  private static hasState(element: Element, name: string): boolean {
    try {
      return element.matches(`:state(${name})`)
    } catch {
      return false
    }
  }
}
