/**
 * The checkbox family:  defines `<ui-checkbox>` and `<ui-radio>`, and exports their components
 * and their DOM element class, `DOMCheckElement`.
 * - Also the `checkbox` lib entry (`@spell-app/ui/ui-checkbox`), measured in `docs/report.md`.
 * - SIDE EFFECT:  importing it defines the tags.
 */

import { DOMCheckElement } from "./CheckControl"
import { UICheckbox } from "./UICheckbox"
import { UIRadio } from "./UIRadio"

UICheckbox.define()
UIRadio.define()

export { UICheckbox, UIRadio, DOMCheckElement }
