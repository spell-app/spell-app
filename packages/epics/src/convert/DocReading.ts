import { ELEMENT_NODE, TEXT_NODE } from "$/epics/markup"

/****************
 * ### `DocReading`
 * What a reader of a plan doc gets from it, for `ConversionProof`:  its ids, its link targets, and its visible text,
 * word by word, in UNITS (an item, a phase, a section, the Overview, the page).
 * - A subclass knows one markup:  `OldReading` the old one (and which of its text is chrome the elements now draw),
 *   `NewReading` the `<epic-*>` markup (and which attributes the elements draw as text).
 * - The walk is shared, so both sides split words the SAME way:  adjacent text nodes join, an element's edge splits,
 *   whitespace is one space.
 * - Plain DOM, no globals:  linkedom documents.  Knows nothing of the converter:  it reads what's there.
 ****************/
export abstract class DocReading {
  /** Every id, minus the excluded. */
  readonly ids = new Set<string>()
  /** Every link target (`href`), plus the links the elements draw, minus the excluded. */
  readonly links = new Set<string>()
  /** Unit => its words, in document order. */
  readonly units = new Map<string, string[]>()
  /** What was left out of `ids`, with why. */
  readonly excludedIds: string[] = []
  /** What was left out of `links`, with why. */
  readonly excludedLinks: string[] = []

  /** Read `document`:  ids and links from the whole document, text from its `<main>`. */
  protected read(document: Document): this {
    for (const element of document.querySelectorAll("[id]")) {
      const why = this.idExclusion(element)
      if (why) this.excludedIds.push(`#${element.id} (${why})`)
      else this.ids.add(element.id)
    }
    for (const element of document.querySelectorAll("[href]")) {
      const href = element.getAttribute("href")!
      const why = this.linkExclusion(element)
      if (why) this.excludedLinks.push(`${href} (${why})`)
      else this.links.add(href)
    }
    for (const link of this.drawnLinks(document)) this.links.add(link)
    const main = document.querySelector("main")
    if (main) this.walk(main, DocReading.PAGE)
    return this
  }

  /** Every word in the doc, in order. */
  get words(): string[] {
    return [...this.units.values()].flat()
  }

  ////////////////
  // ## What a subclass says
  ////////////////

  /** The unit `element` starts, if it starts one (`q7`, `p2`, `overview`). */
  protected abstract unitOf(element: Element): string | undefined

  /**
   * How to read `element`:  its own pieces of text (drawn attributes), and whether to read its children, maybe with a
   * prefix stripped from their first text and a suffix from their last.  `undefined`:  read it as prose.
   */
  protected abstract readingOf(element: Element): ElementReading | undefined

  /** Why `element`'s id isn't compared;  `undefined`:  it is. */
  protected idExclusion(_element: Element): string | undefined {
    return undefined
  }

  /** Why `element`'s `href` isn't compared;  `undefined`:  it is. */
  protected linkExclusion(_element: Element): string | undefined {
    return undefined
  }

  /** Links the markup doesn't hold but its elements draw (a commit's GitHub link). */
  protected drawnLinks(_document: Document): string[] {
    return []
  }

  ////////////////
  // ## The walk
  ////////////////

  /** Read `element`'s children into `unit` (or the unit each starts). */
  private walk(element: Element, unit: string, strip: Strip = {}) {
    const children = Array.from(element.childNodes)
    let run = ""
    let first = true
    const flush = (isLast: boolean) => {
      // Whitespace (before a label) doesn't end the run a prefix starts:  it's kept for the next text
      if (!run.trim() && !isLast) return
      let text = run
      if (first && strip.first) text = text.replace(strip.first, "")
      if (isLast && strip.last) text = text.replace(strip.last, "")
      this.add(unit, text)
      first = false
      run = ""
    }
    children.forEach((child, index) => {
      if (child.nodeType === TEXT_NODE) {
        run += (child as Text).data
        if (index === children.length - 1) flush(true)
        return
      }
      flush(false)
      if (child.nodeType !== ELEMENT_NODE) return
      const childElement = child as Element
      const childUnit = this.unitOf(childElement) ?? unit
      const reading = this.readingOf(childElement) ?? DocReading.prose(childElement)
      for (const piece of reading.pieces ?? []) this.add(childUnit, piece)
      if (reading.children !== false) this.walk(childElement, childUnit, reading.children ?? {})
      // Chrome read as nothing (a label before the title) doesn't end the run the prefix starts
      if (reading.children !== false || reading.pieces?.length) first = false
    })
    flush(true)
  }

  /** Add `text`'s words to `unit`. */
  private add(unit: string, text: string | null | undefined) {
    const words = (text ?? "").split(/\s+/).filter(Boolean)
    if (!words.length) return
    const list = this.units.get(unit) ?? []
    list.push(...words)
    this.units.set(unit, list)
  }

  /**
   * How prose reads:  its text, and the attributes a `ui-*` element shows as text (`header`, `label`, `badge`).
   * - NOT `title` (a tooltip) or `data-*`.  Scripts, styles and templates aren't read.
   * - STATIC:  the same for every reading
   */
  protected static prose(element: Element): ElementReading {
    if (UNREAD.test(element.localName)) return { children: false }
    const pieces = SHOWN_ATTRIBUTES.map((name) => element.getAttribute(name) ?? "").filter(Boolean)
    return { pieces }
  }

  /** The unit outside every other:  the page header, the breadcrumb. */
  static readonly PAGE = "page"
}

/**
 * How `DocReading` reads one element (`readingOf()`).
 * - `pieces`:  text it shows that isn't in its children (a drawn attribute), read before them
 * - `children`:  `false` to skip them;  else how to read them (`Strip`)
 */
export type ElementReading = {
  pieces?: (string | null | undefined)[]
  children?: false | Strip
}

/** Chrome at the edges of an element's text:  stripped from its FIRST text run, and from its LAST. */
export type Strip = { first?: RegExp; last?: RegExp }

/** Attributes a `ui-*` element shows as text. */
const SHOWN_ATTRIBUTES = ["header", "label", "badge"]

/** Elements whose content is never visible text. */
const UNREAD = /^(script|style|template|ui-components)$/
