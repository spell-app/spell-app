import type { ConvertReport } from "./planDoc.types"

import { PlanMarkup } from "./PlanMarkup"

/****************
 * ### `SectionConverter`
 * Converts a parsed page's OLD section markup to `<ui-section>`, in place:  `PlanDoc.migrate()`'s last structural
 * step.
 * - old:  `<section class="s2|s3">` > `<ui-sticky class="spell-h2|spell-h3">` > `<h2|h3 id>` (icons, title), then the
 *   content
 * - new:  `<ui-section id header sticky collapsible dividing>` (`guides/spell-docs/ui-section-test.html` shows every
 *   piece)
 * - STATIC and instance-free on purpose:  a function of the document it's handed;  no files.
 * - From `packages/docs/tools/to-ui-section.js` `convertSections()` (epic `epic-components`, P7):  `epics` can't
 *   import `docs`, so the docs script keeps its own copy until it imports this one (`docs` may import anything).
 ****************/
export class SectionConverter {
  /**
   * Convert every old-markup section in `document` to `<ui-section>`;  returns what it did.
   * - the section takes its HEADING's `id` (the anchor other pages link to:  NEVER changed);  an `id` of the old
   *   `<section>` itself (`phases-section`) is dropped:  listed in `droppedIds`, and the page's links to it
   *   (`href="#phases-section"`) go to the heading's id
   * - the old section's other attributes stay (`data-phase`, `data-status` ...), but its `s2` / `s3` class and
   *   `data-fold` (`"closed"` -> `collapsed`)
   * - the heading's content:
   *   - its `<ui-icon>`:  `slot="icon"`, first in the section;  several stay together in a `<span slot="icon">`
   *   - a runtime-made `ui-label.spell-count`:  dropped;  any other `ui-label` (`.plan-update`) stays in the title
   *   - plain text only:  `header="..."`, whitespace collapsed;  any element in it (`<code>`, `<a>`, a label):  a
   *     `<span slot="header">` holding it all (listed in `slotHeaders`)
   * - the heading level is implied by nesting (2 at the top, +1 per level):  a section whose old heading says
   *   otherwise gets `level` (listed in `levels`)
   * - a section not shaped as above is left alone:  listed in `skipped`
   */
  static convertSections(document: Document): ConvertReport {
    const report: ConvertReport = {
      converted: 0,
      slotHeaders: [],
      multiIcons: [],
      droppedIds: [],
      levels: [],
      skipped: []
    }
    const levelOf = new Map<Element, number>()
    for (const section of Array.from(document.querySelectorAll("section.s2, section.s3"))) {
      const sticky = section.firstElementChild
      const heading = sticky?.matches("ui-sticky") ? sticky.firstElementChild : null
      if (!sticky || !heading?.matches("h2, h3") || !heading.id) {
        report.skipped.push(section.outerHTML.slice(0, 80))
        continue
      }
      const converted = SectionConverter.convertSection(document, section, sticky, heading, report)
      levelOf.set(converted, Number(heading.localName.slice(1)))
    }
    // the level nesting implies, against the old heading's
    for (const [section, level] of levelOf) {
      let implied = 2
      for (let up = section.parentElement?.closest("ui-section"); up; up = up.parentElement?.closest("ui-section"))
        implied++
      if (implied === level) continue
      section.setAttribute("level", String(level))
      report.levels.push(`#${section.id}:  h${level}, nested as h${implied}`)
    }
    return report
  }

  ////////////////
  // ## Internal
  ////////////////

