import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/a11y"

import "$/epics/components/epic-answer"

/** The slots in `host`'s `base` part, by name (`""`:  the default one). */
function baseSlots(host: Element): string[] {
  return Array.from(host.shadowRoot!.querySelectorAll(`[part~="base"] slot`), (slot) => slot.getAttribute("name") ?? "")
}

describe("<epic-answer>", () => {
  test("shows its children through its `base` part's slots, and passes axe", async () => {
    const element = await ElementFixture.render(`<epic-answer id="d1" title="Named palette"><p>Hello</p></epic-answer>`)
    expect(baseSlots(element)).toEqual([""])
    expect(element.querySelector("p")!.textContent).toBe("Hello")
    await expectAccessible(element)
  })
})

describe("<epic-reply>", () => {
  test("shows its children through its `base` part's slots, and passes axe", async () => {
    const element = await ElementFixture.render(
      `<epic-reply from="Claude" at="2026-10-06 23:55" re="as built"><p>Hello</p></epic-reply>`
    )
    expect(baseSlots(element)).toEqual([""])
    expect(element.querySelector("p")!.textContent).toBe("Hello")
    await expectAccessible(element)
  })
})

describe("<epic-more>", () => {
  test("shows its children through its `base` part's slots, and passes axe", async () => {
    const element = await ElementFixture.render(`<epic-more><p>Hello</p></epic-more>`)
    expect(baseSlots(element)).toEqual([""])
    expect(element.querySelector("p")!.textContent).toBe("Hello")
    await expectAccessible(element)
  })
})
