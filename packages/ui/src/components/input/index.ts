/**
 * Barrel for the input components -- also the `input` lib entry (`@spell/ui/input`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-input>` and `<ui-textarea>`.
 */

import { UIInput } from "./UIInput"
import { UITextarea } from "./UITextarea"

UIInput.define()
UITextarea.define()

export { UIInput, UITextarea }
