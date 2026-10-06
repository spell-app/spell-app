import { afterEach, beforeEach, describe, expect, it, onTestFinished } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"

import { UI } from "$/ui/runtime"
import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import "$/ui/components/ui-calendar"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-calendar/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A calendar host with its properties. */
type Calendar = UIHost & {
  value: string | undefined
  open: unknown
  disabledDates: unknown
  disabledDaysOfWeek: unknown
  validity: ValidityState
  formStateRestoreCallback(state: unknown, mode: string): void
}

/** Pieces of a rendered calendar;  functions for what the popup renders only while open. */
function parts(host: Calendar) {
  const shadow = host.shadowRoot!
  const root = shadow.firstElementChild as HTMLElement
  return {
    root,
    input: root.querySelector<HTMLInputElement>("input[part~=control]")!,
    trigger: root.querySelector<HTMLButtonElement>("button[part~=trigger]")!,
    popup: root.querySelector<HTMLElement>("[part~=popup]")!,
    grid: () => root.querySelector<HTMLTableElement>("table[role=grid]")!,
    title: () => root.querySelector<HTMLButtonElement>("[part~=title]")!,
    previous: () => root.querySelector<HTMLButtonElement>("[part~=previous]")!,
    next: () => root.querySelector<HTMLButtonElement>("[part~=next]")!,
    today: () => root.querySelector<HTMLButtonElement>("[part~=today]"),
    cells: () => [...root.querySelectorAll<HTMLElement>("td[role=gridcell]")],
    heads: () => [...root.querySelectorAll<HTMLElement>("thead th")],
    cell: (label: string) => root.querySelector<HTMLElement>(`td[aria-label="${label}"]`)!,
    focused: () => shadow.activeElement as HTMLElement | null,
    stop: () => root.querySelector<HTMLElement>("td[tabindex='0']")!
  }
}

/** Render a calendar and return it with its parts. */
async function calendar(html: string) {
  const host = await ElementFixture.render<Calendar>(html)
  return { host, ...parts(host) }
}

/** Collect `detail`s of `name` events. */
function record(host: Element, name: string) {
  const details: unknown[] = []
  host.addEventListener(name, (event) => details.push((event as CustomEvent).detail))
  return details
}

/** Press `keys` (userEvent syntax), then let the element update. */
async function press(keys: string) {
  await userEvent.keyboard(keys)
  await ElementFixture.tick()
  await ElementFixture.tick()
}

/** A date calendar on September 30, 2026. */
const DATE = `<ui-calendar type="date" value="2026-09-30" locale="en-US" placeholder="Due"></ui-calendar>`

/** The same, inline. */
const INLINE = `<ui-calendar inline type="date" value="2026-09-30" locale="en-US" aria-label="Due"></ui-calendar>`

beforeEach(async () => {
  await UI.load()
  // Escape through a keyboard binding rather than `CloseWatcher`, so every test can press it
  UI.overlays.useCloseWatcher = false
})

afterEach(() => UI.overlays.dispose())

////////////////
// ## Markup
////////////////

