import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/a11y"

import { Markup } from "$/epics/markup"

import "$/epics/components"

/** The slots in `host`'s `base` part, by name (`""`:  the default one). */
function baseSlots(host: Element): string[] {
  return Array.from(host.shadowRoot!.querySelectorAll(`[part~="base"] slot`), (slot) => slot.getAttribute("name") ?? "")
}

describe("<epic-page>", () => {
  test("shows its children through its `base` part's slots, and passes axe", async () => {
    const element = await ElementFixture.render(
      `<epic-page epic="demo" title="Demo"><a slot="durable" href="#durable">Durable</a><p>Hello</p></epic-page>`
    )
    expect(baseSlots(element)).toEqual(["durable", ""])
    expect(element.querySelector("p")!.textContent).toBe("Hello")
    await expectAccessible(element)
  })

  test("`Markup` reads, writes and checks the LIVE elements:  no problems once they're defined and drawn", async () => {
    const page = await ElementFixture.render(`
      <epic-page epic="demo" title="Demo">
        <epic-overview id="overview"><p slot="summary">Two sentences.</p></epic-overview>
        <epic-section id="decisions" kind="questions">
          <epic-item id="q1" title="Which colour names?" status="open"><p>Which?</p></epic-item>
        </epic-section>
      </epic-page>`)
    await ElementFixture.settle()
    expect(Markup.validate(page)).toEqual([])
    const item = page.querySelector("epic-item")!
    Markup.set<"epic-item">(item, { status: "decided", answered: true })
    item.append(Markup.element(document, "epic-answer", { title: "Named palette" }, "<p>Named.</p>"))
    await ElementFixture.settle()
    expect(Markup.read(item)).toEqual({ id: "q1", title: "Which colour names?", status: "decided", answered: true })
    expect(item.querySelector("epic-answer")!.shadowRoot).not.toBeNull()
    expect(Markup.validate(page)).toEqual([])
  })
})
