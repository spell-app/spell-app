import { For, Show } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import {
  CODE_SPAN,
  HeadingLevels,
  type HeadingBounds,
  type SiteDataFile,
  type SiteToken,
  type SiteTokenType
} from "$/ui/docs-components/docs-components.types"
import { SiteData } from "$/ui/docs-components/SiteData"
import { ColorProbe } from "./ColorProbe"
import { TokenRows } from "./TokenRows"
import { FALLBACK_HEX, type DocsTokensVocabulary, type TokenTable, type TokenView } from "./UIDocsTokens.types"
import { docsTokensVocabulary } from "./UIDocsTokens.en"

import tableCSS from "$/ui/components/ui-table/UITable.css?inline"
import tokensCSS from "./UIDocsTokens.css?inline"

/****************
 * ### `UIDocsTokens`
 * The component behind `<ui-docs-tokens>`:
 * a family's CSS custom properties as `<ui-table>`s (`family="ui-button"`, or `tag="ui-or"` for its family),
 * or the foundation's (`global`, one table per group),
 * with their name, default, description, and a LIVE swatch for colours.
 *
 * - Data:  `components.json` through `SiteData` (`families[folder].tokens`, `foundation`);
 *   NEVER the sheets or the vocabularies.  The rows come from `TokenRows`.
 * - Swatches are `<ui-label circular empty>` painted with `--ui-label-background: var(<token>, <default>)`:
 *   they resolve where they're drawn, so they follow the theme, the scheme (dark mode) and anything the page sets.
 *   - A family token's default is given as the `var()`'s fallback, since no sheet declares the public name.
 * - `playground`:  the children are a live preview, in a `<ui-segment>` with a reset `<ui-button>`,
 *   and each row gets a `<ui-input>` (a native colour picker for colours, `ColorProbe` giving it the current value).
 *   - An input sets its token INLINE on the preview's box (the children inherit it through the slot),
 *     or on `:root` with `target="page"`.  The swatches follow.
 *   - An empty input removes the token.
 * - Events:  the inner `<ui-input>`s' `ui-input` / `ui-change` stop here;
 *   the element's own `ui-input` (`{ token, value }`) and `ui-reset` (`{ tokens }`) say what the playground did.
 * - Phone width:  every table is `stackable` by its OWN width
 *   (the sheet sets `--ui-table-stack-by: container` on the DOM element),
 *   or by the screen's when the page-wide `--ui-stack-with` says `page` (`<ui-root stack-with="page">`).
 * - Sheets:  `UITable.css` is adopted HERE too:
 *   `<ui-table>` styles its light-DOM `<table>` with a PAGE sheet,
 *   which never reaches a table inside this shadow root (as in `<ui-docs-api>`).
 * - A doc-only element (`src/docs-components/`):  its shadow DOM is built of other families' widgets,
 *   which its barrel imports.
 ****************/
