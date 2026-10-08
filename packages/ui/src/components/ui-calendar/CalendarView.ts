import { UIT } from "$/ui/core"
import {
  MINUTE_STEP,
  type CalendarCell,
  type CalendarPage,
  type CalendarWeekday,
  type Moment,
  type ViewInput
} from "./UICalendar.types"

/****************
 * ### `CalendarView`
 * One page of the picker, as data:  its title, its cells (rows of Fomantic's grid shapes), the previous / next
 * page targets and the view its title leads up to.  Pure:  the element renders it and rebuilds it (a memo) when
 * the focus, value, bounds or view change.
 * - Shapes (Fomantic's):  years 3 x 4 (the decade, one year before, one after:  2021-2032), months 3 x 4,
 *   days 7 x 6 from the locale's first weekday (constant height), hours 4 x 6, minutes 3 x 4 in 5-minute steps.
 * - A cell is DISABLED outside `min` / `max` (compared in its own unit), on a disabled date or weekday (days,
 *   and the hours / minutes of such a day), or as an adjacent-month day unless `selectAdjacentDays`.
 * - `today` marks the year / month / day holding today (not times);  `active` the value's unit;
 *   `focus` the focus moment's unit -- the roving tab stop;  `range` a unit inside `range` (inclusive).
 * - STATIC, instance-free on purpose:  a page is a pure function of its `ViewInput`, so there's nothing to hold.
 ****************/
export class CalendarView {
  /** Build the page `input` describes. */
  static build(input: ViewInput): CalendarPage {
    const { dates, mode, focus } = input
    const moments = CalendarView.moments(input)
    const columns = COLUMNS[mode]
    const cells = moments.map((moment) => CalendarView.cell(input, moment))
    const rows: CalendarCell[][] = []
    for (let at = 0; at < cells.length; at += columns) rows.push(cells.slice(at, at + columns))
    const [unit, span] = PAGES[mode]
    const first = moments[0]!
    const before = mode === "year" ? first.subtract({ years: 1 }) : dates.step(dates.floor(focus, unit), unit, -1)
    const after = mode === "year" ? first.add({ years: 10 }) : dates.step(dates.floor(focus, unit), unit, 1)
    return {
      mode,
      columns,
      rows,
      title: CalendarView.title(input, first, moments.at(-1)!),
      weekdays: mode === "day" ? CalendarView.weekdays(input) : [],
      previous: {
        target: dates.step(focus, unit, -span),
        disabled: !!input.min && dates.compare(before, input.min, unit) < 0
      },
      next: {
        target: dates.step(focus, unit, span),
        disabled: !!input.max && dates.compare(after, input.max, unit) > 0
      },
      up: CalendarView.up(input)
    }
  }

  /**
   * The moment `key` moves the focus to in `mode`, or `undefined` for a key the grid doesn't handle.
   * - Arrows:  one cell;  up / down one row.  Home / End:  the week's first / last day (days),
   *   else the page's first / last cell.  PageUp / PageDown:  a page;  with Shift, a bigger page (a year of days,
   *   a decade of months).
   */
  static move(input: ViewInput, { key, shiftKey }: Pick<KeyboardEvent, "key" | "shiftKey">): Moment | undefined {
    const { dates, mode, focus } = input
    const columns = COLUMNS[mode]
    switch (key) {
      case UIT.Key.arrowLeft:
        return dates.step(focus, mode, -1)
      case UIT.Key.arrowRight:
        return dates.step(focus, mode, 1)
      case UIT.Key.arrowUp:
        return dates.step(focus, mode, -columns)
      case UIT.Key.arrowDown:
        return dates.step(focus, mode, columns)
      case UIT.Key.home:
      case UIT.Key.end: {
        if (mode === "day") {
          const offset = (focus.dayOfWeek - input.firstDayOfWeek + 7) % 7
          return dates.step(focus, "day", key === UIT.Key.home ? -offset : 6 - offset)
        }
        const moments = CalendarView.moments(input)
        return key === UIT.Key.home ? moments[0] : moments.at(-1)
      }
      case UIT.Key.pageUp:
      case UIT.Key.pageDown: {
        const [unit, span] = shiftKey ? BIG_PAGES[mode] : PAGES[mode]
        return dates.step(focus, unit, key === UIT.Key.pageUp ? -span : span)
      }
    }
    return undefined
  }

