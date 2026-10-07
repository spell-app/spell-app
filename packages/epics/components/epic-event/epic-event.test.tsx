import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/a11y"

import "$/epics/components/epic-event"

/** The slots in `host`'s `base` part, by name (`""`:  the default one). */
function baseSlots(host: Element): string[] {
  return Array.from(host.shadowRoot!.querySelectorAll(`[part~="base"] slot`), (slot) => slot.getAttribute("name") ?? "")
}

describe("<epic-event>", () => {
  test("shows its children through its `base` part's slots, and passes axe", async () => {
    const element = await ElementFixture.render(
      `<epic-event at="2026-10-06T08:12-04:00" icon="pen to square"><p>Hello</p></epic-event>`
    )
    expect(baseSlots(element)).toEqual([""])
    expect(element.querySelector("p")!.textContent).toBe("Hello")
    await expectAccessible(element)
  })
})
