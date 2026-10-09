import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/epics/components/epic-question"
import "$/epics/components/epic-item"

/** `host`'s shadow part `name`. */
function part(host: Element, name: string): HTMLElement | null {
  return host.shadowRoot!.querySelector<HTMLElement>(`[part~="${name}"]`)
}

/** A question, as first asked. */
const QUESTION = `<epic-question><p>Which browser first?</p><ul><li>Firefox</li><li>Chrome</li></ul></epic-question>`

describe("<epic-question>", () => {
  test("a small `Question` label over its text;  the text is its own light children, through its slot;  axe", async () => {
    const host = await ElementFixture.render(QUESTION)
    expect(part(host, "label")!.textContent).toBe("Question")
    expect(getComputedStyle(part(host, "label")!).textTransform).toBe("uppercase")
    expect(host.querySelector("p")!.assignedSlot).toBe(part(host, "base")!.querySelector("slot"))
    await expectAccessible(host)
  })

  test("its label looks like an item's `Original question`, which an item starting with it no longer draws", async () => {
    const answered = await ElementFixture.render(
      `<epic-item id="q1" title="Old" status="decided" answered open><p>Asked in prose.</p></epic-item>`
    )
    const tagged = await ElementFixture.render(
      `<epic-item id="q2" title="New" status="decided" answered open>${QUESTION}</epic-item>`
    )
    await ElementFixture.tick()
    const itemLabel = part(answered, "label")!
    const question = tagged.querySelector("epic-question")!
    expect([itemLabel.textContent, part(tagged, "label")]).toEqual(["Original question", null])
    const look = (element: Element) => {
      const { color, fontSize, fontWeight, letterSpacing, textTransform } = getComputedStyle(element)
      return { color, fontSize, fontWeight, letterSpacing, textTransform }
    }
    expect(look(part(question, "label")!)).toEqual(look(itemLabel))
  })

  test("readable in the LIGHT and DARK schemes (axe)", async () => {
    const light = await ElementFixture.render(
      `<div style="color-scheme: light; color: CanvasText; padding: 4px">${QUESTION}</div>`
    )
    const dark = await ElementFixture.render(
      `<div style="color-scheme: dark; background: #1b1c1d; color: CanvasText; padding: 4px">${QUESTION}</div>`
    )
    await expectAccessible(light)
    await expectAccessible(dark)
  })

  test("in the side bar's ~320px:  nothing overflows", async () => {
    const long = `<epic-question><p>${"Which of these long words goes first? ".repeat(10)}</p></epic-question>`
    const sideBar = await ElementFixture.render(`<div style="width: 320px">${long}</div>`)
    const host = sideBar.querySelector("epic-question")!
    expect([host.getBoundingClientRect().width, part(host, "base")!.scrollWidth].every((it) => it <= 320)).toBe(true)
  })
})
