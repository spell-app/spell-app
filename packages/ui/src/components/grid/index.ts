/**
 * Barrel for the grid components -- also the `grid` lib entry (`@spell/ui/grid`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-grid>`, `<ui-row>` and `<ui-column>`.
 * - NOTE: `GridPart` (the three's base) is internal.
 */

import { UIGrid } from "./UIGrid"
import { UIRow } from "./UIRow"
import { UIColumn } from "./UIColumn"

UIGrid.define()
UIRow.define()
UIColumn.define()

export { UIGrid, UIRow, UIColumn }
