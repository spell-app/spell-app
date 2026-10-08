/**
 * The button family:  defines `<ui-button>`, `<ui-buttons>` and `<ui-or>`, and exports their components.
 * - Also the `button` lib entry (`@spell-app/ui/ui-button`), measured in `docs/report.md`.
 * - SIDE EFFECT:  importing it defines the tags.
 */

import { UIButton } from "./UIButton"
import { UIButtons } from "./UIButtons"
import { UIOr } from "./UIOr"

UIButton.define()
UIButtons.define()
UIOr.define()

export { UIButton, UIButtons, UIOr }
