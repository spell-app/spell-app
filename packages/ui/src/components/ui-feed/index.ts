/**
 * The feed family:  defines `<ui-feed>` and `<ui-event>`, and exports their components, `UIFeed` and `UIFeedEvent`.
 * - SIDE EFFECT:  importing it defines the tags, and the generic content parts through the parts barrel,
 *   so a page never has to import what its events hold.
 * - Also the library's `@spell-app/ui/ui-feed` entry (its size is in `docs/report.md`).
 */

import { UIFeed } from "./UIFeed"
import { UIFeedEvent } from "./UIFeedEvent"

import "$/ui/components/ui-parts"

UIFeed.define()
UIFeedEvent.define()

export { UIFeed, UIFeedEvent }
