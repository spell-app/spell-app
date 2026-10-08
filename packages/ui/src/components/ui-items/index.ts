/**
 * The Items view family:  defines `<ui-items>` and exports its component, `UIItems`.
 * - SIDE EFFECT:  importing it defines the tag, and `<ui-item>` and the content parts through their barrels,
 *   so a page never has to import what its items hold.
 * - Also the library's `@spell-app/ui/ui-items` entry (its size is in `docs/report.md`).
 */

import { UIItems } from "./UIItems"

import "$/ui/components/ui-item"
import "$/ui/components/ui-parts"

UIItems.define()

export { UIItems }
