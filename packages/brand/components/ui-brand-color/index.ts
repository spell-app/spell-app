/**
 * The brand colour family:  defines `<ui-brand-color>` and exports its component, `UIBrandColor`,
 * and its DOM element class, `DOMBrandColorElement`.
 * - SIDE EFFECT:  importing it defines the tag.
 */
import { DOMBrandColorElement, UIBrandColor } from "./UIBrandColor"

UIBrandColor.define()

export { UIBrandColor, DOMBrandColorElement }
