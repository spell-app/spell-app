import type { I18n, UIT } from "$/ui/core"

import { CalendarDates } from "./CalendarDates"
import {
  CELL_FORMATS,
  CLOCK,
  DIGITS,
  DatePart,
  LABEL_FORMATS,
  Moment,
  MomentLike,
  MomentFields,
  TITLE_FORMATS,
  UTC,
  VALUE_FORMATS,
  WORDS,
  YEAR_FIRST
} from "./ui-calendar.types"

/****************
 * ### `CalendarText`
 * The words of one calendar in one locale:  the field's text, cell and title texts, weekday / month names (all
 * `Intl`, through `UI.i18n`), and reading back what a user TYPES.
 * - Formatting passes `timeZone: "UTC"` with `CalendarDates.epoch()`:  a moment's fields print as they are, with
 *   no zone shift, whichever `Temporal` made them.
 * - 12 / 24 hours:  whatever the locale's `Intl` clock is (`en-US` `2:30 PM`, `de-DE` `14:30`).
 * - Parsing (`read()`):  ISO first;  else a forgiving read in the spirit of Fomantic's `parser.date`, with the
 *   LOCALE's field order (`9/30/2026` in `en-US`, `30.9.2026` in `de-DE`), its month names (long or a 3+ letter
 *   prefix) and day periods (`PM`, plus English `am` / `pm`).  It reads its own output back.
 ****************/
export class CalendarText {
  /** Where `Intl` lives, and its formatter cache. */
  readonly i18n: I18n

  /** BCP 47 locale. */
  readonly locale: string

  /** Lowercased month names, long then short, index % 12 === month - 1;  built on first `read()`. */
  private monthNames?: string[]

  constructor(i18n: I18n, locale: string) {
    this.i18n = i18n
    this.locale = locale
  }

  ////////////////
  // ## Formatting
  ////////////////

  /** `moment` through `Intl.DateTimeFormat` with `options`, in UTC (see class docs). */
  format(moment: MomentLike, options: Intl.DateTimeFormatOptions): string {
    return this.i18n.formatDate(CalendarDates.epoch(moment), { ...options, timeZone: UTC }, this.locale)
  }

  /** The field's text for a value of `type`, e.g. `September 30, 2026 at 2:30 PM`. */
  value(moment: MomentLike, type: UIT.CalendarType): string {
    return this.format(moment, VALUE_FORMATS[type])
  }

  /** A cell's visible text in `mode`:  a year, a short month, a day number, a time. */
  cell(moment: Moment, mode: UIT.CalendarMode): string {
    return this.format(moment, CELL_FORMATS[mode])
  }

  /** A cell's accessible name in `mode`:  the whole date (`Wednesday, September 30, 2026`), month, year or time. */
  label(moment: Moment, mode: UIT.CalendarMode): string {
    return this.format(moment, LABEL_FORMATS[mode])
  }

  /** A page title:  `September 2026` (days), `2026` (months), `September 30, 2026` (hours, minutes). */
  title(moment: Moment, mode: UIT.CalendarMode): string {
    return this.format(moment, TITLE_FORMATS[mode])
  }

  /** Weekday names, Sunday first, in `style`. */
  weekdays(style: "long" | "narrow"): string[] {
    return this.i18n.weekdays(style, this.locale)
  }

  /** The locale's first day of the week, `0` = Sunday. */
  firstDayOfWeek(): number {
    return this.i18n.firstDayOfWeek(this.locale)
  }

  ////////////////
  // ## Parsing
  ////////////////

  /**
   * What the user typed, as a moment of `dates.type`, or `null` when it can't be read (see class docs).
   * - Fields left out:  the current year;  midnight for a `datetime` without a time.
   */
  read(text: string, dates: CalendarDates): Moment | null {
    const iso = dates.parse(text)
    if (iso) return iso
    let rest = text.toLocaleLowerCase(this.locale).normalize("NFKC")
    let hour: number | undefined
    let minute = 0
    if (dates.hasTime) {
      const clock = CLOCK.exec(rest)
      const periods = this.dayPeriods()
      const period = periods.find(([name]) => CalendarText.word(name).test(rest))
      if (clock) {
        hour = Number(clock[1])
        minute = Number(clock[2])
        rest = rest.replace(clock[0], " ")
      } else if (period) {
        const bare = new RegExp(`(\\d{1,2})\\s*${CalendarText.escape(period[0])}`).exec(rest)
        if (bare) hour = Number(bare[1])
      }
      if (period && hour !== undefined) {
        rest = rest.replace(CalendarText.word(period[0]), " ")
        if (period[1] === "pm" && hour < 12) hour += 12
        if (period[1] === "am" && hour === 12) hour = 0
      }
      if (dates.type === "time") {
        const numbers = rest.match(DIGITS)?.map(Number) ?? []
        hour ??= numbers[0]
        if (!clock && numbers.length > 1 && !period) minute = numbers[1]!
        return hour === undefined ? null : dates.parse(`${CalendarText.pad(hour)}:${CalendarText.pad(minute)}`)
      }
    }
    const fields = this.dateFields(rest, dates.type)
    if (!fields) return null
    if (dates.type === "datetime") return dates.build({ ...fields, hour: hour ?? 0, minute })
    return dates.build(fields)
  }