describe("<ui-calendar> markup", () => {
  it("renders a field, an icon button and a closed popover dialog", async () => {
    const { root, input, trigger, popup } = await calendar(DATE)
    expect(root.className).toBe("ui calendar")
    expect(root.style.getPropertyValue("--_ui-calendar-anchor")).toMatch(/^--ui-calendar-\d+$/)
    expect(input.parentElement!.className).toBe("ui left icon input")
    expect(input.value).toBe("September 30, 2026")
    expect(input.getAttribute("aria-label")).toBe("Due")
    expect(trigger.getAttribute("aria-label")).toBe("Choose date")
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog")
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
    expect(trigger.getAttribute("aria-controls")).toBe(popup.id)
    expect(popup.getAttribute("popover")).toBe("manual")
    expect(popup.getAttribute("role")).toBe("dialog")
    expect(popup.className).toBe("ui calendar popup bottom left")
    expect(popup.matches(":popover-open")).toBe(false)
    expect(popup.childElementCount).toBe(0)
  })

  it("renders an inline day grid:  header, weekday heads, 6 x 7 cells, the value chosen and the tab stop", async () => {
    const { root, grid, title, heads, cells, stop } = await calendar(INLINE)
    expect(root.firstElementChild!.className).toBe("calendar")
    expect(root.querySelector("input")).toBeNull()
    expect(grid().className).toBe("ui celled center aligned unstackable seven column table day")
    expect(grid().getAttribute("aria-labelledby")).toBe(title().id)
    expect(title().textContent).toBe("September 2026")
    expect(heads().map((head) => head.textContent)).toEqual(["S", "M", "T", "W", "T", "F", "S"])
    expect(heads()[0]!.getAttribute("abbr")).toBe("Sunday")
    expect(cells()).toHaveLength(42)
    expect(cells()[0]!.textContent).toBe("30")
    expect(cells()[0]!.className).toBe("link adjacent disabled")
    expect(cells()[0]!.getAttribute("aria-disabled")).toBe("true")
    const chosen = root.querySelectorAll("td[aria-selected=true]")
    expect([...chosen].map((cell) => cell.getAttribute("aria-label"))).toEqual(["Wednesday, September 30, 2026"])
    expect(stop().textContent).toBe("30")
    expect(root.querySelectorAll("td[tabindex='0']")).toHaveLength(1)
  })

  it("marks today with aria-current and the today class", async () => {
    const { cells } = await calendar(`<ui-calendar inline type="date" locale="en-US" aria-label="Now"></ui-calendar>`)
    const today = cells().filter((cell) => cell.getAttribute("aria-current") === "date")
    expect(today).toHaveLength(1)
    expect(today[0]!.textContent).toBe(String(new Date().getDate()))
    expect(today[0]!.classList.contains("today")).toBe(true)
  })

  it("emits the class grammar for its variations", async () => {
    const { root } = await calendar(
      `<ui-calendar size="small" color="red" inverted compact fluid disabled type="date" locale="en-US"></ui-calendar>`
    )
    expect(root.className).toBe("ui small red compact disabled fluid inverted calendar")
  })

  it("names a time grid (no header) and shows the today / now button", async () => {
    const { root, grid, today } = await calendar(
      `<ui-calendar inline today type="time" value="14:30" locale="en-US" aria-label="Start"></ui-calendar>`
    )
    expect(root.querySelector(".header")).toBeNull()
    expect(grid().classList.contains("hour")).toBe(true)
    expect(grid().getAttribute("aria-label")).toBe("Hours")
    expect(today()!.textContent).toBe("Now")
  })
})

////////////////
// ## Views
////////////////

