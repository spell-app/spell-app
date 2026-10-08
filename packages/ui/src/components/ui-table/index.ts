/**
 * The table family:  defines `<ui-table>` and exports its component, `UITable`.
 * - SIDE EFFECT:  importing it defines the tag.
 * - Also the library's `@spell-app/ui/ui-table` entry (its size is in `docs/report.md`).
 * - NOTE: `TableClassMirror`, `TableGrammar` and `TableSort` are internal helpers, not exported.
 */

import { UITable } from "./UITable"

UITable.define()

export { UITable }
