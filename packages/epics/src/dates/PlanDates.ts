import { PLAN_DATE, type ReadPlanDate } from "./dates.types"

/****************
 * ### `PlanDates`
 * Dates as a plan doc's elements DRAW them:  `10/8/26 14:34`, or `10/8/26` for a day alone (Owen, 2026-10-08,
 * epic `epic-components` P13:  "Use this format for all dates other than in logs").
 * - month and day without a leading zero, a two-digit year, 24-hour `HH:MM`, LOCAL time
 * - reads every form a doc's attributes hold:  `2026-10-08`, `2026-10-08 14:34`, ISO with a `T`, seconds and an
 *   offset (`2026-10-08T14:34:05-04:00`, `...Z`);  a time without an offset is the writer's local time, as written
 * - formats at draw time:  the docs keep their attributes as they are, no migration
 * - NOT the log's (`<epic-event>` keeps `2026-10-08 14:34`), nor the agents panel's ages (`3m`)
 * - STATIC, pure, node-safe:  no DOM, no clock;  elements and node tools alike import it (`$/epics/dates`)
 ****************/
export class PlanDates {
  /**
   * `value` as drawn:  `2026-10-08 14:34` -> `10/8/26 14:34`, `2026-10-08` -> `10/8/26`.
   * - `""` for none;  `value` unchanged when it won't parse (a date written by hand, `...`)
   * - NEVER throws
   */
  static format(value: string | null | undefined): string {
    if (!value) return ""
    const read = PlanDates.read(value)
    return read ? PlanDates.formatDate(read.date, read.hasTime) : value
  }

  /** `date`, local, as drawn:  `10/8/26 14:34`;  `10/8/26` without `withTime`. */
  static formatDate(date: Date, withTime = true): string {
    const day = `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear() % 100).padStart(2, "0")}`
    return withTime ? `${day} ${PlanDates.clock(date)}` : day
  }

  /** `date`'s local time of day, 24-hour:  `14:34`, `09:05`.  The format's time half, for a time shown alone. */
  static clock(date: Date): string {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  }

  /**
   * `value` read as a date:  the moment, and whether it named a time of day;  `undefined` when it won't parse.
   * - with an offset (`Z`, `-04:00`):  that moment, drawn in LOCAL time
   * - without one:  local time, as written;  a day alone is local midnight
   * - a date that doesn't exist (`2026-02-30`, `25:00`):  `undefined`
   */
  static read(value: string): ReadPlanDate | undefined {
    const match = PLAN_DATE.exec(value.trim())
    if (!match) return undefined
    const [, year, month, day, hours, minutes, seconds = "00", offset] = match
    const hasTime = hours !== undefined
    if (offset) {
      const zone = offset === "Z" || offset === "z" ? "Z" : offset.replace(/^([+-]\d\d):?(\d\d)$/, "$1:$2")
      const date = new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}${zone}`)
      return isNaN(date.getTime()) ? undefined : { date, hasTime }
    }
    const parts = [year, month, day, hours ?? "0", minutes ?? "0", seconds].map(Number)
    const date = new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5])
    // `new Date()` rolls an impossible date over (Feb 30 -> Mar 2):  refuse it instead
    const exists =
      date.getFullYear() === parts[0] &&
      date.getMonth() === parts[1] - 1 &&
      date.getDate() === parts[2] &&
      date.getHours() === parts[3] &&
      date.getMinutes() === parts[4]
    return exists ? { date, hasTime } : undefined
  }
}
