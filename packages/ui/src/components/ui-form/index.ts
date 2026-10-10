/**
 * The form family:  defines `<ui-field>`, `<ui-fields>`, `<ui-form>` and `<ui-repeat>`, and exports their components
 * (`UIField`, `UIFields`, `UIForm`, `UIRepeat`) and DOM element classes (`DOMFieldElement`, `DOMFormElement`).
 * - SIDE EFFECT:  importing it defines the tags.
 * - `<ui-repeat>` after `<ui-form>`:  a repeat reads its list from the form around it, which then exists already.
 * - Also the library's `@spell-app/ui/ui-form` entry (its size is in `docs/report.md`).
 * - NOTE: the controls are their own families (`input`, `checkbox`, `dropdown`):  a form validates (and binds)
 *   whatever form-associated elements and native controls it holds, without importing them.
 */

import { DOMFieldElement, UIField } from "./UIField"
import { UIFields } from "./UIFields"
import { DOMFormElement, UIForm } from "./UIForm"
import { UIRepeat } from "./UIRepeat"

UIField.define()
UIFields.define()
UIForm.define()
UIRepeat.define()

export { UIField, UIFields, UIForm, UIRepeat, DOMFieldElement, DOMFormElement }
