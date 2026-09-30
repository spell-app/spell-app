/**
 * Barrel for the list -- also the `list` lib entry (`@spell/ui/list`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-list>`, and `<ui-item>` through the item barrel, so a page never has to import
 *   the items it lists.
 */

import { UIList } from "./UIList"

import "$/components/item"

UIList.define()

export { UIList }
