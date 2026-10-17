/**
 * The brand colour range family:  defines `<brand-color-range>`, and exports its component,
 * its DOM element class, `DOMBrandColorRangeElement`, and `ColorLadder`.
 * - SIDE EFFECT:  importing it defines the tag.
 * - Its component imports the `brand-color` family (SIDE EFFECT:  defines `<brand-color>`), the chips it draws.
 */
import { DOMBrandColorRangeElement, BrandColorRange } from "./BrandColorRange"

BrandColorRange.define()

export { BrandColorRange, DOMBrandColorRangeElement }
export { ColorLadder } from "./ColorLadder"
