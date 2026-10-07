import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/a11y"

import "$/epics/components/epic-item"

/** The slots in `host`'s `base` part, by name (`""`:  the default one). */
function baseSlots(host: Element): string[] {
  return Array.from(host.shadowRoot!.querySelectorAll(`[part~="base"] slot`), (slot) => slot.getAttribute("name") ?? "")
}

describe("<epic-item>", () => {
  test("shows its children through its `base` part's slots, and passes axe", async () => {
    const element = await ElementFixture.render(
      `<epic-item id="q1" title="Which colour names?" status="open"><p>Hello</p></epic-item>`
    )
    expect(baseSlots(element)).toEqual(["title", ""])
    expect(element.querySelector("p")!.textContent).toBe("Hello")
    await expectAccessible(element)
  })

  test("its `id` and `title` stay the platform's:  links land, nothing is added to the markup", async () => {
    const html = `<epic-item id="q1" title="Which colour names?" status="open" answered="" phase="2"></epic-item>`
    const element = await ElementFixture.render<HTMLElement>(html)
    expect(element.outerHTML).toBe(html)
    expect(document.getElementById("q1")).toBe(element)
    expect([element.id, element.title]).toEqual(["q1", "Which colour names?"])
    element.id = "q2"
    element.title = "Another"
    await ElementFixture.settle()
    expect([element.getAttribute("id"), element.getAttribute("title")]).toEqual(["q2", "Another"])
  })
})