export class UIDocsTokens extends E.UIComponent<DocsTokensVocabulary> {
  @E.proto static vocabulary = docsTokensVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { table: tableCSS, "docs-tokens": tokensCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** The preview's box, around the default slot:  where `target="preview"` sets tokens (from its `ref`). */
  private previewBox: HTMLElement | undefined

  ////////////////
  // ## Data
  ////////////////

  /** The site's data, once fetched. */
  @E.state accessor siteData: SiteDataFile | undefined = undefined

  /** Why the data couldn't be fetched, if it couldn't. */
  @E.state accessor loadError: Error | undefined = undefined

  /** The fetch, started on first connect;  settles once `siteData` or `loadError` is set. */
  readonly fetched: Promise<void> = isServer ? Promise.resolve() : this.fetch()

  /** Fetch the site's data (once per page, `SiteData`). */
  private fetch(): Promise<void> {
    return SiteData.load().then(
      (data) => {
        this.siteData = data
      },
      (error: unknown) => {
        this.loadError = error instanceof Error ? error : new Error(String(error))
      }
    )
  }

  /** Still fetching (in a browser). */
  @E.cssState("loading")
  get isLoading(): boolean {
    return !isServer && !this.tokenView
  }

  /** The fetch failed. */
  @E.cssState("error")
  get hasError(): boolean {
    const view = this.tokenView
    return view?.kind === "message" && view.isError
  }

  ////////////////
  // ## View
  ////////////////

  /** The filter input's text. */
  @E.state accessor filterText = ""

  /** What to draw:  the tables, or a message;  `undefined` until the data is in. */
  @E.derived
  get tokenView(): TokenView | undefined {
    const loadError = this.loadError
    if (loadError)
      return { kind: "message", text: this.translationForKey("loadError", { error: loadError.message }), isError: true }
    const data = this.siteData
    if (!data) return undefined
    return TokenRows.viewFor(
      data,
      {
        family: this.family,
        tag: this.tag,
        isGlobal: !!this.global,
        groups: this.groups,
        tokens: this.tokens,
        query: this.filterText
      },
      (key, params) => this.translationForKey(key, params)
    )
  }

  /** Heading level of the group headers, clamped. */
  get headingLevel(): number {
    return HeadingLevels.levelFor(this.level, LEVELS)
  }

  /** The tables to draw (none for a message, or while loading). */
  private get shownTables(): readonly TokenTable[] {
    const view = this.tokenView
    return view?.kind === "tables" ? view.tables : []
  }

  /** The message to show instead of (or, for a filter that matches nothing, below) the tables, if any. */
  private get message(): { text: string; isError: boolean } | undefined {
    const view = this.tokenView
    if (view?.kind === "message") return view
    if (view?.kind === "tables" && !view.tables.length)
      return { text: this.translationForKey("noMatch"), isError: false }
    return undefined
  }

  /** The filter shows for `global`, and for a family with many rows. */
  private get showsFilter(): boolean {
    const view = this.tokenView
    return view?.kind === "tables" && (!!this.global || view.total >= SEARCH_MIN_ROWS)
  }

  ////////////////
  // ## Playground
  ////////////////

  /** Tokens the playground has set:  name => value, in the order they were first set. */
  @E.state accessor overrides: ReadonlyMap<string, string> = new Map()

  /**
   * Each colour row's current value as `#rrggbb` (`ColorProbe`), for the colour inputs:
   * probed once drawn, and again after a reset or a new filter.
   */
  @E.state accessor probedColors: ReadonlyMap<string, string> = new Map()

  /** What the last apply set inline, and on which element:  the next apply removes what's no longer wanted. */
  private lastApplied: { element: HTMLElement; names: Set<string> } | undefined

  /** The playground set a token (also the reset button's `disabled`). */
  @E.cssState("modified")
  get isModified(): boolean {
    return this.overrides.size > 0
  }

  /** Set the playground's tokens on the target while connected;  none otherwise. */
  @E.onChange("isConnected", "playground", "overrides", "target")
  protected onOverridesChanged(
    isConnected: boolean,
    playground: boolean,
    overrides: ReadonlyMap<string, string>,
    target: string | undefined
  ) {
    this.apply(isConnected && playground ? overrides : new Map<string, string>(), target)
  }

  /**
   * Probe the colour rows of the shown tables, and again after each playground change.
   * - Declared after `onOverridesChanged()`, so it runs after it in the same flush:
   *   a reset re-probes with the tokens already removed.
   */
  @E.onChange("probedView", "overrides")
  protected onProbedViewChanged(view: TokenView | undefined) {
    if (view?.kind === "tables") this.probe(view.tables)
  }

  /** The view whose colour rows are probed:  once drawn, while `playground`;  else `undefined`. */
  protected get probedView(): TokenView | undefined {
    return this.isReady && this.playground ? this.tokenView : undefined
  }

  /** The reset button:  remove every token the playground set. */
  @E.untracked
  reset(event?: Event): void {
    const tokens = [...this.overrides.keys()]
    if (!tokens.length) return
    this.overrides = new Map()
    this.send("ui-reset", { tokens, originalEvent: event })
  }

  /**
   * Take the inner inputs' events:  the filter's sets the filter text, a row's sets its token.
   * - Both stop here:  outside, `ui-input` from this DOM element is its own (`{ token, value }`).
   */
  private takeInnerEvents(section: HTMLElement): void {
    section.addEventListener("ui-input", (event) => this.onInput(event as CustomEvent<{ value: string }>))
    section.addEventListener("ui-change", (event) => event.stopPropagation())
  }

  /** An inner `<ui-input>` changed. */
  @E.untracked
  private onInput(event: CustomEvent<{ value: string }>): void {
    event.stopPropagation()
    const input = event.target as HTMLElement
    const value = event.detail.value
    const token = input.dataset.token
    if (!token) {
      this.filterText = value
      return
    }
    const next = new Map(this.overrides)
    if (value.trim()) next.set(token, value.trim())
    else next.delete(token)
    this.overrides = next
    this.send("ui-input", { token, value: value.trim(), originalEvent: event })
  }

  /**
   * Set `tokens` inline on `target`'s element (the preview's box, or `:root` for `page`),
   * and remove what an earlier apply set that's no longer wanted (or set on another element).
   */
  private apply(tokens: ReadonlyMap<string, string>, target: string | undefined): void {
    const element = target === PAGE_TARGET ? document.documentElement : this.previewBox
    const previous = this.lastApplied
    if (previous) {
      for (const name of previous.names) {
        if (previous.element !== element || !tokens.has(name)) previous.element.style.removeProperty(name)
      }
    }
    if (!element) {
      this.lastApplied = undefined
      return
    }
    for (const [name, value] of tokens) element.style.setProperty(name, value)
    this.lastApplied = { element, names: new Set(tokens.keys()) }
  }

  /**
   * Probe every colour row's current value (`ColorProbe`), in this shadow root:
   * where the preview resolves it, minus what the playground set on the preview's box.
   */
  @E.untracked
  private probe(tables: readonly TokenTable[]): void {
    const context = this.domElement.shadowRoot
    if (!context) return
    const isGlobal = !!this.global
    const values = new Map<string, string>()
    for (const table of tables) {
      for (const row of table.rows) {
        if (row.type === COLOR_TYPE) values.set(row.name, TokenRows.cssValueFor(row, { isGlobal }))
      }
    }
    this.probedColors = ColorProbe.hexesFor(context, values)
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <section
        class={this.rootClass}
        part={this.partForName("tokens")}
        ref={(section: HTMLElement) => this.takeInnerEvents(section)}
      >
        <Show when={this.playground}>
          <ui-segment part={this.partForName("playground")} class={PLAYGROUND_CLASS}>
            <div class={BAR_CLASS}>
              <div
                class={PREVIEW_CLASS}
                part={this.partForName("preview")}
                role="group"
                aria-label={this.translationForKey("preview")}
                ref={(box: HTMLElement) => (this.previewBox = box)}
              >
                <slot />
              </div>
              <ui-button
                part={this.partForName("reset")}
                size={SMALL}
                basic=""
                icon={RESET_ICON}
                disabled={this.isModified ? undefined : ""}
                ref={(button: HTMLElement) => button.addEventListener("click", (event) => this.reset(event))}
              >
                {this.translationForKey("reset")}
              </ui-button>
            </div>
          </ui-segment>
        </Show>
        <Show when={this.showsFilter}>
          <ui-input
            part={this.partForName("search")}
            class={SEARCH_CLASS}
            type="search"
            size={SMALL}
            icon={SEARCH_ICON}
            placeholder={this.translationForKey("search")}
            aria-label={this.translationForKey("search")}
          />
        </Show>
        <Show when={this.message}>
          {(message) => (
            <ui-message part={this.partForName("message")} state={message().isError ? "negative" : "info"} size={SMALL}>
              {message().text}
            </ui-message>
          )}
        </Show>
        <For each={this.shownTables}>{(table) => this.table(table)}</For>
      </section>
    )
  }

