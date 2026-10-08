/**
 * The statistic family:  defines `<ui-statistic>` and `<ui-statistics>`,
 * and exports their components, `UIStatistic` and `UIStatistics`.
 * - SIDE EFFECT:  importing it defines the tags.
 * - Also the library's `@spell-app/ui/ui-statistic` entry (its size is in `docs/report.md`).
 * - NOTE: the value and label are the generic parts (`<ui-value>`, `<ui-label>`):
 *   load `@spell-app/ui/ui-parts` and `@spell-app/ui/ui-label` for slotted ones;  the `value` / `label` shorthands need
 *   neither.
 */

import { UIStatistic } from "./UIStatistic"
import { UIStatistics } from "./UIStatistics"

UIStatistic.define()
UIStatistics.define()

export { UIStatistic, UIStatistics }
