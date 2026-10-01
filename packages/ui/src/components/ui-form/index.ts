/**
 * Barrel for the form components -- also the `form` lib entry (`@spell-app/ui/ui-form`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-field>`, `<ui-fields>` and `<ui-form>`.
 * - NOTE: the controls are their own families (`input`, `checkbox`, `dropdown`):  a form validates whatever
 *   form-associated elements and native controls it holds, without importing them.
 */

import { UIField } from "./UIField"
import { UIFields } from "./UIFields"
import { UIForm } from "./UIForm"

UIField.define()
UIFields.define()
UIForm.define()

export { UIField, UIFields, UIForm }
