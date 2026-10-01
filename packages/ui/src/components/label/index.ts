/**
 * Barrel for the label components -- also the `label` lib entry (`@spell-app/ui/label`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-label>` and `<ui-labels>`.
 */

import { UILabel } from "./UILabel"
import { UILabels } from "./UILabels"

UILabel.define()
UILabels.define()

export { UILabel, UILabels }
