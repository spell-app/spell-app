/**
 * `epic-summary` family barrel:  defines `<epic-summary>` (SIDE EFFECT) and exports its component, `EpicSummary`.
 * - Defines the family it draws in its shadow root first:  `<epic-review>`.
 */
import "$/epics/components/epic-review"

import { EpicSummary } from "./EpicSummary"

EpicSummary.define()

export { EpicSummary }
