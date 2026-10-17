/**
 * The brand flourish family:  defines `<brand-flourish>` and exports its component, `BrandFlourish`,
 * and `Flourish`, which draws the art.
 * - SIDE EFFECT:  importing it defines the tag.
 */
import { BrandFlourish } from "./BrandFlourish"

BrandFlourish.define()

export { BrandFlourish }
export { Flourish } from "./Flourish"
