/**
 * `ui-brand-color-set` family barrel:  defines `<ui-brand-color-set>` (SIDE EFFECT) and exports its class.
 * - Imports the `ui-brand-color` family first (SIDE EFFECT:  defines `<ui-brand-color>`), the chips it holds.
 */
import "$/brand/components/ui-brand-color"

import { UIBrandColorSet } from "./UIBrandColorSet"

UIBrandColorSet.define()

export { UIBrandColorSet }
