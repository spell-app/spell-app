/**
 * The brand colour set family:  defines `<brand-color-set>`, and exports its component.
 * - SIDE EFFECT:  importing it defines the tag.
 * - Imports the `brand-color` family first (SIDE EFFECT:  defines `<brand-color>`), the chips it holds.
 */
import "$/brand/components/brand-color"

import { BrandColorSet } from "./BrandColorSet"

BrandColorSet.define()

export { BrandColorSet }
