import { For, Show, createEffect, createMemo, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, proto, UIElement } from "$/ui/core"
import { SiteData } from "$/ui/docs-components/SiteData"
import type { SiteDataFile, SiteToken } from "$/ui/docs-components/docs-components.types"

import { docsTokensVocabulary } from "./ui-docs-tokens.vocabulary.en"
import { DocsTokensFallback } from "./ui-docs-tokens.fallback"
import { ColorProbe } from "./ColorProbe"
import { TokenRows } from "./TokenRows"
import {
  CODE_SPAN,
  COLOR_INPUT,
  DEFAULT_LEVEL,
  FALLBACK_HEX,
  MAX_LEVEL,
  MIN_LEVEL,
  PAGE_TARGET,
  RESET_ICON,
  SEARCH_ICON,
  SEARCH_MIN_ROWS,
  type DocsTokensVocabulary,
  type TokenTable,
  type TokenView
} from "./ui-docs-tokens.types"

import tokensCSS from "./ui-docs-tokens.css?inline"
import tableCSS from "$/ui/components/ui-table/ui-table.css?inline"

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
 * - Phone width:  every table is `stackable` by its OWN width (`stack-by="container"`).
 * - Sheets:  `ui-table.css` is adopted HERE too:  `<ui-table>` styles its light-DOM `<table>` with a PAGE sheet, which
 *   never reaches a table inside this shadow root (plan-doc gap, as `<ui-docs-api>`).
 * - A doc-only element (`src/docs-components/`):  its shadow composes other families' widgets, which its barrel
 *   imports.
 ****************/
export class UIDocsTokens extends UIElement<DocsTokensVocabulary> {
  @proto static vocabulary = docsTokensVocabulary
  @proto static styles = { table: tableCSS, "docs-tokens": tokensCSS }
  @proto static Fallback = DocsTokensFallback
  @proto static delegatesFocus = false

  /** The site's data, once fetched. */
  readonly data = new Cell<SiteDataFile | undefined>(undefined)

  /** Why the data couldn't be fetched, if it couldn't. */
  readonly failure = new Cell<Error | undefined>(undefined)

  /** The filter input's text. */
  readonly query = new Cell("")

  /** Tokens the playground has set:  name => value, in the order they were first set. */
  readonly overrides = new Cell<ReadonlyMap<string, string>>(new Map())

  /**
   * Each colour row's current value as `#rrggbb` (`ColorProbe`), for the colour inputs:  probed once drawn, and
   * again after a reset or a new filter.
   */
  readonly probed = new Cell<ReadonlyMap<string, string>>(new Map())

  /** The fetch, started on first connect;  settles once `data` or `failure` is set. */
  readonly fetched: Promise<void> = isServer ? Promise.resolve() : this.fetch()

  /** The preview's box, around the default slot:  where `target="preview"` sets tokens (from its `ref`). */
  private previewBox: HTMLElement | undefined

  /** What the last apply set inline, and on which element:  the next apply removes what's no longer wanted. */
  private applied: { element: HTMLElement; names: Set<string> } | undefined

  /** What to draw:  the tables, or a message;  `undefined` until the data is in. */
  readonly view = createMemo((): TokenView | undefined => {
    const failure = this.failure.get()
    if (failure) return { kind: "message", text: this.text("loadError", { error: failure.message }), error: true }
    const data = this.data.get()
    if (!data) return undefined
    const { family, tag, global, groups, tokens } = this.attrs
    return TokenRows.view(
      data,
      { family, tag, global: !!global, groups, tokens, query: this.query.get() },
      (key, params) => this.text(key, params)
    )
  })

