import { FIELD_ORDER, STATUS, TITLE_PREFIX, type Phase, type PhaseStatus } from "./planDoc.types"

import { PlanMarkup } from "./PlanMarkup"

/****************
 * ### `PlanSections`
 * A plan doc's sections and phase bodies, EITHER markup:  `<ui-section>` (since 2026-10-02), or the old
 * `section.s2|s3` > `ui-sticky` > `h2|h3` that docs not yet migrated still have.  Plus the bits of page markup
 * `PlanDoc` writes in more than one place:  a phase's status icon, the header's step label, the kickoff prompt.
 * - STATIC and instance-free on purpose:  each takes the element (or document) it reads or changes.
 * - From `packages/docs/tools/plan-doc.js`, "Sections, either markup" (epic `epic-components`, P7).
 ****************/
export class PlanSections {
  ////////////////
  // ## Sections
  ////////////////

  /**
   * The section titled `id`:  the `<ui-section id>` itself, else (old markup) the `section` around the heading `#id`;
   * `null` when there's none.
   */
  static sectionOf(document: Document, id: string): Element | null {
    const element = document.getElementById(id)
    if (!element) return null
    return element.localName === "ui-section" ? element : element.closest("section")
  }

  /** The old heading of `section.s2|s3` (`ui-sticky > h2|h3`), else null. */
  static oldHeading(section: Element): Element | null {
    return section.querySelector(":scope > ui-sticky > :is(h2, h3)")
  }

  /**
   * A section's title as text, whitespace collapsed, badges (`ui-label`) left out:  a `<ui-section>`'s `header`, else
   * its `slot="header"`;  an old section's h2 / h3.
   */
  static titleText(section: Element): string {
    const header = section.localName === "ui-section" ? section.getAttribute("header") : null
    const source =
      header === null
        ? section.localName === "ui-section"
          ? section.querySelector(':scope > [slot="header"]')
          : PlanSections.oldHeading(section)
        : null
    let value = header ?? ""
    if (source) {
      const clone = source.cloneNode(true) as Element
      for (const label of clone.querySelectorAll("ui-label")) label.remove()
      value = clone.textContent ?? ""
    }
    return value.replace(/\s+/g, " ").trim()
  }

  /**
   * Replace `pattern` in the title of `element`:  a `<ui-section>`'s `header` (else its `slot="header"`), an old
   * section's heading, or a plain h3 / h4;  returns the match, or `undefined` when the title doesn't match.
   */
  static replaceInTitle(element: Element, pattern: RegExp, replacement: string): RegExpMatchArray | undefined {
    if (element.localName === "ui-section") {
      const header = element.getAttribute("header")
      if (header === null)
        return PlanSections.replaceInHeading(element.querySelector(':scope > [slot="header"]'), pattern, replacement)
      const match = header.match(pattern)
      if (match) element.setAttribute("header", header.replace(pattern, replacement))
      return match ?? undefined
    }
    if (element.localName === "section")
      return PlanSections.replaceInHeading(PlanSections.oldHeading(element), pattern, replacement)
    return PlanSections.replaceInHeading(element, pattern, replacement)
  }

  /**
   * Replace `pattern` in the title of `element` (`replaceInTitle()`);  returns the number it replaced (`3` for
   * `3.`), or `undefined` when it didn't match.
   */
  static renumber(element: Element, pattern: RegExp, replacement: string): string | undefined {
    return PlanSections.replaceInTitle(element, pattern, replacement)?.[0].match(/\d+/)?.[0]
  }

  /**
   * Put `node` first in `section`'s content:  after its title -- a `<ui-section>`'s slotted children at its start
   * (icon, header), an old section's `ui-sticky`.
   */
  static prependContent(section: Element, node: Node): void {
    let title: Element | null = null
    for (const child of section.children) {
      if (!child.matches("ui-sticky, [slot]")) break
      title = child
    }
    const space = section.ownerDocument.createTextNode("\n")
    if (title) title.after(space, node)
    else section.prepend(space, node)
  }

  /** Fold or unfold a phase section in the markup:  `collapsed` (`<ui-section>`), `data-fold="closed"` (old). */
  static setFolded(section: Element, folded: boolean): void {
    if (section.localName === "ui-section") PlanMarkup.toggle(section, "collapsed", folded)
    else if (folded) section.setAttribute("data-fold", "closed")
    else section.removeAttribute("data-fold")
  }

  /** Is a phase section folded in the markup?  (`setFolded()`) */
  static isFolded(section: Element): boolean {
    return section.localName === "ui-section" ? section.hasAttribute("collapsed") : section.hasAttribute("data-fold")
  }

  ////////////////
  // ## Phases
  ////////////////

  /** `P2 · Short Name` -> `Short Name`. */
  static phaseName(label: string): string {
    return label.replace(/^\s*P\d+\s*·\s*/, "").trim()
  }

