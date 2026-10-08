/**
 * The dropdown family:  defines `<ui-dropdown>`, and exports its component.
 * - Also the `dropdown` lib entry (`@spell-app/ui/ui-dropdown`), measured in `docs/report.md`.
 * - SIDE EFFECT:  importing it defines `<ui-item>` (through `$/ui/components/ui-item`, first,
 *   so the dropdown can read upgraded items), then `<ui-dropdown>`.
 * - `UIItem` belongs to the `item` family (`@spell-app/ui/ui-item`, shared with list and menu):
 *   it isn't exported here.
 */

import { UIDropdown } from "./UIDropdown"

import "$/ui/components/ui-item"

UIDropdown.define()

export { UIDropdown }
