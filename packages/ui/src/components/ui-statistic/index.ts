/**
 * Barrel for the statistic components -- also the `statistic` lib entry (`@spell-app/ui/ui-statistic`), measured in
 * `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-statistic>` and `<ui-statistics>`.
 * - NOTE: the value and label are the generic parts (`<ui-value>`, `<ui-label>`):  load `@spell-app/ui/ui-parts` and
 *   `@spell-app/ui/ui-label` for slotted ones;  the `value` / `label` shorthands need neither.
 */

import { UIStatistic } from "./UIStatistic"
import { UIStatistics } from "./UIStatistics"

UIStatistic.define()
UIStatistics.define()

export { UIStatistic, UIStatistics }
