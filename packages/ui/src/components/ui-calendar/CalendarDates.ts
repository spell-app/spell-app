import type { Temporal } from "temporal-polyfill"

import type { E, UIT } from "$/ui/core"
import { MINUTE_STEP, type ModeOptions, type Moment, type MomentFields, type MomentLike } from "./UICalendar.types"

/****************
 * ### `CalendarDates`
 * The date arithmetic of one calendar, on `Temporal`:  values in and out (ISO by `type`),
 * a cell's unit (`floor()` / `same()` / `compare()`), paging (`step()`) and the views a type walks through (`modes()`).
 * - Every type is held as a `PlainDateTime`, so one comparison serves all:  a `date` at midnight, a `month` on its
 *   first day, a `year` on January 1st, a `time` on TODAY (`anchor`, read once).
 * - `temporal` is whichever `Temporal` the page has (`UI.i18n.temporal`):  native, or the polyfill;
 *   values from one are never mixed with the other's, since everything here goes through `temporal`.
 * - Minute cells are `MINUTE_STEP` apart (Fomantic's `minTimeGap`):  a minute's unit is its 5-minute slot.
 ****************/
export class CalendarDates {
  /**
   * The page's `Temporal`.
   * - STATIC for the object's life:  a calendar that gets another one builds another `CalendarDates`.
   */
  readonly temporal: E.TemporalAPI

  /** What the calendar picks. */
  readonly type: UIT.CalendarType

  /** Day a `time` value is held on:  today, read once. */
  readonly anchor: Temporal.PlainDate

