/**
 * The menu family:  defines `<ui-menu>` and exports its component, `UIMenu`.
 * - SIDE EFFECT:  importing it defines the tag, and `<ui-item>` first (through `$/ui/components/ui-item`:
 *   menus hold generic items).  The menu registers as the owner of `item`, `menu` (sub-menus) and `header` parts.
 * - Also the library's `@spell-app/ui/ui-menu` entry (its size is in `docs/report.md`).
 */

import { UIMenu } from "./UIMenu"

import "$/ui/components/ui-item"

UIMenu.define()

export { UIMenu }