  /** One old section to a `<ui-section>`, in its place;  returns the new element. */
  private static convertSection(
    document: Document,
    section: Element,
    sticky: Element,
    heading: Element,
    report: ConvertReport
  ): Element {
    const attributes: [string, string][] = [["id", heading.id]]
    const kept = Array.from(section.attributes).filter(({ name }) => !["id", "class", "data-fold"].includes(name))
    kept.sort((a, b) => SectionConverter.rank(a.name) - SectionConverter.rank(b.name))
    for (const { name, value } of kept) attributes.push([name, value])
    const classes = (section.getAttribute("class") ?? "").split(/\s+/).filter((name) => name && !/^s[23]$/.test(name))
    if (classes.length) attributes.push(["class", classes.join(" ")])
    const oldId = section.getAttribute("id")
    if (oldId && oldId !== heading.id) {
      report.droppedIds.push(oldId)
      for (const link of document.querySelectorAll(`a[href="#${oldId}"]`)) link.setAttribute("href", `#${heading.id}`)
    }

    const { icons, title } = SectionConverter.splitHeading(heading)
    const rich = title.some((node) => node.nodeType === 1)
    if (!rich)
      attributes.push([
        "header",
        title
          .map((node) => node.textContent)
          .join("")
          .replace(/\s+/g, " ")
          .trim()
      ])
    for (const flag of SectionConverter.SECTION_FLAGS) attributes.push([flag, ""])
    if (section.getAttribute("data-fold") === "closed") attributes.push(["collapsed", ""])
    const result = PlanMarkup.createElement(document, "ui-section", attributes)

    // the whitespace before the old title indents what takes its place:  the slotted icon and title
    const children = Array.from(section.childNodes)
    const at = children.indexOf(sticky)
    const indent = children
      .slice(0, at)
      .filter((node) => node.nodeType === 3)
      .map((node) => node.textContent)
      .join("")
    const slotted: Element[] = []
    if (icons.length === 1) {
      icons[0].setAttribute("slot", "icon")
      slotted.push(icons[0])
    } else if (icons.length > 1) {
      const span = PlanMarkup.createElement(document, "span", [["slot", "icon"]])
      span.append(...SectionConverter.interleave(document, icons))
      slotted.push(span)
      report.multiIcons.push(heading.id)
    }
    if (rich) {
      const span = PlanMarkup.createElement(document, "span", [["slot", "header"]])
      span.append(...SectionConverter.trimmed(title))
      slotted.push(span)
      report.slotHeaders.push(heading.id)
    }
    for (const node of slotted) result.append(document.createTextNode(indent), node)
    result.append(...children.slice(at + 1))
    section.replaceWith(result)
    report.converted++
    return result
  }

  /**
   * A heading's nodes as `{ icons, title }`:  its `<ui-icon>` children, and the rest of its content (moved, not
   * copied) without the runtime's `ui-label.spell-count`.
   */
  private static splitHeading(heading: Element): { icons: Element[]; title: ChildNode[] } {
    const icons: Element[] = []
    const title: ChildNode[] = []
    for (const node of Array.from(heading.childNodes)) {
      if (PlanMarkup.isElement(node) && node.matches("ui-icon")) icons.push(node)
      else if (PlanMarkup.isElement(node) && node.matches("ui-label.spell-count")) continue
      else if (node.nodeType === 1 || node.nodeType === 3) title.push(node)
    }
    return { icons, title }
  }

  /** `nodes` without whitespace-only text at either end, and the outer text's leading / trailing space trimmed. */
  private static trimmed(nodes: ChildNode[]): ChildNode[] {
    const list = [...nodes]
    while (PlanMarkup.isBlank(list[0])) list.shift()
    while (PlanMarkup.isBlank(list.at(-1))) list.pop()
    const first = list[0]
    if (first?.nodeType === 3) first.textContent = (first.textContent ?? "").replace(/^\s+/, "")
    const last = list.at(-1)
    if (last?.nodeType === 3) last.textContent = (last.textContent ?? "").replace(/\s+$/, "")
    return list
  }

  /** `elements` with a space between each, so several icons don't touch. */
  private static interleave(document: Document, elements: Element[]): Node[] {
    return elements.flatMap((element, index) => (index ? [document.createTextNode(" "), element] : [element]))
  }

  /** Sort key of an attribute:  `LEADING` ones first, in order, then the rest as they were. */
  private static rank(name: string): number {
    const index = SectionConverter.LEADING.indexOf(name)
    return index < 0 ? SectionConverter.LEADING.length : index
  }

  ////////////////
  // ## Constants
  ////////////////

  /**
   * The attributes every converted section gets:  a rule under every title, every section folds.
   * - static:  the same for every page
   */
  private static readonly SECTION_FLAGS = ["sticky", "collapsible", "dividing"]

  /**
   * Section attributes that come first, in this order, so plan phases read `id data-phase data-status header ...`.
   * - static:  the same for every page
   */
  private static readonly LEADING = ["data-phase", "data-status"]
}
