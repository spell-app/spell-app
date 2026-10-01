/**
 * Barrel for the dropdown -- also the `dropdown` lib entry (`@spell-app/ui/dropdown`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-item>` (through `$/ui/components/item`, first, so the dropdown can read upgraded
 *   items) and `<ui-dropdown>`.
 * - NOTE: `UIItem` is the `item` family's now (`@spell-app/ui/item`, shared with list and menu);  not re-exported here.
 */

import { UIDropdown } from "./UIDropdown"

import "$/ui/components/item"

UIDropdown.define()

export { UIDropdown }
