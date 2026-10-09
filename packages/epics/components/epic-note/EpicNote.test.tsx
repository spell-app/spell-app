import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/epics/components/epic-note"

/** `element`'s shadow part `name`. */
function part(element: Element, name: string): HTMLElement {
  return element.shadowRoot!.querySelector<HTMLElement>(`[part~='${name}']`)!
}

/** The two notes older prose wrote by hand, as elements. */
const UPDATE = `<epic-note state="update" title="partly fixed by J9, 2026-10-06"><p>Reworded.</p></epic-note>`
const DONE = `<epic-note state="done" title="option A, 2026-10-06"></epic-note>`

describe("<epic-note>", () => {
  test("headed `UPDATE · <title>` / `DONE · <title>`, its note slotted;  a note with no body is its heading alone", async () => {
    const wrap = await ElementFixture.render(`<div>${UPDATE}${DONE}</div>`)
    const [update, done] = Array.from(wrap.querySelectorAll("epic-note"))
    expect(
      [update, done].map((host) => ({
        heading: part(host, "header").textContent,
        look: part(host, "base").className,
        empty: part(host, "body").classList.contains("empty")
      }))
    ).toEqual([
      { heading: "UPDATE · partly fixed by J9, 2026-10-06", look: "update note", empty: false },
      { heading: "DONE · option A, 2026-10-06", look: "done note", empty: true }
    ])
    expect(update.querySelector("p")!.assignedSlot).not.toBeNull()
    expect(getComputedStyle(part(done, "body")).display).toBe("none")
  })

  test("ONE meaning per colour (Q20):  UPDATE orange, DONE green -- two fills;  readable in both schemes (axe)", async () => {
    for (const scheme of ["light", "dark"]) {
      const wrap = await ElementFixture.render(
        `<div style="color-scheme: ${scheme}; background: ${scheme === "dark" ? "#1b1c1d" : "#fff"}">${UPDATE}${DONE}</div>`
      )
      const [update, done] = Array.from(wrap.querySelectorAll("epic-note"))
      const fills = [update, done].map((host) => getComputedStyle(part(host, "base")).backgroundColor)
      expect(fills[0]).not.toBe(fills[1])
      await expectAccessible(update)
      await expectAccessible(done)
    }
  })

  test("no title:  the label alone;  the heading wraps within the side bar's ~320px", async () => {
    const wrap = await ElementFixture.render(
      `<div style="width: 320px"><epic-note state="update"><p>x</p></epic-note><epic-note state="done" title="${"long words ".repeat(12)}"></epic-note></div>`
    )
    const [bare, long] = Array.from(wrap.querySelectorAll("epic-note"))
    expect(part(bare, "header").textContent).toBe("UPDATE")
    expect([long.getBoundingClientRect().width <= 320, wrap.scrollWidth <= 320]).toEqual([true, true])
  })
})
