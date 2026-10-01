/**
 * Barrel for the menu -- also the `menu` lib entry (`@spell-app/ui/menu`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-item>` (through `$/ui/components/item`:  menus hold generic items) and `<ui-menu>`,
 *   which registers as the owner of `item`, `menu` (sub-menus) and `header` parts.
 */

import { UIMenu } from "./UIMenu"

import "$/ui/components/item"

UIMenu.define()

export { UIMenu }
