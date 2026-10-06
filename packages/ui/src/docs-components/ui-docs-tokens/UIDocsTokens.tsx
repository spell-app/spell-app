import { For, Show, createEffect, createMemo, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { CODE_SPAN, HeadingLevels, type SiteDataFile, type SiteToken } from "$/ui/docs-components/docs-components.types"
import { SiteData } from "$/ui/docs-components/SiteData"
import { ColorProbe } from "./ColorProbe"
import { TokenRows } from "./TokenRows"
import { DocsTokensFallback } from "./ui-docs-tokens.fallback"
import {
  COLOR_TYPE,
  FALLBACK_HEX,
  LEVELS,
  type DocsTokensVocabulary,
  type TokenTable,
  type TokenView
} from "./ui-docs-tokens.types"
import { docsTokensVocabulary } from "./ui-docs-tokens.vocabulary.en"

import tableCSS from "$/ui/components/ui-table/ui-table.css?inline"
import tokensCSS from "./ui-docs-tokens.css?inline"

/****************
 * ### `<ui-docs-tokens>`
 * A family's CSS custom properties (`family="ui-button"`, or `tag="ui-or"` for its family), or the foundation's
 * (`global`, one table per group), as `<ui-table>`s:  name, default, description, and a LIVE swatch for colours.
 * - Data:  `components.json` through `SiteData` (`families[folder].tokens`, `foundation`);  NEVER the sheets or the
 *   vocabularies.  Rows:  `TokenRows`, shared with the native fallback.
 * - Swatches are `<ui-label circular empty>` painted with `--ui-label-background: var(<token>, <default>)`:  they
 *   resolve where they're drawn, so they follow the theme, the scheme (dark mode) and anything the page sets.  A
 *   family token's default is given as the fallback, since no sheet declares the public name.
 * - `playground`:  the children are a live preview, in a `<ui-segment>` with a reset `<ui-button>`, and each row
 *   gets a `<ui-input>` (a native colour picker for colours, `ColorProbe` giving it the current value) that sets the
 *   token INLINE on the preview's box (the children inherit it through the slot), or on `:root` with
 *   `target="page"`.  The swatches follow.  Empty input:  the token is removed.
 * - Events:  the inner `<ui-input>`s' `ui-input` / `ui-change` stop here;  the element's own `ui-input`
 *   (`{ token, value }`) and `ui-reset` (`{ tokens }`) say what the playground did.
 * - Phone width:  every table is `stackable` by its OWN width (the sheet sets `--ui-table-stack-by: container` on the
 *   host), or by the screen's when the page-wide `--ui-stack-with` says `page` (`<ui-root stack-with="page">`).
 * - Sheets:  `ui-table.css` is adopted HERE too:  `<ui-table>` styles its light-DOM `<table>` with a PAGE sheet, which
 *   never reaches a table inside this shadow root (plan-doc gap, as `<ui-docs-api>`).
 * - A doc-only element (`src/docs-components/`):  its shadow composes other families' widgets, which its barrel
 *   imports.
 ****************/
export class UIDocsTokens extends E.UIElement<DocsTokensVocabulary> {
  @E.proto static vocabulary = docsTokensVocabulary
  @E.proto static styles = { table: tableCSS, "docs-tokens": tokensCSS }
  @E.proto static Fallback = DocsTokensFallback
  @E.proto static delegatesFocus = false

  /** The site's data, once fetched. */
  readonly data = new E.Cell<SiteDataFile | undefined>(undefined)

  /** Why the data couldn't be fetched, if it couldn't. */
  readonly failure = new E.Cell<Error | undefined>(undefined)

  /** The filter input's text. */
  readonly query = new E.Cell("")

  /** Tokens the playground has set:  name => value, in the order they were first set. */
  readonly overrides = new E.Cell<ReadonlyMap<string, string>>(new Map())

  /**
   * Each colour row's current value as `#rrggbb` (`ColorProbe`), for the colour inputs:  probed once drawn, and
   * again after a reset or a new filter.
   */
  readonly probed = new E.Cell<ReadonlyMap<string, string>>(new Map())

  /** The fetch, started on first connect;  settles once `data` or `failure` is set. */
  readonly fetched: Promise<void> = isServer ? Promise.resolve() : this.fetch()

  /** The preview's box, around the default slot:  where `target="preview"` sets tokens (from its `ref`). */
  private previewBox: HTMLElement | undefined

  /** What the last apply set inline, and on which element:  the next apply removes what's no longer wanted. */
  private applied: { element: HTMLElement; names: Set<string> } | undefined

  /** What to draw:  the tables, or a message;  `undefined` until the data is in. */
  readonly view = createMemo((): TokenView | undefined => {
    const failure = this.failure.get()
    if (failure) return { kind: "message", text: this.text("loadError", { error: failure.message }), isError: true }
    const data = this.data.get()
    if (!data) return undefined
    const { family, tag, global, groups, tokens } = this.attrs
    return TokenRows.viewFor(
      data,
      { family, tag, isGlobal: !!global, groups, tokens, query: this.query.get() },
      (key, params) => this.text(key, params)
    )
  })

  /** Heading level of the group headers, clamped. */
  readonly level = createMemo(() => HeadingLevels.levelFor(this.attrs.level, LEVELS))

  protected override hostStates() {
    const view = this.view()
    return {
      loading: !isServer && !view,
      error: view?.kind === "message" && view.isError,
      modified: this.overrides.get().size > 0
    }
  }

  /** Base `mount()`, plus the playground's effects:  set the tokens on the target, probe the colour rows. */
  override mount(): JSX.Element {
    const content = super.mount()
    if (isServer) return content
    createEffect(
      () => ({
        tokens: this.isConnected.get() && this.attrs.playground ? this.overrides.get() : new Map<string, string>(),
        target: this.attrs.target
      }),
      ({ tokens, target }) => {
        this.apply(tokens, target)
      }
    )
    // after the apply above (same flush, created first), so a reset re-probes with the tokens already removed
    createEffect(
      () => ({
        view: this.isLoaded() && this.attrs.playground ? this.view() : undefined,
        isPristine: this.overrides.get().size === 0
      }),
      ({ view }) => {
        if (view?.kind === "tables") this.probe(view.tables)
      }
    )
    return content
  }

  render(): JSX.Element {
    return (
      <section class={this.classes()} part={this.part("tokens")} ref={(section: HTMLElement) => this.listen(section)}>
        <Show when={this.attrs.playground}>
          <ui-segment part={this.part("playground")} class={PLAYGROUND_CLASS}>
            <div class={BAR_CLASS}>
              <div
                class={PREVIEW_CLASS}
                part={this.part("preview")}
                role={UIT.GROUP}
                aria-label={this.text("preview")}
                ref={(box: HTMLElement) => (this.previewBox = box)}
              >
                <slot />
              </div>
              <ui-button
                part={this.part("reset")}
                size={SMALL}
                basic=""
                icon={RESET_ICON}
                disabled={this.overrides.get().size ? undefined : ""}
                ref={(button: HTMLElement) => button.addEventListener(UIT.CLICK, (event) => this.reset(event))}
              >
                {this.text("reset")}
              </ui-button>
            </div>
          </ui-segment>
        </Show>
        <Show when={this.isSearchable()}>
          <ui-input
            part={this.part("search")}
            class={SEARCH_CLASS}
            type={SEARCH_TYPE}
            size={SMALL}
            icon={SEARCH_ICON}
            placeholder={this.text("search")}
            aria-label={this.text("search")}
          />
        </Show>
        <Show when={this.message()}>
          {(message) => (
            <ui-message part={this.part("message")} state={message().isError ? "negative" : "info"} size={SMALL}>
              {message().text}
            </ui-message>
          )}
        </Show>
        <For each={this.shownTables()}>{(table) => this.table(table)}</For>
      </section>
    )
  }

  /** The reset button:  remove every token the playground set. */
  reset(event?: Event): void {
    const tokens = [...untrack(() => this.overrides.get()).keys()]
    if (!tokens.length) return
    this.overrides.set(new Map())
    this.emit("ui-reset", { tokens, originalEvent: event })
  }

  ////////////////
  // ## Rendering
  ////////////////

  /**
   * One table:  bare for a family;  with `global`, in a group section under its header and description.
   * - No description column when no row has one (most families' tokens carry none).
   */
  private table(table: TokenTable): JSX.Element {
    const isDescribed = table.rows.some((row) => row.description)
    const grid = (
      <ui-table part={this.part("table")} celled="" compact="">
        <table>
          <Show when={table.title ?? this.attrs.caption}>
            <caption class={table.title ? VISUALLY_HIDDEN_CLASS : undefined}>
              {table.title ?? this.attrs.caption}
            </caption>
          </Show>
          <thead>
            <tr>
              <th scope="col">{this.text("token")}</th>
              <th scope="col">{this.text("default")}</th>
              <Show when={isDescribed}>
                <th scope="col">{this.text("description")}</th>
              </Show>
              <Show when={this.attrs.playground}>
                <th scope="col">{this.text("value")}</th>
              </Show>
            </tr>
          </thead>
          <tbody>
            <For each={table.rows}>{(row) => this.row(row, { isDescribed })}</For>
          </tbody>
        </table>
      </ui-table>
    )
    if (!table.title) return grid
    return (
      <section class={GROUP_CLASS} part={this.part("group")}>
        <ui-header part={this.part("header")} level={String(this.level())}>
          {table.title}
        </ui-header>
        <Show when={table.description}>
          <p class={UIT.DESCRIPTION} part={this.part("description")}>
            {this.inline(table.description ?? "")}
          </p>
        </Show>
        {grid}
      </section>
    )
  }

  /** One token's row:  name, default (and swatch), description (`isDescribed`), and the playground's input. */
  private row(row: SiteToken, { isDescribed }: { isDescribed: boolean }): JSX.Element {
    const isColor = row.type === COLOR_TYPE
    return (
      <tr>
        <th scope="row">
          <code class={NAME_CLASS}>{row.name}</code>
        </th>
        <td>
          <span class={DEFAULT_CLASS}>
            <Show when={isColor}>
              <ui-label
                part={this.part("swatch")}
                circular=""
                empty=""
                aria-hidden={UIT.TRUE}
                style={{ "--ui-label-background": this.swatch(row) }}
              />
            </Show>
            <code>{row.default}</code>
          </span>
        </td>
        <Show when={isDescribed}>
          <td>{this.inline(row.description ?? "")}</td>
        </Show>
        <Show when={this.attrs.playground}>
          <td>
            <ui-input
              part={this.part("input")}
              class={VALUE_CLASS}
              size={SMALL}
              fluid=""
              data-token={row.name}
              type={isColor ? COLOR_TYPE : undefined}
              placeholder={isColor ? undefined : row.default}
              aria-label={this.text("setToken", { token: row.name })}
              prop:value={this.inputValue(row)}
            />
          </td>
        </Show>
      </tr>
    )
  }

  /** `text` with each backticked span as `<code>`, as text nodes (never HTML). */
  private inline(text: string): (string | JSX.Element)[] {
    return text.split(CODE_SPAN).map((piece, index) => (index % 2 ? <code>{piece}</code> : piece))
  }

  ////////////////
  // ## View
  ////////////////

  /** The tables to draw (none for a message, or while loading). */
  private shownTables(): readonly TokenTable[] {
    const view = this.view()
    return view?.kind === "tables" ? view.tables : []
  }

  /** The message to show instead of (or, for a filter that matches nothing, below) the tables, if any. */
  private message(): { text: string; isError: boolean } | undefined {
    const view = this.view()
    if (view?.kind === "message") return view
    if (view?.kind === "tables" && !view.tables.length) return { text: this.text("noMatch"), isError: false }
    return undefined
  }

  /** The filter shows for `global`, and for a family with many rows. */
  private isSearchable(): boolean {
    const view = this.view()
    return view?.kind === "tables" && (!!this.attrs.global || view.total >= SEARCH_MIN_ROWS)
  }

  /**
   * What a row's swatch paints:  the preview's value while the playground set one there, else the token itself,
   * resolved here (`TokenRows.cssValueFor()`).
   */
  private swatch(row: SiteToken): string {
    const set = this.attrs.target === PAGE_TARGET ? undefined : this.overrides.get().get(row.name)
    return set ?? TokenRows.cssValueFor(row, { isGlobal: !!this.attrs.global })
  }

  /** A row input's value:  what the playground set, else empty (a colour:  its current colour). */
  private inputValue(row: SiteToken): string {
    const set = this.overrides.get().get(row.name)
    if (set !== undefined) return set
    return row.type === COLOR_TYPE ? (this.probed.get().get(row.name) ?? FALLBACK_HEX) : ""
  }

  ////////////////
  // ## Playground
  ////////////////

  /**
   * Take the inner inputs' events:  the filter's sets the query, a row's sets its token.
   * - Both stop here:  outside, `ui-input` from this host is the element's own (`{ token, value }`).
   */
  private listen(section: HTMLElement): void {
    section.addEventListener("ui-input", (event) => this.onInput(event as CustomEvent<{ value: string }>))
    section.addEventListener("ui-change", (event) => event.stopPropagation())
  }

  /** An inner `<ui-input>` changed. */
  private onInput(event: CustomEvent<{ value: string }>): void {
    event.stopPropagation()
    const input = event.target as HTMLElement
    const value = event.detail.value
    const token = input.dataset.token
    if (!token) {
      this.query.set(value)
      return
    }
    const next = new Map(untrack(() => this.overrides.get()))
    if (value.trim()) next.set(token, value.trim())
    else next.delete(token)
    this.overrides.set(next)
    this.emit("ui-input", { token, value: value.trim(), originalEvent: event })
  }

  /**
   * Set `tokens` inline on `target`'s element (the preview's box, or `:root` for `page`), and remove what an earlier
   * apply set that's no longer wanted (or set on another element).
   */
  private apply(tokens: ReadonlyMap<string, string>, target: string | undefined): void {
    const element = target === PAGE_TARGET ? document.documentElement : this.previewBox
    const previous = this.applied
    if (previous) {
      for (const name of previous.names) {
        if (previous.element !== element || !tokens.has(name)) previous.element.style.removeProperty(name)
      }
    }
    if (!element) {
      this.applied = undefined
      return
    }
    for (const [name, value] of tokens) element.style.setProperty(name, value)
    this.applied = { element, names: new Set(tokens.keys()) }
  }

  /**
   * Probe every colour row's current value (`ColorProbe`), in this shadow root:  where the preview resolves it, minus
   * what the playground set on the preview's box.
   */
  private probe(tables: readonly TokenTable[]): void {
    const context = this.host.shadowRoot
    if (!context) return
    const isGlobal = untrack(() => !!this.attrs.global)
    const values = new Map<string, string>()
    for (const table of tables) {
      for (const row of table.rows) {
        if (row.type === COLOR_TYPE) values.set(row.name, TokenRows.cssValueFor(row, { isGlobal }))
      }
    }
    this.probed.set(ColorProbe.hexesFor(context, values))
  }

  ////////////////
  // ## Data
  ////////////////

  /** Fetch the site's data (once per page, `SiteData`). */
  private fetch(): Promise<void> {
    return SiteData.load().then(
      (data) => this.data.set(data),
      (error: unknown) => this.failure.set(error instanceof Error ? error : new Error(String(error)))
    )
  }
}

/** `target` that writes on `:root` instead of the preview. */
const PAGE_TARGET = "page"

/** The filter shows for `global`, and for a family with at least this many rows. */
const SEARCH_MIN_ROWS = 16

/** Icon of the filter input. */
const SEARCH_ICON = "search"

/** Native input type of the filter. */
const SEARCH_TYPE = "search"

/** Icon of the reset button. */
const RESET_ICON = "undo"

/** `size` of the reset button, the filter, the message and the row inputs. */
const SMALL = "small"

/** Class word of the playground's segment. */
const PLAYGROUND_CLASS = "playground"

/** Class word of the playground's row:  the preview and the reset button. */
const BAR_CLASS = "bar"

/** Class word of the preview's box. */
const PREVIEW_CLASS = "preview"

/** Class word of the filter input. */
const SEARCH_CLASS = "search"

/** Class word of a `global` group's section. */
const GROUP_CLASS = "group"

/** Class word of a row's token name. */
const NAME_CLASS = "name"

/** Class word of a row's default cell content:  the swatch and the value. */
const DEFAULT_CLASS = "default"

/** Class word of a row's playground input. */
const VALUE_CLASS = "value"

/** Utility class of a group table's caption:  its header already names it. */
const VISUALLY_HIDDEN_CLASS = "ui-visually-hidden"