describe("<ui-calendar> views", () => {
  it("walks date:  the title goes up to months and years;  choosing goes back down to the value", async () => {
    const { host, grid, title, cell } = await calendar(INLINE)
    const changes = record(host, "ui-change")
    title().click()
    await ElementFixture.tick()
    expect(grid().classList.contains("month")).toBe(true)
    expect(title().textContent).toBe("2026")
    title().click()
    await ElementFixture.tick()
    expect(grid().classList.contains("year")).toBe(true)
    expect(title().textContent).toBe("2021 – 2032")
    expect(title().disabled).toBe(true)
    cell("2027").click()
    await ElementFixture.tick()
    expect(grid().classList.contains("month")).toBe(true)
    cell("March 2027").click()
    await ElementFixture.tick()
    expect(title().textContent).toBe("March 2027")
    expect(changes).toEqual([])
    cell("Monday, March 15, 2027").click()
    await ElementFixture.tick()
    expect(changes).toEqual([expect.objectContaining({ value: "2027-03-15" })])
    expect(host.value).toBe("2027-03-15")
  })

  it("walks datetime:  day => hour => minute => value, and closes", async () => {
    const { host, input, trigger, popup, cell, grid, title } = await calendar(
      `<ui-calendar value="2026-09-30T09:00" locale="en-US" placeholder="When"></ui-calendar>`
    )
    trigger.click()
    await ElementFixture.tick()
    expect(popup.matches(":popover-open")).toBe(true)
    cell("Friday, September 18, 2026").click()
    await ElementFixture.tick()
    expect(grid().classList.contains("hour")).toBe(true)
    expect(title().textContent).toBe("September 18, 2026")
    cell("2:00 PM").click()
    await ElementFixture.tick()
    expect(grid().classList.contains("minute")).toBe(true)
    cell("2:45 PM").click()
    await ElementFixture.tick()
    expect(host.value).toBe("2026-09-18T14:45")
    expect(input.value).toBe("September 18, 2026 at 2:45 PM")
    expect(popup.matches(":popover-open")).toBe(false)
  })

  it("stops at the hour with disable-minute, and skips months with disable-month", async () => {
    const { host, cell, title, grid } = await calendar(
      `<ui-calendar inline disable-minute disable-month value="2026-09-30T09:00" locale="en-US" aria-label="When"></ui-calendar>`
    )
    title().click()
    await ElementFixture.tick()
    expect(grid().classList.contains("year")).toBe(true)
    cell("2026").click()
    await ElementFixture.tick()
    expect(grid().classList.contains("day")).toBe(true)
    cell("Wednesday, September 30, 2026").click()
    await ElementFixture.tick()
    cell("3:00 PM").click()
    await ElementFixture.tick()
    expect(host.value).toBe("2026-09-30T15:00")
  })

  it("picks months and years", async () => {
    const month = await calendar(
      `<ui-calendar inline type="month" value="2026-09" locale="en-US" aria-label="Month"></ui-calendar>`
    )
    expect(month.grid().className).toContain("three column table month")
    month.cell("December 2026").click()
    await ElementFixture.tick()
    expect(month.host.value).toBe("2026-12")
    const year = await calendar(
      `<ui-calendar inline type="year" value="2026" locale="en-US" aria-label="Year"></ui-calendar>`
    )
    year.cell("2030").click()
    await ElementFixture.tick()
    expect(year.host.value).toBe("2030")
  })

  it("pages with previous / next", async () => {
    const { previous, next, title } = await calendar(INLINE)
    expect(previous().getAttribute("aria-label")).toBe("Previous month")
    next().click()
    await ElementFixture.tick()
    expect(title().textContent).toBe("October 2026")
    previous().click()
    await ElementFixture.tick()
    previous().click()
    await ElementFixture.tick()
    expect(title().textContent).toBe("August 2026")
  })

  it("the today button picks today", async () => {
    const { host, today } = await calendar(
      `<ui-calendar inline today type="date" value="2020-01-01" locale="en-US" aria-label="Day"></ui-calendar>`
    )
    expect(today()!.textContent).toBe("Today")
    today()!.click()
    await ElementFixture.tick()
    const now = new Date()
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
    expect(host.value).toBe(iso)
  })
})

////////////////
// ## Bounds
////////////////

