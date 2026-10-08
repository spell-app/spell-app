/**
 * The brand colour set family:  defines `<ui-brand-color-set>`, and exports its component.
 * - SIDE EFFECT:  importing it defines the tag.
 * - Imports the `ui-brand-color` family first (SIDE EFFECT:  defines `<ui-brand-color>`), the chips it holds.
 */
import "$/brand/components/ui-brand-color"

import { UIBrandColorSet } from "./UIBrandColorSet"

UIBrandColorSet.define()

export { UIBrandColorSet }
