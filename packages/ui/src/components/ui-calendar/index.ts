/**
 * The calendar family:  defines `<ui-calendar>`, and exports its component.
 * - Also the `calendar` lib entry (`@spell-app/ui/ui-calendar`), measured in `docs/report.md`.
 * - SIDE EFFECT:  importing it defines the tag.
 * - NOTE: `CalendarDates` / `CalendarText` / `CalendarView` are the family's helpers, not exported:
 *   their shapes follow the component.  `temporal-polyfill` is NOT imported here:
 *   `UI.i18n.loadTemporal()` loads it (a lazy chunk) only in browsers without `Temporal`.
 */

import { UICalendar } from "./UICalendar"

UICalendar.define()

export { UICalendar }