describe("<ui-calendar> bounds", () => {
  it("disables cells outside min / max and the pages beyond them", async () => {
    const { host, cell, previous, next } = await calendar(
      `<ui-calendar inline type="date" value="2026-09-18" min="2026-09-07" max="2026-09-25" locale="en-US" aria-label="Day"></ui-calendar>`
    )
    expect(cell("Sunday, September 6, 2026").getAttribute("aria-disabled")).toBe("true")
    expect(cell("Monday, September 7, 2026").hasAttribute("aria-disabled")).toBe(false)
    expect(cell("Saturday, September 26, 2026").getAttribute("aria-disabled")).toBe("true")
    expect(previous().disabled).toBe(true)
    expect(next().disabled).toBe(true)
    cell("Sunday, September 6, 2026").click()
    await ElementFixture.tick()
    expect(host.value).toBe("2026-09-18")
  })

  it("disables the dates and weekdays of its properties;  adjacent days only with select-adjacent-days", async () => {
    const { host, cell } = await calendar(INLINE.replace("inline", "inline select-adjacent-days"))
    host.disabledDates = ["2026-09-15"]
    host.disabledDaysOfWeek = [0, 6]
    await ElementFixture.tick()
    expect(cell("Tuesday, September 15, 2026").classList.contains("disabled")).toBe(true)
    expect(cell("Saturday, September 12, 2026").classList.contains("disabled")).toBe(true)
    expect(cell("Monday, September 14, 2026").classList.contains("disabled")).toBe(false)
    const adjacent = cell("Thursday, October 1, 2026")
    expect(adjacent.className).toBe("link adjacent")
    adjacent.click()
    await ElementFixture.tick()
    expect(host.value).toBe("2026-10-01")
  })

  it("links a range:  the end's minimum is the start's value;  the span between them is highlighted", async () => {
    const page = await ElementFixture.render(`<div>
      <ui-calendar id="s" end-calendar="e" inline type="date" value="2026-09-14" locale="en-US" aria-label="Start"></ui-calendar>
      <ui-calendar id="e" start-calendar="s" inline type="date" value="2026-09-18" locale="en-US" aria-label="End"></ui-calendar>
    </div>`)
    const [start, end] = page.querySelectorAll<Calendar>("ui-calendar")
    await ElementFixture.tick()
    await ElementFixture.tick()
    const ranged = (host: Calendar) =>
      parts(host)
        .cells()
        .filter((cell) => cell.classList.contains("range"))
    expect(ranged(end!).map((cell) => cell.textContent)).toEqual(["14", "15", "16", "17", "18"])
    expect(ranged(start!)).toHaveLength(5)
    expect(parts(end!).cell("Sunday, September 13, 2026").getAttribute("aria-disabled")).toBe("true")
    expect(parts(start!).cell("Saturday, September 19, 2026").getAttribute("aria-disabled")).toBe("true")
    // a new start moves the end's minimum, live
    start!.value = "2026-09-16"
    await ElementFixture.tick()
    expect(parts(end!).cell("Tuesday, September 15, 2026").getAttribute("aria-disabled")).toBe("true")
    expect(ranged(end!).map((cell) => cell.textContent)).toEqual(["16", "17", "18"])
  })
})

////////////////
// ## Keyboard (APG date picker)
////////////////