  /** The moment of every cell of the page, in reading order. */
  private static moments(input: ViewInput): Moment[] {
    const { dates, mode, focus } = input
    switch (mode) {
      case "year": {
        const start = dates.floor(focus, "year").with({ year: Math.ceil(focus.year / 10) * 10 - 9 })
        return CalendarView.range(12, (index) => start.add({ years: index }))
      }
      case "month": {
        const start = dates.floor(focus, "year")
        return CalendarView.range(12, (index) => start.add({ months: index }))
      }
      case "day": {
        const first = dates.floor(focus, "month")
        const offset = (first.dayOfWeek - input.firstDayOfWeek + 7) % 7
        const start = first.subtract({ days: offset })
        return CalendarView.range(42, (index) => start.add({ days: index }))
      }
      case "hour": {
        const start = dates.floor(focus, "day")
        return CalendarView.range(24, (index) => start.add({ hours: index }))
      }
      default: {
        const start = dates.floor(focus, "hour")
        return CalendarView.range(60 / MINUTE_STEP, (index) => start.add({ minutes: index * MINUTE_STEP }))
      }
    }
  }

  /** One cell. */
  private static cell(input: ViewInput, moment: Moment): CalendarCell {
    const { dates, mode, text } = input
    const adjacent = CalendarView.isAdjacent(input, moment)
    const disabled = CalendarView.isDisabled(input, moment)
    const range = input.range
    return {
      moment,
      text: text.cell(moment, mode),
      label: text.label(moment, mode),
      adjacent,
      disabled,
      active: dates.same(moment, input.value, mode) && !(adjacent && disabled),
      today:
        !adjacent && (mode === "year" || mode === "month" || mode === "day") && dates.same(moment, input.today, mode),
      focus: !adjacent && dates.same(moment, input.focus, mode),
      range:
        !!range && !adjacent && dates.compare(moment, range[0], mode) >= 0 && dates.compare(moment, range[1], mode) <= 0
    }
  }

  /** A day of the previous / next month, on a page of days? */
  private static isAdjacent(input: ViewInput, moment: Moment): boolean {
    return input.mode === "day" && moment.month !== input.focus.month
  }

  /** Can't be chosen?  See class docs. */
  private static isDisabled(input: ViewInput, moment: Moment): boolean {
    const { dates, mode } = input
    if (CalendarView.isAdjacent(input, moment) && !input.selectAdjacentDays) return true
    if (input.min && dates.compare(moment, input.min, mode) < 0) return true
    if (input.max && dates.compare(moment, input.max, mode) > 0) return true
    if (mode === "year" || mode === "month") return false
    if (input.disabledDays.has(moment.dayOfWeek % 7)) return true
    return input.disabledDates.has(moment.toPlainDate().toString())
  }

  /** The page's title;  the year page's is a range (`2021 – 2032`, Fomantic's `yearHeader`). */
  private static title(input: ViewInput, first: Moment, last: Moment): string {
    const { mode, text } = input
    if (mode !== "year") return text.title(input.focus, mode)
    return `${text.title(first, mode)} – ${text.title(last, mode)}`
  }

  /** Weekday column heads from the first day of the week:  narrow text, long name. */
  private static weekdays(input: ViewInput): CalendarWeekday[] {
    const narrow = input.text.weekdays("narrow")
    const long = input.text.weekdays("long")
    return CalendarView.range(7, (index) => {
      const day = (index + input.firstDayOfWeek) % 7
      return { text: narrow[day]!, label: long[day]! }
    })
  }

  /**
   * The view the title leads to:  the coarser one before `mode` (days => months => years);  hours and minutes go
   * back to days (Fomantic);  none at the top, or for a `time` calendar.
   */
  private static up(input: ViewInput): UIT.CalendarMode | undefined {
    const { mode, modes } = input
    if (mode === "hour" || mode === "minute") return modes.includes("day") ? "day" : undefined
    const index = modes.indexOf(mode)
    return index > 0 ? modes[index - 1] : undefined
  }

  /** `[make(0), ... make(count - 1)]`. */
  private static range<T>(count: number, make: (index: number) => T): T[] {
    return Array.from({ length: count }, (_, index) => make(index))
  }
}

/** Cells per row, per view. */
const COLUMNS: Readonly<Record<UIT.CalendarMode, number>> = { year: 3, month: 3, day: 7, hour: 4, minute: 3 }

/** A page's unit and size, per view:  what previous / next and PageUp / PageDown move by. */
const PAGES: Readonly<Record<UIT.CalendarMode, readonly [UIT.CalendarMode, number]>> = {
  year: ["year", 10],
  month: ["year", 1],
  day: ["month", 1],
  hour: ["day", 1],
  minute: ["day", 1]
}

/** Shift + PageUp / PageDown, per view. */
const BIG_PAGES: Readonly<Record<UIT.CalendarMode, readonly [UIT.CalendarMode, number]>> = {
  year: ["year", 100],
  month: ["year", 10],
  day: ["year", 1],
  hour: ["month", 1],
  minute: ["month", 1]
}
