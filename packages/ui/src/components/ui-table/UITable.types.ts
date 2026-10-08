/**
 * Constants the `ui-table` family's files share:  its component (`UITable`) and its helpers (`TableClassMirror`,
 * `TableSort`).
 * - Pure data, at the bottom of the folder's imports:  types only, so node can load it (`yarn site:data`).
 * - A constant ONE class uses is a module constant below that class (epic `wwod-spell-ui`, Q18).
 */

import type { UIT } from "$/ui/core"

////////////////
// ## The light-DOM table
////////////////

/** Tag of a table:  the slotted author table, and the one data mode renders. */
export const TABLE = "table"

/** The table's `class` attribute, which the element mirrors its class string onto (`TableClassMirror`). */
export const CLASS = "class"

////////////////
// ## Sorting
////////////////

/** The flipped sort direction:  a sorted column's second activation (`UITable`), and `TableSort`'s sign. */
export const DESCENDING: UIT.TableSortDirection = "descending"