describe("<ui-calendar> keyboard (APG date picker)", () => {
  it("moves the focus with arrows, Home / End, PageUp / PageDown (+ Shift);  Enter chooses", async () => {
    const { host, stop, focused, title } = await calendar(INLINE)
    stop().focus()
    await press("{ArrowRight}")
    expect(focused()!.getAttribute("aria-label")).toBe("Thursday, October 1, 2026")
    expect(title().textContent).toBe("October 2026")
    await press("{ArrowLeft}{ArrowUp}")
    expect(focused()!.getAttribute("aria-label")).toBe("Wednesday, September 23, 2026")
    await press("{ArrowDown}")
    expect(focused()!.getAttribute("aria-label")).toBe("Wednesday, September 30, 2026")
    await press("{Home}")
    expect(focused()!.getAttribute("aria-label")).toBe("Sunday, September 27, 2026")
    await press("{End}")
    expect(focused()!.getAttribute("aria-label")).toBe("Saturday, October 3, 2026")
    await press("{PageUp}")
    expect(focused()!.getAttribute("aria-label")).toBe("Thursday, September 3, 2026")
    await press("{PageDown}{PageDown}")
    expect(focused()!.getAttribute("aria-label")).toBe("Tuesday, November 3, 2026")
    await press("{Shift>}{PageDown}{/Shift}")
    expect(focused()!.getAttribute("aria-label")).toBe("Wednesday, November 3, 2027")
    await press("{Shift>}{PageUp}{PageUp}{/Shift}")
    expect(focused()!.getAttribute("aria-label")).toBe("Monday, November 3, 2025")
    await press("{Enter}")
    expect(host.value).toBe("2025-11-03")
    expect(focused()!.getAttribute("aria-selected")).toBe("true")
  })

  it("clamps the day when paging from the 31st", async () => {
    const { stop, focused } = await calendar(INLINE.replace("2026-09-30", "2026-08-31"))
    stop().focus()
    await press("{PageDown}")
    expect(focused()!.getAttribute("aria-label")).toBe("Wednesday, September 30, 2026")
  })

  it("Space chooses too;  disabled cells take focus but can't be chosen", async () => {
    const { host, stop, focused } = await calendar(INLINE.replace("inline", 'inline max="2026-10-01"'))
    stop().focus()
    await press("{ArrowRight}{ArrowRight}")
    expect(focused()!.getAttribute("aria-label")).toBe("Friday, October 2, 2026")
    expect(focused()!.getAttribute("aria-disabled")).toBe("true")
    await press(" ")
    expect(host.value).toBe("2026-09-30")
    await press("{ArrowLeft} ")
    expect(host.value).toBe("2026-10-01")
  })

  it("month and year grids:  rows of three, PageUp / PageDown by a year / a decade", async () => {
    const { stop, focused, title } = await calendar(
      `<ui-calendar inline type="month" value="2026-09" locale="en-US" aria-label="Month"></ui-calendar>`
    )
    stop().focus()
    await press("{ArrowUp}")
    expect(focused()!.getAttribute("aria-label")).toBe("June 2026")
    await press("{End}")
    expect(focused()!.getAttribute("aria-label")).toBe("December 2026")
    await press("{PageDown}")
    expect(title().textContent).toBe("2027")
    await press("{Shift>}{PageUp}{/Shift}")
    expect(focused()!.getAttribute("aria-label")).toBe("December 2017")
    // the title leads to the year grid;  its tab stop is the focused year
    title().click()
    await ElementFixture.tick()
    expect(stop().textContent).toBe("2017")
    stop().focus()
    await press("{ArrowDown}{PageDown}")
    expect(focused()!.getAttribute("aria-label")).toBe("2030")
  })

  it("opens from the field with ArrowDown, focus in the grid;  Escape closes and focus returns to the field", async () => {
    const { host, input, popup, focused, trigger } = await calendar(DATE)
    const opens = record(host, "ui-open")
    input.focus()
    await press("{ArrowDown}")
    expect(popup.matches(":popover-open")).toBe(true)
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
    expect(host.matches(":state(open)")).toBe(true)
    expect(opens).toEqual([expect.objectContaining({ open: true })])
    expect(focused()!.getAttribute("aria-label")).toBe("Wednesday, September 30, 2026")
    await press("{ArrowLeft}{Escape}")
    expect(popup.matches(":popover-open")).toBe(false)
    expect(focused()).toBe(input)
    expect(host.value).toBe("2026-09-30")
  })

  it("the icon button opens with focus in the grid;  choosing closes and returns focus to it", async () => {
    const { host, trigger, popup, focused } = await calendar(DATE)
    trigger.focus()
    await press("{Enter}")
    expect(popup.matches(":popover-open")).toBe(true)
    expect(focused()!.getAttribute("aria-label")).toBe("Wednesday, September 30, 2026")
    await press("{ArrowUp}{Enter}")
    expect(host.value).toBe("2026-09-23")
    expect(popup.matches(":popover-open")).toBe(false)
    expect(focused()).toBe(trigger)
  })

  it("a click in the field opens without taking focus from it;  Tab onward closes", async () => {
    const page = await ElementFixture.render(`<div>${DATE}<button>After</button></div>`)
    const host = page.querySelector<Calendar>("ui-calendar")!
    const { input, popup } = parts(host)
    await userEvent.click(input)
    await ElementFixture.tick()
    expect(popup.matches(":popover-open")).toBe(true)
    expect(host.shadowRoot!.activeElement).toBe(input)
    page.querySelector("button")!.focus()
    await ElementFixture.tick()
    expect(popup.matches(":popover-open")).toBe(false)
  })

  it("closes on an outside click", async () => {
    const { trigger, popup } = await calendar(DATE)
    await userEvent.click(trigger)
    await ElementFixture.tick()
    expect(popup.matches(":popover-open")).toBe(true)
    await userEvent.click(document.body, { position: { x: 5, y: 400 } })
    await ElementFixture.tick()
    expect(popup.matches(":popover-open")).toBe(false)
  })
})

