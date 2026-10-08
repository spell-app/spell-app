/**
 * The list family:  defines `<ui-list>` and exports its component, `UIList`.
 * - SIDE EFFECT:  importing it defines the tag, and `<ui-item>` through the item barrel,
 *   so a page never has to import the items it lists.
 * - Also the library's `@spell-app/ui/ui-list` entry (its size is in `docs/report.md`).
 */

import { UIList } from "./UIList"

import "$/ui/components/ui-item"

UIList.define()

export { UIList }
