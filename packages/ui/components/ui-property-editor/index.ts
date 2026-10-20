/**
 * The property editor family:  defines `<ui-property-editor>`, `<ui-property-group>` and `<ui-property>`,
 * and exports their components.
 * - SIDE EFFECT:  importing it defines the tags.
 *   Its components import the form and section families first:  the editor is a form and draws a section,
 *   a group is a section, a property is a field.
 * - Also the library's `@spell-app/ui/ui-property-editor` entry.
 */

import { DOMPropertyElement, UIProperty } from "./UIProperty"
import { DOMPropertyEditorElement, UIPropertyEditor } from "./UIPropertyEditor"
import { DOMPropertyGroupElement, UIPropertyGroup } from "./UIPropertyGroup"

UIPropertyEditor.define()
UIPropertyGroup.define()
UIProperty.define()

export {
  UIPropertyEditor,
  UIPropertyGroup,
  UIProperty,
  DOMPropertyEditorElement,
  DOMPropertyGroupElement,
  DOMPropertyElement
}
