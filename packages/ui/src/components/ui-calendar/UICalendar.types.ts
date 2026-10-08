/**
 * Constants and types of the `ui-calendar` family:  what its component, its helpers (`CalendarDates`,
 * `CalendarText`, `CalendarView`) and its native fallback share.
 * - Pure data:  `import type` only, so node can load it (`yarn site:data`).
 * - A constant only ONE class reads sits below that class instead:
 *   the formats below `CalendarText`, the ISO forms below `CalendarDates`, the page sizes below `CalendarView`,
 *   the class words below `UICalendar`.
 */

import type { Temporal } from "temporal-polyfill"
import type { UIT } from "$/ui/core"
import type { CalendarDates } from "./CalendarDates"
import type { CalendarText } from "./CalendarText"
import type { calendarVocabulary } from "./UICalendar.en"

////////////////
// ## The component
////////////////

/** The vocabulary's type, for short. */
export type Vocabulary = typeof calendarVocabulary

/** Fomantic's default type. */
export const DEFAULT_TYPE: UIT.CalendarType = "datetime"

////////////////
// ## Moments
////////////////

/** A picked moment:  every type is held as a `PlainDateTime`, the unused parts zero (see `CalendarDates`). */
export type Moment = Temporal.PlainDateTime

/** Fields `CalendarDates.build()` takes. */
export type MomentFields = {
  /** full year, e.g. `2026` */
  year: number
  /** `1` = January */
  month: number
  /** day of the month, from `1` */
  day: number
  /** `0` - `23`;  default `0` */
  hour?: number
  /** `0` - `59`;  default `0` */
  minute?: number
}

/**
 * A moment's fields, all of them:  what formatting reads (`CalendarDates.epoch()`).
 * - A `Moment` is one;  a server render builds one from the ISO value by hand (`CalendarDates.isoFields()`),
 *   without `Temporal`.
 */
export type MomentLike = Required<MomentFields>

/** One field of a date. */
export type DatePart = "year" | "month" | "day"

/** Minutes between two minute cells (Fomantic's `minTimeGap`):  a minute's unit is its 5-minute slot. */
export const MINUTE_STEP = 5

////////////////
// ## Views
////////////////

/** Options of `CalendarDates.modes()`:  the `disable-*` attributes. */
export type ModeOptions = {
  /** drop the minute view */
  disableMinute?: boolean
  /** drop the month view, unless the type picks a month */
  disableMonth?: boolean
  /** drop the year view, unless the type picks a year */
  disableYear?: boolean
}

/** What `CalendarView.build()` needs. */
export type ViewInput = {
  /** date arithmetic */
  dates: CalendarDates
  /** words */
  text: CalendarText
  /** the view to build */
  mode: UIT.CalendarMode
  /** every view the type walks through, coarse to fine */
  modes: readonly UIT.CalendarMode[]
  /** the focused moment:  picks the page */
  focus: Moment
  /** the chosen moment */
  value: Moment | undefined
  /** now */
  today: Moment
  /** earliest choosable moment (own `min`, or a range's start) */
  min: Moment | undefined
  /** latest choosable moment (own `max`, or a range's end) */
  max: Moment | undefined
  /** first weekday column, `0` = Sunday */
  firstDayOfWeek: number
  /** ISO dates that can't be chosen */
  disabledDates: ReadonlySet<string>
  /** weekdays that can't be chosen, `0` = Sunday */
  disabledDays: ReadonlySet<number>
  /** adjacent-month days can be chosen */
  selectAdjacentDays: boolean
  /** a range to highlight, start to end */
  range: readonly [Moment, Moment] | undefined
}

/** One page, see `CalendarView`. */
export type CalendarPage = {
  /** the view it shows */
  mode: UIT.CalendarMode
  /** cells per row */
  columns: number
  /** the cells, in rows of `columns` */
  rows: CalendarCell[][]
  /** e.g. `September 2026` */
  title: string
  /** column heads, days only */
  weekdays: CalendarWeekday[]
  /** where the previous-page button goes, and whether it can */
  previous: CalendarPageTurn
  /** where the next-page button goes, and whether it can */
  next: CalendarPageTurn
  /** the view the title button leads to, if any */
  up: UIT.CalendarMode | undefined
}

/** A previous / next button of a page. */
export type CalendarPageTurn = {
  /** the focus moment it moves to */
  target: Moment
  /** past `min` / `max`:  the button is disabled */
  disabled: boolean
}

/**
 * One cell of a page.
 * - Its booleans are Fomantic's cell classes, by name:  `active` === chosen, `focus` === the keyboard's cell,
 *   `adjacent` === another month's day, `range` === inside a range.
 */
export type CalendarCell = {
  /** start of the cell's unit */
  moment: Moment
  /** visible text, e.g. `30` */
  text: string
  /** accessible name, e.g. `Wednesday, September 30, 2026` */
  label: string
  /** a day of the previous / next month */
  adjacent: boolean
  /** can't be chosen (see `CalendarView`) */
  disabled: boolean
  /** holds the value */
  active: boolean
  /** holds today */
  today: boolean
  /** the focus moment:  the grid's tab stop */
  focus: boolean
  /** inside the highlighted range */
  range: boolean
}

/** A weekday column head. */
export type CalendarWeekday = {
  /** narrow text, e.g. `S` */
  text: string
  /** full name, e.g. `Sunday` */
  label: string
}
