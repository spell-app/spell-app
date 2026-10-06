import { For, Show, createEffect, createMemo, createRenderEffect, untrack } from "solid-js"
import { Portal, isServer, type JSX } from "@solidjs/web"

import { Cell, HostAttribute, UI, UIElement, proto, type AttributeName, UIT } from "$/ui/core"

import { tableVocabulary } from "./ui-table.vocabulary.en"
import { TableClassMirror } from "./TableClassMirror"
import { TableGrammar } from "./TableGrammar"
import { TableSort } from "./TableSort"
import { TableFallback } from "./ui-table.fallback"

import tableCSS from "./ui-table.css?inline"
import {
  ASCENDING,
  ARIA_SORT,
  CLASS,
  DATA_UI,
  DESCENDING,
  GENERATED,
  SPACE,
  STACK_BY_CLASS,
  TABLE
} from "./ui-table.types"
import { ARIA_LABEL, BUTTON, TABINDEX, ENTER } from "$/ui/components/components.types"

/****************
 * ### `<ui-table>`
 * A native `<table>` in Fomantic's table look:  `<ui-table celled striped><table>...</table></ui-table>`.
 * - Light / shadow split:  the table stays NATIVE and in the LIGHT DOM (table semantics, find-in-page, copy,
 *   page CSS);  the shadow root is only `<div class="... scroller" part="scroller"><slot></slot></div>`.
 * - Styling:  the element mirrors its class string (`ui celled striped table`, from `ClassBuilder`) onto the
 *   slotted table (`TableClassMirror`:  only its own words, author classes kept, re-applied when a framework
 *   rewrites `className`), and registers `ui-table.css` as a PAGE sheet too, whose class-grammar rules then style
 *   it.  Why classes, not host-attribute selectors:  one mechanical port of `table.less` serves element and
 *   static markup (SSR writes `class="ui celled table"` and paints before any JS), and translated names,
 *   `yes` / `no` and `medium` resolve through the vocabulary like every other component.
 * - Row / cell looks are the author's classes on native `tr` / `td` / `th` (`positive`, `red marked left`,
 *   `collapsing` ...):  no JS.
 * - Scrolling:  `scrolling` / `overflowing` cap the scroller's height;  it then scrolls and is a focusable,
 *   named region (host `aria-label`, else the `<caption>`, else the translated `label`).
 * - Sorting (`sortable`):  every `thead` header sorts, except `th[data-sortable="false"]` / `th.disabled`.
 *   - A header's `<button>` is its control (APG's sortable table:  authors SHOULD put one in each sortable
 *     header);  a header without one is made focusable (`tabindex="0"`) and answers Enter / Space.  The
 *     element never moves or wraps author nodes.
 *   - The sorted header gets `aria-sort` (removed from the others);  `ui-table.css` draws the caret from it.
 *   - `sort-column` / `sort-direction` are auto-controlled;  each activation dispatches the cancelable
 *     `ui-sort` (`TableSortDetail`) first:  the sorted column flips, another starts `ascending`.
 *   - Reordering:  data mode shows its rows sorted;  a slotted table reorders its `tbody` rows by cell text
 *     only with `client-sort` (simple static tables);  otherwise the app sorts -- frameworks own their rows.
 * - Data mode:  `rows` (+ optional `columnDefs`) with NO slotted `<table>` renders one into the LIGHT DOM
 *   (header cells `scope="col"`, a sort `<button>` each when sortable, keyed rows, text only -- never HTML).
 *   It's removed when `rows` is unset or an author table appears:  the author's table always wins.
 *   - Why light DOM:  the same page sheet and class grammar as a slotted table;  native semantics in the
 *     document;  a server renders the same `<table>` itself (first paint never needs the property).
 *   - NOTE: no virtualization (the plan's ~200-row threshold):  every row renders.
 * - NOTE: `sort-column` counts `colspan`s but not `rowspan`s (see `TableSort`).
 * - Static server render (`$/ui/static`):  no observers, effects or listeners;  `decorateStatic()` writes the author
 *   table's classes, marker and `aria-sort` once, and data mode renders its table inside the scroller (the page's
 *   static stylesheet styles it there).
 ****************/
