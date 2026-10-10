/**
 * `epic-page` family barrel:  defines `<epic-page>` (SIDE EFFECT) and exports its class.
 * - Defines the families it draws in its shadow root first:  `<epic-new-item>`, `<epic-agents>`.
 */
import "$/epics/components/epic-new-item"
import "$/epics/components/epic-agents"

import { EpicPage } from "./EpicPage"

EpicPage.define()

export { EpicPage }
