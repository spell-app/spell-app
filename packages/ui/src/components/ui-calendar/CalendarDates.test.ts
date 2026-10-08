import { Temporal } from "temporal-polyfill"
import { describe, expect, test } from "vite-plus/test"

import type { UIT } from "$/ui/core"
import { CalendarDates } from "./CalendarDates"
import type { Moment } from "./UICalendar.types"

/** 2:37 PM on September 30, 2026. */
const MOMENT = Temporal.PlainDateTime.from("2026-09-30T14:37")

////////////////
// ## CalendarDates.parse()
////////////////

describe("CalendarDates.parse()", () => {
  test.each([
    ["date", "2026-09-30", "2026-09-30T00:00"],
    ["date", "2026-09-30T14:30", "2026-09-30T00:00"],
    ["datetime", "2026-09-30", "2026-09-30T00:00"],
    ["datetime", " 2026-09-30T14:37:45 ", "2026-09-30T14:37"],
    ["month", "2026-09", "2026-09-01T00:00"],
    ["year", "2026", "2026-01-01T00:00"],
    ["year", "33", "0033-01-01T00:00"]
  ] as const)("reads a %s from ISO %j", (type, text, expected) => {
    expect(iso(dates(type).parse(text))).toBe(expected)
  })

  test("holds a `time` on today (`anchor`)", () => {
    const time = dates("time")
    expect(iso(time.parse("14:30"))).toBe(`${time.anchor}T14:30`)
  })

  test("reads a `Date` by its LOCAL fields, and a Temporal object by its ISO form", () => {
    expect(iso(dates("datetime").parse(new Date(2026, 8, 30, 14, 37, 45)))).toBe("2026-09-30T14:37")
    expect(iso(dates("date").parse(Temporal.PlainDate.from("2026-09-30")))).toBe("2026-09-30T00:00")
  })

  test("is undefined for empty or unreadable values;  NEVER throws", () => {
    for (const value of [undefined, null, "", "garbage", "2026-13-01", new Date(Number.NaN)])
      expect(dates("date").parse(value), String(value)).toBeUndefined()
    expect(dates("year").parse("2026-09")).toBeUndefined()
  })
})

////////////////
// ## CalendarDates.format()
////////////////

describe("CalendarDates.format()", () => {
  test.each([
    ["date", "2026-09-30"],
    ["datetime", "2026-09-30T14:37"],
    ["time", "14:37"],
    ["month", "2026-09"],
    ["year", "2026"]
  ] as const)("writes a %s as %j, which parse() reads back", (type, expected) => {
    const calendar = dates(type)
    expect(calendar.format(MOMENT)).toBe(expected)
    expect(calendar.format(calendar.parse(expected)!)).toBe(expected)
  })

  test("pads a year to four digits", () => {
    expect(dates("year").format(Temporal.PlainDateTime.from("0033-01-01T00:00"))).toBe("0033")
  })
})

////////////////
// ## CalendarDates.build()
////////////////

describe("CalendarDates.build()", () => {
  test("builds a moment from fields, or undefined when they make none (no 31st of April)", () => {
    expect(iso(dates("datetime").build({ year: 2026, month: 4, day: 30, hour: 9, minute: 5 }))).toBe("2026-04-30T09:05")
    expect(dates("date").build({ year: 2026, month: 4, day: 31 })).toBeUndefined()
  })
})

////////////////
// ## CalendarDates.floor()
////////////////

describe("CalendarDates.floor()", () => {
  test.each([
    ["year", "2026-01-01T00:00"],
    ["month", "2026-09-01T00:00"],
    ["day", "2026-09-30T00:00"],
    ["hour", "2026-09-30T14:00"],
    ["minute", "2026-09-30T14:35"]
  ] as const)("starts the %s unit at %s;  a minute's unit is its 5-minute slot", (mode, expected) => {
    expect(iso(dates("datetime").floor(MOMENT, mode))).toBe(expected)
  })
})

////////////////
// ## CalendarDates.compare() / same()
////////////////

describe("CalendarDates.compare() / same()", () => {
  test("compares the units holding two moments", () => {
    const calendar = dates("datetime")
    const later = MOMENT.add({ minutes: 2 })
    expect(calendar.compare(MOMENT, later, "minute")).toBe(0)
    expect(calendar.compare(MOMENT, MOMENT.add({ minutes: 5 }), "minute")).toBe(-1)
    expect(calendar.compare(MOMENT.add({ days: 1 }), MOMENT, "day")).toBe(1)
    expect(calendar.same(MOMENT, later, "minute")).toBe(true)
  })

  test("same() is false when either moment is missing", () => {
    expect(dates("date").same(MOMENT, undefined, "day")).toBe(false)
    expect(dates("date").same(undefined, MOMENT, "day")).toBe(false)
  })
})

