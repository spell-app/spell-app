/**
 * Loose constants and types of the `ui-calendar` family:  the words, selectors and shapes its element
 * classes and its native fallback share, lifted out of their files.
 * - Data only:  nothing here runs;  the classes import what they need from `./ui-calendar.types`.
 */

import type { Temporal } from "temporal-polyfill"
import type { UIT } from "$/ui/core"
import type { CalendarDates } from "./CalendarDates"
import type { CalendarText } from "./CalendarText"
import type { calendarVocabulary } from "./ui-calendar.vocabulary.en"

/** A picked moment:  every type is held as a `PlainDateTime`, the unused parts zero (see `CalendarDates`). */
export type Moment = Temporal.PlainDateTime

/** Fields `CalendarDates.build()` takes. */
export type MomentFields = {
  year: number
  month: number
  day: number
  hour?: number
  minute?: number
}

/**
 * A moment's fields, all of them:  what formatting reads (`CalendarDates.epoch()`).
 * - A `Moment` is one;  a server render builds one from the ISO value by hand (`CalendarDates.isoFields()`),
 *   without `Temporal`.
 */
export type MomentLike = Required<MomentFields>

/** ISO forms a server render reads by hand, by calendar type (`CalendarDates.isoFields()`). */
export const ISO_FORMS: Record<UIT.CalendarType, RegExp> = {
  year: /^(\d{1,6})$/,
  month: /^(\d{4,6})-(\d{2})$/,
  date: /^(\d{4,6})-(\d{2})-(\d{2})$/,
  datetime: /^(\d{4,6})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/,
  time: /^(\d{2}):(\d{2})/
}

/** Options of `CalendarDates.modes()`:  the `disable-*` attributes. */
export type ModeOptions = {
  disableMinute?: boolean
  disableMonth?: boolean
  disableYear?: boolean
}

/** Views per type, before the `disable-*` attributes. */
export const MODES: Readonly<Record<UIT.CalendarType, readonly UIT.CalendarMode[]>> = {
  date: ["year", "month", "day"],
  datetime: ["year", "month", "day", "hour", "minute"],
  time: ["hour", "minute"],
  month: ["year", "month"],
  year: ["year"]
}

/** A `year` value:  up to six digits, as ISO's expanded years. */
export const YEAR = /^\d{1,6}$/

/** One field of a date. */
export type DatePart = "year" | "month" | "day"

/** The field's text per type (Fomantic's `MMMM D, YYYY h:mm A` family, in the locale's words). */
export const VALUE_FORMATS: Readonly<Record<UIT.CalendarType, Intl.DateTimeFormatOptions>> = {
  date: { dateStyle: "long" },
  datetime: { dateStyle: "long", timeStyle: "short" },
  time: { timeStyle: "short" },
  month: { year: "numeric", month: "long" },
  year: { year: "numeric" }
}

/** Cell texts per view. */
export const CELL_FORMATS: Readonly<Record<UIT.CalendarMode, Intl.DateTimeFormatOptions>> = {
  year: { year: "numeric" },
  month: { month: "short" },
  day: { day: "numeric" },
  hour: { hour: "numeric", minute: "2-digit" },
  minute: { hour: "numeric", minute: "2-digit" }
}

/** Cell names per view. */
export const LABEL_FORMATS: Readonly<Record<UIT.CalendarMode, Intl.DateTimeFormatOptions>> = {
  year: { year: "numeric" },
  month: { year: "numeric", month: "long" },
  day: { dateStyle: "full" },
  hour: { hour: "numeric", minute: "2-digit" },
  minute: { hour: "numeric", minute: "2-digit" }
}

/** Page titles per view (the year view's is a range, built by the view). */
export const TITLE_FORMATS: Readonly<Record<UIT.CalendarMode, Intl.DateTimeFormatOptions>> = {
  year: { year: "numeric" },
  month: { year: "numeric" },
  day: { year: "numeric", month: "long" },
  hour: { dateStyle: "long" },
  minute: { dateStyle: "long" }
}

/** ISO-ish numeric order, for text that starts with a 4-digit year. */
export const YEAR_FIRST: DatePart[] = ["year", "month", "day"]

/** A clock time in typed text:  `14:30`, `2:30`. */
export const CLOCK = /(\d{1,2}):(\d{2})/

/** Runs of digits, and of letters (any script). */
export const DIGITS = /\d+/g
export const WORDS = /\p{L}+/gu

/** Time zone every format runs in (see class docs). */
export const UTC = "UTC"

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
  value: Moment | null
  /** now */
  today: Moment
  /** earliest choosable moment (own `min`, or a range's start) */
  min: Moment | null
  /** latest choosable moment (own `max`, or a range's end) */
  max: Moment | null
  /** first weekday column, `0` = Sunday */
  firstDayOfWeek: number
  /** ISO dates that can't be chosen */
  disabledDates: ReadonlySet<string>
  /** weekdays that can't be chosen, `0` = Sunday */
  disabledDays: ReadonlySet<number>
  /** adjacent-month days can be chosen */
  selectAdjacentDays: boolean
  /** a range to highlight, start to end */
  range: readonly [Moment, Moment] | null
}