  /** A phase's status icon;  `slotted`:  a `<ui-section>`'s (`slot="icon"`). */
  static icon(status: PhaseStatus, slotted = false): string {
    const { icon: name, color } = STATUS[status]
    return `<ui-icon${slotted ? ' slot="icon"' : ""} name="${name}" color="${color}"></ui-icon>`
  }

  /** Phase `section`'s Estimate field (`ui-item[icon=clock]`, or an old doc's `li`), if any. */
  static estimateField(section: Element): Element | undefined {
    const body = section.querySelector(":scope > .plan-phase-body")
    return Array.from(body?.children ?? []).find((item) => /^Estimate:/.test(PlanSections.textOf(item).trim()))
  }

  /**
   * Phase `section`'s estimate, as text:  its title's badge, else (old docs) its field;  `undefined` while missing or
   * `TBD`.
   */
  static estimateText(section: Element): string | undefined {
    const badge = section.localName === "ui-section" ? section.getAttribute("badge") : null
    if (badge) return badge
    const field = PlanSections.estimateField(section)
    const value =
      field &&
      PlanSections.textOf(field)
        .trim()
        .replace(/^Estimate:\s*/, "")
    return value && value !== "TBD" ? value : undefined
  }

  /** Phase body `body`'s field `label` (`Goal`, `Done` ...:  the item whose text starts `Goal:`), if any. */
  static fieldOf(body: Element, label: string): Element | undefined {
    return Array.from(body.children).find((item) => PlanSections.textOf(item).trim().startsWith(`${label}:`))
  }

  /** Field `field` (an element, out of the doc), labelled `label`, into phase body `body` in its place (`FIELD_ORDER`). */
  static insertField(body: Element, label: string, field: Element): void {
    const later = FIELD_ORDER.slice(FIELD_ORDER.indexOf(label) + 1)
    const next = Array.from(body.children).find((item) =>
      later.some((other) => PlanSections.textOf(item).trim().startsWith(`${other}:`))
    )
    if (next) next.before(field)
    else body.append(field)
  }

  /** The header's step label for `phase`:  a link to it, `prefix` before its name. */
  static stepLabel(phase: Phase, color: string, glyph: string, prefix: string): string {
    // just `<icon> P4` (Owen, 2026-10-04);  the phase's name in the tooltip
    const tip = PlanMarkup.text(`${prefix}P${phase.n} · ${phase.name}`)
    return `<ui-label basic color="${color}" icon="${glyph}" href="#p${phase.n}" title="${tip}">P${phase.n}</ui-label>`
  }

  ////////////////
  // ## Title and prompt
  ////////////////

  /** A plan doc's title:  its h1's text, `TITLE_PREFIX` dropped;  `undefined` without an h1. */
  static docTitle(document: Document): string | undefined {
    const heading = document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim()
    if (heading === undefined) return undefined
    return heading.startsWith(TITLE_PREFIX) ? heading.slice(TITLE_PREFIX.length) : heading
  }

  /** A prompt's text as `<p>`s:  blank lines split paragraphs, single newlines become `<br>`;  "" for none. */
  static promptHTML(prompt: string | null | undefined): string {
    return String(prompt ?? "")
      .trim()
      .split(/\n\s*\n/)
      .filter((paragraph) => paragraph.trim())
      .map((paragraph) => `<p>${PlanMarkup.text(paragraph.trim()).replace(/\n/g, "<br>")}</p>`)
      .join("")
  }

  /**
   * The folded "Kickoff prompt" aside around a `blockquote.plan-prompt` holding `html`:  a styled accordion, as the
   * docs' asides (`spell-aside`), no `open`
   */
  static promptPanel(html: string): string {
    return (
      `<ui-accordion class="plan-prompt-panel spell-aside" styled><ui-title>Kickoff prompt</ui-title>` +
      `<ui-content><blockquote class="plan-prompt">${html}</blockquote></ui-content></ui-accordion>`
    )
  }

  ////////////////
  // ## Internal
  ////////////////

  /**
   * Replace `pattern` in the first non-blank text node of `heading` (after its icons);  returns the match, or
   * `undefined` when that text doesn't match.
   */
  private static replaceInHeading(
    heading: Element | null,
    pattern: RegExp,
    replacement: string
  ): RegExpMatchArray | undefined {
    if (!heading) return undefined
    const walker = heading.ownerDocument.createTreeWalker(heading, 4 /* NodeFilter.SHOW_TEXT */)
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent ?? ""
      if (!text.trim()) continue
      const match = text.match(pattern)
      if (!match) return undefined
      node.textContent = text.replace(pattern, replacement)
      return match
    }
    return undefined
  }

  /** `element`'s text:  never `null` for an element, whatever the DOM types say. */
  private static textOf(element: Element): string {
    return element.textContent ?? ""
  }
}
