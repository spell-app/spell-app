/**
 * The brand flourish family:  defines `<ui-brand-flourish>` and exports its component, `UIBrandFlourish`,
 * and `Flourish`, which draws the art.
 * - SIDE EFFECT:  importing it defines the tag.
 */
import { UIBrandFlourish } from "./UIBrandFlourish"

UIBrandFlourish.define()

export { UIBrandFlourish }
export { Flourish } from "./Flourish"
