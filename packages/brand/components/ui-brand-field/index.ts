/**
 * The brand field family:  defines `<ui-brand-field>` and exports its component, `UIBrandField`,
 * and its DOM element class, `DOMBrandFieldElement`.
 * - SIDE EFFECT:  importing it defines the tag.
 */
import { DOMBrandFieldElement, UIBrandField } from "./UIBrandField"

UIBrandField.define()

export { UIBrandField, DOMBrandFieldElement }
