/**
 * Loose constants, types and helpers of `<ui-table>`:  its element classes and native fallback import them from here.
 */

import type { UIT } from "$/ui/core"

////////////////
// ## TableClassMirror
////////////////

/** The attribute mirrored. */
export const CLASS = "class"

////////////////
// ## TableGrammar
////////////////

/** Scroller attributes that make it scroll. */
export const SCROLLING = "scrolling"
export const OVERFLOWING = "overflowing"

////////////////
// ## TableSort
////////////////

/** Tag of a header cell. */
export const HEADER = "th"

/** Tag of a table. */
export const TABLE = "table"

/** A cell's column span attribute. */
export const COLSPAN = "colspan"

/** A table's own header rows, as a selector (`TableSort.staticHeaderAt()`). */
export const STATIC_HEADER_ROWS = ":scope > thead > tr"

/** The flipped direction. */
export const DESCENDING: UIT.TableSortDirection = "descending"

////////////////
// ## UITable
////////////////

/** Tables the element rendered itself:  never mistaken for an author's. */
export const GENERATED = new WeakSet<HTMLTableElement>()

/** The static server render's component-root marker (`$/ui/server`'s flattener writes it on every root). */
export const DATA_UI = "data-ui"

/** Header attributes the element manages. */
export const ARIA_SORT = "aria-sort"

export const SPACE = " "

/** Sort directions. */
export const ASCENDING: UIT.TableSortDirection = "ascending"

////////////////
// ## ui-table.fallback
////////////////

/** The fallback's one part. */
export const SCROLLER = "scroller"

/** Prefix of the class `stack-by` adds to the table:  `stack-by-container`, `stack-by-viewport`. */
export const STACK_BY_CLASS = "stack-by-"