////////////////
// ## CalendarDates.step()
////////////////

describe("CalendarDates.step()", () => {
  test("moves by units;  a minute unit is 5 minutes;  day overflow clamps", () => {
    const calendar = dates("datetime")
    expect(iso(calendar.step(MOMENT, "minute", 2))).toBe("2026-09-30T14:47")
    expect(iso(calendar.step(MOMENT, "hour", -1))).toBe("2026-09-30T13:37")
    expect(iso(calendar.step(MOMENT, "year", 1))).toBe("2027-09-30T14:37")
    expect(iso(calendar.step(Temporal.PlainDateTime.from("2026-01-31T00:00"), "month", 1))).toBe("2026-02-28T00:00")
  })
})

////////////////
// ## CalendarDates.clamp()
////////////////

describe("CalendarDates.clamp()", () => {
  test("keeps a moment within min / max, either of which may be missing", () => {
    const calendar = dates("date")
    const min = MOMENT.subtract({ days: 1 })
    const max = MOMENT.add({ days: 1 })
    expect(calendar.clamp(MOMENT, min, max)).toBe(MOMENT)
    expect(calendar.clamp(MOMENT.subtract({ days: 5 }), min, undefined)).toBe(min)
    expect(calendar.clamp(MOMENT.add({ days: 5 }), undefined, max)).toBe(max)
  })
})

////////////////
// ## CalendarDates.modes()
////////////////

describe("CalendarDates.modes()", () => {
  test.each([
    ["date", {}, ["year", "month", "day"]],
    ["datetime", {}, ["year", "month", "day", "hour", "minute"]],
    ["datetime", { disableMinute: true }, ["year", "month", "day", "hour"]],
    ["date", { disableYear: true, disableMonth: true }, ["day"]],
    ["month", { disableMonth: true }, ["year", "month"]],
    ["time", {}, ["hour", "minute"]],
    ["year", { disableYear: true }, ["year"]]
  ] as const)("walks a %s, %j, through %j:  the FINAL view always stays", (type, options, expected) => {
    expect(dates(type).modes(options)).toEqual(expected)
  })
})

////////////////
// ## CalendarDates.startMode()
////////////////

describe("CalendarDates.startMode()", () => {
  test("opens on days, else hours, else the final view", () => {
    expect(CalendarDates.startMode(["year", "month", "day", "hour", "minute"])).toBe("day")
    expect(CalendarDates.startMode(["hour", "minute"])).toBe("hour")
    expect(CalendarDates.startMode(["year", "month"])).toBe("month")
  })
})

////////////////
// ## CalendarDates.epoch()
////////////////

describe("CalendarDates.epoch()", () => {
  test("keeps the fields unshifted in UTC, years 0-99 included", () => {
    const at = new Date(CalendarDates.epoch({ year: 33, month: 2, day: 3, hour: 4, minute: 5 }))
    expect(at.toISOString()).toBe("0033-02-03T04:05:00.000Z")
  })
})

////////////////
// ## CalendarDates.isoFields()
////////////////

describe("CalendarDates.isoFields()", () => {
  test.each([
    ["2026", "year", { year: 2026, month: 1, day: 1, hour: 0, minute: 0 }],
    ["2026-09", "month", { year: 2026, month: 9, day: 1, hour: 0, minute: 0 }],
    ["2026-09-30", "date", { year: 2026, month: 9, day: 30, hour: 0, minute: 0 }],
    ["2026-09-30T14:37", "datetime", { year: 2026, month: 9, day: 30, hour: 14, minute: 37 }],
    ["14:37", "time", { year: 1970, month: 1, day: 1, hour: 14, minute: 37 }]
  ] as const)("reads %j as a %s's fields", (text, type, expected) => {
    expect(CalendarDates.isoFields(text, type)).toEqual(expected)
  })

  test("is undefined for text that isn't the type's ISO form", () => {
    expect(CalendarDates.isoFields("2026-09-30", "time")).toBeUndefined()
    expect(CalendarDates.isoFields("September", "date")).toBeUndefined()
  })
})

/** A `CalendarDates` of `type` on the polyfill's `Temporal`. */
function dates(type: UIT.CalendarType): CalendarDates {
  return new CalendarDates({ temporal: Temporal, type })
}

/** `moment` to the minute, e.g. `2026-09-30T14:37`;  `undefined` stays. */
function iso(moment: Moment | undefined): string | undefined {
  return moment?.toString({ smallestUnit: "minute" })
}
