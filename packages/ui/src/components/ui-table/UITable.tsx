// oxlint-disable-next-line spell-ui/no-solid-effect -- the class mirror's RENDER effect:  a throw must reach the error net
import { For, Show, createRenderEffect } from "solid-js"
import { Portal, isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { tableVocabulary } from "./UITable.en"
import { TableClassMirror } from "./TableClassMirror"
import { TableGrammar } from "./TableGrammar"
import { TableSort } from "./TableSort"

import tableCSS from "./UITable.css?inline"

/****************
 * ### `UITable`
 * The component behind `<ui-table>`:
 * a native `<table>` in Fomantic's table look, `<ui-table celled striped><table>...</table></ui-table>`.
 *
 * - The table stays NATIVE and in the LIGHT DOM (table semantics, find-in-page, copy, the page's CSS);
 *   the shadow root is only `<div class="... scroller" part="scroller"><slot></slot></div>`.
 *
 * - Styling:  the component mirrors its class string (`ui celled striped table`, from `ClassBuilder`)
 *   onto the slotted table (`TableClassMirror`), and registers `UITable.css` as a PAGE sheet too,
 *   whose class-grammar rules then style it.
 *   - The mirror writes only its own words and keeps the author's classes,
 *     and writes them again when a framework rewrites `className`.
 *   - Why classes, not attribute selectors on the DOM element:
 *     one mechanical port of `table.less` serves the element and static markup
 *     (a server writes `class="ui celled table"` and paints before any JS),
 *     and translated names, `yes` / `no` and `medium` resolve through the vocabulary like every other component's.
 *
 * - Row and cell looks are the author's classes on native `tr` / `td` / `th`
 *   (`positive`, `red marked left`, `collapsing` ...):  no JS.
 *
 * - Scrolling:  `scrolling` and `overflowing` cap the scroller's height.
 *   It then scrolls, and is a focusable, named region
 *   (the DOM element's `aria-label`, else the `<caption>`, else the translated `label`).
 *
 * - Sorting (`sortable`):  every `thead` header sorts, except `th[data-sortable="false"]` and `th.disabled`.
 *   - A header's `<button>` is its control (APG's sortable table:  authors SHOULD put one in each sortable header);
 *     a header without one is made focusable (`tabindex="0"`) and answers Enter and Space.
 *     The component never moves or wraps the author's nodes.
 *   - The sorted header gets `aria-sort` (removed from the others);  `UITable.css` draws the caret from it.
 *   - `sort-column` and `sort-direction` are auto-controlled.
 *     Each activation first sends the cancelable `ui-sort` (`TableSortDetail`):
 *     the sorted column flips, another starts `ascending`.
 *   - Reordering:  data mode shows its rows sorted.
 *     A slotted table reorders its `tbody` rows by cell text only with `client-sort` (simple static tables);
 *     otherwise the app sorts:  frameworks own their rows.
 *
 * - Data mode:  `rows` (and optional `columnDefs`), with NO slotted `<table>`, draws one into the LIGHT DOM:
 *   header cells `scope="col"`, a sort `<button>` each when sortable, keyed rows, text only (never HTML).
 *   It's removed when `rows` is unset or an author table appears:  the author's table always wins.
 *   - Why the light DOM:  the same page sheet and class grammar as a slotted table,
 *     native semantics in the document,
 *     and a server draws the same `<table>` itself (first paint never needs the property).
 *   - NOTE: no virtualization (the plan's ~200-row threshold):  every row is drawn.
 *
 * - NOTE: `sort-column` counts `colspan`s but not `rowspan`s (see `TableSort`).
 *
 * - Static server render (`$/ui/static`):  no observers, effects or listeners.
 *   `decorateStatic()` writes the author table's classes, marker and `aria-sort` once,
 *   and data mode draws its table inside the scroller (the page's static style sheet styles it there).
 ****************/
export class UITable extends E.UIComponent<typeof tableVocabulary> {
  @E.proto static vocabulary = tableVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { table: tableCSS },
    // the scroller and the light-DOM headers take focus themselves
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## Rendering
  ////////////////

  /**
   * Base `onMount()`, plus the light-DOM work:
   * - the render effect that mirrors classes onto the managed table
   *   (undone when the DOM element is released:  it survives moves)
   * - the `@onChange` methods watch the table, decorate headers and (with `client-sort`) reorder rows
   */
  override onMount(): JSX.Element {
    const content = super.onMount()
    if (isServer) {
      this.decorateStatic()
      return content
    }
    this.domElement.addReleaseCallback(() => this.classMirror.detach())
    // stays explicit, a RENDER effect:  the class mirror is the element's main DOM binding,
    // and a throw in its compute (the classes) must reach the element's error net --
    // a plain effect's error is only logged
    createRenderEffect(
      () => [this.managedTable, this.rootClass] as const,
      ([table, classes]) => this.classMirror.apply(table, classes)
    )
    return content
  }

  render(): JSX.Element {
    this.registerPageSheets()
    return (
      <>
        <div
          class={this.scrollerClasses}
          part={this.partForName("scroller")}
          tabindex={this.scrollerScrolls ? 0 : undefined}
          role={this.scrollerScrolls ? "region" : undefined}
          aria-label={this.scrollerScrolls ? this.regionLabel : undefined}
        >
          <slot />
          {isServer ? <Show when={this.isInDataMode}>{this.staticTable()}</Show> : undefined}
        </div>
        {isServer ? undefined : (
          <Portal mount={this.domElement}>
            <Show when={this.isInDataMode}>{this.generatedTable()}</Show>
          </Portal>
        )}
      </>
    )
  }

  /**
   * Register the family's sheets as PAGE sheets too:  their class-grammar rules style the light-DOM table.
   * - Idempotent (`UI.styles.register`);  re-registering new text (hot reload) updates them in place.
   */
  private registerPageSheets() {
    if (isServer) return
    for (const [name, css] of Object.entries(this.elementSetup.styleSheets))
      UI.styles.register(name, css, { page: true })
  }

  /**
   * `stack-by` as a class on the table before the noun (`ui stackable stack-by-container table`):
   * a private word the sheet keys on, from the CANONICAL value, so a translated attribute still works.
   * - A class, not a state of the DOM element:
   *   `:state()` rules in the page sheet left WebKit with stale viewport media queries on a later table.
   */
  protected get extraClass(): string | undefined {
    return this.stackBy ? `${STACK_BY_CLASS}${this.stackBy}` : undefined
  }

  ////////////////
  // ## The managed table
  ////////////////

  /** First author `<table>` child (never the generated one);  follows the DOM element's children. */
  @E.watches({ childList: true })
  get authorTable(): HTMLTableElement | undefined {
    return this.scanAuthorTable()
  }

  /** The generated data-mode table, once rendered (set a microtask after its `ref`). */
  @E.state accessor dataTable: HTMLTableElement | undefined = undefined

  /** Bumped when the managed table's content changes (header rows, caption text ...). */
  @E.state accessor tableRevision = 0

  /** The table this element styles and sorts:  the author's, else the generated one. */
  get managedTable(): HTMLTableElement | undefined {
    return this.authorTable ?? (this.isInDataMode ? this.dataTable : undefined)
  }

  /** Mirrors `rootClass` onto `managedTable`. */
  private readonly classMirror = new TableClassMirror()

  /**
   * First `<table>` child that the element didn't render.
   * - By `localName`, not `instanceof HTMLTableElement`:  a static server render's children are linkedom elements.
   */
  private scanAuthorTable(): HTMLTableElement | undefined {
    for (const child of this.domElement.children) {
      if (child.localName === "table" && !GENERATED.has(child as HTMLTableElement)) return child as HTMLTableElement
    }
    return undefined
  }

  /**
   * Watch the managed table's content (rows, header cells, caption text) and bump `tableRevision` when it changes.
   * - Returns the cleanup (run when the table changes).
   */
  @E.onChange("managedTable")
  protected onManagedTableChanged(table: HTMLTableElement | undefined): (() => void) | undefined {
    if (!table) return undefined
    // oxlint-disable-next-line spell-ui/no-mutation-observer -- watches the managed TABLE, swapped with it
    const observer = new MutationObserver(() => this.tableRevision++)
    observer.observe(table, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }

  /**
   * The author table in a static server render, once:  what the browser's effects keep up to date.
   * - its classes mirrored in (`TableClassMirror.mirrored()`)
   * - `data-ui="table"`:  a root of the static stylesheet's `@scope` too, so the table sheet reaches its cells
   *   (a slotted element's insides are out of its owner's scope, but this sheet is a PAGE sheet in the browser)
   * - `aria-sort` on the sorted header, while `sortable` (the caret)
   * - SIDE EFFECT:  writes the page's (linkedom) table;  no focusable headers:  nothing on a static page sorts.
   */
  @E.untracked
  private decorateStatic() {
    const table = this.authorTable
    if (!table) return
    table.setAttribute("class", TableClassMirror.mirrored(table.getAttribute("class"), this.rootClass))
    table.setAttribute(UIT.STATIC_ROOT, this.vocabulary.noun)
    const column = this.sortColumn
    const direction = this.effectiveSortDirection
    if (!this.sortable || column === undefined || !direction) return
    TableSort.staticHeaderAt(table, column)?.setAttribute("aria-sort", direction)
  }

  ////////////////
  // ## Data mode
  ////////////////

  /** `rows`, when it's an array. */
  get dataRows(): readonly UIT.TableRow[] | undefined {
    const rows = this.rows
    return Array.isArray(rows) ? (rows as readonly UIT.TableRow[]) : undefined
  }

  /** Data mode:  `rows` set and no author table. */
  get isInDataMode(): boolean {
    return this.dataRows !== undefined && !this.authorTable
  }

  /** Data-mode columns:  `columnDefs`, else the first row's keys. */
  @E.derived
  get dataColumns(): readonly UIT.TableColumn[] {
    const defs = this.columnDefs
    if (Array.isArray(defs)) return (defs as UIT.TableColumn[]).filter((column) => typeof column?.key === "string")
    const first = this.dataRows?.[0]
    return first ? Object.keys(first).map((key) => ({ key })) : []
  }

  /** Data-mode rows in the current sort order;  unsorted when the column can't sort. */
  @E.derived
  get sortedRows(): readonly UIT.TableRow[] {
    const rows = this.dataRows ?? []
    const index = this.sortColumn
    const column = index === undefined ? undefined : this.dataColumns[index]
    if (!column || column.sortable === false) return rows
    const sign = this.effectiveSortDirection === "descending" ? -1 : 1
    return [...rows].sort((a, b) => TableSort.compare(a[column.key], b[column.key], sign))
  }

  /**
   * The data-mode table, into the DOM element's LIGHT DOM (through the `Portal`).
   * - No classes here:  `classMirror` writes them like on an author table.
   */
  private generatedTable(): JSX.Element {
    return <table ref={(table: HTMLTableElement) => this.adoptDataTable(table)}>{this.headAndBody()}</table>
  }

  /**
   * The data-mode table in a static server render:  inside the scroller (no light DOM to portal into),
   * with the classes the mirror would write, and `aria-sort` on the sorted header.
   */
  private staticTable(): JSX.Element {
    return <table class={this.rootClass}>{this.headAndBody(this.effectiveSortDirection)}</table>
  }

  /**
   * The data-mode table's head and body.
   * - `direction`:  the static render's `aria-sort` for the sorted column's header
   *   (the browser's comes from `decorateHeaders()`).
   */
  private headAndBody(direction?: UIT.TableSortDirection): JSX.Element {
    const sorted = direction && this.sortable ? this.sortColumn : undefined
    return (
      <>
        <thead>
          <tr>
            <For each={this.dataColumns}>
              {(column, index) => this.columnHeader(column, index() === sorted ? direction : undefined)}
            </For>
          </tr>
        </thead>
        <tbody>
          <For each={this.sortedRows}>
            {(row) => (
              <tr>
                <For each={this.dataColumns}>
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
   * Remember the generated `table`:  marked at once (the author-table scan must skip it),
   * stored a microtask later (a `ref` runs inside the render, an owned scope).
   */
  private adoptDataTable(table: HTMLTableElement) {
    GENERATED.add(table)
    E.afterSolidUpdate(() => (this.dataTable = table))
  }

  /**
   * One data-mode header:  `th scope="col"`, a `<button>` inside while it can sort.
   * - `sort`:  its `aria-sort`, in a static server render only.
   */
  private columnHeader(column: UIT.TableColumn, sort?: UIT.TableSortDirection): JSX.Element {
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
        <Show when={this.sortable && !optOut} fallback={text}>
          <button type="button">{text}</button>
        </Show>
      </th>
    )
  }

  ////////////////
  // ## Sorting
  ////////////////

  /** `sort-column`:  page-controlled, or set by clicks. */
  @E.controlled("sort-column") accessor sortColumn: number | undefined = undefined

  /** `sort-direction`:  page-controlled, or set by clicks. */
  @E.controlled("sort-direction") accessor sortDirection: UIT.TableSortDirection | undefined = undefined

  /** Direction in effect:  `sortDirection`, `ascending` when only a column is set. */
  get effectiveSortDirection(): UIT.TableSortDirection | undefined {
    return this.sortColumn === undefined ? undefined : (this.sortDirection ?? "ascending")
  }

  /** Headers this element made focusable (`tabindex="0"`). */
  private readonly headersMadeFocusable = new Set<HTMLTableCellElement>()

  /** Header this element set `aria-sort` on. */
  private sortedHeader: HTMLTableCellElement | undefined

  /** The table, its content, `sortable` or the sort changed:  decorate the headers again. */
  @E.onChange("tableRevision", "managedTable", "sortable", "sortColumn", "effectiveSortDirection")
  protected onSortChanged(
    _revision: number,
    table: HTMLTableElement | undefined,
    isSortable: boolean,
    column: number | undefined,
    direction: UIT.TableSortDirection | undefined
  ) {
    this.decorateHeaders({ table, isSortable, column, direction })
  }

  /**
   * Header ARIA and focus for the current sort:
   * - while `sortable`, every sortable header without a `<button>` gets `tabindex="0"`;
   *   headers that stop qualifying lose the ones THIS element set
   * - the sorted column's header gets `aria-sort`;  every other header in the `thead` loses it
   */
  private decorateHeaders({ table, isSortable, column, direction }: HeaderSort) {
    const headers = table && isSortable ? TableSort.headers(table) : []
    const focusable = new Set(
      headers.filter((header) => TableSort.isSortable(header) && !header.querySelector("button"))
    )
    for (const header of this.headersMadeFocusable) {
      if (!focusable.has(header)) {
        header.removeAttribute("tabindex")
        this.headersMadeFocusable.delete(header)
      }
    }
    for (const header of focusable) {
      if (header.hasAttribute("tabindex")) continue
      header.setAttribute("tabindex", "0")
      this.headersMadeFocusable.add(header)
    }
    const sorted = table && isSortable && column !== undefined ? TableSort.headerAt(table, column) : undefined
    if (this.sortedHeader && this.sortedHeader !== sorted) this.sortedHeader.removeAttribute("aria-sort")
    for (const header of headers) if (header !== sorted) header.removeAttribute("aria-sort")
    if (sorted && direction) sorted.setAttribute("aria-sort", direction)
    this.sortedHeader = sorted
  }

  /** `client-sort`:  reorder the author table's `tbody` rows by the sorted column's cell text. */
  @E.onChange("authorTable", "clientSort", "sortColumn", "effectiveSortDirection")
  protected onClientSortChanged(
    table: HTMLTableElement | undefined,
    clientSort: boolean,
    column: number | undefined,
    direction: UIT.TableSortDirection | undefined
  ) {
    if (table && clientSort && column !== undefined && direction) TableSort.sortRows(table, column, direction)
  }

  /** A click on (or inside) a sortable header sorts by it. */
  @E.on("click")
  protected onClick(event: MouseEvent) {
    const header = this.sortableHeader(event)
    if (header) this.requestSort(header, event)
  }

  /** Enter / Space on a focusable header (not its button:  that one clicks). */
  @E.on("keydown")
  protected onKeyDown(event: KeyboardEvent) {
    if (event.key !== UIT.Key.enter && event.key !== UIT.Key.space) return
    const header = this.sortableHeader(event)
    if (!header || event.target !== header) return
    event.preventDefault()
    this.requestSort(header, event)
  }

  /** The sortable header `event` happened in, while the table is `sortable`. */
  @E.untracked
  private sortableHeader(event: Event): HTMLTableCellElement | undefined {
    const table = this.managedTable
    if (!table || !this.sortable) return undefined
    const header = TableSort.header(table, event.target)
    return header && TableSort.isSortable(header) ? header : undefined
  }

  /**
   * Sort by `header`'s column:  `ui-sort` first (cancelable), then `sort-column` / `sort-direction`.
   * - The sorted column flips direction;  another column starts `ascending`.
   * - Nothing changes when the event is cancelled, or when a handler set either property itself.
   */
  @E.untracked
  private requestSort(header: HTMLTableCellElement, originalEvent: Event) {
    const column = TableSort.column(header)
    const current = this.sortColumn
    const direction: UIT.TableSortDirection =
      column === current && this.effectiveSortDirection === "ascending" ? "descending" : "ascending"
    const detail: UIT.TableSortDetail = { column, key: TableSort.key(header), direction, originalEvent }
    this.requestChange("sortDirection", direction, () =>
      this.requestChange("sortColumn", column, () => this.send("ui-sort", detail))
    )
  }

  ////////////////
  // ## The scroller
  ////////////////

  /** Shadow scroller's classes, e.g. `resizable short scrolling scroller`. */
  @E.derived
  get scrollerClasses(): string {
    return TableGrammar.scroller((name) => this.scrollerValue(name))
  }

  /** Scrolling or overflowing:  the scroller is a focusable region. */
  get scrollerScrolls(): boolean {
    return TableGrammar.scrolls((name) => this.scrollerValue(name))
  }

  /**
   * Name of the scroller region:  the DOM element's `aria-label`, else the table's `<caption>` text,
   * else the `label` text.
   * - Read in `render()`:  the translated text needs the loaded runtime;  follows `tableRevision` (a new caption).
   */
  private get regionLabel(): string {
    void this.tableRevision
    const caption = this.managedTable?.caption?.textContent?.trim()
    return this.attributes["aria-label"] ?? (caption || this.translationForKey("label"))
  }

  // `attached` (any edge), `attached-top`, `attached-bottom`:
  // the DOM element carries the table's outer margin, so it mirrors the attached scroller's
  // (`UITable.css`:  inside a size container a margin never collapses with the content above).

  /** Attached on any edge:  `:state(attached)`. */
  @E.cssState("attached")
  get isAttached(): boolean {
    return !!this.scrollerValue("attached")
  }

  /** Attached at the top:  `:state(attached-top)`. */
  @E.cssState("attached-top")
  get isAttachedTop(): boolean {
    return this.scrollerValue("attached") === UIT.TOP
  }

  /** Attached at the bottom:  `:state(attached-bottom)`. */
  @E.cssState("attached-bottom")
  get isAttachedBottom(): boolean {
    return this.scrollerValue("attached") === UIT.BOTTOM
  }

  /** Converted value of scroller attribute `name` (`TableGrammar.scroller()`'s). */
  private scrollerValue(name: string): unknown {
    return this.classValue(name as E.AttributeName<typeof tableVocabulary>)
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UITable extends E.AttributeValues<typeof tableVocabulary> {}

/** What `decorateHeaders()` decorates for. */
type HeaderSort = {
  /** the managed table, if any */
  table: HTMLTableElement | undefined
  /** `sortable` */
  isSortable: boolean
  /** sorted column, if any */
  column: number | undefined
  /** its direction, if any */
  direction: UIT.TableSortDirection | undefined
}

/** Tables the element rendered itself (data mode):  never mistaken for an author's. */
const GENERATED = new WeakSet<HTMLTableElement>()

/** Prefix of the class `stack-by` adds to the table:  `stack-by-container`, `stack-by-viewport`. */
const STACK_BY_CLASS = "stack-by-"
