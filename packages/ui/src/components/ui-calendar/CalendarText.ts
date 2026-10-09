import { E, type UIT } from "$/ui/core"
import { CalendarDates } from "./CalendarDates"
import type { DatePart, Moment, MomentFields, MomentLike } from "./UICalendar.types"

/****************
 * ### `CalendarText`
 * The words of one calendar in one locale:  the field's text, cell and title texts, weekday / month names (all
 * `Intl`, through `UI.i18n`), and reading back what a person TYPES.
 * - Formatting passes `timeZone: "UTC"` with `CalendarDates.epoch()`:  a moment's fields print as they are,
 *   with no zone shift, whichever `Temporal` made them.
 * - 12 / 24 hours:  whatever the locale's `Intl` clock is (`en-US` `2:30 PM`, `de-DE` `14:30`).
 * - Parsing (`read()`):  ISO first;  else a forgiving read in the spirit of Fomantic's `parser.date`,
 *   with the LOCALE's field order (`9/30/2026` in `en-US`, `30.9.2026` in `de-DE`), its month names (long or a 3+
 *   letter prefix) and day periods (`PM`, plus English `am` / `pm`).  It reads its own output back.
 ****************/
export class CalendarText {
  /** Where `Intl` lives, and its formatter cache. */
  readonly i18n: E.I18n

  /** BCP 47 locale. */
  readonly locale: string

  constructor({ i18n, locale }: CalendarTextProps) {
    this.i18n = i18n
    this.locale = locale
  }

  ////////////////
  // ## Formatting
  ////////////////

  /** `moment` through `Intl.DateTimeFormat` with `options`, in UTC (see class docs). */
  format(moment: MomentLike, options: Intl.DateTimeFormatOptions): string {
    return this.i18n.formatDate(CalendarDates.epoch(moment), { ...options, timeZone: "UTC" }, this.locale)
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
   * What the person typed, as a moment of `dates.type`, or `undefined` when it can't be read (see class docs).
   * - Fields left out:  the current year;  midnight for a `datetime` without a time.
   */
  read(text: string, dates: CalendarDates): Moment | undefined {
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
        if (period[1] === PM && hour < 12) hour += 12
        if (period[1] === AM && hour === 12) hour = 0
      }
      if (dates.type === "time") {
        const numbers = rest.match(DIGITS)?.map(Number) ?? []
        hour ??= numbers[0]
        if (!clock && numbers.length > 1 && !period) minute = numbers[1]!
        return hour === undefined ? undefined : dates.parse(`${CalendarText.pad(hour)}:${CalendarText.pad(minute)}`)
      }
    }
    const fields = this.dateFields(rest, dates.type)
    if (!fields) return undefined
    if (dates.type === "datetime") return dates.build({ ...fields, hour: hour ?? 0, minute })
    return dates.build(fields)
  }

  /**
   * Year / month / day from the date part of typed text, or `undefined`.
   * - A 4+ digit first number means year-first (ISO-ish order);  a month NAME takes the month;
   *   otherwise the locale's numeric order.  Two-digit years:  under 60 => 20xx, else 19xx (Fomantic's `centuryBreak`).
   */
  private dateFields(text: string, type: UIT.CalendarType): MomentFields | undefined {
    const numbers = text.match(DIGITS) ?? []
    const named = this.monthByName(text)
    const order = numbers[0] && numbers[0].length >= 4 ? YEAR_FIRST : this.numericOrder()
    const wanted = order.filter(
      (part) => (named === undefined || part !== "month") && (type !== "year" || part === "year")
    )
    const values: Partial<Record<DatePart, number>> = named === undefined ? {} : { month: named }
    // a number that can't be a day or month is the year, wherever it sits
    const yearIndex = numbers.findIndex((number) => number.length >= 3 || Number(number) > 31)
    if (yearIndex >= 0 && wanted.includes("year")) {
      const year = numbers.splice(yearIndex, 1)[0]!
      // two digits over 31 (`75`) still follow the century rule, as a two-digit year in its usual place does
      values.year = year.length <= 2 ? CalendarText.century(Number(year)) : Number(year)
    }
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
    return Number.isNaN(fields.month) || Number.isNaN(fields.day) ? undefined : fields
  }

  /** Month (1-12) named in `text`:  a full name or a 3+ letter prefix of one, long or short. */
  private monthByName(text: string): number | undefined {
    const names = this.monthNames
    for (const word of text.match(WORDS) ?? []) {
      if (word.length < 3) continue
      const index = names.findIndex((name) => name === word || name.startsWith(word))
      if (index >= 0) return (index % 12) + 1
    }
    return undefined
  }

  /** Lowercased month names, long then short, index % 12 === month - 1;  built on first `read()`. */
  @E.lazy private get monthNames(): string[] {
    return [...this.i18n.months("long", this.locale), ...this.i18n.months("short", this.locale)].map((name) =>
      name.toLocaleLowerCase(this.locale).replace(/\./g, "")
    )
  }

  /** The locale's order of year / month / day in a numeric date, e.g. `month, day, year` for `en-US`. */
  private numericOrder(): DatePart[] {
    const parts = new Intl.DateTimeFormat(this.locale, { year: "numeric", month: "numeric", day: "numeric" })
      .formatToParts(0)
      .map((part) => part.type)
    return parts.filter((type): type is DatePart => type === "year" || type === "month" || type === "day")
  }

  /** Day-period words to look for, lowercased, with what they mean:  the locale's, then English. */
  private dayPeriods(): [string, DayPeriod][] {
    const found: [string, DayPeriod][] = []
    for (const [name, meaning] of [
      [this.dayPeriod(1), AM],
      [this.dayPeriod(13), PM],
      [AM, AM],
      [PM, PM]
    ] as const) {
      if (name && !found.some(([each]) => each === name)) found.push([name, meaning])
    }
    // the longer word first:  `p.m.` read as `pm` must not leave a lone `p`
    return found.sort(([a], [b]) => b.length - a.length)
  }

  /** The locale's day-period word at `hour` (UTC), lowercased without dots;  `undefined` for a 24-hour locale. */
  private dayPeriod(hour: number): string | undefined {
    return new Intl.DateTimeFormat(this.locale, { hour: "numeric", hour12: true, timeZone: "UTC" })
      .formatToParts(Date.UTC(2000, 0, 1, hour))
      .find((part) => part.type === "dayPeriod")
      ?.value.toLocaleLowerCase(this.locale)
      .replace(/\./g, "")
  }

  ////////////////
  // ## Pure helpers
  // STATIC:  pure text work, needing nothing of the instance.
  ////////////////

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

