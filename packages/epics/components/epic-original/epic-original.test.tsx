import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/a11y"

import "$/epics/components/epic-original"

/** The slots in `host`'s `base` part, by name (`""`:  the default one). */
function baseSlots(host: Element): string[] {
  return Array.from(host.shadowRoot!.querySelectorAll(`[part~="base"] slot`), (slot) => slot.getAttribute("name") ?? "")
}

describe("<epic-original>", () => {
  test("shows its children through its `base` part's slots, and passes axe", async () => {
    const element = await ElementFixture.render(`<epic-original><p>Hello</p></epic-original>`)
    expect(baseSlots(element)).toEqual([""])
    expect(element.querySelector("p")!.textContent).toBe("Hello")
    await expectAccessible(element)
  })
})

describe("<epic-version>", () => {
  test("shows its children through its `base` part's slots, and passes axe", async () => {
    const element = await ElementFixture.render(`<epic-version as-of="2026-10-04 20:49"><p>Hello</p></epic-version>`)
    expect(baseSlots(element)).toEqual([""])
    expect(element.querySelector("p")!.textContent).toBe("Hello")
    await expectAccessible(element)
  })
})
