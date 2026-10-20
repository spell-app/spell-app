import { describe, expect, it } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"
import type { DOMFieldElement } from "$/ui/components/ui-form/UIField"

import "$/ui"

////////////////
// ## Helpers
////////////////

/** A part of the DOM element `host`'s shadow root, or `null`. */
function part(host: Element, name: string): HTMLElement | null {
  return host.shadowRoot!.querySelector(`[part~="${name}"]`)
}

////////////////
// ## Layout
////////////////

describe("<ui-field> layout", () => {
  it("lays out the label row, the control and the hint;  leaves out what isn't there", async () => {
    const host =
      await ElementFixture.render(`<ui-field label="Vibrancy" output="100%" hint="Above 100% can leave sRGB.">
      <input type="range" min="0" max="200">
    </ui-field>`)
    expect(["label", "output", "hint"].map((name) => part(host, name)!.textContent)).toEqual([
      "Vibrancy",
      "100%",
      "Above 100% can leave sRGB."
    ])
    expect(["actions", "info", "error"].map((name) => part(host, name))).toEqual([null, null, null])
    expect(host.matches(":state(field)")).toBe(true)
    await expectAccessible(host)
  })

  it("draws no label row for a field that slots its own <label>:  it looks as it always did", async () => {
    const host = await ElementFixture.render(`<ui-field><label for="n">Name</label><input id="n"></ui-field>`)
    expect(part(host, "row")).toBeNull()
    expect(host.querySelector("input")!.hasAttribute("aria-label")).toBe(false)
    await expectAccessible(host)
  })

  it("shows slotted actions and a tip that describes its icon", async () => {
    const host = await ElementFixture.render(`<ui-field label="Base color sits at" description="Where the seed lands.">
      <ui-button slot="actions" size="mini">Auto</ui-button>
      <input type="range">
    </ui-field>`)
    expect(part(host, "actions")).not.toBeNull()
    const info = part(host, "info")!
    expect(info.getAttribute("aria-label")).toBe("More about Base color sits at")
    expect(host.shadowRoot!.getElementById(info.getAttribute("aria-describedby")!)!.textContent).toBe(
      "Where the seed lands."
    )
    await expectAccessible(host)
  })

  it('takes a rich tip from `slot="description"`;  the icon appears with it', async () => {
    const host = await ElementFixture.render(`<ui-field label="Vibrancy"><input type="range"></ui-field>`)
    expect(part(host, "info")).toBeNull()
    const rich = document.createElement("span")
    rich.slot = "description"
    rich.innerHTML = "How <b>bold</b> the colours are.<br>Slide left for softer."
    host.append(rich)
    await expect.poll(() => part(host, "info")).not.toBeNull()
    const tip = host.shadowRoot!.getElementById(part(host, "info")!.getAttribute("aria-describedby")!)!
    expect(rich.assignedSlot!.closest("[part~=tip]")).toBe(tip)
    await expect.poll(() => part(host, "info")!.querySelector("svg")).not.toBeNull()
    await expectAccessible(host)
  })

  it("`inline`:  puts the label row beside the control, and the hint under both", async () => {
    const host =
      await ElementFixture.render(`<ui-field label="Notifications" hint="Daily at most." inline style="width: 400px">
      <ui-checkbox toggle></ui-checkbox>
    </ui-field>`)
    await ElementFixture.settle()
    const row = part(host, "row")!.getBoundingClientRect()
    const control = host.querySelector("ui-checkbox")!.getBoundingClientRect()
    const hint = part(host, "hint")!.getBoundingClientRect()
    expect(control.left).toBeGreaterThan(row.right)
    expect(Math.abs(control.top + control.height / 2 - (row.top + row.height / 2))).toBeLessThan(4)
    expect(hint.top).toBeGreaterThanOrEqual(Math.max(row.bottom, control.bottom))
  })

  it("keeps the label row's height when a taller action pill appears", async () => {
    const host = await ElementFixture.render(`<ui-field label="Vibrancy" output="100%">
      <input type="range">
    </ui-field>`)
    const row = part(host, "row")!
    const input = host.querySelector("input")!
    const before = { row: row.getBoundingClientRect().height, control: input.getBoundingClientRect().top }
    host.insertAdjacentHTML(
      "afterbegin",
      `<ui-button slot="actions" size="mini" circular basic icon="rotate left">Reset</ui-button>`
    )
    await ElementFixture.settle()
    const pill = host.querySelector("ui-button")!.getBoundingClientRect().height
    expect(pill).toBeGreaterThan(before.row)
    expect(row.getBoundingClientRect().height).toBe(before.row)
    expect(input.getBoundingClientRect().top).toBe(before.control)
  })
})

////////////////
// ## Naming, errors and states
////////////////

describe("<ui-field> naming and errors", () => {
  it("names an unnamed control after its label, follows the label, and leaves a named one alone", async () => {
    const host = await ElementFixture.render(`<ui-field label="Hue">
      <input type="range" id="a"><input type="text" id="b" aria-label="Own name">
    </ui-field>`)
    const [a, b] = [host.querySelector("#a")!, host.querySelector("#b")!]
    expect(a.getAttribute("aria-label")).toBe("Hue")
    expect(b.getAttribute("aria-label")).toBe("Own name")
    host.setAttribute("label", "Hue drift")
    await ElementFixture.tick()
    expect(a.getAttribute("aria-label")).toBe("Hue drift")
    expect(b.getAttribute("aria-label")).toBe("Own name")
  })

  it("focuses the control when its label is clicked", async () => {
    const host = await ElementFixture.render(`<ui-field label="Name"><input type="text"></ui-field>`)
    part(host, "label")!.click()
    expect(document.activeElement).toBe(host.querySelector("input"))
  })

  it("shows `error` as a line under the control, then <ui-form>'s over it;  `[]` goes back to `error`", async () => {
    const host = await ElementFixture.render<DOMFieldElement>(
      `<ui-field label="Hex" error="That isn't a colour."><input type="text"></ui-field>`
    )
    expect(part(host, "error")!.textContent).toBe("That isn't a colour.")
    expect(part(host, "error")!.getAttribute("role")).toBe("alert")
    expect(host.matches(":state(error)")).toBe(true)
    expect(part(host, "field")!.classList.contains("error")).toBe(true)
    host.showErrors(["Hex must have a value"])
    await ElementFixture.tick()
    expect(part(host, "error")!.textContent).toBe("Hex must have a value")
    expect(host.errors).toEqual(["Hex must have a value"])
    host.showErrors([])
    host.removeAttribute("error")
    await ElementFixture.tick()
    expect(part(host, "error")).toBeNull()
    expect(host.matches(":state(error)")).toBe(false)
  })

  it("draws the error below the control, in the error colour, not as a pointing label", async () => {
    const host = await ElementFixture.render(`<ui-field label="Hex" error="Not a colour."><input></ui-field>`)
    const error = part(host, "error")!
    expect(error.classList.contains("label")).toBe(false)
    expect(error.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      host.querySelector("input")!.getBoundingClientRect().bottom
    )
  })

  it("is `inert` while disabled;  `:state(readonly)` and `:state(mixed)` follow their attributes", async () => {
    const host = await ElementFixture.render(`<ui-field label="Name" disabled readonly mixed><input></ui-field>`)
    expect(part(host, "field")!.inert).toBe(true)
    expect(["disabled", "readonly", "mixed"].map((state) => host.matches(`:state(${state})`))).toEqual([
      true,
      true,
      true
    ])
    host.removeAttribute("mixed")
    await ElementFixture.tick()
    expect(host.matches(":state(mixed)")).toBe(false)
  })
})
