import type { Temporal } from "temporal-polyfill"

import type { TemporalAPI, UIT } from "$/ui/core"
import { ISO_FORMS, MODES, ModeOptions, Moment, MomentFields, MomentLike, YEAR } from "./ui-calendar.types"

/****************
 * ### `CalendarDates`
 * The date arithmetic of one calendar, on `Temporal`:  values in and out (ISO by `type`), a cell's unit
 * (`floor()` / `same()` / `compare()`), paging (`step()`) and the views a type walks through (`modes()`).
 * - Every type is held as a `PlainDateTime`, so one comparison serves all:  a `date` at midnight, a `month` on its
 *   first day, a `year` on January 1st, a `time` on TODAY (`anchor`, read once).
 * - `T` is whichever `Temporal` the page has (`UI.i18n.temporal`):  native, or the polyfill;  values from one
 *   are never mixed with the other's, since everything here goes through `T`.
 * - Minute cells are `MINUTE_STEP` apart (Fomantic's `minTimeGap`):  a minute's unit is its 5-minute slot.
 ****************/
export class CalendarDates {
  /** Minutes between two minute cells. */
  static readonly MINUTE_STEP = 5

  /** The page's `Temporal`. */
  readonly T: TemporalAPI

  /** What the calendar picks. */
  readonly type: UIT.CalendarType

  /** Day a `time` value is held on:  today, read once. */
  readonly anchor: Temporal.PlainDate

  constructor(T: TemporalAPI, type: UIT.CalendarType) {
    this.T = T
    this.type = type
    this.anchor = T.Now.plainDateISO()
  }

  /** Has a time part (`time`, `datetime`)? */
  get hasTime(): boolean {
    return this.type === "time" || this.type === "datetime"
  }

  /** Has a date part (everything but `time`)? */
  get hasDate(): boolean {
    return this.type !== "time"
  }

  ////////////////
  // ## Values
  ////////////////

  /**
   * `value` as a moment, or `null` when empty or unreadable.
   * - Takes an ISO string of the calendar's type (a `datetime` also takes a bare date, a `date` a date-time), a
   *   `Date` (its LOCAL fields), or a Temporal object (through its ISO `toString()`).
   */
  parse(value: unknown): Moment | null {
    if (value == null || value === "") return null
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : this.fromDate(value)
    // a Temporal object's `toString()` is its ISO form
    const text = (typeof value === "string" ? value : (value as { toString(): string }).toString()).trim()
    try {
      switch (this.type) {
        case "time":
          return this.anchor.toPlainDateTime(this.T.PlainTime.from(text))
        case "year":
          return YEAR.test(text) ? this.T.PlainDateTime.from({ year: Number(text), month: 1, day: 1 }) : null
        case "month":
          return this.T.PlainYearMonth.from(text).toPlainDate({ day: 1 }).toPlainDateTime()
        case "date":
          return this.T.PlainDate.from(text).toPlainDateTime()
        default:
          return this.floor(this.T.PlainDateTime.from(text), "minute", 1)
      }
    } catch {
      return null
    }
  }

  /** ISO string of `moment` for the calendar's type:  `2026-09-30`, `14:30`, `2026-09-30T14:30`, `2026-09`, `2026`. */
  format(moment: Moment): string {
    switch (this.type) {
      case "time":
        return moment.toPlainTime().toString({ smallestUnit: "minute" })
      case "year":
        return String(moment.year).padStart(4, "0")
      case "month":
        return moment.toPlainDate().toPlainYearMonth().toString()
      case "date":
        return moment.toPlainDate().toString()
      default:
        return moment.toString({ smallestUnit: "minute" })
    }
  }

  /** Now, to the minute;  a `time` on `anchor`. */
  now(): Moment {
    const now = this.floor(this.T.Now.plainDateTimeISO(), "minute", 1)
    return this.type === "time" ? this.anchor.toPlainDateTime(now.toPlainTime()) : now
  }

  /**
   * A moment from fields, `null` when they don't make one (`reject`:  no 31st of April).
   * - What the text parser builds from what it read.
   */
  build(fields: MomentFields): Moment | null {
    try {
      return this.T.PlainDateTime.from(fields, { overflow: "reject" })
    } catch {
      return null
    }
  }

  ////////////////
  // ## Units
  ////////////////

