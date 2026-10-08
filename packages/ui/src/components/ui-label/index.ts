/**
 * The label family:  defines `<ui-label>` and `<ui-labels>`, and exports their components, `UILabel` and `UILabels`.
 * - SIDE EFFECT:  importing it defines the tags.
 * - Also the library's `@spell-app/ui/ui-label` entry (its size is in `docs/report.md`).
 */

import { UILabel } from "./UILabel"
import { UILabels } from "./UILabels"

UILabel.define()
UILabels.define()

export { UILabel, UILabels }
