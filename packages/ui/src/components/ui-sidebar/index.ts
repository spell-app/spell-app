/**
 * Barrel for the sidebar -- also the `sidebar` lib entry (`@spell-app/ui/ui-sidebar`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-pushable>`, `<ui-pusher>` and `<ui-sidebar>`.
 * - NOTE: a sidebar's content (usually a `<ui-menu vertical>`) is the page's to import.
 */

import { UIPushable } from "./UIPushable"
import { UIPusher } from "./UIPusher"
import { UISidebar } from "./UISidebar"

UIPushable.define()
UIPusher.define()
UISidebar.define()

export { UIPushable, UIPusher, UISidebar }
