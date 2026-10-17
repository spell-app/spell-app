/**
 * `epic-page` family barrel:  defines `<epic-page>` (SIDE EFFECT) and exports its class.
 * - Defines the family it draws in its shadow root first:  `<epic-agents>`.
 */
import "$/epics/components/epic-agents"

import { EpicPage } from "./EpicPage"

EpicPage.define()

export { EpicPage }
