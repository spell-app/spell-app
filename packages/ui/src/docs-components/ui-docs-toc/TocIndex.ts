import {
  EXAMPLE_TAG,
  HEADING_SELECTOR,
  READING_LINE,
  SECTION_HEADER_SELECTOR,
  SECTION_SELECTOR,
  SECTION_TAG,
  TABS_TAG,
  type FollowedContent,
  type TocEntry,
  type TocSection
} from "./ui-docs-toc.types"

/****************
 * ### `TocIndex`
 * The page side of `<ui-docs-toc>`:  which content it follows, the sections and entries in it, the one in view.
 * - Plain DOM, no Solid:  the element and its native fallback both use it, and node scripts load it by path
 *   (`scripts/site-sections.ts`, `tools/SiteCheck.ts`):  NEVER imports a value from `$/ui/core`.
 * - Static only:  pure reads (and id writes) of the DOM it's given.
 * - Entries form a tree:  level 2 headings and top-level `<ui-section>`s, then what's under each (examples, level 3
 *   headings, nested sections), as deep as the sections nest.
 * - SIDE EFFECT:  `scan()` gives every listed heading / section / example without an `id` one (a slug of its text,
 *   made unique in the document), so the links have targets and other pages can link to them.
 ****************/
export class TocIndex {
  /**
   * The element named by `forId` (else the page's `<main>`, else `<body>`), and the tab set when it is one.
   * - `undefined` while a named element doesn't exist yet (the toc may come first in the page).
   */
  static followed(document: Document, forId: string | undefined): FollowedContent | undefined {
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
   * The sections of `root`, in page order:  each level 2 heading with the examples / level 3 headings after it,
   * and each `<ui-section>` with what's nested in it (sections, examples, headings), at any depth.
   * - A level 2 heading inside a `<ui-section>` is an entry of that section, like the rest.
   * - Headings before the first section become sections with no entries.
   * - Skipped:  headings and sections inside an example's live markup (a header page's demos), inside templates;
   *   sections without a title.
   * - `reserved`:  ids a new id must not take (the tab values, which the URL hash also names).
   */
  static scan(root: Element, reserved: ReadonlySet<string> = new Set()): TocSection[] {
    const sections: TocEntry[] = []
    const ofSection = new Map<Element, TocEntry>()
    for (const heading of root.querySelectorAll(HEADING_SELECTOR)) {
      if (TocIndex.insideExample(heading, root)) continue
      const text = TocIndex.text(heading)
      if (!text) continue
      const entry: TocEntry = { id: TocIndex.idOf(heading, text, reserved), text, target: heading, entries: [] }
      if (heading.localName === SECTION_TAG) ofSection.set(heading, entry)
      const parent = TocIndex.enclosing(heading, root, ofSection)
      const last = sections.at(-1)
      if (parent) (parent.entries as TocEntry[]).push(entry)
      else if (heading.matches(SECTION_SELECTOR) || !last) sections.push(entry)
      else (last.entries as TocEntry[]).push(entry)
    }
    return sections
  }

  /** `entries` and everything under them, depth first:  page order. */
  static flatten(entries: readonly TocEntry[]): TocEntry[] {
    return entries.flatMap((entry) => [entry, ...TocIndex.flatten(entry.entries)])
  }

  /** Ids from the top-level section down to the entry `id` (its own last);  `[]` when it isn't listed. */
  static pathTo(entries: readonly TocEntry[], id: string | undefined): string[] {
    if (!id) return []
    for (const entry of entries) {
      if (entry.id === id) return [id]
      const below = TocIndex.pathTo(entry.entries, id)
      if (below.length) return [entry.id, ...below]
    }
    return []
  }

  /**
   * The id of the entry in view:  the last one whose top has passed the reading line (the document's scroll padding
   * plus a fifth of the viewport);  the last one at the page's end;  the first one above everything.
   * - Entries without a box (a hidden pane) or inside a folded `<ui-section>` are skipped.
   */
  static current(sections: readonly TocSection[], document: Document): string | undefined {
    const view = document.defaultView
    if (!view) return undefined
    const all = TocIndex.flatten(sections).filter(
      (entry) => entry.target.getClientRects().length && !TocIndex.folded(entry.target)
    )
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

  /** The top-level section holding the entry `id`, at any depth (or being it). */
  static sectionOf(sections: readonly TocSection[], id: string | undefined): TocSection | undefined {
    const top = TocIndex.pathTo(sections, id)[0]
    return top === undefined ? undefined : sections.find((section) => section.id === top)
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

  /**
   * A heading's link text:  an example's `header`, else its text, whitespace collapsed.
   * - A nested heading of the same tag is its SUB header (`<ui-header>Title<ui-header>sub</ui-header></ui-header>`):
   *   left out, so the link says `Title`, not `Title sub`.
   */
  private static text(heading: Element): string {
    let text: string | null | undefined
    if (heading.localName === EXAMPLE_TAG) text = heading.getAttribute(HEADER)
    else if (heading.localName === SECTION_TAG)
      text = heading.getAttribute(HEADER) || heading.querySelector(SECTION_HEADER_SELECTOR)?.textContent
    else
      text = [...heading.childNodes]
        // `localName`, not `instanceof Element`:  node scripts run this on linkedom, which has no `Element` global;
        // a text node has no `localName`
        .filter((node) => (node as Element).localName !== heading.localName)
        .map((node) => node.textContent)
        .join("")
    return (text ?? "").replace(/\s+/g, " ").trim()
  }

  /** `heading` is part of an example's live markup (or a template), below `root`. */
  private static insideExample(heading: Element, root: Element): boolean {
    const example = heading.parentElement?.closest(`${EXAMPLE_TAG}, template`)
    return !!example && root.contains(example)
  }

  /** The listed `<ui-section>` (`ofSection`) nearest around `element`, below `root`;  `undefined` at the top. */
  private static enclosing(element: Element, root: Element, ofSection: Map<Element, TocEntry>): TocEntry | undefined {
    for (let section = element.parentElement?.closest(SECTION_TAG); section;) {
      if (!root.contains(section) || section === root) return undefined
      const entry = ofSection.get(section)
      if (entry) return entry
      section = section.parentElement?.closest(SECTION_TAG)
    }
    return undefined
  }

  /** `element` is hidden inside a folded `<ui-section>` (not counting itself). */
  private static folded(element: Element): boolean {
    for (let section = element.parentElement?.closest(SECTION_TAG); section;) {
      if (section.hasAttribute("collapsible") && section.hasAttribute("collapsed")) return true
      section = section.parentElement?.closest(SECTION_TAG)
    }
    return false
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

/** A section's or example's title attribute. */
const HEADER = "header"
