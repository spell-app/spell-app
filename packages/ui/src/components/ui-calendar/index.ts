/**
 * Barrel for the calendar -- also the `calendar` lib entry (`@spell-app/ui/ui-calendar`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-calendar>`.
 * - NOTE: `CalendarDates` / `CalendarText` / `CalendarView` are the family's helpers, not exported:  their
 *   shapes follow the element.  `temporal-polyfill` is NOT imported here:  `UI.i18n.loadTemporal()` loads it
 *   (a lazy chunk) only in browsers without `Temporal`.
 */

import { UICalendar } from "./UICalendar"

UICalendar.define()

export { UICalendar }