/** What `new CalendarText()` takes. */
export type CalendarTextProps = {
  /** where `Intl` lives (`UI.i18n`) */
  i18n: E.I18n
  /** BCP 47 locale */
  locale: string
}

/** What a day-period word means:  before or after noon. */
type DayPeriod = typeof AM | typeof PM

/** Before noon, and the English day-period word for it. */
const AM = "am"

/** After noon, as `AM`. */
const PM = "pm"

/** The field's text per type (Fomantic's `MMMM D, YYYY h:mm A` family, in the locale's words). */
const VALUE_FORMATS: Readonly<Record<UIT.CalendarType, Intl.DateTimeFormatOptions>> = {
  date: { dateStyle: "long" },
  datetime: { dateStyle: "long", timeStyle: "short" },
  time: { timeStyle: "short" },
  month: { year: "numeric", month: "long" },
  year: { year: "numeric" }
}

/** Cell texts per view. */
const CELL_FORMATS: Readonly<Record<UIT.CalendarMode, Intl.DateTimeFormatOptions>> = {
  year: { year: "numeric" },
  month: { month: "short" },
  day: { day: "numeric" },
  hour: { hour: "numeric", minute: "2-digit" },
  minute: { hour: "numeric", minute: "2-digit" }
}

/** Cell names per view. */
const LABEL_FORMATS: Readonly<Record<UIT.CalendarMode, Intl.DateTimeFormatOptions>> = {
  year: { year: "numeric" },
  month: { year: "numeric", month: "long" },
  day: { dateStyle: "full" },
  hour: { hour: "numeric", minute: "2-digit" },
  minute: { hour: "numeric", minute: "2-digit" }
}

/** Page titles per view (the year view's is a range, built by `CalendarView`). */
const TITLE_FORMATS: Readonly<Record<UIT.CalendarMode, Intl.DateTimeFormatOptions>> = {
  year: { year: "numeric" },
  month: { year: "numeric" },
  day: { year: "numeric", month: "long" },
  hour: { dateStyle: "long" },
  minute: { dateStyle: "long" }
}

/** ISO-ish numeric order, for text that starts with a 4-digit year. */
const YEAR_FIRST: DatePart[] = ["year", "month", "day"]

/** A clock time in typed text:  `14:30`, `2:30`. */
const CLOCK = /(\d{1,2}):(\d{2})/

/** Runs of digits. */
const DIGITS = /\d+/g

/** Runs of letters, any script. */
const WORDS = /\p{L}+/gu
