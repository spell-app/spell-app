import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/epics/components/epic-update"

describe("<epic-update>", () => {
  test("empty:  an inline orange UPDATE label, its phase in its tooltip", async () => {
    const root = await ElementFixture.render(`<p>Changed <epic-update phase="5"></epic-update></p>`)
    const update = root.querySelector("epic-update")!
    const label = update.shadowRoot!.querySelector('[part~="label"]')!
    expect({ text: label.textContent, tip: label.getAttribute("title") }).toEqual({
      text: "UPDATE",
      tip: "Changed during P5"
    })
    expect(update.matches(":state(note)")).toBe(false)
    expect(getComputedStyle(update).display).toBe("inline-block")
    await expectAccessible(root)
  })

  test("with children:  a note, its children through its slot;  back to a label when they go", async () => {
    const update = await ElementFixture.render(`<epic-update phase="2"><p>What changed.</p></epic-update>`)
    await ElementFixture.tick()
    expect(update.matches(":state(note)")).toBe(true)
    expect(getComputedStyle(update).display).toBe("block")
    expect(update.querySelector("p")!.assignedSlot).not.toBeNull()
    update.replaceChildren()
    await new Promise(requestAnimationFrame)
    await ElementFixture.tick()
    expect(update.matches(":state(note)")).toBe(false)
  })
})
