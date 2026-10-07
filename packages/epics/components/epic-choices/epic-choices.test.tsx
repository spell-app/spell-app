import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/a11y"

import "$/epics/components/epic-choices"

/** The slots in `host`'s `base` part, by name (`""`:  the default one). */
function baseSlots(host: Element): string[] {
  return Array.from(host.shadowRoot!.querySelectorAll(`[part~="base"] slot`), (slot) => slot.getAttribute("name") ?? "")
}

describe("<epic-choices>", () => {
  test("shows its children through its `base` part's slots, and passes axe", async () => {
    const element = await ElementFixture.render(`<epic-choices chosen="A"><p>Hello</p></epic-choices>`)
    expect(baseSlots(element)).toEqual([""])
    expect(element.querySelector("p")!.textContent).toBe("Hello")
    await expectAccessible(element)
  })
})

describe("<epic-option>", () => {
  test("shows its children through its `base` part's slots, and passes axe", async () => {
    const element = await ElementFixture.render(
      `<epic-option letter="A" title="A named palette" recommended><p>Hello</p></epic-option>`
    )
    expect(baseSlots(element)).toEqual(["title", ""])
    expect(element.querySelector("p")!.textContent).toBe("Hello")
    await expectAccessible(element)
  })
})
