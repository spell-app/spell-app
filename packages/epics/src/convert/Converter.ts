import { parseHTML } from "linkedom"

import { SectionIds, type ItemSectionKind } from "$/epics/definitions"
import { PART_EXT, type PartReader } from "$/epics/tool/PlanParts"
import { PlanMarkup } from "$/epics/tool/PlanMarkup"

import { OLD_LAYOUTS, type Conversion } from "./convert.types"

import { CardConverter } from "./CardConverter"
import { ConversionProof } from "./ConversionProof"
import { DocPass } from "./DocPass"
import { ItemConverter } from "./ItemConverter"
import { LogConverter } from "./LogConverter"
import { OldParts } from "./OldParts"
import { PageConverter } from "./PageConverter"
import { PhaseConverter } from "./PhaseConverter"

/****************
 * ### `Converter`
 * The FIRST pass:  converts ONE plan doc from the old markup (`ui-section`s, `ui-item[data-status]`, any generation
 * still in use) to `<epic-*>` markup, and proves it lost nothing.
 * - in:  the doc as it is on disk, split (a skeleton plus `parts/<id>.html`) or one file;  assembled first
 *   (`OldParts`)
 * - out:  the same doc in `<epic-*>` markup, split again (`EpicParts`), each file formatted as `vp fmt` would;  its
 *   `Markup.validate()` problems (none allowed) and its `ConversionProof` (`DocPass`)
 * - by concern, one helper class each:  the page and Overview (`PageConverter`), phases (`PhaseConverter`), items
 *   (`ItemConverter`), an item's cards -- choices, answer, replies, Original Discussion, commits (`CardConverter`),
 *   the log (`LogConverter`).  They work on this one's `document`, IN PLACE:  prose nodes MOVE into the new elements,
 *   never re-made, so what's inside is exactly what was there.
 * - its output is a CONVERTED doc, which the second pass (`Upgrader`) takes on to P14's elements
 ****************/
export class Converter extends DocPass {
  /** The helpers, one per concern:  each works on `document` through this. */
  readonly page = new PageConverter(this)
  readonly phases = new PhaseConverter(this)
  readonly items = new ItemConverter(this)
  readonly cards = new CardConverter(this)
  readonly log = new LogConverter(this)

  constructor({ name, skeleton, readPart = () => undefined }: ConverterProps) {
    const before = Converter.assembled(skeleton, readPart)
    super({
      name,
      before: before.document,
      document: Converter.assembled(skeleton, readPart).document,
      wasSplit: before.split
    })
    for (const id of before.missing) this.note(`part \`parts/${id}${PART_EXT}\` is missing:  its host converts empty`)
  }

  /**
   * Convert the doc:  the new markup, validated, split, formatted, and proved against the old.
   * - throws `ConvertError` for markup it can't place (`OLD_LAYOUTS`, an unknown structure)
   */
  async convert(): Promise<Conversion> {
    this.convertMarkup()
    const { skeleton, parts, problems, after } = await this.output()
    const proof = new ConversionProof({ before: this.before, after }).report
    const { name, notes, wasSplit } = this
    return { name, skeleton, parts, notes, problems, proof, wasSplit, pass: 1, counts: {} }
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
    for (const node of Array.from(main.childNodes)) if (PlanMarkup.isBlank(node)) node.remove()
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

  /** `skeleton` parsed, its parts put back (`OldParts`). */
  private static assembled(skeleton: string, readPart: PartReader) {
    const document = parseHTML(skeleton).document as unknown as Document
    const { split, missing } = new OldParts(document).assemble(readPart)
    return { document, split, missing }
  }
}

/** `Converter`'s props (and `Upgrader`'s):  the doc as read from disk. */
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