export class UITable extends UIElement<typeof tableVocabulary> {
  @proto static vocabulary = tableVocabulary
  @proto static styles = { table: tableCSS }
  @proto static Fallback = TableFallback
  @proto static delegatesFocus = false

  /** Host `aria-label`:  the scroller region's name. */
  readonly ariaLabel = new HostAttribute(this.host, ARIA_LABEL)

  /** `sort-column`:  host-controlled, or set by clicks. */
  readonly sortColumnState = this.controlled("sort-column", undefined)

  /** `sort-direction`:  host-controlled, or set by clicks. */
  readonly sortDirectionState = this.controlled("sort-direction", undefined)

  /** First author `<table>` child (never the generated one);  follows the host's children. */
  readonly authorTable = new Cell<HTMLTableElement | undefined>(untrack(() => this.scanAuthorTable()))

  /** The generated data-mode table, once rendered (set a microtask after its `ref`). */
  readonly dataTable = new Cell<HTMLTableElement | undefined>(undefined)

  /** Bumped when the managed table's content changes (header rows, caption text ...). */
  readonly revision = new Cell(0)

  /** `rows`, when it's an array. */
  readonly dataRows = createMemo(() => {
    const rows = this.attrs.rows
    return Array.isArray(rows) ? (rows as readonly UIT.TableRow[]) : undefined
  })

  /** Data mode:  `rows` set and no author table. */
  readonly dataMode = createMemo(() => this.dataRows() !== undefined && !this.authorTable.get())

  /** Data-mode columns:  `columnDefs`, else the first row's keys. */
  readonly columns = createMemo((): readonly UIT.TableColumn[] => {
    const defs = this.attrs.columnDefs
    if (Array.isArray(defs)) return (defs as UIT.TableColumn[]).filter((column) => typeof column?.key === "string")
    const first = this.dataRows()?.[0]
    return first ? Object.keys(first).map((key) => ({ key })) : []
  })

  /** The table this element styles and sorts:  the author's, else the generated one. */
  readonly table = createMemo(() => this.authorTable.get() ?? (this.dataMode() ? this.dataTable.get() : undefined))

  /** Direction in effect:  `sort-direction`, `ascending` when only a column is set. */
  readonly direction = createMemo((): UIT.TableSortDirection | undefined =>
    this.sortColumnState.get() === undefined ? undefined : (this.sortDirectionState.get() ?? ASCENDING)
  )

  /** Data-mode rows in the current sort order;  unsorted when the column can't sort. */
  readonly sortedRows = createMemo((): readonly UIT.TableRow[] => {
    const rows = this.dataRows() ?? []
    const index = this.sortColumnState.get()
    const column = index === undefined ? undefined : this.columns()[index]
    if (!column || column.sortable === false) return rows
    const sign = this.direction() === DESCENDING ? -1 : 1
    return [...rows].sort((a, b) => TableSort.compare(a[column.key], b[column.key], sign))
  })

  /** Shadow scroller's classes, e.g. `resizable short scrolling scroller`. */
  readonly scrollerClasses = createMemo(() => TableGrammar.scroller((name) => this.scrollerValue(name)))

  /** Scrolling or overflowing:  the scroller is a focusable region. */
  readonly scrolls = createMemo(() => TableGrammar.scrolls((name) => this.scrollerValue(name)))

  /** Mirrors `classes()` onto `table()`. */
  private readonly mirror = new TableClassMirror()

  /** Headers this element made focusable (`tabindex="0"`). */
  private readonly focusable = new Set<HTMLTableCellElement>()

  /** Header this element set `aria-sort` on. */
  private sortedHeader: HTMLTableCellElement | undefined

  ////////////////
  // ## Rendering
  ////////////////

