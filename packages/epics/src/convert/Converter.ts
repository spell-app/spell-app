import { parseHTML } from "linkedom"

import { SectionIds, type EpicData, type EpicTag, type ItemSectionKind } from "$/epics/definitions"
import { Markup, type MarkupContent, type MarkupProblem } from "$/epics/markup"
import { PART_EXT, PARTS_DIR, PlanParts, type PartReader } from "$/epics/tool/PlanParts"
import { PlanMarkup } from "$/epics/tool/PlanMarkup"

import { ConvertError, OLD_LAYOUTS, type Conversion } from "./convert.types"

import { CardConverter } from "./CardConverter"
import { ConversionProof } from "./ConversionProof"
import { escapeAmpersands, isBlank } from "./domEdits"
import { EpicParts } from "./EpicParts"
import { ItemConverter } from "./ItemConverter"
import { LogConverter } from "./LogConverter"
import { PageConverter } from "./PageConverter"
import { PhaseConverter } from "./PhaseConverter"

/****************
 * ### `Converter`
 * Converts ONE plan doc from today's markup (`ui-section`s, `ui-item[data-status]`, any generation still in use) to
 * `<epic-*>` markup, and proves it lost nothing.
 * - in:  the doc as it is on disk, split (a skeleton plus `parts/<id>.htm`) or one file;  assembled first
 *   (`PlanParts.assemble()`)
 * - out:  the same doc in `<epic-*>` markup, split again (`EpicParts`), each file formatted as `vp fmt` would;  its
 *   `Markup.validate()` problems (none allowed) and its `ConversionProof`
 * - every `<epic-*>` element is made through `Markup` (`element()`):  the definitions check each attribute
 * - by concern, one helper class each:  the page and Overview (`PageConverter`), phases (`PhaseConverter`), items
 *   (`ItemConverter`), an item's cards -- choices, answer, replies, Original Discussion, commits (`CardConverter`),
 *   the log (`LogConverter`).  They work on this one's `document`, IN PLACE:  prose nodes MOVE into the new elements,
 *   never re-made, so what's inside is exactly what was there.
 * - Node only (linkedom, oxfmt through `PlanParts.formatHTML()`);  no files:  `ConvertRun` reads and writes them.
 ****************/
export class Converter {
  /** The epic's name:  its folder in `epics/`. */
  readonly name: string
  /** The working document:  the old doc, assembled, made over into the new one IN PLACE. */
  readonly document: Document
  /** What the converter did that a reader should know about. */
  readonly notes: string[] = []
  /** Was the input split? */
  readonly wasSplit: boolean

  /** The old doc as it was, assembled:  the proof's `before`. */
  private readonly before: Document

  /** The helpers, one per concern:  each works on `document` through this. */
  readonly page = new PageConverter(this)
  readonly phases = new PhaseConverter(this)
  readonly items = new ItemConverter(this)
  readonly cards = new CardConverter(this)
  readonly log = new LogConverter(this)

  constructor({ name, skeleton, readPart = () => undefined }: ConverterProps) {
    this.name = name
    const before = Converter.assembled(skeleton, readPart)
    this.before = before.document
    this.wasSplit = before.split
    this.document = Converter.assembled(skeleton, readPart).document
    for (const id of before.missing) this.note(`part \`parts/${id}${PART_EXT}\` is missing:  its host converts empty`)
  }

  /**
   * Convert the doc:  the new markup, validated, split, formatted, and proved against the old.
   * - throws `ConvertError` for markup it can't place (`OLD_LAYOUTS`, an unknown structure)
   */
  async convert(): Promise<Conversion> {
    this.convertMarkup()
    const problems = Markup.validate(this.document).map(describeProblem)
    const docName = `${this.name}.plan.html`
    escapeAmpersands(this.document)
    const rawParts = new EpicParts(this.document).split({ docName })
    const skeleton = await PlanParts.formatHTML(docName, PlanMarkup.serialize(this.document))
    const parts = new Map<string, string>()
    for (const [id, text] of rawParts) parts.set(id, await PlanParts.formatHTML(`${PARTS_DIR}/${id}${PART_EXT}`, text))
    const after = Converter.reassembled(skeleton, parts, problems)
    const proof = new ConversionProof({ before: this.before, after }).report
    return {
      name: this.name,
      skeleton,
      parts,
      notes: this.notes,
      problems: [...new Set(problems)],
      proof,
      wasSplit: this.wasSplit
    }
  }

  ////////////////
  // ## For the helpers
  ////////////////

  /**
   * A new `<tag>` from `data` and `children`, through `Markup.element()`.
   * - throws `ConvertError` naming `source` (the old element it's made from) when the definitions refuse the data
   */
  element<T extends EpicTag>(tag: T, data: EpicData<T>, children: MarkupContent, source?: Element): Element {
    try {
      return Markup.element(this.document, tag, data, children)
    } catch (error) {
      throw this.error((error as Error).message, source)
    }
  }

