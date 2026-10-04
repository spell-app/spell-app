import { For, Show, createEffect, createMemo } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, proto, UIElement } from "$/ui/core"
import { SiteData } from "$/ui/docs-components/SiteData"
import type { SiteDataFile, SiteTag } from "$/ui/docs-components/docs-components.types"

import { docsApiVocabulary } from "./ui-docs-api.vocabulary.en"
import { DocsApiFallback } from "./ui-docs-api.fallback"
import { ApiModel } from "./ApiModel"
import { InlineCode } from "./InlineCode"
import {
  DEFAULT_LEVEL,
  MAX_LEVEL,
  MIN_LEVEL,
  RANGE_SEPARATOR,
  type ApiCell,
  type ApiItem,
  type ApiMessage,
  type ApiSection,
  type DocsApiVocabulary
} from "./ui-docs-api.types"

import apiCSS from "./ui-docs-api.css?inline"
import tableCSS from "$/ui/components/ui-table/ui-table.css?inline"

/****************
 * ### `<ui-docs-api>`
 * The API reference of a tag (`tag="ui-button"`), or of every tag of a family (`family="ui-button"`), as Fomantic
 * tables:  `<ui-table celled compact definition>` per section -- attributes, properties, events, slots, parts,
 * states, texts -- each under a `<ui-header>` title, only those the tag has.
 * - Data:  `components.json`, through `SiteData` (fetched once per page);  NEVER the vocabularies.  The tables'
 *   content is `ApiModel`'s, shared with the native fallback.
 * - `family`:  each tag in its own `<section part="tag">` under a `dividing` `<ui-header>` whose id is the tag, its
 *   text a link to itself:  an `<a>` INSIDE the heading, not `<ui-header href>` (its `<a role="heading">` fails axe:
 *   plan-doc gap).  Fragment links can't reach ids inside a shadow root, so the element scrolls to
 *   `location.hash` itself:  once its tables are drawn, and on every `hashchange` while connected.
 * - Descriptions:  `` `code` `` spans become `<code>` (`InlineCode`), as text nodes, never HTML.
 * - Values:  compact `<ui-labels size="mini">`;  hues painted in their own colour, a numeric run as one label.
 * - Phone width:  every table is `stackable` by its OWN width (`stack-by="container"`):  rows become blocks in a
 *   narrow column, whatever the viewport.
 * - Sheets:  `ui-table.css` is adopted HERE too:  `<ui-table>` styles its light-DOM `<table>` with a PAGE sheet,
 *   which never reaches a table inside this shadow root (plan-doc gap).
 * - A doc-only element (`src/docs-components/`):  its shadow composes other families' widgets, which its barrel
 *   imports.
 ****************/
export class UIDocsApi extends UIElement<DocsApiVocabulary> {
  @proto static vocabulary = docsApiVocabulary
  @proto static styles = { table: tableCSS, "docs-api": apiCSS }
  @proto static Fallback = DocsApiFallback
  @proto static delegatesFocus = false

  /** The site's data, once fetched. */
  readonly data = new Cell<SiteDataFile | undefined>(undefined)

  /** Why the data couldn't be fetched, if it couldn't. */
  readonly failure = new Cell<Error | undefined>(undefined)

  /** The fetch, started on first connect;  settles once `data` or `failure` is set. */
  readonly fetched: Promise<void> = isServer ? Promise.resolve() : this.fetch()

  /** `hashchange`:  scroll to the new hash, if it's one of this element's tag headers. */
  private readonly onHashChange = () => void this.reveal(location.hash)

  /** What to draw:  one entry per tag, with its tables;  `undefined` until the data is in. */
  readonly items = createMemo((): ApiItem[] | undefined => {
    const data = this.data.get()
    return data && UIDocsApi.itemsOf(data, this.attrs.tag, this.attrs.family)
  })