  /**
   * Base `mount()`, plus the light-DOM work:  host listeners, the author-table watch, and the effects that
   * mirror classes, watch the table, decorate headers and (with `client-sort`) reorder rows.
   */
  override mount(): JSX.Element {
    const content = super.mount()
    if (isServer) {
      this.decorateStatic()
      return content
    }
    this.listen()
    // a RENDER effect:  the class mirror is the element's main DOM binding, and a throw in its compute (the
    // classes memo) must reach the fork's error boundary -- a plain effect's error is only logged
    createRenderEffect(
      () => [this.table(), this.classes()] as const,
      ([table, classes]) => this.mirror.apply(table, classes)
    )
    createEffect(
      () => this.table(),
      (table) => this.watch(table)
    )
    createEffect(
      () => {
        this.revision.get()
        return [this.table(), this.attrs.sortable, this.sortColumnState.get(), this.direction()] as const
      },
      ([table, sortable, column, direction]) => this.decorateHeaders(table, sortable, column, direction)
    )
    createEffect(
      () => [this.authorTable.get(), this.attrs.clientSort, this.sortColumnState.get(), this.direction()] as const,
      ([table, clientSort, column, direction]) => {
        if (table && clientSort && column !== undefined && direction) TableSort.sortRows(table, column, direction)
      }
    )
    return content
  }

  /**
   * `stack-by` as a class on the table after the noun (`ui stackable table stack-by-container`):  a private word the
   * sheet keys on, from the CANONICAL value, so a translated attribute still works.  A class, not a host state:
   * `:state()` rules in the page sheet left WebKit with stale viewport media queries on a later table.
   */
  protected extraClasses(): string | undefined {
    return this.attrs.stackBy ? `${STACK_BY_CLASS}${this.attrs.stackBy}` : undefined
  }

  /**
   * `attached` (any edge), `attached-top`, `attached-bottom`:  the HOST carries the table's outer margin
   * (`ui-table.css`:  inside a size container a margin never collapses with the content above), so it mirrors the
   * attached scroller's.
   */
  protected hostStates() {
    const attached = this.scrollerValue("attached")
    return { attached: !!attached, "attached-top": attached === "top", "attached-bottom": attached === "bottom" }
  }

  render(): JSX.Element {
    this.registerPageSheets()
    return (
      <>
        <div
          class={this.scrollerClasses()}
          part={this.part("scroller")}
          tabindex={this.scrolls() ? 0 : undefined}
          role={this.scrolls() ? "region" : undefined}
          aria-label={this.scrolls() ? this.regionLabel() : undefined}
        >
          <slot />
          {isServer ? <Show when={this.dataMode()}>{this.renderStaticData()}</Show> : null}
        </div>
        {isServer ? null : (
          <Portal mount={this.host}>
            <Show when={this.dataMode()}>{this.renderData()}</Show>
          </Portal>
        )}
      </>
    )
  }

  /**
   * The data-mode table, into the host's LIGHT DOM (through the `Portal`).
   * - No classes here:  `mirror` writes them like on an author table.
   */
  private renderData(): JSX.Element {
    return <table ref={(table: HTMLTableElement) => this.adoptDataTable(table)}>{this.renderDataContent()}</table>
  }

  /**
   * The data-mode table in a static server render:  inside the scroller (no light DOM to portal into), with the
   * classes the mirror would write, and `aria-sort` on the sorted header.
   */
  private renderStaticData(): JSX.Element {
    return <table class={this.classes()}>{this.renderDataContent(this.direction())}</table>
  }

