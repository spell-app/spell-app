import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/epics/components/epic-update"

describe("<epic-update>", () => {
  test("bare:  an inline orange UPDATE label, its phase in its tooltip", async () => {
    const root = await ElementFixture.render(`<p>Changed <epic-update phase="5"></epic-update></p>`)
    const update = root.querySelector("epic-update")!
    const label = update.shadowRoot!.querySelector('[part~="label"]')!
    expect({ text: label.textContent, tip: label.getAttribute("title") }).toEqual({
      text: "UPDATE",
      tip: "Changed during P5"
    })
    expect(update.matches(":state(block)")).toBe(false)
    expect(getComputedStyle(update).display).toBe("inline-block")
    await expectAccessible(root)
  })

  test("a block:  `Update: <summary>`, the date at the right of the title row, what changed under it", async () => {
    const update = await ElementFixture.render(
      `<epic-update at="2026-10-11 14:30" summary="Split P7 in two" phase="6"><p>Why it split.</p></epic-update>`
    )
    await ElementFixture.tick()
    const shadow = update.shadowRoot!
    expect(update.matches(":state(block)")).toBe(true)
    expect(update.matches(":state(open)")).toBe(true)
    expect(getComputedStyle(update).display).toBe("block")
    expect(shadow.querySelector('[part~="title"]')!.textContent).toBe("Update: Split P7 in two")
    expect(shadow.querySelector('[part~="title"] b')!.textContent).toBe("Update")
    const time = shadow.querySelector('[part~="time"]')!
    expect({ text: time.textContent, tip: time.getAttribute("title") }).toEqual({
      text: "10/11/26 14:30",
      tip: "2026-10-11 14:30 · Written during P6"
    })
    // the date on the title's right, on its first line
    const title = shadow.querySelector('[part~="title"]')!.getBoundingClientRect()
    const box = time.getBoundingClientRect()
    expect(box.left).toBeGreaterThanOrEqual(title.right - 0.5)
    expect(Math.abs(box.top - title.top)).toBeLessThan(6)
    expect(update.querySelector("p")!.assignedSlot).not.toBeNull()
    await expectAccessible(update.parentElement!)
  })

  test("a block folds by its title row:  what changed `until-found`, open again on a second click", async () => {
    const update = await ElementFixture.render(
      `<epic-update at="2026-10-11 14:30" summary="Moved"><p>Text</p></epic-update>`
    )
    await ElementFixture.tick()
    const shadow = update.shadowRoot!
    const button = shadow.querySelector<HTMLButtonElement>('[part~="toggle"]')!
    const body = shadow.querySelector('[part~="body"]')!
    expect(button.getAttribute("aria-expanded")).toBe("true")
    shadow.querySelector<HTMLElement>('[part~="header"]')!.click()
    await ElementFixture.tick()
    expect(body.getAttribute("hidden")).toBe("until-found")
    expect(update.matches(":state(open)")).toBe(false)
    button.click()
    await ElementFixture.tick()
    expect(body.hasAttribute("hidden")).toBe(false)
  })

  test("a summary alone:  a block with no fold, no body;  an older note (children, no summary):  `Update` alone", async () => {
    const root = await ElementFixture.render(
      `<div><epic-update at="2026-10-11" summary="Renamed"></epic-update>` +
        `<epic-update phase="2"><p>What changed.</p></epic-update></div>`
    )
    await ElementFixture.tick()
    const [summed, note] = Array.from(root.querySelectorAll("epic-update"))
    expect(summed!.matches(":state(block)")).toBe(true)
    expect(summed!.shadowRoot!.querySelector('[part~="toggle"]')).toBeNull()
    expect(summed!.shadowRoot!.querySelector('[part~="time"]')!.textContent).toBe("10/11/26")
    expect(note!.matches(":state(block)")).toBe(true)
    expect(note!.shadowRoot!.querySelector('[part~="title"]')!.textContent).toBe("Update")
    expect(note!.shadowRoot!.querySelector('[part~="time"]')).toBeNull()
    note!.replaceChildren()
    await new Promise(requestAnimationFrame)
    await ElementFixture.tick()
    expect(note!.matches(":state(block)")).toBe(false)
  })
})
