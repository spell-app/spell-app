import { describe, expect, test } from "vite-plus/test"

import { TableSort } from "./TableSort"

/** A structured head (two rows, a colspan) over a body whose numbers sort differently as text. */
const STRUCTURED =
  `<thead><tr><th colspan="2">Person</th><th rowspan="2" data-key="count">Count</th></tr>` +
  `<tr><th data-key="first">First</th><th data-sortable="false">Last</th></tr></thead>` +
  `<tbody><tr><td>Jamie</td><td>Doe</td><td>10</td></tr>` +
  `<tr><td>Jill</td><td>Roe</td><td>9</td></tr>` +
  `<tr><td>John</td><td>Poe</td><td>100</td></tr>` +
  `<tr><td>Zoe</td></tr></tbody>`

////////////////
// ## Headers and columns
////////////////

describe("TableSort.header()", () => {
  test("finds the header cell a click landed in, ONLY in the table's own head", () => {
    const table = tableOf(
      `<thead><tr><th><button>Name</button></th></tr></thead>` +
        `<tbody><tr><th>Row head</th><td><table><thead><tr><th>Inner</th></tr></thead></table></td></tr></tbody>`
    )
    const [name, rowHead, inner] = table.querySelectorAll("th")
    expect(TableSort.header(table, name!.querySelector("button"))).toBe(name)
    expect(TableSort.header(table, rowHead!)).toBeUndefined()
    expect(TableSort.header(table, inner!)).toBeUndefined()
    expect(TableSort.header(table, null)).toBeUndefined()
  })
})

describe("TableSort.headers()", () => {
  test("lists every head cell, row by row", () => {
    const headers = TableSort.headers(tableOf(STRUCTURED))
    expect(headers.map((header) => header.textContent)).toEqual(["Person", "Count", "First", "Last"])
  })
})

describe("TableSort.isSortable()", () => {
  test('is false for `data-sortable="false"` and Fomantic\'s `class="disabled"`', () => {
    const table = tableOf(
      `<thead><tr><th>A</th><th data-sortable="false">B</th><th class="disabled">C</th></tr></thead>`
    )
    expect(TableSort.headers(table).map((header) => TableSort.isSortable(header))).toEqual([true, false, false])
  })
})

describe("TableSort.column()", () => {
  test("counts the colspans before a cell", () => {
    const [person, count] = TableSort.headers(tableOf(STRUCTURED))
    expect([TableSort.column(person!), TableSort.column(count!)]).toEqual([0, 2])
  })
})

describe("TableSort.cellAt()", () => {
  test("finds the cell covering a column;  nothing past the row's end", () => {
    const row = tableOf(STRUCTURED).tHead!.rows[0]!
    expect([0, 1, 2, 3].map((column) => TableSort.cellAt(row, column)?.textContent)).toEqual([
      "Person",
      "Person",
      "Count",
      undefined
    ])
  })
})

describe("TableSort.headerAt() / staticHeaderAt()", () => {
  test("answer the LOWEST header row's cell covering a column, the same with or without the table DOM API", () => {
    const table = tableOf(STRUCTURED)
    const lowest = [0, 1, 2].map((column) => TableSort.headerAt(table, column)?.textContent)
    // a `rowspan` from the row above isn't counted:  column 2's lowest header is the top row's
    expect(lowest).toEqual(["First", "Last", "Count"])
    expect([0, 1, 2].map((column) => TableSort.staticHeaderAt(table, column)?.textContent)).toEqual(lowest)
  })
})

describe("TableSort.key()", () => {
  test("reads `data-key`;  nothing without one", () => {
    const [person, count] = TableSort.headers(tableOf(STRUCTURED))
    expect([TableSort.key(person!), TableSort.key(count!)]).toEqual([undefined, "count"])
  })
})

////////////////
// ## Sorting
////////////////

describe("TableSort.sortRows()", () => {
  test("orders body rows by a column's text, numbers numerically, a row without that cell last", () => {
    const table = tableOf(STRUCTURED)
    TableSort.sortRows(table, 2, "ascending")
    expect(firstCells(table)).toEqual(["Jill", "Jamie", "John", "Zoe"])
    TableSort.sortRows(table, 2, "descending")
    expect(firstCells(table)).toEqual(["John", "Jamie", "Jill", "Zoe"])
  })

  test("moves NOTHING when the rows are in order already", () => {
    const table = tableOf(STRUCTURED)
    TableSort.sortRows(table, 0, "ascending")
    const observer = new MutationObserver(() => undefined)
    observer.observe(table, { childList: true, subtree: true })
    TableSort.sortRows(table, 0, "ascending")
    expect(observer.takeRecords()).toEqual([])
    observer.disconnect()
  })
})

describe("TableSort.compare()", () => {
  test("puts missing values last in BOTH directions", () => {
    for (const sign of [1, -1]) {
      expect(["b", "", "a", null].sort((a, b) => TableSort.compare(a, b, sign))).toEqual(
        sign === 1 ? ["a", "b", "", null] : ["b", "a", "", null]
      )
    }
  })

  test("compares numbers numerically, and text with numbers in it naturally", () => {
    expect([10, 9, 100].sort((a, b) => TableSort.compare(a, b, 1))).toEqual([9, 10, 100])
    expect(["item 10", "item 9"].sort((a, b) => TableSort.compare(a, b, 1))).toEqual(["item 9", "item 10"])
  })
})

describe("TableSort.text()", () => {
  test("writes primitives as text, nothing as empty, objects as JSON", () => {
    expect([TableSort.text(3), TableSort.text(true), TableSort.text(null), TableSort.text({ a: 1 })]).toEqual([
      "3",
      "true",
      "",
      '{"a":1}'
    ])
  })
})

////////////////
// ## Helpers
////////////////

/** A detached `<table>` holding `html`. */
function tableOf(html: string): HTMLTableElement {
  const table = document.createElement("table")
  table.innerHTML = html
  return table
}

/** The body rows' first cell texts, top to bottom. */
function firstCells(table: HTMLTableElement): string[] {
  return [...table.tBodies[0]!.rows].map((row) => row.cells[0]!.textContent!)
}