  /**
   * The data-mode table's head and body.
   * - `direction`:  the static render's `aria-sort` for the sorted column's header (the browser's comes from
   *   `decorateHeaders()`).
   */
  private renderDataContent(direction?: UIT.TableSortDirection): JSX.Element {
    const sorted = direction && this.attrs.sortable ? this.sortColumnState.get() : undefined
    return (
      <>
        <thead>
          <tr>
            <For each={this.columns()}>
              {(column, index) => this.renderHeader(column, index() === sorted ? direction : undefined)}
            </For>
          </tr>
        </thead>
        <tbody>
          <For each={this.sortedRows()}>
            {(row) => (
              <tr>
                <For each={this.columns()}>
                  {(column) => (
                    <td class={TableGrammar.cell(column) || undefined}>{TableSort.text(row[column.key])}</td>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </>
    )
  }

  /**
   * Remember the generated `table`:  marked at once (the author-table scan must skip it), stored a microtask
   * later (a `ref` runs inside the render, where signal writes are forbidden).
   */
  private adoptDataTable(table: HTMLTableElement) {
    GENERATED.add(table)
    queueMicrotask(() => this.dataTable.set(table))
  }

  /**
   * One data-mode header:  `th scope="col"`, a `<button>` inside while it can sort.
   * - `sort`:  its `aria-sort`, in a static server render only.
   */
  private renderHeader(column: UIT.TableColumn, sort?: UIT.TableSortDirection): JSX.Element {
    const text = column.header ?? column.key
    const optOut = column.sortable === false
    return (
      <th
        scope="col"
        aria-sort={sort}
        class={TableGrammar.cell(column) || undefined}
        {...{
          [UIT.TABLE_SORT_KEY]: column.key,
          [UIT.TABLE_SORT_OPT_OUT.attribute]: optOut ? UIT.TABLE_SORT_OPT_OUT.value : undefined
        }}
      >
        <Show when={this.attrs.sortable && !optOut} fallback={text}>
          <button type="button">{text}</button>
        </Show>
      </th>
    )
  }

  /**
   * Name of the scroller region:  host `aria-label`, else the table's `<caption>` text, else the `label` text.
   * - A method, read in `render()`:  the translated text needs the loaded runtime.
   */
  private regionLabel(): string {
    this.revision.get()
    const caption = this.table()?.caption?.textContent?.trim()
    return this.ariaLabel.get() ?? (caption || this.text("label"))
  }

  /**
   * Register the family's sheets as PAGE sheets too:  their class-grammar rules style the light-DOM table.
   * - Idempotent (`UI.styles.register`);  re-registering new text (hot reload) updates them in place.
   */
  private registerPageSheets() {
    if (isServer) return
    for (const [name, css] of Object.entries(this.styles)) UI.styles.register(name, css, { page: true })
  }

  ////////////////
  // ## The managed table
  ////////////////

  /**
   * Listen on the host for header clicks / keys, and watch its children for an author table.
   * - SIDE EFFECT:  undone when the host is released;  host-scoped, so it survives moves (`keepAlive`).
   */
  private listen() {
    const host = this.host
    const observer = new MutationObserver(() => this.authorTable.set(this.scanAuthorTable()))
    observer.observe(host, { childList: true })
    host.addEventListener("click", this.onClick)
    host.addEventListener("keydown", this.onKeyDown)
    host.addReleaseCallback(() => {
      observer.disconnect()
      host.removeEventListener("click", this.onClick)
      host.removeEventListener("keydown", this.onKeyDown)
      this.mirror.detach()
    })
  }

  /**
   * First `<table>` child that the element didn't render.
   * - By `localName`, not `instanceof HTMLTableElement`:  a static server render's children are linkedom elements.
   */
  private scanAuthorTable(): HTMLTableElement | undefined {
    for (const child of this.host.children) {
      if (child.localName === TABLE && !GENERATED.has(child as HTMLTableElement)) return child as HTMLTableElement
    }
    return undefined
  }

  /**
   * The author table in a static server render, once:  what the browser's effects keep up to date.
   * - its classes mirrored in (`TableClassMirror.mirrored()`)
   * - `data-ui="table"`:  a root of the static stylesheet's `@scope` too, so the table sheet reaches its cells -- a
   *   slotted element's insides are out of its owner's scope, but this sheet is a PAGE sheet in the browser
   * - `aria-sort` on the sorted header, while `sortable` (the caret)
   * - SIDE EFFECT:  writes the page's (linkedom) table;  no focusable headers:  nothing on a static page sorts.
   */
  private decorateStatic() {
    const table = untrack(this.authorTable.get)
    if (!table) return
    untrack(() => {
      table.setAttribute(CLASS, TableClassMirror.mirrored(table.getAttribute(CLASS), this.classes()))
      table.setAttribute(DATA_UI, this.vocabulary.noun)
      const column = this.sortColumnState.get()
      const direction = this.direction()
      if (!this.attrs.sortable || column === undefined || !direction) return
      TableSort.staticHeaderAt(table, column)?.setAttribute(ARIA_SORT, direction)
    })
  }

  /**
   * Watch `table`'s content (rows, header cells, caption text) and bump `revision` when it changes.
   * - Returns the cleanup (the effect runs it when the table changes).
   */
  private watch(table: HTMLTableElement | undefined): (() => void) | undefined {
    if (!table) return undefined
    const observer = new MutationObserver(() => this.revision.set(untrack(this.revision.get) + 1))
    observer.observe(table, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }

  /**
   * Header ARIA and focus for the current sort:
   * - while `sortable`, every sortable header without a `<button>` gets `tabindex="0"`;  headers that stop
   *   qualifying lose the ones THIS element set
   * - the sorted column's header gets `aria-sort`;  every other header in the `thead` loses it
   */
  private decorateHeaders(
    table: HTMLTableElement | undefined,
    sortable: boolean,
    column: number | undefined,
    direction: UIT.TableSortDirection | undefined
  ) {
    const headers = table && sortable ? TableSort.headers(table) : []
    const focusable = new Set(headers.filter((header) => TableSort.isSortable(header) && !header.querySelector(BUTTON)))
    for (const header of this.focusable) {
      if (!focusable.has(header)) {
        header.removeAttribute(TABINDEX)
        this.focusable.delete(header)
      }
    }
    for (const header of focusable) {
      if (header.hasAttribute(TABINDEX)) continue
      header.setAttribute(TABINDEX, "0")
      this.focusable.add(header)
    }
    const sorted = table && sortable && column !== undefined ? TableSort.headerAt(table, column) : undefined
    if (this.sortedHeader && this.sortedHeader !== sorted) this.sortedHeader.removeAttribute(ARIA_SORT)
    for (const header of headers) if (header !== sorted) header.removeAttribute(ARIA_SORT)
    if (sorted && direction) sorted.setAttribute(ARIA_SORT, direction)
    this.sortedHeader = sorted
  }

  ////////////////
  // ## Sorting
  ////////////////

  /** A click on (or inside) a sortable header sorts by it. */
  private readonly onClick = (event: MouseEvent) => {
    const header = this.sortableHeader(event)
    if (header) this.requestSort(header, event)
  }

  /** Enter / Space on a focusable header (not its button:  that one clicks). */
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== ENTER && event.key !== SPACE) return
    const header = this.sortableHeader(event)
    if (!header || event.target !== header) return
    event.preventDefault()
    this.requestSort(header, event)
  }

  /** The sortable header `event` happened in, while the table is `sortable`. */
  private sortableHeader(event: Event): HTMLTableCellElement | undefined {
    const table = untrack(this.table)
    if (!table || !untrack(() => this.attrs.sortable)) return undefined
    const header = TableSort.header(table, event.target)
    return header && TableSort.isSortable(header) ? header : undefined
  }

  /**
   * Sort by `header`'s column:  `ui-sort` first (cancelable), then `sort-column` / `sort-direction`.
   * - The sorted column flips direction;  another column starts `ascending`.
   * - Nothing changes when the event is cancelled, or when a handler set either property itself.
   */
  private requestSort(header: HTMLTableCellElement, originalEvent: Event) {
    const column = TableSort.column(header)
    const current = untrack(this.sortColumnState.get)
    const direction: UIT.TableSortDirection =
      column === current && untrack(this.direction) === ASCENDING ? DESCENDING : ASCENDING
    const detail: UIT.TableSortDetail = { column, key: TableSort.key(header), direction, originalEvent }
    this.sortDirectionState.request(direction, () =>
      this.sortColumnState.request(column, () => this.emit("ui-sort", detail))
    )
  }

  ////////////////
  // ## Values
  ////////////////

  /** Converted value of scroller attribute `name` (see `TableGrammar.scrollerAttributes`). */
  private scrollerValue(name: string): unknown {
    return this.classValue(name as AttributeName<typeof tableVocabulary>)
  }
}
