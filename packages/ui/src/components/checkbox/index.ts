/**
 * Barrel for the checkbox components -- also the `checkbox` lib entry (`@spell-app/ui/checkbox`), measured in
 * `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-checkbox>` and `<ui-radio>`.
 */

import { UICheckbox } from "./UICheckbox"
import { UIRadio } from "./UIRadio"

UICheckbox.define()
UIRadio.define()

export { UICheckbox, UIRadio }
