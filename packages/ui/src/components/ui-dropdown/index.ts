/**
 * Barrel for the dropdown -- also the `dropdown` lib entry (`@spell-app/ui/ui-dropdown`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-item>` (through `$/ui/components/ui-item`, first, so the dropdown can read upgraded
 *   items) and `<ui-dropdown>`.
 * - NOTE: `UIItem` is the `item` family's now (`@spell-app/ui/ui-item`, shared with list and menu);  not re-exported here.
 */

import { UIDropdown } from "./UIDropdown"

import "$/ui/components/ui-item"

UIDropdown.define()

export { UIDropdown }
