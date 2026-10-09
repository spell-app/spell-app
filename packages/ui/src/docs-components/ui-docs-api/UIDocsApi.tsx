import { For, Show } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import {
  HeadingLevels,
  type HeadingBounds,
  type SiteDataFile,
  type SiteTag
} from "$/ui/docs-components/docs-components.types"
import { SiteData } from "$/ui/docs-components/SiteData"
import { ApiModel } from "./ApiModel"
import { InlineCode } from "./InlineCode"
import { type ApiCell, type ApiItem, type ApiMessage, type ApiSection, type DocsApiVocabulary } from "./UIDocsApi.types"
import { docsApiVocabulary } from "./UIDocsApi.en"

import tableCSS from "$/ui/components/ui-table/UITable.css?inline"
import apiCSS from "./UIDocsApi.css?inline"

/****************
 * ### `UIDocsApi`
 * The component behind `<ui-docs-api>`:  the API reference of a tag (`tag="ui-button"`),
 * or of every tag of a family (`family="ui-button"`), as Fomantic tables.
 *
 * - One `<ui-table celled compact definition>` per section (attributes, properties, events, slots, parts, states,
 *   texts), each under a `<ui-header>` title;  only the sections the tag has.
 * - Data:  `components.json`, through `SiteData` (fetched once per page);  NEVER the vocabularies.
 *   What the tables hold comes from `ApiModel`.
 * - `family`:  each tag in its own `<section part="tag">`, under a `dividing` `<ui-header>`
 *   whose id is the tag and whose text links to itself.
 *   - The link is an `<a>` INSIDE the heading, not `<ui-header href>` (its `<a role="heading">` fails axe).
 *   - Fragment links can't reach ids inside a shadow root, so the component scrolls to `location.hash` itself:
 *     once its tables are drawn, and on every `hashchange` while connected.
 * - Descriptions:  `` `code` `` spans become `<code>` (`InlineCode`), as text nodes, never HTML.
 * - Values:  compact `<ui-labels size="mini">`;  hues painted in their own colour, a numeric run as one label.
 * - Phone width:  every table is `stackable` by its OWN width (`stack-by="container"`):
 *   rows become blocks in a narrow column, whatever the viewport.
 * - Sheets:  `UITable.css` is adopted HERE too:  `<ui-table>` styles its light-DOM `<table>` with a PAGE sheet,
 *   which never reaches a table inside this shadow root.
 * - A doc-only element (`src/docs-components/`):  its shadow DOM is built of other families' widgets,
 *   which its barrel imports.
 ****************/
export class UIDocsApi extends E.UIComponent<DocsApiVocabulary> {
  @E.proto static vocabulary = docsApiVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { table: tableCSS, "docs-api": apiCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## The data
  ////////////////

  /** The site's data, once fetched. */
  @E.state accessor siteData: SiteDataFile | undefined = undefined

  /** Why the data couldn't be fetched, if it couldn't. */
  @E.state accessor loadError: Error | undefined = undefined

  /** The fetch, started on first connect;  settles once `siteData` or `loadError` is set. */
  readonly fetched: Promise<void> = isServer ? Promise.resolve() : this.fetch()

  /** Waiting for the data (never in a server render:  nothing loads). */
  @E.cssState("loading")
  get isLoading(): boolean {
    return !isServer && !this.siteData && !this.loadError
  }

  /** Fetch the site's data into `siteData`, or the reason it failed into `loadError`. */
  private fetch(): Promise<void> {
    return SiteData.load().then(
      (data) => void (this.siteData = data),
      (error: unknown) => void (this.loadError = error instanceof Error ? error : new Error(String(error)))
    )
  }

  ////////////////
  // ## What to draw
  ////////////////

  /** What to draw:  one entry per tag, with its tables;  `undefined` until the data is in. */
  @E.derived
  get items(): ApiItem[] | undefined {
    const data = this.siteData
    return data && UIDocsApi.itemsFor(data, { tag: this.tag, family: this.family })
  }

  /** The message to show instead of tables, if any:  a failed fetch, no `tag` / `family`, an unknown tag. */
  get message(): ApiMessage | undefined {
    const failure = this.loadError
    if (failure) return { state: NEGATIVE, key: "loadError", params: { error: failure.message } }
    const items = this.items
    if (!items || items.length) return undefined
    const name = this.family || this.tag
    return name ? { state: WARNING, key: "notFound", params: { tag: name } } : { state: WARNING, key: "noTag" }
  }

  /** Shows a message:  any (an unknown tag too), not only a failed fetch. */
  @E.cssState("error")
  get hasMessage(): boolean {
    return !!this.message
  }

  /** Heading level of the topmost headers, clamped. */
  get headingLevel(): number {
    return HeadingLevels.levelFor(this.level, LEVELS)
  }

  /** Drawn (`isReady`) with tables:  announce them, and scroll to `location.hash` if it names one of them. */
  @E.onChange("isReady", "items")
  protected onItemsChanged(isReady: boolean, items: ApiItem[] | undefined) {
    if (isReady && items?.length) this.onTablesDrawn(items)
  }

  /** The tables are in the DOM:  announce them, then scroll to `location.hash` if it names one of them. */
  private onTablesDrawn(items: readonly ApiItem[]) {
    this.send("ui-render", { tags: items.map((item) => item.tag.tag) })
    void this.reveal(location.hash)
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <section class={this.rootClass} part={this.partForName("api")}>
        <Show when={this.message}>
          {(message) => (
            <ui-message part={this.partForName("message")} state={message().state} size={SMALL}>
              {this.inline(this.translationForKey(message().key, message().params))}
            </ui-message>
          )}
        </Show>
        <For each={this.items ?? []}>{(item) => this.item(item)}</For>
      </section>
    )
  }

