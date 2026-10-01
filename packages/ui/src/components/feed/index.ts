/**
 * Barrel for the feed components -- also the `feed` lib entry (`@spell-app/ui/feed`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-feed>` and `<ui-event>`, and the generic content parts through the parts barrel, so
 *   a page never has to import what its events hold.
 */

import { UIFeed } from "./UIFeed"
import { UIFeedEvent } from "./UIFeedEvent"

import "$/ui/components/parts"

UIFeed.define()
UIFeedEvent.define()

export { UIFeed, UIFeedEvent }
