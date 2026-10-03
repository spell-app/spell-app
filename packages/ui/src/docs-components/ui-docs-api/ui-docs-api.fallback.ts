import { NativeFallback, proto } from "$/ui/core"
import { SiteData } from "$/ui/docs-components/SiteData"
import type { SiteDataFile } from "$/ui/docs-components/docs-components.types"

import { docsApiVocabulary } from "./ui-docs-api.vocabulary.en"
import { ApiModel } from "./ApiModel"
import { InlineCode } from "./InlineCode"
import {
  DEFAULT_LEVEL,
  MAX_LEVEL,
  MIN_LEVEL,
  RANGE_SEPARATOR,
  type ApiCell,
  type ApiSection,
  type DocsApiTextKey
} from "./ui-docs-api.types"

/****************
 * ### `DocsApiFallback`
 * `<section part="api" class="ui api">` holding, once the data is in, the same tables as the element (`ApiModel`),
 * as plain native `<table>`s:  per tag with `family`, an `<hN id="<tag>" part="header">` first.
 * - Native elements only:  no widgets, no Fomantic table look, values as comma-separated `<code>`s.
 * - English only:  the texts are read straight from the vocabulary (no `UI.i18n`).
 ****************/
export class DocsApiFallback extends NativeFallback<typeof docsApiVocabulary> {
  @proto static vocabulary = docsApiVocabulary
  @proto static degraded = [
    "plain native tables:  no Fomantic look, no stacking at phone width",
    "values as plain code, no labels or colour swatches",
    "English texts only",
    "no scrolling to `location.hash`"
  ]

  /** The `<section>` the tables go into, once the data arrives. */
  private section: HTMLElement | undefined

  protected override build() {
    this.section = this.decorate(this.create("section", { class: this.classes() }), "api")
    return [this.section]
  }

  /** Fetch the data, then fill the section;  a failure shows as a paragraph. */
  protected override attached() {
    SiteData.load().then(
      (data) => this.fill(data),
      (error: unknown) => this.say("loadError", { error: error instanceof Error ? error.message : String(error) })
    )
  }

  /** The tables for `tag` / `family`, or a message when there are none. */
  private fill(data: SiteDataFile) {
    const family = this.attr("family")
    const name = family || this.attr("tag")
    const tags = family
      ? (SiteData.family(data, family)?.tags ?? []).flatMap((tag) => SiteData.tag(data, tag) ?? [])
      : [SiteData.tag(data, name ?? "")].flatMap((entry) => entry ?? [])
    if (!name) return this.say("noTag")
    if (!tags.length) return this.say("notFound", { tag: name })
    const level = Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Number(this.attr("level")) || DEFAULT_LEVEL))
    for (const tag of tags) {
      if (family) {
        const header = this.create(`h${level}` as "h3", { id: tag.tag }, this.code(`<${tag.tag}>`))
        this.section!.append(this.decorate(header, "header"))
        if (tag.description) this.section!.append(this.create("p", {}, ...this.inline(tag.description)))
      }
      for (const section of ApiModel.sections(tag)) this.section!.append(...this.table(section, tag.tag))
    }
  }

  /** One section:  a caption-titled `<table>`. */
  private table(section: ApiSection, tag: string): Node[] {
    const caption = this.create("caption", {}, this.text(section.id))
    const head = this.create(
      "thead",
      {},
      this.create("tr", {}, ...section.columns.map((column) => this.create("th", { scope: "col" }, this.text(column))))
    )
    const rows = section.rows.map((row) => this.create("tr", {}, ...row.cells.map((cell) => this.cell(cell))))
    const table = this.create("table", { "aria-label": `${this.text(section.id)} of <${tag}>` }, caption, head)
    table.append(this.create("tbody", {}, ...rows))
    return [this.decorate(table, "table")]
  }

  /** One cell, as plain text and `<code>`. */
  private cell(cell: ApiCell): HTMLElement {
    if (cell.type === "name") {
      const name = cell.code === undefined ? this.text(cell.label ?? "defaultSlot") : this.code(cell.code)
      const notes = cell.notes.map((note) => ` (${this.text(note.key)}${note.code ? ` ${note.code}` : ""})`)
      return this.create("th", { scope: "row" }, name, ...notes)
    }
    if (cell.type === "text") return this.create("td", {}, ...this.inline(cell.text))
    const values = cell.range ? [`${cell.values[0]}${RANGE_SEPARATOR}${cell.values.at(-1)}`] : cell.values
    return this.create("td", {}, ...values.flatMap((value, index) => [...(index ? [", "] : []), this.code(value)]))
  }

  /** A message paragraph in place of the tables. */
  private say(key: DocsApiTextKey, params: Record<string, string> = {}) {
    this.section?.append(this.decorate(this.create("p", {}, ...this.inline(this.text(key, params))), "message"))
  }

  /** `text` with its code spans as `<code>`. */
  private inline(text: string): (string | HTMLElement)[] {
    return InlineCode.parse(text).map((piece) => (piece.code ? this.code(piece.text) : piece.text))
  }

  /** `<code>text</code>`. */
  private code(text: string): HTMLElement {
    return this.create("code", {}, text)
  }

  /** The vocabulary's English text for `key`, `{name}`s filled from `params`. */
  private text(key: DocsApiTextKey, params: Record<string, string> = {}): string {
    const text = docsApiVocabulary.texts.find((entry) => entry.key === key)?.text ?? key
    return text.replace(/\{(\w+)\}/g, (match, name: string) => params[name] ?? match)
  }
}
