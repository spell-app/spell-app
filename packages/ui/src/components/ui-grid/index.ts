/**
 * The grid family:  defines `<ui-grid>`, `<ui-row>` and `<ui-column>`,
 * and exports their components, `UIGrid`, `UIRow` and `UIColumn`.
 * - SIDE EFFECT:  importing it defines the tags.
 * - Also the library's `@spell-app/ui/ui-grid` entry (its size is in `docs/report.md`).
 * - NOTE: `GridPart` (the three's base) is internal.
 */

import { UIGrid } from "./UIGrid"
import { UIRow } from "./UIRow"
import { UIColumn } from "./UIColumn"

UIGrid.define()
UIRow.define()
UIColumn.define()

export { UIGrid, UIRow, UIColumn }
