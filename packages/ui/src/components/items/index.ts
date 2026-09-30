/**
 * Barrel for the Items view -- also the `items` lib entry (`@spell/ui/items`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-items>`, and `<ui-item>` and the content parts through their barrels, so a page never
 *   has to import what its items hold.
 */

import { UIItems } from "./UIItems"

import "$/components/item"
import "$/components/parts"

UIItems.define()

export { UIItems }
