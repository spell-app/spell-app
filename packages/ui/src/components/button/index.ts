/**
 * Barrel for the button components -- also the `button` lib entry (`@spell/ui/button`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-button>`, `<ui-buttons>`, `<ui-or>`.
 */

import { UIButton } from "./UIButton"
import { UIButtons } from "./UIButtons"
import { UIOr } from "./UIOr"

UIButton.define()
UIButtons.define()
UIOr.define()

export { UIButton, UIButtons, UIOr }
