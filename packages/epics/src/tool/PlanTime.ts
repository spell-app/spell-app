import type { Duration } from "./planDoc.types"

/****************
 * ### `PlanTime`
 * Dates, times and estimates as a plan doc writes them:  LOCAL time, `YYYY-MM-DD HH:MM` for people, ISO with its
 * offset for machines;  phase estimates (`1-2h`) as minutes and back.
 * - STATIC and instance-free on purpose:  pure functions of their arguments, no clock unless passed one.
 * - From `packages/docs/tools/plan-doc.js` (epic `epic-components`, P7).
 ****************/
export class PlanTime {
  ////////////////
  // ## Dates and times
  ////////////////

  /** `date`'s local date, `YYYY-MM-DD`. */
  static isoDate(date = new Date()): string {
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${date.getFullYear()}-${month}-${day}`
  }

  /**
   * `date` as ISO local time with its offset, to the second:  `2026-10-04T12:46:05-04:00`.
   * - an item's change stamp (`data-changed`):  compared with a commit time (`git log --format=%cI`), same form
   */
  static isoTime(date = new Date()): string {
    const minutes = -date.getTimezoneOffset()
    const sign = minutes < 0 ? "-" : "+"
    const offset = `${sign}${pad(Math.floor(Math.abs(minutes) / 60))}:${pad(Math.abs(minutes) % 60)}`
    const clock = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    return `${PlanTime.isoDate(date)}T${clock}${offset}`

    /** `7` -> `07`. */
    function pad(value: number): string {
      return String(value).padStart(2, "0")
    }
  }

  /**
   * `date` as ISO local time with its offset, to the minute:  `2026-09-30T23:30-07:00`.
   * - a log line's time (`<epic-event at>`), which the element shows as `2026-09-30 23:30`
   */
  static isoMinutes(date = new Date()): string {
    return PlanTime.isoTime(date).replace(/:\d\d(?=[+-]\d\d:\d\d$)/, "")
  }

  /** `date`, local, as `YYYY-MM-DD HH:MM`:  an Original Discussion version's "As of". */
  static clockTime(date: Date): string {
    return `${PlanTime.isoDate(date)} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  }

  /** `YYYY-MM-DD` as a `Date`:  local midnight that day. */
  static localDay(day: string): Date {
    const [year, month, date] = day.split("-").map(Number)
    return new Date(year, month - 1, date)
  }

  ////////////////
  // ## Estimates
  ////////////////

  /**
   * An estimate as minutes, `{ min, max }`;  `undefined` when it won't parse.
   * - `30m`, `45 min`, `2h`, `1.5h`, `1h30m`, `~2h`;  a range:  `1-2h`, `30m-1h`
   */
  static parseDuration(estimate: string | undefined): Duration | undefined {
    const value = estimate?.toLowerCase().replace(/~/g, "").trim()
    if (!value) return undefined
    const range = value.match(/^([\d.]+)\s*-\s*([\d.]+)\s*(h|m|min)$/)
    if (range) return { min: PlanTime.toMinutes(range[1], range[3]), max: PlanTime.toMinutes(range[2], range[3]) }
    const ends = value.split(/\s*-\s*/)
    if (ends.length > 2) return undefined
    const [min, max] = ends.map(PlanTime.sumUnits)
    if (min === undefined || (ends.length === 2 && max === undefined)) return undefined
    return { min, max: max ?? min }
  }

  /** `ranges` added up. */
  static sumRanges(ranges: Duration[]): Duration {
    return ranges.reduce((total, range) => ({ min: total.min + range.min, max: total.max + range.max }), {
      min: 0,
      max: 0
    })
  }

  /** `{ min: 60, max: 150 }` -> `1h-2h 30m`;  one value when they're equal. */
  static formatRange({ min, max }: Duration): string {
    return min === max ? PlanTime.formatMinutes(min) : `${PlanTime.formatMinutes(min)}-${PlanTime.formatMinutes(max)}`
  }

  /** 90 -> `1h 30m`, 45 -> `45m`, 120 -> `2h`, 0 -> `0m`. */
  static formatMinutes(total: number): string {
    const hours = Math.floor(total / 60)
    const rest = total % 60
    return [hours && `${hours}h`, (rest || !hours) && `${rest}m`].filter(Boolean).join(" ")
  }

  ////////////////
  // ## Internal
  ////////////////

  /** `1h30m` -> 90;  `undefined` unless the whole of `value` is hours and minutes. */
  private static sumUnits(value: string): number | undefined {
    const parts = Array.from(value.matchAll(/([\d.]+)\s*(h|min|m)(?![a-z])\s*/g))
    if (
      !parts.length ||
      parts
        .map((part) => part[0])
        .join("")
        .trim() !== value.trim()
    )
      return undefined
    return parts.reduce((total, part) => total + PlanTime.toMinutes(part[1], part[2]), 0)
  }

  /** `count` `unit`s (`h` / `m` / `min`) in minutes. */
  private static toMinutes(count: string, unit: string): number {
    return Math.round(Number(count) * (unit === "h" ? 60 : 1))
  }
}
