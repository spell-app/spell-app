/**
 * Barrel for the menu -- also the `menu` lib entry (`@spell/ui/menu`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-item>` (through `$/components/item`:  menus hold generic items) and `<ui-menu>`,
 *   which registers as the owner of `item`, `menu` (sub-menus) and `header` parts.
 */

import { UIMenu } from "./UIMenu"

import "$/components/item"

UIMenu.define()

export { UIMenu }