  ////////////////
  // ## Tables and rows
  ////////////////

  /**
   * One table:  bare for a family;  with `global`, in a group section under its header and description.
   * - No description column when no row has one (most families' tokens carry none).
   */
  private table(table: TokenTable): JSX.Element {
    const isDescribed = table.rows.some((row) => row.description)
    const grid = (
      <ui-table part={this.partForName("table")} celled="" compact="">
        <table>
          <Show when={table.title ?? this.caption}>
            <caption class={table.title ? VISUALLY_HIDDEN_CLASS : undefined}>{table.title ?? this.caption}</caption>
          </Show>
          <thead>
            <tr>
              <th scope="col">{this.translationForKey("token")}</th>
              <th scope="col">{this.translationForKey("default")}</th>
              <Show when={isDescribed}>
                <th scope="col">{this.translationForKey("description")}</th>
              </Show>
              <Show when={this.playground}>
                <th scope="col">{this.translationForKey("value")}</th>
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
      <section class={GROUP_CLASS} part={this.partForName("group")}>
        <ui-header part={this.partForName("header")} level={String(this.headingLevel)}>
          {table.title}
        </ui-header>
        <Show when={table.description}>
          <p class={UIT.DESCRIPTION} part={this.partForName("description")}>
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
                part={this.partForName("swatch")}
                circular=""
                empty=""
                aria-hidden="true"
                style={{ "--ui-label-background": this.swatch(row) }}
              />
            </Show>
            <code>{row.default}</code>
          </span>
        </td>
        <Show when={isDescribed}>
          <td>{this.inline(row.description ?? "")}</td>
        </Show>
        <Show when={this.playground}>
          <td>
            <ui-input
              part={this.partForName("input")}
              class={VALUE_CLASS}
              size={SMALL}
              fluid=""
              data-token={row.name}
              type={isColor ? COLOR_TYPE : undefined}
              placeholder={isColor ? undefined : row.default}
              aria-label={this.translationForKey("setToken", { token: row.name })}
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

  /**
   * What a row's swatch paints:  the preview's value while the playground set one there,
   * else the token itself, resolved here (`TokenRows.cssValueFor()`).
   */
  private swatch(row: SiteToken): string {
    const set = this.target === PAGE_TARGET ? undefined : this.overrides.get(row.name)
    return set ?? TokenRows.cssValueFor(row, { isGlobal: !!this.global })
  }

  /** A row input's value:  what the playground set, else empty (a colour:  its current colour). */
  private inputValue(row: SiteToken): string {
    const set = this.overrides.get(row.name)
    if (set !== undefined) return set
    return row.type === COLOR_TYPE ? (this.probedColors.get(row.name) ?? FALLBACK_HEX) : ""
  }
}
export interface UIDocsTokens extends E.AttributeValues<DocsTokensVocabulary> {}

/** `target` that writes on `:root` instead of the preview. */
const PAGE_TARGET = "page"

/** The filter shows for `global`, and for a family with at least this many rows. */
const SEARCH_MIN_ROWS = 16

/** Icon of the filter input. */
const SEARCH_ICON = "search"

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

/** `level`:  any heading level;  unset, `3`:  group headers sit under the page's `h2` sections. */
const LEVELS: HeadingBounds = { min: 1, max: 6, fallback: 3 }

/** `SiteToken.type` of a colour:  a live swatch, and a colour input in the playground. */
const COLOR_TYPE: SiteTokenType = "color"
