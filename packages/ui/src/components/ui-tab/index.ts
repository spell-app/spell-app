/**
 * The tab family:  defines `<ui-tab>` (a pane) and `<ui-tabs>` (the tab set, the owner of `tab` panes),
 * and exports their components, `UITab` and `UITabs`.
 * - SIDE EFFECT:  importing it defines the tags.
 * - NOTE: `<ui-tabs>` adopts `UIMenu.css` for its tab list, and `<ui-tab>` `UISegment.css`, as sheets only:
 *   no `<ui-menu>` or `<ui-segment>` is defined here.
 * - Also the library's `@spell-app/ui/ui-tab` entry (its size is in `docs/report.md`).
 */

import { UITab } from "./UITab"
import { UITabs } from "./UITabs"

UITab.define()
UITabs.define()

export { UITab, UITabs }
