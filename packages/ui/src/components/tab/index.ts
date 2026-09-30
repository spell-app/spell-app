/**
 * Barrel for the tab components -- also the `tab` lib entry (`@spell/ui/tab`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-tab>` (a pane) and `<ui-tabs>`, which registers as the owner of `tab` panes.
 * - NOTE: `<ui-tabs>` adopts `menu.css` for its tab list, and `<ui-tab>` `segment.css`, as sheets only:  no
 *   `<ui-menu>` or `<ui-segment>` is defined here.
 */

import { UITab } from "./UITab"
import { UITabs } from "./UITabs"

UITab.define()
UITabs.define()

export { UITab, UITabs }
