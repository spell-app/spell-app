/**
 * The brand colour family:  defines `<brand-color>` and exports its component, `BrandColor`,
 * and its DOM element class, `DOMBrandColorElement`.
 * - SIDE EFFECT:  importing it defines the tag.
 */
import { DOMBrandColorElement, BrandColor } from "./BrandColor"

BrandColor.define()

export { BrandColor, DOMBrandColorElement }