  /**
   * Start of the `mode` unit holding `moment`:  its year's January 1st, its month's 1st, its day's midnight, its
   * hour, its minute slot (`step` minutes, default `MINUTE_STEP`).
   */
  floor(moment: Moment, mode: UIT.CalendarMode, step = CalendarDates.MINUTE_STEP): Moment {
    const time = { second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 }
    switch (mode) {
      case "year":
        return moment.with({ month: 1, day: 1, hour: 0, minute: 0, ...time })
      case "month":
        return moment.with({ day: 1, hour: 0, minute: 0, ...time })
      case "day":
        return moment.with({ hour: 0, minute: 0, ...time })
      case "hour":
        return moment.with({ minute: 0, ...time })
      default:
        return moment.with({ minute: moment.minute - (moment.minute % step), ...time })
    }
  }

  /** `a` before (`-1`), in (`0`) or after (`1`) `b`'s `mode` unit. */
  compare(a: Moment, b: Moment, mode: UIT.CalendarMode): number {
    return this.T.PlainDateTime.compare(this.floor(a, mode), this.floor(b, mode))
  }

  /** Same `mode` unit? */
  same(a: Moment | null | undefined, b: Moment | null | undefined, mode: UIT.CalendarMode): boolean {
    return !!a && !!b && this.compare(a, b, mode) === 0
  }

  /** `moment` moved by `count` `mode` units (a minute unit is `MINUTE_STEP` minutes);  day overflow clamps. */
  step(moment: Moment, mode: UIT.CalendarMode, count: number): Moment {
    switch (mode) {
      case "year":
        return moment.add({ years: count })
      case "month":
        return moment.add({ months: count })
      case "day":
        return moment.add({ days: count })
      case "hour":
        return moment.add({ hours: count })
      default:
        return moment.add({ minutes: count * CalendarDates.MINUTE_STEP })
    }
  }

  /** `moment` kept within `min` / `max` (either may be missing). */
  clamp(moment: Moment, min: Moment | null, max: Moment | null): Moment {
    if (min && this.T.PlainDateTime.compare(moment, min) < 0) return min
    if (max && this.T.PlainDateTime.compare(moment, max) > 0) return max
    return moment
  }

  ////////////////
  // ## Views
  ////////////////

  /**
   * The views this type walks through, coarse to fine;  the LAST one picks the value.
   * - `date` year => month => day;  `datetime` ... => hour => minute;  `time` hour => minute;  `month` year =>
   *   month;  `year` year.
   * - `disable-minute` drops the minute view;  `disable-month` / `disable-year` drop those views unless the type
   *   picks them.
   */
  modes({ disableMinute = false, disableMonth = false, disableYear = false }: ModeOptions = {}): UIT.CalendarMode[] {
    const all = MODES[this.type]
    const final = all.at(-1)
    return all.filter((mode) => {
      if (mode === "minute") return !disableMinute
      if (mode === final) return true
      if (mode === "month") return !disableMonth
      if (mode === "year") return !disableYear
      return true
    })
  }

  /** The view the picker opens on:  days, else hours, else the final view. */
  static startMode(modes: readonly UIT.CalendarMode[]): UIT.CalendarMode {
    return modes.find((mode) => mode === "day" || mode === "hour") ?? modes.at(-1)!
  }

  /**
   * Milliseconds for `Intl.DateTimeFormat` with `timeZone: "UTC"`:  the moment's fields, unshifted.
   * - `setUTCFullYear`, not `Date.UTC()`, which maps years 0-99 to 19xx.
   */
  static epoch(moment: MomentLike): number {
    const date = new Date(0)
    date.setUTCFullYear(moment.year, moment.month - 1, moment.day)
    date.setUTCHours(moment.hour, moment.minute, 0, 0)
    return date.getTime()
  }

  /**
   * Server render:  the fields of ISO `text` for `type`, read by hand (no `Temporal` there), for FORMATTING only;
   * `undefined` when it isn't that type's ISO form.  Unused parts are zero (a time's date:  1970-01-01).
   */
  static isoFields(text: string, type: UIT.CalendarType): MomentLike | undefined {
    const match = ISO_FORMS[type].exec(text.trim())
    if (!match) return undefined
    const numbers = match.slice(1).map(Number)
    if (type === "time") return { year: 1970, month: 1, day: 1, hour: numbers[0]!, minute: numbers[1]! }
    const [year = 1970, month = 1, day = 1, hour = 0, minute = 0] = numbers
    return { year, month, day, hour, minute }
  }

  /** A `Date`'s local fields, to the minute. */
  private fromDate(date: Date): Moment {
    const moment = this.T.PlainDateTime.from({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes()
    })
    return this.parse(this.format(moment))!
  }
}
