/**
 * The brand colour range family:  defines `<ui-brand-color-range>`, and exports its component,
 * its DOM element class, `DOMBrandColorRangeElement`, and `ColorLadder`.
 * - SIDE EFFECT:  importing it defines the tag.
 * - Its component imports the `ui-brand-color` family (SIDE EFFECT:  defines `<ui-brand-color>`), the chips it draws.
 */
import { DOMBrandColorRangeElement, UIBrandColorRange } from "./UIBrandColorRange"

UIBrandColorRange.define()

export { UIBrandColorRange, DOMBrandColorRangeElement }
export { ColorLadder } from "./ColorLadder"
