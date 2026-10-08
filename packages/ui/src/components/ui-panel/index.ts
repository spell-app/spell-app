/**
 * The panel family:  defines `<ui-panel>` and exports its component, `UIPanel`.
 * - SIDE EFFECT:  importing it defines the tag.
 *   `UIPanel` imports the section family first, which defines `<ui-sections>` and `<ui-section>`:
 *   a panel extends the section, and nests in one.
 * - Also the library's `@spell-app/ui/ui-panel` entry (its size is in `docs/report.md`).
 */

import { UIPanel } from "./UIPanel"

UIPanel.define()

export { UIPanel }