////////////////
// ## Typing
////////////////

describe("<ui-calendar> typing", () => {
  it("reads the locale's numeric order, month names and its own output;  Enter commits", async () => {
    const { host, input } = await calendar(DATE)
    await userEvent.clear(input)
    await userEvent.type(input, "10/4/2026{Enter}")
    await ElementFixture.tick()
    expect(host.value).toBe("2026-10-04")
    expect(input.value).toBe("October 4, 2026")
    await userEvent.clear(input)
    await userEvent.type(input, "dec 25 26{Enter}")
    await ElementFixture.tick()
    expect(host.value).toBe("2026-12-25")
    await userEvent.clear(input)
    await userEvent.type(input, "2027-01-02{Enter}")
    await ElementFixture.tick()
    expect(host.value).toBe("2027-01-02")
  })

  it("reads German dates and 24-hour times", async () => {
    const { host, input } = await calendar(
      `<ui-calendar value="2026-09-30T09:00" locale="de-DE" placeholder="Wann"></ui-calendar>`
    )
    expect(input.value).toBe("30. September 2026 um 09:00")
    await userEvent.clear(input)
    await userEvent.type(input, "4.10.2026 14:30{Enter}")
    await ElementFixture.tick()
    expect(host.value).toBe("2026-10-04T14:30")
    await userEvent.clear(input)
    await userEvent.type(input, "5. Okt 2026 um 7:05{Enter}")
    await ElementFixture.tick()
    expect(host.value).toBe("2026-10-05T07:05")
  })

  it("reads English day periods and its own date-time text", async () => {
    const { host, input } = await calendar(
      `<ui-calendar value="2026-09-30T09:00" locale="en-US" placeholder="When"></ui-calendar>`
    )
    await userEvent.clear(input)
    await userEvent.type(input, "September 30, 2026 at 2:30 PM{Enter}")
    await ElementFixture.tick()
    expect(host.value).toBe("2026-09-30T14:30")
    const time = await calendar(`<ui-calendar type="time" locale="en-US" placeholder="Time"></ui-calendar>`)
    await userEvent.type(time.input, "12:15 am{Enter}")
    await ElementFixture.tick()
    expect(time.host.value).toBe("00:15")
    await userEvent.clear(time.input)
    await userEvent.type(time.input, "7 pm{Enter}")
    await ElementFixture.tick()
    expect(time.host.value).toBe("19:00")
  })

  it("reverts unreadable or out-of-range text;  clears on empty text", async () => {
    const { host, input } = await calendar(DATE.replace("type", 'max="2026-12-31" type'))
    const changes = record(host, "ui-change")
    await userEvent.clear(input)
    await userEvent.type(input, "not a date{Enter}")
    await ElementFixture.tick()
    expect(input.value).toBe("September 30, 2026")
    await userEvent.clear(input)
    await userEvent.type(input, "1/1/2027{Enter}")
    await ElementFixture.tick()
    expect(host.value).toBe("2026-09-30")
    await userEvent.clear(input)
    await userEvent.keyboard("{Enter}")
    await ElementFixture.tick()
    expect(host.value).toBe("")
    expect(changes).toEqual([expect.objectContaining({ value: "" })])
  })
})

////////////////
// ## Events and value
////////////////

