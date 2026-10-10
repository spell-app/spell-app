import { describe, expect, test } from "vite-plus/test"

import {
  byTitle,
  epicCardHtml,
  epicGroupFor,
  epicGroupsHtml,
  epicWorkedHtml,
  eventTimesIn,
  lastWorked,
  parseFavorites,
  readEpicDate
} from "$/server/site/EpicCards"
import { epicStateFor } from "$/server/site/EpicState"

/** A day the tests stand on:  2026-10-10, local. */
const NOW = new Date(2026, 9, 10, 9)

describe("epicGroupFor()", () => {
  test("errors are Urgent, done is Done;  Active needs phases left, else Planning;  paused stays Active", () => {
    const group = (phases: string[], more: { urgent?: string[]; future?: boolean; updated?: string } = {}) =>
      epicGroupFor(epicStateFor({ phases, ...more }, NOW))
    expect(group(["done", "done"], { urgent: ["q1"] })).toBe("urgent")
    expect(group(["done"])).toBe("done")
    expect(group(["done", "active"])).toBe("active")
    expect(group(["todo"], { updated: "2026-01-01" })).toBe("active")
    expect(group([])).toBe("planning")
    expect(group([], { future: true })).toBe("planning")
  })
})

describe("epicGroupsHtml()", () => {
  test("writes every group in order, an empty one hidden;  alphabetical by title, numbers as numbers", () => {
    const card = (name: string, title: string, favorite = false) =>
      epicCardHtml({ name, title, href: `${name}.html`, meta: name, facts: { phases: ["active"] }, favorite }, NOW)
    const html = epicGroupsHtml([card("b", "epic 10"), card("a", "Epic 9"), card("s", "Star", true)])
    expect(Array.from(html.matchAll(/data-group="(\w+)"( hidden)?>\n/g), (m) => `${m[1]}${m[2] ?? ""}`)).toEqual([
      "favorites",
      "active",
      "planning hidden",
      "urgent hidden",
      "done hidden"
    ])
    expect(Array.from(html.matchAll(/data-epic="(\w+)"/g), (m) => m[1])).toEqual(["s", "a", "b"])
    expect(byTitle("Epic 9", "epic 10")).toBeLessThan(0)
  })
})

describe("last worked", () => {
  test("reads a day, a local time, an offset (git's too);  the latest wins;  nothing readable:  undefined", () => {
    expect(readEpicDate("2026-10-08")).toEqual(new Date(2026, 9, 8))
    expect(readEpicDate("2026-10-08 14:34")).toEqual(new Date(2026, 9, 8, 14, 34))
    expect(readEpicDate("2026-10-08T14:34-04:00")).toEqual(new Date("2026-10-08T18:34:00Z"))
    expect(readEpicDate("2026-10-08T14:34:05-0400")).toEqual(new Date("2026-10-08T18:34:05Z"))
    expect(readEpicDate("soon")).toBeUndefined()
    const log = `<epic-event at="2026-10-09T00:26-04:00">a</epic-event>\n<epic-event\n  at="2026-10-09T22:08-04:00">b</epic-event>`
    expect(eventTimesIn(log)).toEqual(["2026-10-09T00:26-04:00", "2026-10-09T22:08-04:00"])
    expect(lastWorked(["2026-10-09", ...eventTimesIn(log), undefined])).toEqual(new Date("2026-10-10T02:08:00Z"))
    expect(lastWorked([null, "x"])).toBeUndefined()
  })

  test("shows month and day without the year;  the full date and time in its title", () => {
    expect(epicWorkedHtml(new Date(2026, 9, 9, 7, 5))).toMatch(
      /^<time class="spell-epic-worked" datetime="2026-10-09T07:05[+-]\d\d:\d\d" title="Last worked on 10\/9\/26 07:05">10\/9<\/time>$/
    )
  })
})

test("parseFavorites():  a JSON list of names;  anything else is none", () => {
  expect(parseFavorites('["airplane", 3, "seo"]')).toEqual(new Set(["airplane", "seo"]))
  expect(parseFavorites("{}")).toEqual(new Set())
  expect(parseFavorites("not json")).toEqual(new Set())
  expect(parseFavorites(undefined)).toEqual(new Set())
})
