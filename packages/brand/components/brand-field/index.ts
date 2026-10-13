/**
 * The brand field family:  defines `<brand-field>` and exports its component, `BrandField`,
 * and its DOM element class, `DOMBrandFieldElement`.
 * - SIDE EFFECT:  importing it defines the tag.
 */
import { DOMBrandFieldElement, BrandField } from "./BrandField"

BrandField.define()

export { BrandField, DOMBrandFieldElement }