  /** Heading level of the group headers, clamped. */
  readonly level = createMemo(() => {
    const level = Math.round(Number(this.attrs.level ?? DEFAULT_LEVEL))
    return Number.isFinite(level) ? Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, level)) : DEFAULT_LEVEL
  })

  protected override hostStates() {
    const view = this.view()
    return {
      loading: !isServer && !view,
      error: view?.kind === "message" && view.error,
      modified: this.overrides.get().size > 0
    }
  }

  /** Base `mount()`, plus the playground's effects:  set the tokens on the target, probe the colour rows. */
  override mount(): JSX.Element {
    const content = super.mount()
    if (isServer) return content
    createEffect(
      () => ({
        tokens: this.connected.get() && this.attrs.playground ? this.overrides.get() : new Map<string, string>(),
        page: this.attrs.target === PAGE_TARGET
      }),
      ({ tokens, page }) => {
        this.apply(tokens, page)
      }
    )
    // after the apply above (same flush, created first), so a reset re-probes with the tokens already removed
    createEffect(
      () => ({
        view: this.loaded() && this.attrs.playground ? this.view() : undefined,
        pristine: this.overrides.get().size === 0
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
          <ui-segment part={this.part("playground")} class="playground">
            <div class="bar">
              <div
                class="preview"
                part={this.part("preview")}
                role="group"
                aria-label={this.text("preview")}
                ref={(box: HTMLElement) => (this.previewBox = box)}
              >
                <slot />
              </div>
              <ui-button
                part={this.part("reset")}
                size="small"
                basic=""
                icon={RESET_ICON}
                disabled={this.overrides.get().size ? undefined : ""}
                ref={(button: HTMLElement) => button.addEventListener("click", (event) => this.reset(event))}
              >
                {this.text("reset")}
              </ui-button>
            </div>
          </ui-segment>
        </Show>
        <Show when={this.searchable()}>
          <ui-input
            part={this.part("search")}
            class="search"
            type="search"
            size="small"
            icon={SEARCH_ICON}
            placeholder={this.text("search")}
            aria-label={this.text("search")}
          />
        </Show>
        <Show when={this.message()}>
          {(message) => (
            <ui-message part={this.part("message")} state={message().error ? "negative" : "info"} size="small">
              {message().text}
            </ui-message>
          )}
        </Show>
        <For each={this.tables()}>{(table) => this.renderTable(table)}</For>
      </section>
    )
  }

  ////////////////
  // ## Rendering
  ////////////////

  /**
   * One table:  bare for a family;  with `global`, in a group section under its header and description.
   * - No description column when no row has one (most families' tokens carry none).
   */
  private renderTable(table: TokenTable): JSX.Element {
    const described = table.rows.some((row) => row.description)
    const grid = (
      <ui-table part={this.part("table")} celled="" compact="" stack-by="container">
        <table>
          <Show when={table.title ?? this.attrs.caption}>
            <caption class={table.title ? "ui-visually-hidden" : undefined}>
              {table.title ?? this.attrs.caption}
            </caption>
          </Show>
          <thead>
            <tr>
              <th scope="col">{this.text("token")}</th>
              <th scope="col">{this.text("default")}</th>
              <Show when={described}>
                <th scope="col">{this.text("description")}</th>
              </Show>
              <Show when={this.attrs.playground}>
                <th scope="col">{this.text("value")}</th>
              </Show>
            </tr>
          </thead>
          <tbody>
            <For each={table.rows}>{(row) => this.renderRow(row, described)}</For>
          </tbody>
        </table>
      </ui-table>
    )
    if (!table.title) return grid
    return (
      <section class="group" part={this.part("group")}>
        <ui-header part={this.part("header")} level={String(this.level())}>
          {table.title}
        </ui-header>
        <Show when={table.description}>
          <p class="description" part={this.part("description")}>
            {this.inline(table.description ?? "")}
          </p>
        </Show>
        {grid}
      </section>
    )
  }

  /** One token's row:  name, default (and swatch), description (if `described`), and the playground's input. */
  private renderRow(row: SiteToken, described: boolean): JSX.Element {
    return (
      <tr>
        <th scope="row">
          <code class="name">{row.name}</code>
        </th>
        <td>
          <span class="default">
            <Show when={row.type === "color"}>
              <ui-label
                part={this.part("swatch")}
                circular=""
                empty=""
                aria-hidden="true"
                style={{ "--ui-label-background": this.swatch(row) }}
              />
            </Show>
            <code>{row.default}</code>
          </span>
        </td>
        <Show when={described}>
          <td>{this.inline(row.description ?? "")}</td>
        </Show>
        <Show when={this.attrs.playground}>
          <td>
            <ui-input
              part={this.part("input")}
              class="value"
              size="small"
              fluid=""
              data-token={row.name}
              type={row.type === "color" ? COLOR_INPUT : undefined}
              placeholder={row.type === "color" ? undefined : row.default}
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
  private tables(): readonly TokenTable[] {
    const view = this.view()
    return view?.kind === "tables" ? view.tables : []
  }

  /** The message to show instead of (or, for a filter that matches nothing, below) the tables, if any. */
  private message(): { text: string; error: boolean } | undefined {
    const view = this.view()
    if (view?.kind === "message") return view
    if (view?.kind === "tables" && !view.tables.length) return { text: this.text("noMatch"), error: false }
    return undefined
  }

  /** The filter shows for `global`, and for a family with many rows. */
  private searchable(): boolean {
    const view = this.view()
    return view?.kind === "tables" && (!!this.attrs.global || view.total >= SEARCH_MIN_ROWS)
  }

  /**
   * What a row's swatch paints:  the preview's value while the playground set one there, else the token itself,
   * resolved here, with its default for a family token (no sheet declares the public name).
   */
  private swatch(row: SiteToken): string {
    const set = this.attrs.target === PAGE_TARGET ? undefined : this.overrides.get().get(row.name)
    return set ?? (this.attrs.global ? `var(${row.name})` : `var(${row.name}, ${row.default})`)
  }

  /** A row input's value:  what the playground set, else empty (a colour:  its current colour). */
  private inputValue(row: SiteToken): string {
    const set = this.overrides.get().get(row.name)
    if (set !== undefined) return set
    return row.type === "color" ? (this.probed.get().get(row.name) ?? FALLBACK_HEX) : ""
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

  /** The reset button:  remove every token the playground set. */
  reset(event?: Event): void {
    const tokens = [...untrack(() => this.overrides.get()).keys()]
    if (!tokens.length) return
    this.overrides.set(new Map())
    this.emit("ui-reset", { tokens, originalEvent: event })
  }

  /**
   * Set `tokens` inline on the target (the preview's box, or `:root` for `page`), and remove what an earlier apply set
   * that's no longer wanted (or set on another target).
   */
  private apply(tokens: ReadonlyMap<string, string>, page: boolean): void {
    const element = page ? document.documentElement : this.previewBox
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
    const global = untrack(() => !!this.attrs.global)
    const values = new Map<string, string>()
    for (const table of tables) {
      for (const row of table.rows) {
        if (row.type === "color") values.set(row.name, global ? `var(${row.name})` : `var(${row.name}, ${row.default})`)
      }
    }
    this.probed.set(ColorProbe.hexes(context, values))
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
