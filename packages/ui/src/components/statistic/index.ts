/**
 * Barrel for the statistic components -- also the `statistic` lib entry (`@spell/ui/statistic`), measured in
 * `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-statistic>` and `<ui-statistics>`.
 * - NOTE: the value and label are the generic parts (`<ui-value>`, `<ui-label>`):  load `@spell/ui/parts` and
 *   `@spell/ui/label` for slotted ones;  the `value` / `label` shorthands need neither.
 */

import { UIStatistic } from "./UIStatistic"
import { UIStatistics } from "./UIStatistics"

UIStatistic.define()
UIStatistics.define()

export { UIStatistic, UIStatistics }