/** One page, see `CalendarView`. */
export type CalendarPage = {
  mode: UIT.CalendarMode
  /** cells per row */
  columns: number
  rows: CalendarCell[][]
  /** e.g. `September 2026` */
  title: string
  /** column heads, days only */
  weekdays: CalendarWeekday[]
  /** where the previous-page button goes, and whether it can */
  previous: { target: Moment; disabled: boolean }
  /** where the next-page button goes, and whether it can */
  next: { target: Moment; disabled: boolean }
  /** the view the title button leads to, if any */
  up: UIT.CalendarMode | undefined
}

/** One cell of a page. */
export type CalendarCell = {
  /** start of the cell's unit */
  moment: Moment
  /** visible text, e.g. `30` */
  text: string
  /** accessible name, e.g. `Wednesday, September 30, 2026` */
  label: string
  /** a day of the previous / next month */
  adjacent: boolean
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

/** Cells per row, per view. */
export const COLUMNS: Readonly<Record<UIT.CalendarMode, number>> = { year: 3, month: 3, day: 7, hour: 4, minute: 3 }

/** A page's unit and size, per view:  what previous / next and PageUp / PageDown move by. */
export const PAGES: Readonly<Record<UIT.CalendarMode, readonly [UIT.CalendarMode, number]>> = {
  year: ["year", 10],
  month: ["year", 1],
  day: ["month", 1],
  hour: ["day", 1],
  minute: ["day", 1]
}

/** Shift + PageUp / PageDown, per view. */
export const BIG_PAGES: Readonly<Record<UIT.CalendarMode, readonly [UIT.CalendarMode, number]>> = {
  year: ["year", 100],
  month: ["year", 10],
  day: ["year", 1],
  hour: ["month", 1],
  minute: ["month", 1]
}

/** Vocabulary type, for brevity. */
export type Vocabulary = typeof calendarVocabulary

/** Fomantic's default type. */
export const DEFAULT_TYPE: UIT.CalendarType = "datetime"

/** Fomantic's default popup position. */
export const DEFAULT_POSITION = "bottom left"

/** `UI.ids` prefix. */
export const ID_PREFIX = "ui-calendar"

/** Hidden input carrying an inline calendar's value in a static server render:  `type`. */
export const HIDDEN = "hidden"

/** Inline custom property naming the field's anchor (`ui-calendar.css`). */
export const ANCHOR_PROPERTY = "--_ui-calendar-anchor"

/** Glyph names. */
export const CALENDAR_ICON = "calendar"
export const CLOCK_ICON = "clock"
export const PREVIOUS_ICON = "chevron-left"
export const NEXT_ICON = "chevron-right"

/** Keys. */
export const ENTER = "Enter"
export const SPACE = " "

export const FOCUSED_CELL = "td[tabindex='0']"

/** Previous / next text keys, per view. */
export const PAGE_TEXTS = {
  year: ["calendarPreviousYears", "calendarNextYears"],
  month: ["calendarPreviousYear", "calendarNextYear"],
  day: ["calendarPreviousMonth", "calendarNextMonth"],
  hour: ["calendarPreviousDay", "calendarNextDay"],
  minute: ["calendarPreviousDay", "calendarNextDay"]
} as const

/**
 * Class words of the markup contract (`ui-calendar.css`) -- grammar, not attributes, so not in the vocabulary.
 * - NOTE: Fomantic's cell classes:  `active` === chosen, `focus` === the keyboard's cell, `adjacent` === another
 *   month's day, `range` === inside a range.
 */
export const INPUT = "ui left icon input"
export const POPUP = "ui calendar popup"
export const PICKER = "calendar"

export const PREVIOUS = "prev link"
export const TITLE = "title link"
export const NEXT = "next link"
export const TABLE = "ui celled center aligned unstackable"
export const COLUMN = "column table"
export const TODAY = "today link"

export const LINK = "link"
export const ADJACENT = "adjacent"

export const TODAY_CELL = "today"
export const FOCUS = "focus"
export const RANGE = "range"
export const FLUID = "fluid"

/** The part of a `<ui-calendar>` the fallback touches;  optional, the element may not have upgraded. */
export type CalendarHost = HTMLElement & { value?: string | null }

/** Native input type holding each calendar type's ISO value. */
export const NATIVE_TYPES: Readonly<Record<UIT.CalendarType, string>> = {
  date: "date",
  time: "time",
  datetime: "datetime-local",
  month: "month",
  year: "number"
}
