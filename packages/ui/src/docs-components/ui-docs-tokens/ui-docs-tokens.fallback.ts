import { NativeFallback, proto } from "$/ui/core"
import { SiteData } from "$/ui/docs-components/SiteData"
import type { SiteDataFile, SiteToken } from "$/ui/docs-components/docs-components.types"

import { docsTokensVocabulary } from "./ui-docs-tokens.vocabulary.en"
import { TokenRows } from "./TokenRows"
import {
  CODE_SPAN,
  DEFAULT_LEVEL,
  MAX_LEVEL,
  MIN_LEVEL,
  type DocsTokensTextKey,
  type TokenTable
} from "./ui-docs-tokens.types"

/****************
 * ### `DocsTokensFallback`
 * `<section part="tokens" class="ui ... tokens">` holding, once the data is in, the same rows as the element
 * (`TokenRows`) as plain native `<table>`s:  with `global`, each under an `<hN part="header">` and its description.
 * With `playground`, the preview (default slot) above them, without inputs.
 * - Native elements only:  no widgets, no Fomantic table look;  a colour's swatch is a `<span>` painted with
 *   `background: var(<token>, <default>)`, live like the element's.
 * - English only:  the texts are read straight from the vocabulary (no `UI.i18n`).
 ****************/
export class DocsTokensFallback extends NativeFallback<typeof docsTokensVocabulary> {
  @proto static vocabulary = docsTokensVocabulary
  @proto static degraded = [
    "plain native tables:  no Fomantic look, no stacking at phone width",
    "no filter input",
    "the playground shows its preview, but no inputs and no reset",
    "English texts only"
  ]

  /** The `<section>` the tables go into, once the data arrives. */
  private section: HTMLElement | undefined

  protected override build() {
    this.section = this.decorate(this.create("section", { class: this.classes() }), "tokens")
    if (this.flag("playground")) this.section.append(this.decorate(this.create("div", {}, this.slot()), "preview"))
    return [this.section]
  }

  /** Fetch the data, then fill the section;  a failure shows as a paragraph. */
  protected override attached() {
    SiteData.load().then(
      (data) => this.fill(data),
      (error: unknown) => this.say("loadError", { error: error instanceof Error ? error.message : String(error) })
    )
  }

  /** The tables, or the message `TokenRows` gives instead. */
  private fill(data: SiteDataFile) {
    const view = TokenRows.view(
      data,
      {
        family: this.attr("family") ?? undefined,
        tag: this.attr("tag") ?? undefined,
        global: this.flag("global"),
        groups: this.attr("groups") ?? undefined,
        tokens: this.attr("tokens") ?? undefined
      },
      (key, params) => this.text(key, params)
    )
    if (view.kind === "message") {
      this.section?.append(this.message(view.text))
      return
    }
    const level = Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Number(this.attr("level")) || DEFAULT_LEVEL))
    for (const table of view.tables) this.section?.append(...this.group(table, level))
  }

  /** One table, under its header and description when it's a foundation group. */
  private group(table: TokenTable, level: number): Node[] {
    const caption = table.title ?? this.attr("caption")
    const head = this.create(
      "thead",
      {},
      this.create(
        "tr",
        {},
        ...(["token", "default", "description"] as const).map((key) =>
          this.create("th", { scope: "col" }, this.text(key))
        )
      )
    )
    const body = this.create("tbody", {}, ...table.rows.map((row) => this.row(row)))
    const grid = this.decorate(
      this.create("table", {}, ...(caption ? [this.create("caption", {}, caption)] : []), head, body),
      "table"
    )
    if (!table.title) return [grid]
    const header = this.decorate(this.create(`h${level}` as "h3", {}, table.title), "header")
    const description = table.description
      ? [this.decorate(this.create("p", {}, ...this.inline(table.description)), "description")]
      : []
    return [this.decorate(this.create("section", {}, header, ...description, grid), "group")]
  }

  /** One token's row:  name, default (a swatch first for a colour), description. */
  private row(row: SiteToken): HTMLElement {
    const swatch = this.create("span", { "aria-hidden": "true" })
    swatch.style.cssText =
      "display: inline-block; width: 1em; height: 1em; margin-inline-end: 0.5em; vertical-align: middle; " +
      "border-radius: 50%; box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.25)"
    swatch.style.background = this.flag("global") ? `var(${row.name})` : `var(${row.name}, ${row.default})`
    const value = [
      ...(row.type === "color" ? [this.decorate(swatch, "swatch")] : []),
      this.create("code", {}, row.default)
    ]
    return this.create(
      "tr",
      {},
      this.create("th", { scope: "row" }, this.create("code", {}, row.name)),
      this.create("td", {}, ...value),
      this.create("td", {}, ...this.inline(row.description ?? ""))
    )
  }

  /** A message paragraph in place of the tables. */
  private say(key: DocsTokensTextKey, params: Record<string, string> = {}) {
    this.section?.append(this.message(this.text(key, params)))
  }

  /** A message paragraph. */
  private message(text: string): HTMLElement {
    return this.decorate(this.create("p", {}, text), "message")
  }

  /** `text` with its backticked spans as `<code>`. */
  private inline(text: string): (string | HTMLElement)[] {
    return text.split(CODE_SPAN).map((piece, index) => (index % 2 ? this.create("code", {}, piece) : piece))
  }

  /** The vocabulary's English text for `key`, `{name}`s filled from `params`. */
  private text(key: DocsTokensTextKey, params: Record<string, string> = {}): string {
    const text = docsTokensVocabulary.texts.find((entry) => entry.key === key)?.text ?? key
    return text.replace(/\{(\w+)\}/g, (match, name: string) => params[name] ?? match)
  }
}
