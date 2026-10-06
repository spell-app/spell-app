import { For, Show, createEffect, createMemo } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { HeadingLevels, type SiteDataFile, type SiteTag } from "$/ui/docs-components/docs-components.types"
import { SiteData } from "$/ui/docs-components/SiteData"
import { ApiModel } from "./ApiModel"
import { InlineCode } from "./InlineCode"
import { DocsApiFallback } from "./ui-docs-api.fallback"
import {
  LEVELS,
  type ApiCell,
  type ApiItem,
  type ApiMessage,
  type ApiSection,
  type DocsApiVocabulary
} from "./ui-docs-api.types"
import { docsApiVocabulary } from "./ui-docs-api.vocabulary.en"

import tableCSS from "$/ui/components/ui-table/ui-table.css?inline"
import apiCSS from "./ui-docs-api.css?inline"

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
export class UIDocsApi extends E.UIElement<DocsApiVocabulary> {
  @E.proto static vocabulary = docsApiVocabulary
  @E.proto static styles = { table: tableCSS, "docs-api": apiCSS }
  @E.proto static Fallback = DocsApiFallback
  @E.proto static delegatesFocus = false

  /** The site's data, once fetched. */
  readonly data = new E.Cell<SiteDataFile | undefined>(undefined)

  /** Why the data couldn't be fetched, if it couldn't. */
  readonly failure = new E.Cell<Error | undefined>(undefined)

  /** The fetch, started on first connect;  settles once `data` or `failure` is set. */
  readonly fetched: Promise<void> = isServer ? Promise.resolve() : this.fetch()

  /** `hashchange`:  scroll to the new hash, if it's one of this element's tag headers. */
  private readonly onHashChange = () => void this.reveal(location.hash)

  /** What to draw:  one entry per tag, with its tables;  `undefined` until the data is in. */
  readonly items = createMemo((): ApiItem[] | undefined => {
    const data = this.data.get()
    return data && UIDocsApi.itemsFor(data, { tag: this.attrs.tag, family: this.attrs.family })
  })

  /** The message to show instead of tables, if any:  a failed fetch, no `tag` / `family`, an unknown tag. */
  readonly message = createMemo((): ApiMessage | undefined => {
    const failure = this.failure.get()
    if (failure) return { state: NEGATIVE, key: "loadError", params: { error: failure.message } }
    const items = this.items()
    if (!items || items.length) return undefined
    const name = this.attrs.family || this.attrs.tag
    return name ? { state: WARNING, key: "notFound", params: { tag: name } } : { state: WARNING, key: "noTag" }
  })

  /** Heading level of the topmost headers, clamped. */
  readonly level = createMemo(() => HeadingLevels.levelFor(this.attrs.level, LEVELS))

  protected override hostStates() {
    return { loading: !isServer && !this.data.get() && !this.failure.get(), error: !!this.message() }
  }

  /** Base `mount()`, plus the effects that announce the drawn tables and follow `location.hash`. */
  override mount(): JSX.Element {
    const content = super.mount()
    if (isServer) return content
    createEffect(
      () => (this.isLoaded() ? this.items() : undefined),
      (items) => {
        if (items?.length) this.drawn(items)
      }
    )
    createEffect(
      () => this.isConnected.get(),
      (isConnected) => {
        if (!isConnected) return undefined
        window.addEventListener(HASHCHANGE, this.onHashChange)
        return () => window.removeEventListener(HASHCHANGE, this.onHashChange)
      }
    )
    return content
  }

  render(): JSX.Element {
    return (
      <section class={this.classes()} part={this.part("api")}>
        <Show when={this.message()}>
          {(message) => (
            <ui-message part={this.part("message")} state={message().state} size={SMALL}>
              {this.inline(this.text(message().key, message().params))}
            </ui-message>
          )}
        </Show>
        <For each={this.items() ?? []}>{(item) => this.item(item)}</For>
      </section>
    )
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** One tag:  its tables, under its own header and summary with `family`. */
  private item(item: ApiItem): JSX.Element {
    if (!item.isGrouped) return <For each={item.sections}>{(section) => this.table(item, section)}</For>
    return (
      <section class={TAG_CLASS} part={this.part("tag")}>
        <ui-header part={this.part("header")} id={item.tag.tag} level={String(this.level())} dividing="">
          <a href={`#${item.tag.tag}`}>
            <code>{`<${item.tag.tag}>`}</code>
          </a>
        </ui-header>
        <Show when={item.tag.description}>
          <p class={UIT.DESCRIPTION} part={this.part("description")}>
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
          part={this.part("title")}
          level={String(item.isGrouped ? this.level() + 1 : this.level())}
          size={SMALL}
        >
          {this.text(section.id)}
        </ui-header>
        <Show when={section.note}>
          <p class={NOTE_CLASS} part={this.part("note")}>
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
          {cell.code === undefined ? <em>{cell.label ? this.text(cell.label) : ""}</em> : <code>{cell.code}</code>}
          <For each={cell.notes}>
            {(note) => (
              <small class={CAPTION_CLASS}>
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
            {this.text("valueSet")} <code>{cell.set}</code>
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
    const id = UIDocsApi.idForHash(hash)
    const root = this.host.renderRoot
    const header = id ? (root as ShadowRoot).getElementById?.(id) : undefined
    if (!header) return
    const hosts = [...root.querySelectorAll("*")].filter((element) => "ready" in element)
    await Promise.all(hosts.map((element) => (element as Element & { ready: Promise<void> }).ready))
    requestAnimationFrame(() => (header.getClientRects().length ? header : header.parentElement)?.scrollIntoView())
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
   * What `tag` / `family` name in `data`:  a family's tags in its order (grouped, each with a header), else the one
   * tag (no header);  `[]` when neither is set or the data has no such tag.
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

/** What `itemsFor()` draws:  the `tag` and `family` attributes. */
type ItemsParams = {
  /** one tag, with no header */
  tag?: string
  /** every tag of a family, each under its header;  wins over `tag` */
  family?: string
}

/** `window` event the element follows while connected. */
const HASHCHANGE = "hashchange"

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
