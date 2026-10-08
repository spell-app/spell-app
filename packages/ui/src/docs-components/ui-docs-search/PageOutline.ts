import type { SiteSearchSection } from "$/ui/docs-components/docs-components.types"
import { SearchIndex } from "./SearchIndex"
import { TRAIL, type SearchEntry } from "./UIDocsSearch.types"

/****************
 * ### `PageOutline`
 * A page's sections:  what `<ui-docs-search>`'s "On this page" searches, read LIVE from the page shown (`read()`),
 * and what `yarn site:data` writes into the search file for every page (`tools/SiteSearchBuilder.ts`,
 * through `sections()`, on linkedom), so a page reads the same either way:
 * - a section:  a `<ui-section id>`, or a level 2-4 header with an id (`<ui-header level id>`, `<h2 id>` ...),
 *   so a page not nested into sections yet (the overview) still lists its headings;  never one inside an example,
 *   a `<template>` or a `<script>`
 * - its title:  the section's `header`, else its `slot="header"` child's text;  a header's own text,
 *   without its sub header or icon
 * - its `parent`:  the section around it;  a top-level one in a `<ui-tabs id="site-tabs">` pane names its `tab`
 * - every tab's sections, the hidden panes' too:  landing on one selects its tab (the site's router)
 * - Its links are `#id`:  the page shown, whatever its URL.
 * - Plain DOM, no Solid, no globals (node's linkedom runs it too):  NEVER imports a value from `$/ui/core`,
 *   which node can't load;  cheap enough to read on every search.
 * - Static only:  pure reads of the DOM it's given.
 ****************/
export class PageOutline {
  /** `root`'s sections as search entries of the page shown, in document order;  none without a root. */
  static read(root: Element | undefined): SearchEntry[] {
    if (!root) return []
    const { sections, tabs } = PageOutline.sections(root)
    return sections.map((section, at) => {
      const trail = SearchIndex.trail(sections, at, tabs)
      return {
        kind: "here" as const,
        title: section.title,
        ...(trail.length && { context: trail.join(TRAIL) }),
        href: `#${section.id}`,
        terms: [section.id, ...trail]
      }
    })
  }

  /**
   * `root`'s sections (titled ones only), in document order, and its tabs' labels by value.
   * - A section left out (no title) never breaks a `parent`:  indexes are of the list returned.
   */
  static sections(root: Element): { sections: SiteSearchSection[]; tabs: Record<string, string> } {
    const found = [...root.querySelectorAll(SECTIONS)].filter(
      (element) => !element.closest(NOT_PAGE) && PageOutline.titleOf(element)
    )
    const index = new Map(found.map((element, at) => [element, at]))
    const tabs: Record<string, string> = {}
    for (const pane of root.querySelectorAll(PANES)) {
      const value = pane.getAttribute(VALUE)!
      tabs[value] = pane.getAttribute(LABEL) ?? value
    }
    const sections = found.map((element): SiteSearchSection => {
      const parent = PageOutline.parentOf(element, index)
      const pane = parent === undefined ? element.closest(PANES) : undefined
      return {
        id: element.id,
        title: PageOutline.titleOf(element),
        ...(parent !== undefined && { parent }),
        ...(pane && { tab: pane.getAttribute(VALUE)! })
      }
    })
    return { sections, tabs }
  }

  /** A section's or header's title (see the class). */
  static titleOf(element: Element): string {
    if (element.localName === SECTION_TAG) {
      const header = element.getAttribute(HEADER)
      const slotted = [...element.children].find((child) => child.getAttribute("slot") === HEADER)
      return PageOutline.clean(header ?? slotted?.textContent ?? "")
    }
    const copy = element.cloneNode(true) as Element
    for (const inner of copy.querySelectorAll(NOT_TITLE)) inner.remove()
    return PageOutline.clean(copy.textContent ?? "")
  }

  /** Index of the nearest listed section around `element`, if any. */
  private static parentOf(element: Element, index: ReadonlyMap<Element, number>): number | undefined {
    for (let around = element.parentElement?.closest(SECTION_WITH_ID); around;) {
      const at = index.get(around)
      if (at !== undefined) return at
      around = around.parentElement?.closest(SECTION_WITH_ID)
    }
    return undefined
  }

  /** `text` with its whitespace collapsed. */
  private static clean(text: string): string {
    return text.replace(/\s+/g, " ").trim()
  }
}

/** What counts as a section. */
const SECTIONS =
  "ui-section[id], ui-header[id][level='2'], ui-header[id][level='3'], ui-header[id][level='4'], h2[id], h3[id], h4[id]"

/** Never a page section:  demo markup. */
const NOT_PAGE = "ui-docs-example, template, script"

/** A tab pane of the page. */
const PANES = "ui-tabs#site-tabs > ui-tab[value]"

/** The section tag. */
const SECTION_TAG = "ui-section"

/** A section that can be a parent:  one with an id. */
const SECTION_WITH_ID = "ui-section[id]"

/** A section's title attribute, and the slot of its rich title. */
const HEADER = "header"

/** What a header's title leaves out:  its sub header, its icon, anything slotted. */
const NOT_TITLE = "ui-header, ui-icon, [slot]"

/** A pane's value attribute:  its tab's id. */
const VALUE = "value"

/** A pane's label attribute:  its tab's text. */
const LABEL = "label"