  /** The message to show instead of tables, if any:  a failed fetch, no `tag` / `family`, an unknown tag. */
  readonly message = createMemo((): ApiMessage | undefined => {
    const failure = this.failure.get()
    if (failure) return { state: "negative", key: "loadError", params: { error: failure.message } }
    const items = this.items()
    if (!items || items.length) return undefined
    const name = this.attrs.family || this.attrs.tag
    return name ? { state: "warning", key: "notFound", params: { tag: name } } : { state: "warning", key: "noTag" }
  })

  /** Heading level of the topmost headers, clamped. */
  readonly level = createMemo(() => {
    const level = Math.round(Number(this.attrs.level ?? DEFAULT_LEVEL))
    return Number.isFinite(level) ? Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, level)) : DEFAULT_LEVEL
  })

  protected override hostStates() {
    return { loading: !isServer && !this.data.get() && !this.failure.get(), error: !!this.message() }
  }

  /** Base `mount()`, plus the effects that announce the drawn tables and follow `location.hash`. */
  override mount(): JSX.Element {
    const content = super.mount()
    if (isServer) return content
    createEffect(
      () => (this.loaded() ? this.items() : undefined),
      (items) => {
        if (items?.length) this.drawn(items)
      }
    )
    createEffect(
      () => this.connected.get(),
      (connected) => {
        if (!connected) return undefined
        window.addEventListener("hashchange", this.onHashChange)
        return () => window.removeEventListener("hashchange", this.onHashChange)
      }
    )
    return content
  }

  render(): JSX.Element {
    return (
      <section class={this.classes()} part={this.part("api")}>
        <Show when={this.message()}>
          <ui-message part={this.part("message")} state={this.message()?.state} size="small">
            {this.inline(this.message() ? this.text(this.message()!.key, this.message()!.params) : "")}
          </ui-message>
        </Show>
        <For each={this.items() ?? []}>{(item) => this.renderItem(item)}</For>
      </section>
    )
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** One tag:  its tables, under its own header and summary with `family`. */
  private renderItem(item: ApiItem): JSX.Element {
    if (!item.grouped) return <For each={item.sections}>{(section) => this.renderSection(item, section)}</For>
    return (
      <section class="tag" part={this.part("tag")}>
        <ui-header part={this.part("header")} id={item.tag.tag} level={String(this.level())} dividing="">
          <a href={`#${item.tag.tag}`}>
            <code>{`<${item.tag.tag}>`}</code>
          </a>
        </ui-header>
        <Show when={item.tag.description}>
          <p class="description" part={this.part("description")}>
            {this.inline(item.tag.description ?? "")}
          </p>
        </Show>
        <For each={item.sections}>{(section) => this.renderSection(item, section)}</For>
      </section>
    )
  }

  /** One table:  its title (and note), then the `<ui-table>`. */
  private renderSection(item: ApiItem, section: ApiSection): JSX.Element {
    const tag = `<${item.tag.tag}>`
    return (
      <>
        <ui-header
          part={this.part("title")}
          level={String(item.grouped ? this.level() + 1 : this.level())}
          size="small"
        >
          {this.text(section.id)}
        </ui-header>
        <Show when={section.note}>
          <p class="note ui-muted" part={this.part("note")}>
            {this.inline(section.note ? this.text(section.note) : "")}
          </p>
        </Show>
        <ui-table part={this.part("table")} celled="" compact="" definition="" stackable="" stack-by="container">
          <table aria-label={this.text("tableLabel", { section: this.text(section.id), tag })}>
            <thead>
              <tr>
                <For each={section.columns}>{(column) => <th scope="col">{this.text(column)}</th>}</For>
              </tr>
            </thead>
            <tbody>
              <For each={section.rows}>
                {(row) => (
                  <tr>
                    <For each={row.cells}>{(cell) => this.renderCell(cell)}</For>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </ui-table>
      </>
    )
  }

  /** One cell:  a name as the row's `<th>`, prose with code spans, or values as labels. */
  private renderCell(cell: ApiCell): JSX.Element {
    if (cell.type === "name") {
      return (
        <th scope="row">
          {cell.code === undefined ? <em>{cell.label ? this.text(cell.label) : ""}</em> : <code>{cell.code}</code>}
          <For each={cell.notes}>
            {(note) => (
              <small class="ui-caption">
                {this.text(note.key)}
                <Show when={note.code !== undefined}>
                  {" "}
                  <code>{note.code}</code>
                </Show>
              </small>
            )}
          </For>
        </th>
      )
    }
    if (cell.type === "text") return <td>{this.inline(cell.text)}</td>
    const values = cell.range ? [`${cell.values[0]}${RANGE_SEPARATOR}${cell.values.at(-1)}`] : cell.values
    return (
      <td>
        <ui-labels size="mini">
          <For each={values}>
            {(value) => (
              <ui-label basic={cell.swatch ? undefined : ""} color={cell.swatch ? value : undefined}>
                {value}
              </ui-label>
            )}
          </For>
        </ui-labels>
        <Show when={cell.set}>
          <small class="ui-caption">
            {this.text("valueSet")} <code>{cell.set}</code>
          </small>
        </Show>
      </td>
    )
  }

  /** `text` with its `` `code` `` spans as `<code>`. */
  private inline(text: string): JSX.Element {
    return <For each={InlineCode.parse(text)}>{(piece) => (piece.code ? <code>{piece.text}</code> : piece.text)}</For>
  }

  ////////////////
  // ## Data and scrolling
  ////////////////

  /** Fetch the site's data into `data`, or the reason it failed into `failure`. */
  private fetch(): Promise<void> {
    return SiteData.load().then(
      (data) => this.data.set(data),
      (error: unknown) => this.failure.set(error instanceof Error ? error : new Error(String(error)))
    )
  }

  /** The tables are in the DOM:  announce them, then scroll to `location.hash` if it names one of them. */
  private drawn(items: readonly ApiItem[]) {
    this.emit("ui-render", { tags: items.map((item) => item.tag.tag) })
    void this.reveal(location.hash)
  }

  /**
   * Scroll the tag header `hash` names into view, if it's in this shadow root.
   * - Waits for the widgets in the shadow root to render first (`ready`):  until they do, the tables above it
   *   are still growing, and the scroll would land short.
   * - Scrolls the header's `<section>` when the header host draws no box of its own (`display: contents`).
   */
  private async reveal(hash: string): Promise<void> {
    const id = UIDocsApi.idOf(hash)
    const root = this.host.renderRoot
    const header = id ? (root as ShadowRoot).getElementById?.(id) : undefined
    if (!header) return
    const hosts = [...root.querySelectorAll("*")].filter((element) => "ready" in element)
    await Promise.all(hosts.map((element) => (element as Element & { ready: Promise<void> }).ready))
    requestAnimationFrame(() => (header.getClientRects().length ? header : header.parentElement)?.scrollIntoView())
  }

  /** The id a `location.hash` names, decoded;  `""` for none or a malformed one. */
  private static idOf(hash: string): string {
    try {
      return decodeURIComponent(hash.replace(/^#/, ""))
    } catch {
      return ""
    }
  }

  /**
   * What `tag` / `family` name in `data`:  a family's tags in its order (grouped, each with a header), else the one
   * tag (no header);  `[]` when neither is set or the data has no such tag.
   */
  private static itemsOf(data: SiteDataFile, tag: string | undefined, family: string | undefined): ApiItem[] {
    if (family) {
      const tags = SiteData.family(data, family)?.tags ?? []
      return tags
        .map((name) => SiteData.tag(data, name))
        .filter((entry): entry is SiteTag => !!entry)
        .map((entry) => ({ tag: entry, grouped: true, sections: ApiModel.sections(entry) }))
    }
    const entry = tag ? SiteData.tag(data, tag) : undefined
    return entry ? [{ tag: entry, grouped: false, sections: ApiModel.sections(entry) }] : []
  }
}
