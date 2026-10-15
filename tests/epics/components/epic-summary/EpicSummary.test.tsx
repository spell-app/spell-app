import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/epics/components/epic-summary"

/** A summary, two sentences. */
const SUMMARY = `<epic-summary>Plan docs drawn by web components. <code>spell dev plan-doc</code> writes them.</epic-summary>`

describe("<epic-summary>", () => {
  test("a lede:  its text is its own light children, through its slot, a size up from the page's;  axe", async () => {
    const host = await ElementFixture.render(SUMMARY)
    const slot = host.shadowRoot!.querySelector('[part~="base"] slot') as HTMLSlotElement
    expect(slot.assignedNodes().map((node) => node.textContent)).toEqual([
      "Plan docs drawn by web components. ",
      "spell dev plan-doc",
      " writes them."
    ])
    expect(getComputedStyle(host).fontSize).toBe("17px")
    await expectAccessible(host)
  })

  test("a `<p>` inside takes the lede's look, without margins of its own", async () => {
    const host = await ElementFixture.render(`<epic-summary><p>One.</p><p>Two.</p></epic-summary>`)
    const [one, two] = Array.from(host.querySelectorAll("p"), (p) => getComputedStyle(p))
    expect([one!.fontSize, one!.marginTop, one!.marginBottom, two!.marginTop]).toEqual(["17px", "0px", "0px", "8.5px"])
  })

  test("readable in the LIGHT and DARK schemes (axe)", async () => {
    const light = await ElementFixture.render(
      `<div style="color-scheme: light; color: CanvasText; padding: 4px">${SUMMARY}</div>`
    )
    const dark = await ElementFixture.render(
      `<div style="color-scheme: dark; background: #1b1c1d; color: CanvasText; padding: 4px">${SUMMARY}</div>`
    )
    await expectAccessible(light)
    await expectAccessible(dark)
  })

  test("in the side bar's ~320px:  it wraps, nothing overflows", async () => {
    const sideBar = await ElementFixture.render(`<div style="width: 320px">${SUMMARY}</div>`)
    const host = sideBar.querySelector("epic-summary")!
    expect([host.getBoundingClientRect().width, host.scrollWidth].every((it) => it <= 320)).toBe(true)
  })
})