describe("<ui-calendar> events and value", () => {
  it("ui-change is cancelable:  a veto keeps the old value", async () => {
    const { host, cell } = await calendar(INLINE)
    host.addEventListener("ui-change", (event) => event.preventDefault())
    cell("Tuesday, September 15, 2026").click()
    await ElementFixture.tick()
    expect(host.value).toBe("2026-09-30")
    expect(parts(host).stop().textContent).toBe("15")
  })

  it("ui-open is cancelable;  `open` opens and closes from the property", async () => {
    const { host, trigger, popup } = await calendar(DATE)
    const veto = (event: Event) => event.preventDefault()
    host.addEventListener("ui-open", veto)
    trigger.click()
    await ElementFixture.tick()
    expect(popup.matches(":popover-open")).toBe(false)
    host.removeEventListener("ui-open", veto)
    host.open = true
    await ElementFixture.tick()
    expect(popup.matches(":popover-open")).toBe(true)
    host.open = false
    await ElementFixture.tick()
    expect(popup.matches(":popover-open")).toBe(false)
  })

  it("follows the host's value property, and ignores what it can't read", async () => {
    const { host, input } = await calendar(DATE)
    host.value = "2026-01-05"
    await ElementFixture.tick()
    expect(input.value).toBe("January 5, 2026")
    host.value = "garbage"
    await ElementFixture.tick()
    expect(input.value).toBe("")
  })

  it("stays shut when disabled or read-only", async () => {
    for (const flag of ["disabled", "readonly"]) {
      const { host, trigger, input, popup } = await calendar(DATE.replace("type", `${flag} type`))
      expect(trigger.disabled).toBe(true)
      input.click()
      await ElementFixture.tick()
      expect(popup.matches(":popover-open"), flag).toBe(false)
      expect(host.matches(":state(disabled)")).toBe(flag === "disabled")
    }
  })
})

////////////////
// ## Locales
////////////////

describe("<ui-calendar> locales", () => {
  it("en-US:  Sunday first, 12-hour cells;  de-DE:  Monday first, German names, 24-hour cells", async () => {
    const us = await calendar(INLINE)
    expect(us.heads()[0]!.getAttribute("abbr")).toBe("Sunday")
    const de = await calendar(INLINE.replace("en-US", "de-DE"))
    expect(de.heads().map((head) => head.getAttribute("abbr"))).toEqual([
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
      "Samstag",
      "Sonntag"
    ])
    expect(de.title().textContent).toBe("September 2026")
    expect(de.cells()[0]!.getAttribute("aria-label")).toBe("Montag, 31. August 2026")
    expect(de.previous().getAttribute("aria-label")).toBe("Previous month")
    const hours = (locale: string) =>
      calendar(`<ui-calendar inline type="time" value="14:00" locale="${locale}" aria-label="Time"></ui-calendar>`)
    expect((await hours("en-US")).stop().textContent).toBe("2:00 PM")
    expect((await hours("de-DE")).stop().textContent).toBe("14:00")
  })

  it("first-day-of-week overrides the locale", async () => {
    const { heads, cells } = await calendar(INLINE.replace("inline", 'inline first-day-of-week="1"'))
    expect(heads()[0]!.getAttribute("abbr")).toBe("Monday")
    expect(cells()[0]!.getAttribute("aria-label")).toBe("Monday, August 31, 2026")
  })
})

////////////////
// ## Forms
////////////////

