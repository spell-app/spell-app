/**
 * The input family:  defines `<ui-input>` and `<ui-textarea>`, and exports their components.
 * - Also the `input` lib entry (`@spell-app/ui/ui-input`), measured in `docs/report.md`.
 * - SIDE EFFECT:  importing it defines the tags.
 */

import { UIInput } from "./UIInput"
import { UITextarea } from "./UITextarea"

UIInput.define()
UITextarea.define()

export { UIInput, UITextarea }
