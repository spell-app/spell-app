import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/epics/components/epic-status"

/** `element`'s shadow part `name`. */
function part(element: Element, name: string): HTMLElement | null {
  return element.shadowRoot!.querySelector<HTMLElement>(`[part~='${name}']`)
}

/** An underway card, as `plan-doc status ... underway` writes it. */
const UNDERWAY =
  `<epic-status slot="status" state="underway" at="2026-10-08 14:20">` +
  `<p>Weigh moving the pack templates into one JSON file, and answer here with a recommendation.</p></epic-status>`

/** The same card done, with a summary. */
const DONE =
  `<epic-status slot="status" state="done" at="2026-10-08 14:20" done-at="2026-10-08 14:34">` +
  `<p>Weigh moving the pack templates into one JSON file, and answer here with a recommendation.</p>` +
  `<p slot="summary">Recommended keeping a file each:  the JSON would need escaping for every template.</p>` +
  `</epic-status>`

describe("<epic-status>", () => {
  test("underway:  `Claude • Underway` left, `at` right as `10/8/26 14:20`, the reading;  blue (Claude on it, Q20);  passes axe", async () => {
    const host = await ElementFixture.render(UNDERWAY)
    expect({
      who: part(host, "who")!.textContent,
      date: part(host, "date")!.textContent,
      datetime: part(host, "date")!.getAttribute("datetime"),
      tip: part(host, "date")!.title,
      base: part(host, "base")!.className,
      summaryShown: getComputedStyle(part(host, "summary")!).display !== "none",
      states: [host.matches(":state(underway)"), host.matches(":state(done)")]
    }).toEqual({
      who: "Claude • Underway",
      date: "10/8/26 14:20",
      datetime: "2026-10-08 14:20",
      tip: "",
      base: "underway status",
      summaryShown: false,
      states: [true, false]
    })
    expect(host.querySelector("p")!.assignedSlot!.name).toBe("")
    await expectAccessible(host)
  })

  test("done:  `Claude • Done`, the done time right (taken in its tooltip), the reading kept, the summary under it;  green (done, Q20);  passes axe", async () => {
    const host = await ElementFixture.render(DONE)
    const summary = host.querySelector('[slot="summary"]')!
    expect({
      who: part(host, "who")!.textContent,
      date: part(host, "date")!.textContent,
      tip: part(host, "date")!.title,
      base: part(host, "base")!.className,
      summarySlot: summary.assignedSlot!.name,
      summaryShown: getComputedStyle(part(host, "summary")!).display !== "none",
      done: host.matches(":state(done)")
    }).toEqual({
      who: "Claude • Done",
      date: "10/8/26 14:34",
      tip: "taken 10/8/26 14:20",
      base: "done status",
      summarySlot: "summary",
      summaryShown: true,
      done: true
    })
    await expectAccessible(host)
  })

  test("a card born done (a pick `inbox apply` filed):  `at` alone is its date;  no summary, no summary box", async () => {
    const host = await ElementFixture.render(
      `<epic-status state="done" at="2026-10-08 15:02"><p>Chose B · Keep one file per template</p></epic-status>`
    )
    expect([part(host, "date")!.textContent, part(host, "date")!.title, part(host, "summary")!.offsetHeight]).toEqual([
      "10/8/26 15:02",
      "",
      0
    ])
  })

  test("the two fills differ (blue, green), and each stays readable in the DARK scheme too (axe)", async () => {
    const wrap = await ElementFixture.render(
      `<div style="color-scheme: dark; background: #1b1c1d; padding: 4px">${UNDERWAY}${DONE}</div>`
    )
    const [underway, done] = Array.from(wrap.querySelectorAll("epic-status"))
    const fills = [underway, done].map((host) => getComputedStyle(part(host, "base")!).backgroundColor)
    expect(fills[0]).not.toBe(fills[1])
    await expectAccessible(underway)
    await expectAccessible(done)
  })

  test("the date stays at the RIGHT of the TOP line in the side bar's ~320px", async () => {
    const sideBar = await ElementFixture.render(`<div style="width: 320px">${DONE}</div>`)
    const host = sideBar.querySelector("epic-status")!
    const [header, who, date] = ["header", "who", "date"].map((name) => part(host, name)!.getBoundingClientRect())
    expect(Math.abs(date.top - who.top)).toBeLessThan(4)
    expect([date.right <= header.right + 0.5, date.left >= who.right]).toEqual([true, true])
  })
})
