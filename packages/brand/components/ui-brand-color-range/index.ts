/**
 * `ui-brand-color-range` family barrel:  defines `<ui-brand-color-range>` (SIDE EFFECT) and exports its class, host
 * and `ColorLadder`.
 * - Its element imports the `ui-brand-color` family (SIDE EFFECT:  defines `<ui-brand-color>`), the chips it draws.
 */
import { UIBrandColorRange } from "./UIBrandColorRange"

UIBrandColorRange.define()

export { UIBrandColorRange }
export { BrandColorRangeHost } from "./BrandColorRangeHost"
export { ColorLadder } from "./ColorLadder"
