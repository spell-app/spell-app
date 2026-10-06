import { Temporal } from "temporal-polyfill"
import { beforeAll, describe, expect, test } from "vite-plus/test"

import type { UIT } from "$/ui/core"
import { UI } from "$/ui/runtime"
import { CalendarDates } from "./CalendarDates"
import { CalendarText } from "./CalendarText"

/** 2:30 PM on Wednesday, September 30, 2026. */
const MOMENT = Temporal.PlainDateTime.from("2026-09-30T14:30")

beforeAll(async () => {
  await UI.load()
})

describe("CalendarText formatting", () => {
  test("writes the field's text in the locale's words and clock", () => {
    expect(words("en-US").value(MOMENT, "date")).toBe("September 30, 2026")
    expect(words("en-US").value(MOMENT, "datetime")).toBe("September 30, 2026 at 2:30 PM")
    expect(words("de-DE").value(MOMENT, "datetime")).toBe("30. September 2026 um 14:30")
  })

  test("writes a day cell's text, accessible name and page title", () => {
    const text = words("en-US")
    expect([text.cell(MOMENT, "day"), text.label(MOMENT, "day"), text.title(MOMENT, "day")]).toEqual([
      "30",
      "Wednesday, September 30, 2026",
      "September 2026"
    ])
  })

  test("names weekdays Sunday first, and the locale's first day of the week", () => {
    expect(words("en-US").weekdays("long")[0]).toBe("Sunday")
    expect(words("en-US").firstDayOfWeek()).toBe(0)
    expect(words("de-DE").firstDayOfWeek()).toBe(1)
  })
})

describe("CalendarText.read()", () => {
  test.each([
    ["en-US", "date", "2026-09-30", "2026-09-30T00:00"],
    ["en-US", "date", "9/30/2026", "2026-09-30T00:00"],
    ["de-DE", "date", "30.9.2026", "2026-09-30T00:00"],
    ["en-US", "date", "Sept 30 2026", "2026-09-30T00:00"],
    ["en-US", "date", "9/30/26", "2026-09-30T00:00"],
    ["en-US", "datetime", "September 30, 2026 at 2:30 PM", "2026-09-30T14:30"],
    ["en-US", "datetime", "9/30/2026", "2026-09-30T00:00"],
    ["de-DE", "datetime", "1.2.2027 18:45", "2027-02-01T18:45"],
    ["en-US", "month", "September 2026", "2026-09-01T00:00"],
    ["en-US", "year", "2026", "2026-01-01T00:00"]
  ] as const)("%s reads a %s from %j", (locale, type, typed, expected) => {
    expect(words(locale).read(typed, dates(type))?.toString({ smallestUnit: "minute" })).toBe(expected)
  })

  // KNOWN BUG (epic `wwod-spell-ui`, I21):  a two-digit year over 31 is taken as "the year" before the century rule runs, so
  // `9/30/75` reads as the year 75.  `test.fails` until `dateFields()` runs `century()` on it too.
  test.fails("reads a two-digit year of 60+ as 19xx:  9/30/75 => 1975", () => {
    expect(words("en-US").read("9/30/75", dates("date"))?.year).toBe(1975)
  })

  test.each([
    ["2pm", "14:00"],
    ["12 am", "00:00"],
    ["9 45", "09:45"]
  ])("reads a time from %j as %s", (typed, expected) => {
    expect(words("en-US").read(typed, dates("time"))?.toPlainTime().toString({ smallestUnit: "minute" })).toBe(expected)
  })

  test("reads its own output back", () => {
    for (const locale of ["en-US", "de-DE"]) {
      const text = words(locale)
      expect(text.read(text.value(MOMENT, "datetime"), dates("datetime"))?.equals(MOMENT), locale).toBe(true)
    }
  })

  test("is undefined for text that names no date", () => {
    expect(words("en-US").read("4/31/2026", dates("date"))).toBeUndefined()
    expect(words("en-US").read("soon", dates("date"))).toBeUndefined()
  })
})

/** `UI.i18n`'s words for `locale`. */
function words(locale: string): CalendarText {
  return new CalendarText({ i18n: UI.i18n, locale })
}

/** A `CalendarDates` of `type` on the polyfill's `Temporal`. */
function dates(type: UIT.CalendarType): CalendarDates {
  return new CalendarDates({ temporal: Temporal, type })
}