  /** Note what the converter did that a reader should know (text moved, markup kept as it was). */
  note(message: string): void {
    this.notes.push(message)
  }

  /** A `ConvertError` about `element`, in this doc. */
  error(message: string, element?: Element): ConvertError {
    const where = element ? describe(element) : undefined
    return new ConvertError(`${this.name}:  ${message}${where ? `  (at ${where})` : ""}`, {
      cause: { doc: this.name, where }
    })
  }

  ////////////////
  // ## The conversion
  ////////////////

  /** Make the working document over into `<epic-*>` markup, IN PLACE. */
  private convertMarkup() {
    const { document } = this
    const old = document.querySelector(OLD_LAYOUTS)
    if (old)
      throw this.error(`a layout from before 2026-10-02:  run \`spell dev plan-doc migrate ${this.name}\` first`, old)
    const main = document.querySelector("main")
    if (!main) throw this.error("no <main>")
    const page = this.page.convert(main)
    for (const section of Array.from(main.children)) {
      if (section.localName !== "ui-section") continue
      const made = this.section(section)
      if (made) {
        page.append(made)
        section.remove()
        continue
      }
      // Where it stood:  before the page's sections, or after
      const before = !page.children.length || page.children.length === page.querySelectorAll(":scope > [slot]").length
      if (before) page.before(section)
      else main.append(section)
      this.note(
        `#${section.id || "(no id)"} has no place in <epic-page>:  kept ${before ? "before" : "after"} it, as it was`
      )
    }
    for (const node of Array.from(main.childNodes)) if (isBlank(node)) node.remove()
    this.page.wrapBody()
  }

  /** The `<epic-*>` for one of `main`'s sections;  `undefined` for a section the page has no place for. */
  private section(section: Element): Element | undefined {
    const id = section.id
    if (id === "overview") return this.page.overview(section)
    if (id === SectionIds.phases) return this.phases.section(section)
    if (id === SectionIds.log) return this.log.section(section)
    const kind = ITEM_KINDS.find((it) => SectionIds[it] === id)
    return kind ? this.items.section(section, kind) : undefined
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** `skeleton` parsed, its parts put back (`PlanParts.assemble()`). */
  private static assembled(skeleton: string, readPart: PartReader) {
    const document = parseHTML(skeleton).document as unknown as Document
    const { split, missing } = new PlanParts(document).assemble(readPart)
    return { document, split, missing }
  }

  /**
   * The written files read back:  the skeleton parsed, checked, its parts checked as their hosts' children and put
   * back.  Adds what `Markup.validate()` finds to `problems`.
   * - STATIC:  reads strings, as a reader of the files would
   */
  private static reassembled(skeleton: string, parts: Map<string, string>, problems: string[]): Document {
    const document = parseHTML(skeleton).document as unknown as Document
    problems.push(...Markup.validate(document).map(describeProblem))
    for (const [id, text] of parts) {
      const host = document.getElementById(id)
      if (!host) {
        problems.push(`parts/${id}${PART_EXT}:  no host #${id} in the skeleton`)
        continue
      }
      const fragment = parseHTML(`<template>${text}</template>`).document.querySelector("template")!
        .content as unknown as DocumentFragment
      problems.push(
        ...Markup.validate(fragment, { as: host }).map((it) => `parts/${id}${PART_EXT}:  ${describeProblem(it)}`)
      )
    }
    const missing = new EpicParts(document).assemble((id) => parts.get(id))
    for (const id of missing) problems.push(`#${id}'s part is missing`)
    problems.push(...Markup.validate(document).map(describeProblem))
    return document
  }
}

/** `Converter`'s props:  the doc as read from disk. */
export type ConverterProps = {
  /** The epic's name. */
  name: string
  /** The doc's HTML:  the skeleton of a split doc, or the whole one-file doc. */
  skeleton: string
  /** Its part files, by id;  none for a one-file doc. */
  readPart?: PartReader
}

/** The sections of items, in page order. */
const ITEM_KINDS: ItemSectionKind[] = ["questions", "judgements", "caveats", "todos", "issues", "tests"]

/** A validation problem, one line. */
function describeProblem(problem: MarkupProblem): string {
  return `${problem.kind}:  ${problem.where} ${problem.message}`
}

/** `element` in a few words:  `<ui-section id="phases">`. */
function describe(element: Element): string {
  const key = ["id", "class", "header"].find((name) => element.hasAttribute(name))
  return key ? `<${element.localName} ${key}="${element.getAttribute(key)}">` : `<${element.localName}>`
}
