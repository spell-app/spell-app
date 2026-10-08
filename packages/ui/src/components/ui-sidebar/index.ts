/**
 * The sidebar family:  defines `<ui-pushable>`, `<ui-pusher>` and `<ui-sidebar>`,
 * and exports their components, `UIPushable`, `UIPusher` and `UISidebar`.
 * - SIDE EFFECT:  importing it defines the tags.
 * - NOTE: a sidebar's content (usually a `<ui-menu vertical>`) is the page's to import.
 * - Also the library's `@spell-app/ui/ui-sidebar` entry (its size is in `docs/report.md`).
 */

import { UIPushable } from "./UIPushable"
import { UIPusher } from "./UIPusher"
import { UISidebar } from "./UISidebar"

UIPushable.define()
UIPusher.define()
UISidebar.define()

export { UIPushable, UIPusher, UISidebar }
