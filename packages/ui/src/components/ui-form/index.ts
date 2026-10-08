/**
 * The form family:  defines `<ui-field>`, `<ui-fields>` and `<ui-form>`, and exports their components
 * (`UIField`, `UIFields`, `UIForm`) and DOM element classes (`DOMFieldElement`, `DOMFormElement`).
 * - SIDE EFFECT:  importing it defines the tags.
 * - Also the library's `@spell-app/ui/ui-form` entry (its size is in `docs/report.md`).
 * - NOTE: the controls are their own families (`input`, `checkbox`, `dropdown`):  a form validates whatever
 *   form-associated elements and native controls it holds, without importing them.
 */

import { DOMFieldElement, UIField } from "./UIField"
import { UIFields } from "./UIFields"
import { DOMFormElement, UIForm } from "./UIForm"

UIField.define()
UIFields.define()
UIForm.define()

export { UIField, UIFields, UIForm, DOMFieldElement, DOMFormElement }
