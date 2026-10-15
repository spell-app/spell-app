import { UIT } from "$/ui/core"

/****************
 * ### `TableSort`
 * Sorting mechanics of a NATIVE table, as static helpers:  which header a click hit, its column,
 * and reordering `tbody` rows by cell text (`client-sort`).  Plain DOM, no state.
 * - Columns count `colspan`s:  `<th colspan="2">` covers columns 0 and 1, the next header is column 2.
 *   NOTE: `rowspan`s from rows above are not counted (a structured table's lower header row numbers its own
 *   cells), and a spanning cell in the body answers for its FIRST column.
 * - Comparison:  `Intl.Collator(undefined, { numeric: true })` -- `item 9` before `item 10`, locale-aware,
 *   stable (`Array.prototype.sort`).
 * - STATIC and instance-free on purpose:  it holds no state, and the element and its static render share it.
 ****************/
export class TableSort {
  /**
   * The `thead` header cell of `table` that `target` is in, or `undefined`.
   * - Only `table`'s own header rows:  a table nested in a cell doesn't count.
   */
  static header(table: HTMLTableElement, target: EventTarget | null): HTMLTableCellElement | undefined {
    const cell = target instanceof Element ? target.closest("th") : undefined
    if (!(cell instanceof HTMLTableCellElement) || cell.closest("table") !== table) return undefined
    return cell.parentElement?.parentElement === table.tHead ? cell : undefined
  }

  /** Every header cell in `table`'s `thead`, row by row. */
  static headers(table: HTMLTableElement): HTMLTableCellElement[] {
    const cells: HTMLTableCellElement[] = []
    for (const row of table.tHead?.rows ?? []) {
      for (const cell of row.cells) if (cell.localName === "th") cells.push(cell)
    }
    return cells
  }

  /** Can `header` sort?  Not with `data-sortable="false"` or Fomantic's `class="disabled"`. */
  static isSortable(header: HTMLTableCellElement): boolean {
    return (
      header.getAttribute(UIT.TABLE_SORT_OPT_OUT.attribute) !== UIT.TABLE_SORT_OPT_OUT.value &&
      !header.classList.contains(UIT.DISABLED)
    )
  }

  /** Column index of `cell` in its row, counting the `colspan`s before it. */
  static column(cell: HTMLTableCellElement): number {
    let column = 0
    for (let previous = cell.previousElementSibling; previous; previous = previous.previousElementSibling) {
      if (previous instanceof HTMLTableCellElement) column += previous.colSpan
    }
    return column
  }

  /** The header for `column`:  the lowest header row's cell covering it (the most specific), if any. */
  static headerAt(table: HTMLTableElement, column: number): HTMLTableCellElement | undefined {
    const rows = [...(table.tHead?.rows ?? [])].reverse()
    for (const row of rows) {
      const cell = TableSort.cellAt(row, column)
      if (cell?.localName === "th") return cell
    }
    return undefined
  }

  /** `row`'s cell covering `column`, if any. */
  static cellAt(row: HTMLTableRowElement, column: number): HTMLTableCellElement | undefined {
    let start = 0
    for (const cell of row.cells) {
      if (column < start + cell.colSpan) return column >= start ? cell : undefined
      start += cell.colSpan
    }
    return undefined
  }

  /**
   * `headerAt()` without the table DOM API (`tHead`, `rows`, `cells`, `colSpan`):  a static server render's tables
   * are linkedom elements, which have none.  Same answer:  the lowest header row's `th` covering `column`.
   */
  static staticHeaderAt(table: Element, column: number): Element | undefined {
    const rows = [...table.querySelectorAll(STATIC_HEADER_ROWS)].reverse()
    for (const row of rows) {
      let start = 0
      for (const cell of row.children) {
        const span = Number(cell.getAttribute("colspan")) || 1
        if (column < start + span) {
          if (column >= start && cell.localName === "th") return cell
          break
        }
        start += span
      }
    }
    return undefined
  }

  /** `header`'s `data-key`, for `ui-sort`'s detail. */
  static key(header: HTMLTableCellElement): string | undefined {
    return header.getAttribute(UIT.TABLE_SORT_KEY) ?? undefined
  }

  /**
   * Reorder each `tbody`'s rows by the text of their cell in `column`.
   * - SIDE EFFECT:  moves `tr` nodes, only when the order changes (so a sorted table sees no mutation).
   * - Rows without that cell sort last, in their order.
   */
  static sortRows(table: HTMLTableElement, column: number, direction: UIT.TableSortDirection) {
    const sign = direction === "descending" ? -1 : 1
    for (const body of table.tBodies) {
      const rows = [...body.rows]
      const texts = new Map(rows.map((row) => [row, TableSort.cellAt(row, column)?.textContent?.trim()]))
      const sorted = [...rows].sort((a, b) => TableSort.compare(texts.get(a), texts.get(b), sign))
      if (sorted.every((row, index) => row === rows[index])) continue
      body.append(...sorted)
    }
  }

  /**
   * Order of two values under `sign` (`1` ascending, `-1` descending).
   * - `undefined` / `null` / `""` last, whatever the direction;  two numbers numerically;
   *   else the collator over their text.
   */
  static compare(a: unknown, b: unknown, sign: number): number {
    const missingA = a == null || a === ""
    const missingB = b == null || b === ""
    if (missingA || missingB) return Number(missingA) - Number(missingB)
    if (typeof a === "number" && typeof b === "number") return (a - b) * sign
    return COLLATOR.compare(TableSort.text(a), TableSort.text(b)) * sign
  }

  /** A value as text:  primitives `String()`ed, `null` / `undefined` empty, anything else as JSON. */
  static text(value: unknown): string {
    if (value == null) return ""
    if (typeof value === "object") return JSON.stringify(value)
    return String(value as string | number | boolean | bigint | symbol)
  }
}

/** A table's own header rows, as a selector (`staticHeaderAt()`). */
const STATIC_HEADER_ROWS = ":scope > thead > tr"

/** Numeric-aware collator for cell text and data values:  one per page. */
const COLLATOR = new Intl.Collator(undefined, { numeric: true })