  constructor({ temporal, type }: CalendarDatesProps) {
    this.temporal = temporal
    this.type = type
    this.anchor = temporal.Now.plainDateISO()
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
   * `value` as a moment, or `undefined` when empty or unreadable.
   * - Takes an ISO string of the calendar's type (a `datetime` also takes a bare date, a `date` a date-time),
   *   a `Date` (its LOCAL fields), or a Temporal object (through its ISO `toString()`).
   * - NEVER throws.
   */
  parse(value: unknown): Moment | undefined {
    if (value == null || value === "") return undefined
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : this.fromDate(value)
    // a Temporal object's `toString()` is its ISO form
    const text = (typeof value === "string" ? value : (value as { toString(): string }).toString()).trim()
    const { temporal } = this
    try {
      switch (this.type) {
        case "time":
          return this.anchor.toPlainDateTime(temporal.PlainTime.from(text))
        case "year":
          return YEAR.test(text) ? temporal.PlainDateTime.from({ year: Number(text), month: 1, day: 1 }) : undefined
        case "month":
          return temporal.PlainYearMonth.from(text).toPlainDate({ day: 1 }).toPlainDateTime()
        case "date":
          return temporal.PlainDate.from(text).toPlainDateTime()
        default:
          return this.floor(temporal.PlainDateTime.from(text), "minute", 1)
      }
    } catch {
      return undefined
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
    const now = this.floor(this.temporal.Now.plainDateTimeISO(), "minute", 1)
    return this.type === "time" ? this.anchor.toPlainDateTime(now.toPlainTime()) : now
  }

  /**
   * A moment from fields, `undefined` when they don't make one (`reject`:  no 31st of April).
   * - What the text parser builds from what it read.
   */
  build(fields: MomentFields): Moment | undefined {
    try {
      return this.temporal.PlainDateTime.from(fields, { overflow: "reject" })
    } catch {
      return undefined
    }
  }

  ////////////////
  // ## Units
  ////////////////

  /**
   * Start of the `mode` unit holding `moment`:  its year's January 1st, its month's 1st, its day's midnight,
   * its hour, its minute slot (`step` minutes, default `MINUTE_STEP`).
   */
  floor(moment: Moment, mode: UIT.CalendarMode, step = MINUTE_STEP): Moment {
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
    return this.temporal.PlainDateTime.compare(this.floor(a, mode), this.floor(b, mode))
  }

  /** Same `mode` unit?  `false` when either is missing. */
  same(a: Moment | undefined, b: Moment | undefined, mode: UIT.CalendarMode): boolean {
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
        return moment.add({ minutes: count * MINUTE_STEP })
    }
  }

  /** `moment` kept within `min` / `max` (either may be missing). */
  clamp(moment: Moment, min: Moment | undefined, max: Moment | undefined): Moment {
    if (min && this.temporal.PlainDateTime.compare(moment, min) < 0) return min
    if (max && this.temporal.PlainDateTime.compare(moment, max) > 0) return max
    return moment
  }

  ////////////////
  // ## Views
  ////////////////

  /**
   * The views this type walks through, coarse to fine;  the LAST one picks the value.
   * - `date` year => month => day;  `datetime` ... => hour => minute;  `time` hour => minute;
   *   `month` year => month;  `year` year.
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

  ////////////////
  // ## Internal
  ////////////////

  /** A `Date`'s local fields, to the minute. */
  private fromDate(date: Date): Moment {
    const moment = this.temporal.PlainDateTime.from({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes()
    })
    return this.parse(this.format(moment))!
  }

  ////////////////
  // ## Statics
  ////////////////

  /**
   * The view the picker opens on:  days, else hours, else the final view.
   * - STATIC:  pure over `modes`, needs no `Temporal`.
   */
  static startMode(modes: readonly UIT.CalendarMode[]): UIT.CalendarMode {
    return modes.find((mode) => mode === "day" || mode === "hour") ?? modes.at(-1)!
  }

  /**
   * Milliseconds for `Intl.DateTimeFormat` with `timeZone: "UTC"`:  the moment's fields, unshifted.
   * - `setUTCFullYear`, not `Date.UTC()`, which maps years 0-99 to 19xx.
   * - STATIC:  `CalendarText` formats with it, and a server render's fields come without any `Temporal`.
   */
  static epoch(moment: MomentLike): number {
    const date = new Date(0)
    date.setUTCFullYear(moment.year, moment.month - 1, moment.day)
    date.setUTCHours(moment.hour, moment.minute, 0, 0)
    return date.getTime()
  }

  /**
   * Server render:  the fields of ISO `text` for `type`, read by hand, for FORMATTING only;
   * `undefined` when it isn't that type's ISO form.  Unused parts are zero (a time's date:  1970-01-01).
   * - STATIC:  a server render has no `Temporal`, so no `CalendarDates`.
   */
  static isoFields(text: string, type: UIT.CalendarType): MomentLike | undefined {
    const match = ISO_FORMS[type].exec(text.trim())
    if (!match) return undefined
    const numbers = match.slice(1).map(Number)
    if (type === "time") return { year: 1970, month: 1, day: 1, hour: numbers[0]!, minute: numbers[1]! }
    const [year = 1970, month = 1, day = 1, hour = 0, minute = 0] = numbers
    return { year, month, day, hour, minute }
  }
}

/** What `new CalendarDates()` takes. */
export type CalendarDatesProps = {
  /** the page's `Temporal` (`UI.i18n.temporal`) */
  temporal: E.TemporalAPI
  /** what the calendar picks */
  type: UIT.CalendarType
}

/** ISO forms a server render reads by hand, by calendar type (`isoFields()`). */
const ISO_FORMS: Readonly<Record<UIT.CalendarType, RegExp>> = {
  year: /^(\d{1,6})$/,
  month: /^(\d{4,6})-(\d{2})$/,
  date: /^(\d{4,6})-(\d{2})-(\d{2})$/,
  datetime: /^(\d{4,6})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/,
  time: /^(\d{2}):(\d{2})/
}

/** Views per type, before the `disable-*` attributes (`modes()`). */
const MODES: Readonly<Record<UIT.CalendarType, readonly UIT.CalendarMode[]>> = {
  date: ["year", "month", "day"],
  datetime: ["year", "month", "day", "hour", "minute"],
  time: ["hour", "minute"],
  month: ["year", "month"],
  year: ["year"]
}

/** A `year` value:  up to six digits, as ISO's expanded years. */
const YEAR = /^\d{1,6}$/
