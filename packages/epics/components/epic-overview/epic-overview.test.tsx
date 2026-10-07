import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/a11y"

import "$/epics/components/epic-overview"

/** The slots in `host`'s `base` part, by name (`""`:  the default one). */
function baseSlots(host: Element): string[] {
  return Array.from(host.shadowRoot!.querySelectorAll(`[part~="base"] slot`), (slot) => slot.getAttribute("name") ?? "")
}

describe("<epic-overview>", () => {
  test("shows its children through its `base` part's slots, and passes axe", async () => {
    const element = await ElementFixture.render(
      `<epic-overview id="overview"><p slot="summary">Summary</p><blockquote slot="prompt"><p>Prompt</p></blockquote><p>Hello</p></epic-overview>`
    )
    expect(baseSlots(element)).toEqual(["summary", "prompt", ""])
    expect(element.querySelector(":scope > p:not([slot])")!.textContent).toBe("Hello")
    await expectAccessible(element)
  })
})
