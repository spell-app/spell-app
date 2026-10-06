import { Temporal } from "temporal-polyfill"
import { beforeAll, describe, expect, test } from "vite-plus/test"

import { UI } from "$/ui/runtime"
import { CalendarDates } from "./CalendarDates"
import { CalendarText } from "./CalendarText"
import { CalendarView } from "./CalendarView"
import type { Moment, ViewInput } from "./ui-calendar.types"

/** The focus:  Wednesday, September 30, 2026 (September 1st is a Tuesday). */
const FOCUS = Temporal.PlainDateTime.from("2026-09-30T14:37")

beforeAll(async () => {
  await UI.load()
})

describe("CalendarView.build()", () => {
  test("lays a day page out 7 x 6 from the first weekday, titled by its month, leading up to months", () => {
    const page = CalendarView.build(input())
    expect({ columns: page.columns, rows: page.rows.length, title: page.title, up: page.up }).toEqual({
      columns: 7,
      rows: 6,
      title: "September 2026",
      up: "month"
    })
    expect(
      page.rows
        .flat()
        .map((cell) => cell.moment.day)
        .slice(0, 3)
    ).toEqual([30, 31, 1])
    expect(page.weekdays.map((weekday) => weekday.label)[0]).toBe("Sunday")
  })

  test("starts the week on `firstDayOfWeek`", () => {
    const page = CalendarView.build(input({ firstDayOfWeek: 1 }))
    expect(page.rows[0]![0]!.moment.day).toBe(31)
    expect(page.weekdays[0]!.label).toBe("Monday")
  })

  test("lays a year page out as the decade, a year before and one after:  2021 – 2032", () => {
    const page = CalendarView.build(input({ mode: "year" }))
    const years = page.rows.flat().map((cell) => cell.moment.year)
    expect([years[0], years.at(-1), page.columns, page.title, page.up]).toEqual([
      2021,
      2032,
      3,
      "2021 – 2032",
      undefined
    ])
  })

  test("marks adjacent-month days, disabled unless `selectAdjacentDays`", () => {
    const first = (overrides: Partial<ViewInput>) => CalendarView.build(input(overrides)).rows[0]![0]!
    expect(first({})).toMatchObject({ adjacent: true, disabled: true })
    expect(first({ selectAdjacentDays: true })).toMatchObject({ adjacent: true, disabled: false })
  })

  test("marks the value `active`, the focus the tab stop, today, and a range", () => {
    const value = FOCUS.subtract({ days: 2 })
    const today = FOCUS.subtract({ days: 10 })
    const page = CalendarView.build(input({ value, today, range: [today, value] }))
    const cell = (day: number) => page.rows.flat().find((each) => !each.adjacent && each.moment.day === day)!
    expect(cell(28)).toMatchObject({ active: true, range: true })
    expect(cell(30)).toMatchObject({ focus: true, active: false, range: false })
    expect(cell(20)).toMatchObject({ today: true, range: true })
  })

  test("disables days outside min / max, disabled weekdays and disabled dates;  turns off page turns past them", () => {
    const page = CalendarView.build(
      input({
        min: FOCUS.with({ day: 2 }),
        max: FOCUS.with({ day: 29 }),
        disabledDays: new Set([0]),
        disabledDates: new Set(["2026-09-15"])
      })
    )
    const disabled = page.rows
      .flat()
      .filter((cell) => !cell.adjacent && cell.disabled)
      .map((cell) => cell.moment.day)
    expect(disabled).toEqual([1, 6, 13, 15, 20, 27, 30])
    expect([page.previous.disabled, page.next.disabled]).toEqual([true, true])
  })

  test("pages by the view's unit:  a month of days", () => {
    const page = CalendarView.build(input())
    expect([iso(page.previous.target), iso(page.next.target)]).toEqual(["2026-08-30T14:37", "2026-10-30T14:37"])
  })
})

describe("CalendarView.move()", () => {
  test.each([
    ["ArrowLeft", false, "2026-09-29"],
    ["ArrowRight", false, "2026-10-01"],
    ["ArrowUp", false, "2026-09-23"],
    ["ArrowDown", false, "2026-10-07"],
    ["Home", false, "2026-09-27"],
    ["End", false, "2026-10-03"],
    ["PageUp", false, "2026-08-30"],
    ["PageDown", true, "2027-09-30"]
  ])("%s (shift %s) moves a day page's focus to %s", (key, shiftKey, expected) => {
    expect(CalendarView.move(input(), { key, shiftKey })?.toPlainDate().toString()).toBe(expected)
  })

  test("is undefined for a key the grid doesn't handle", () => {
    expect(CalendarView.move(input(), { key: "x", shiftKey: false })).toBeUndefined()
  })
})

/** A day page of a `date` calendar in `en-US`, focused on `FOCUS`, with `overrides`. */
function input(overrides: Partial<ViewInput> = {}): ViewInput {
  const dates = new CalendarDates({ temporal: Temporal, type: "date" })
  return {
    dates,
    text: new CalendarText({ i18n: UI.i18n, locale: "en-US" }),
    mode: "day",
    modes: dates.modes(),
    focus: FOCUS,
    value: undefined,
    today: FOCUS.add({ years: 5 }),
    min: undefined,
    max: undefined,
    firstDayOfWeek: 0,
    disabledDates: new Set(),
    disabledDays: new Set(),
    selectAdjacentDays: false,
    range: undefined,
    ...overrides
  }
}

/** `moment` to the minute. */
function iso(moment: Moment): string {
  return moment.toString({ smallestUnit: "minute" })
}