  /** One tag:  its tables, under its own header and summary with `family`. */
  private item(item: ApiItem): JSX.Element {
    if (!item.isGrouped) return <For each={item.sections}>{(section) => this.table(item, section)}</For>
    return (
      <section class={TAG_CLASS} part={this.partForName("tag")}>
        <ui-header part={this.partForName("header")} id={item.tag.tag} level={String(this.headingLevel)} dividing="">
          <a href={`#${item.tag.tag}`}>
            <code>{`<${item.tag.tag}>`}</code>
          </a>
        </ui-header>
        <Show when={item.tag.description}>
          <p class={UIT.DESCRIPTION} part={this.partForName("description")}>
            {this.inline(item.tag.description ?? "")}
          </p>
        </Show>
        <For each={item.sections}>{(section) => this.table(item, section)}</For>
      </section>
    )
  }

  /** One table:  its title (and note), then the `<ui-table>`. */
  private table(item: ApiItem, section: ApiSection): JSX.Element {
    const tag = `<${item.tag.tag}>`
    return (
      <>
        <ui-header
          part={this.partForName("title")}
          level={String(item.isGrouped ? this.headingLevel + 1 : this.headingLevel)}
          size={SMALL}
        >
          {this.translationForKey(section.id)}
        </ui-header>
        <Show when={section.note}>
          <p class={NOTE_CLASS} part={this.partForName("note")}>
            {this.inline(section.note ? this.translationForKey(section.note) : "")}
          </p>
        </Show>
        <ui-table part={this.partForName("table")} celled="" compact="" definition="" stackable="" stack-by="container">
          <table
            aria-label={this.translationForKey("tableLabel", { section: this.translationForKey(section.id), tag })}
          >
            <thead>
              <tr>
                <For each={section.columns}>{(column) => <th scope="col">{this.translationForKey(column)}</th>}</For>
              </tr>
            </thead>
            <tbody>
              <For each={section.rows}>
                {(row) => (
                  <tr>
                    <For each={row.cells}>{(cell) => this.cell(cell)}</For>
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
  private cell(cell: ApiCell): JSX.Element {
    if (cell.type === "name") {
      return (
        <th scope="row">
          {cell.code === undefined ? (
            <em>{cell.label ? this.translationForKey(cell.label) : ""}</em>
          ) : (
            <code>{cell.code}</code>
          )}
          <For each={cell.notes}>
            {(note) => (
              <small class={CAPTION_CLASS}>
                {this.translationForKey(note.key)}
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
    return (
      <td>
        <ui-labels size="mini">
          <For each={ApiModel.labelsFor(cell)}>
            {(value) => (
              <ui-label basic={cell.isSwatch ? undefined : ""} color={cell.isSwatch ? value : undefined}>
                {value}
              </ui-label>
            )}
          </For>
        </ui-labels>
        <Show when={cell.set}>
          <small class={CAPTION_CLASS}>
            {this.translationForKey("valueSet")} <code>{cell.set}</code>
          </small>
        </Show>
      </td>
    )
  }

  /** `text` with its `` `code` `` spans as `<code>`. */
  private inline(text: string): JSX.Element {
    return <For each={InlineCode.parse(text)}>{(piece) => (piece.isCode ? <code>{piece.text}</code> : piece.text)}</For>
  }

  ////////////////
  // ## Scrolling to the hash
  ////////////////

  /** While connected:  follow `hashchange`. */
  @E.onChange("isConnected")
  protected onConnectedChanged(isConnected: boolean) {
    if (!isConnected) return undefined
    window.addEventListener("hashchange", this.onHashChange)
    return () => window.removeEventListener("hashchange", this.onHashChange)
  }

  /** `hashchange`:  scroll to the new hash, if it's one of this element's tag headers. */
  private readonly onHashChange = () => void this.reveal(location.hash)

  /**
   * Scroll the tag header `hash` names into view, if it's in this shadow root.
   * - Waits for the widgets in the shadow root to render first (`ready`):  until they do, the tables above it
   *   are still growing, and the scroll would land short.
   * - Scrolls the header's `<section>` when the `<ui-header>` draws no box of its own (`display: contents`).
   */
  private async reveal(hash: string): Promise<void> {
    const id = UIDocsApi.idForHash(hash)
    const root = this.domElement.renderRoot
    const header = id ? (root as ShadowRoot).getElementById?.(id) : undefined
    if (!header) return
    const elements = [...root.querySelectorAll("*")].filter((element) => "ready" in element)
    await Promise.all(elements.map((element) => (element as Element & { ready: Promise<void> }).ready))
    E.beforeNextPaint(() => (header.getClientRects().length ? header : header.parentElement)?.scrollIntoView())
  }

  /**
   * The id a `location.hash` names, decoded;  `""` for none or a malformed one.
   * - Static:  pure.
   */
  private static idForHash(hash: string): string {
    try {
      return decodeURIComponent(hash.replace(/^#/, ""))
    } catch {
      return ""
    }
  }

  /**
   * What `tag` / `family` name in `data`:  a family's tags in its order (grouped, each with a header),
   * else the one tag (no header);  `[]` when neither is set or the data has no such tag.
   * - Static:  pure.
   */
  private static itemsFor(data: SiteDataFile, { tag, family }: ItemsParams): ApiItem[] {
    if (family) {
      const tags = SiteData.family(data, family)?.tags ?? []
      return tags
        .map((name) => SiteData.tag(data, name))
        .filter((entry): entry is SiteTag => !!entry)
        .map((entry) => ({ tag: entry, isGrouped: true, sections: ApiModel.sectionsFor(entry) }))
    }
    const entry = tag ? SiteData.tag(data, tag) : undefined
    return entry ? [{ tag: entry, isGrouped: false, sections: ApiModel.sectionsFor(entry) }] : []
  }
}

/** The vocabulary getters, typed (`UIComponent`'s doc). */
export interface UIDocsApi extends E.AttributeValues<DocsApiVocabulary> {}

/** What `itemsFor()` draws:  the `tag` and `family` attributes. */
type ItemsParams = {
  /** one tag, with no header */
  tag?: string
  /** every tag of a family, each under its header;  wins over `tag` */
  family?: string
}

/** Class word of one tag's block, with `family`. */
const TAG_CLASS = "tag"

/** Classes of the line under a table's title:  muted. */
const NOTE_CLASS = "note ui-muted"

/** Class of the small notes under a name or values:  the caption utility. */
const CAPTION_CLASS = "ui-caption"

/** `size` of the table titles and the message. */
const SMALL = "small"

/** `<ui-message>` `state` of a failed fetch. */
const NEGATIVE = "negative"

/** `<ui-message>` `state` of a missing or unknown tag. */
const WARNING = "warning"

/**
 * `level`:  a heading level, leaving room for the table titles one level deeper;  unset, `3`,
 * under the page's `h2` "API" section.
 */
const LEVELS: HeadingBounds = { min: 1, max: 5, fallback: 3 }