  /**
   * Year / month / day from the date part of typed text, or `null`.
   * - A 4+ digit first number means year-first (ISO-ish order);  a month NAME takes the month;  otherwise the
   *   locale's numeric order.  Two-digit years:  under 60 => 20xx, else 19xx (Fomantic's `centuryBreak`).
   */
  private dateFields(text: string, type: UIT.CalendarType): MomentFields | null {
    const numbers = text.match(DIGITS) ?? []
    const named = this.monthByName(text)
    const order = numbers[0] && numbers[0].length >= 4 ? YEAR_FIRST : this.numericOrder()
    const wanted = order.filter(
      (part) => (named === undefined || part !== "month") && (type !== "year" || part === "year")
    )
    const values: Partial<Record<DatePart, number>> = named === undefined ? {} : { month: named }
    // a number that can't be a day or month is the year, wherever it sits
    const yearIndex = numbers.findIndex((number) => number.length >= 3 || Number(number) > 31)
    if (yearIndex >= 0 && wanted.includes("year")) values.year = Number(numbers.splice(yearIndex, 1)[0])
    for (const part of wanted) {
      if (values[part] !== undefined) continue
      if (type === "month" && part === "day") continue
      const next = numbers.shift()
      if (next === undefined) break
      values[part] = part === "year" && next.length <= 2 ? CalendarText.century(Number(next)) : Number(next)
    }
    const fields = {
      year: values.year ?? new Date().getFullYear(),
      month: values.month ?? (type === "year" ? 1 : NaN),
      day: values.day ?? (type === "month" || type === "year" ? 1 : NaN)
    }
    return Number.isNaN(fields.month) || Number.isNaN(fields.day) ? null : fields
  }

  /** Month (1-12) named in `text`:  a full name or a 3+ letter prefix of one, long or short. */
  private monthByName(text: string): number | undefined {
    const names = (this.monthNames ??= [
      ...this.i18n.months("long", this.locale),
      ...this.i18n.months("short", this.locale)
    ].map((name) => name.toLocaleLowerCase(this.locale).replace(/\./g, "")))
    for (const word of text.match(WORDS) ?? []) {
      if (word.length < 3) continue
      const index = names.findIndex((name) => name === word || name.startsWith(word))
      if (index >= 0) return (index % 12) + 1
    }
    return undefined
  }

  /** The locale's order of year / month / day in a numeric date, e.g. `month, day, year` for `en-US`. */
  private numericOrder(): DatePart[] {
    const parts = new Intl.DateTimeFormat(this.locale, { year: "numeric", month: "numeric", day: "numeric" })
      .formatToParts(0)
      .map((part) => part.type)
    return parts.filter((type): type is DatePart => type === "year" || type === "month" || type === "day")
  }

  /** Day-period words to look for, lowercased, with what they mean:  the locale's, then English. */
  private dayPeriods(): [string, "am" | "pm"][] {
    const found: [string, "am" | "pm"][] = []
    for (const [name, meaning] of [
      [this.dayPeriod(1), "am"],
      [this.dayPeriod(13), "pm"],
      ["am", "am"],
      ["pm", "pm"]
    ] as const) {
      if (name && !found.some(([each]) => each === name)) found.push([name, meaning])
    }
    // the longer word first:  `p.m.` read as `pm` must not leave a lone `p`
    return found.sort(([a], [b]) => b.length - a.length)
  }

  /** The locale's day-period word at `hour` (UTC), lowercased without dots;  `undefined` for a 24-hour locale. */
  private dayPeriod(hour: number): string | undefined {
    return new Intl.DateTimeFormat(this.locale, { hour: "numeric", hour12: true, timeZone: UTC })
      .formatToParts(Date.UTC(2000, 0, 1, hour))
      .find((part) => part.type === "dayPeriod")
      ?.value.toLocaleLowerCase(this.locale)
      .replace(/\./g, "")
  }

  /** Two-digit year => full year (see `dateFields()`). */
  private static century(year: number): number {
    return year < 60 ? 2000 + year : 1900 + year
  }

  /** Two digits. */
  private static pad(value: number): string {
    return String(value).padStart(2, "0")
  }

  /** `name` as a whole word (not inside a longer word), any script. */
  private static word(name: string): RegExp {
    return new RegExp(`(?<!\\p{L})${CalendarText.escape(name)}(?!\\p{L})`, "u")
  }

  /** `text` safe inside a `RegExp`. */
  private static escape(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  }
}