describe("<ui-calendar> forms", () => {
  it("submits the ISO value, validates `required`, resets to the attribute", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(`<form>
      <ui-calendar name="start" type="datetime" value="2026-09-30T14:30" locale="en-US" placeholder="Start"></ui-calendar>
      <ui-calendar name="due" type="date" required locale="en-US" placeholder="Due"></ui-calendar>
    </form>`)
    const [start, due] = form.querySelectorAll<Calendar>("ui-calendar")
    expect(new FormData(form).get("start")).toBe("2026-09-30T14:30")
    expect(new FormData(form).has("due")).toBe(false)
    expect(form.checkValidity()).toBe(false)
    expect(due!.validity.valueMissing).toBe(true)
    expect(due!.matches(":state(invalid)")).toBe(true)
    due!.value = "2026-10-01"
    start!.value = "2027-01-01T08:00"
    await ElementFixture.tick()
    expect(form.checkValidity()).toBe(true)
    expect([...new FormData(form)]).toEqual([
      ["start", "2027-01-01T08:00"],
      ["due", "2026-10-01"]
    ])
    form.reset()
    await ElementFixture.tick()
    expect(new FormData(form).get("start")).toBe("2026-09-30T14:30")
    expect(parts(start!).input.value).toBe("September 30, 2026 at 2:30 PM")
    expect(new FormData(form).has("due")).toBe(false)
  })

  it("is left out of the form when disabled by a fieldset", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(`<form><fieldset disabled>
      <ui-calendar name="day" type="date" value="2026-09-30" locale="en-US" placeholder="Day"></ui-calendar>
    </fieldset></form>`)
    await ElementFixture.tick()
    const host = form.querySelector<Calendar>("ui-calendar")!
    expect(new FormData(form).has("day")).toBe(false)
    expect(parts(host).root.classList.contains("disabled")).toBe(true)
    expect(parts(host).input.disabled).toBe(true)
  })

  it("restores a saved state", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><ui-calendar name="day" type="date" locale="en-US" placeholder="Day"></ui-calendar></form>`
    )
    const host = form.querySelector<Calendar>("ui-calendar")!
    host.formStateRestoreCallback("2026-02-14", "restore")
    await ElementFixture.tick()
    expect(host.value).toBe("2026-02-14")
    expect(new FormData(form).get("day")).toBe("2026-02-14")
  })
})

////////////////
// ## Tokens from outside
////////////////

describe("<ui-calendar> tokens from outside", () => {
  /** The first cell's top padding, which `--ui-calendar-cell-padding` drives. */
  function cellPadding(host: Calendar): string {
    return getComputedStyle(parts(host).cells()[0]!).paddingTop
  }

  it("takes a token set on the HOST", async () => {
    const { host } = await calendar(
      INLINE.replace("<ui-calendar", `<ui-calendar style="--ui-calendar-cell-padding: 20px"`)
    )
    expect(cellPadding(host)).toBe("20px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-calendar-cell-padding: 20px"><div>${INLINE}</div></section>`
    )
    expect(cellPadding(wrapper.querySelector<Calendar>("ui-calendar")!)).toBe("20px")
  })

  it("takes a token set through `::part(calendar)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(calendar) { --ui-calendar-cell-padding: 20px }</style>${INLINE.replace("<ui-calendar", `<ui-calendar class="themed"`)}</div>`
    )
    expect(cellPadding(wrapper.querySelector<Calendar>("ui-calendar")!)).toBe("20px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-calendar-cell-padding", "20px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-calendar-cell-padding")
    })
    const { host } = await calendar(INLINE)
    expect(cellPadding(host)).toBe("20px")
  })

  it("reaches the popup's cells, set on the host;  `compact` reaches them too", async () => {
    const { host, trigger } = await calendar(
      DATE.replace("<ui-calendar", `<ui-calendar style="--ui-calendar-cell-padding: 20px"`)
    )
    trigger.click()
    await ElementFixture.tick()
    expect(cellPadding(host)).toBe("20px")
    const { host: compact, trigger: compactTrigger } = await calendar(
      DATE.replace("<ui-calendar", "<ui-calendar compact")
    )
    compactTrigger.click()
    await ElementFixture.tick()
    const cell = parts(compact).cells()[0]!
    expect(parseFloat(getComputedStyle(cell).paddingTop)).toBeCloseTo(
      0.3 * parseFloat(getComputedStyle(cell).fontSize),
      1
    )
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-calendar> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await ElementFixture.tick()
    await expectAccessible(root)
  })

  it("axe passes with the popup open", async () => {
    const { host, trigger } = await calendar(DATE.replace("type", "today type"))
    trigger.click()
    await ElementFixture.tick()
    await expectAccessible(host)
  })
})
