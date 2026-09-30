/**
 * Barrel for the table component -- also the `table` lib entry (`@spell/ui/table`).
 * - SIDE EFFECT:  defines `<ui-table>`.
 * - NOTE: `TableClassMirror`, `TableGrammar` and `TableSort` are internal helpers, not exported.
 */

import { UITable } from "./UITable"

UITable.define()

export { UITable }
