import { describe, expect, it } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/a11y"

import "$/brand/components"

/** A part of `host`'s shadow root, or `null`. */
function part(host: Element, name: string): HTMLElement | null {
  return host.shadowRoot!.querySelector(`[part~="${name}"]`)
}

/** `<ui-brand-field>`'s host API, as `<ui-form>` sees it. */
type FieldHost = HTMLElement & { showErrors(messages: readonly string[]): void; errors: readonly string[] }

describe("<ui-brand-field>", () => {
  it("lays out the label row, the control and the help;  leaves out what isn't there", async () => {
    const host =
      await ElementFixture.render(`<ui-brand-field label="Vibrancy" value="100%" help="Above 100% can leave sRGB.">
      <input type="range" min="0" max="200">
    </ui-brand-field>`)
    expect(part(host, "label")!.textContent).toBe("Vibrancy")
    expect(part(host, "value")!.textContent).toBe("100%")
    expect(part(host, "help")!.textContent).toBe("Above 100% can leave sRGB.")
    expect(part(host, "actions")).toBeNull()
    expect(part(host, "info")).toBeNull()
    expect(part(host, "error")).toBeNull()
    expect(host.matches(":state(field)")).toBe(true)
    expect([...part(host, "field")!.classList]).toEqual(["field", "brand"])
    await expectAccessible(host)
  })

  it("shows slotted actions and an info tip that describes its icon", async () => {
    const host = await ElementFixture.render(`<ui-brand-field label="Base color sits at" info="Where the seed lands.">
      <ui-button slot="actions" size="mini">Auto</ui-button>
      <input type="range">
    </ui-brand-field>`)
    expect(part(host, "actions")).not.toBeNull()
    const info = part(host, "info")!
    expect(info.getAttribute("aria-label")).toBe("More about Base color sits at")
    expect(host.shadowRoot!.getElementById(info.getAttribute("aria-describedby")!)!.textContent).toBe(
      "Where the seed lands."
    )
    await expectAccessible(host)
  })

  it('takes a rich tip from `slot="info"`;  the icon appears with it', async () => {
    const host = await ElementFixture.render(`<ui-brand-field label="Vibrancy"><input type="range"></ui-brand-field>`)
    expect(part(host, "info")).toBeNull()
    const rich = document.createElement("span")
    rich.slot = "info"
    rich.innerHTML = "How <b>bold</b> the colours are.<br>Slide left for softer."
    host.append(rich)
    await expect.poll(() => part(host, "info")).not.toBeNull()
    const tip = host.shadowRoot!.getElementById(part(host, "info")!.getAttribute("aria-describedby")!)!
    expect(rich.assignedSlot!.closest("[part~=tip]")).toBe(tip)
    await expect.poll(() => part(host, "info")!.querySelector("svg")).not.toBeNull()
    await expectAccessible(host)
  })

  it("keeps the label row's height when a taller action pill appears", async () => {
    const host = await ElementFixture.render(`<ui-brand-field label="Vibrancy" value="100%">
      <input type="range">
    </ui-brand-field>`)
    const row = part(host, "row")!
    const control = part(host, "control")!
    const before = { row: row.getBoundingClientRect().height, control: control.getBoundingClientRect().top }
    host.insertAdjacentHTML(
      "afterbegin",
      `<ui-button slot="actions" size="mini" circular basic icon="rotate left">Reset</ui-button>`
    )
    await ElementFixture.settle()
    const pill = host.querySelector("ui-button")!.getBoundingClientRect().height
    expect(pill).toBeGreaterThan(before.row)
    expect(row.getBoundingClientRect().height).toBe(before.row)
    expect(control.getBoundingClientRect().top).toBe(before.control)
  })

  it("stretches a slotted <ui-menu> (its host is `display: contents`) across the control row", async () => {
    const host = await ElementFixture.render(`<ui-brand-field label="Corners" style="width: 400px">
      <ui-menu appearance="segmented" alignment="fluid" equal size="small">
        <ui-item>Sharp</ui-item><ui-item>Soft</ui-item><ui-item>Round</ui-item>
      </ui-menu>
    </ui-brand-field>`)
    await ElementFixture.settle()
    const menu = host.querySelector<HTMLElement>("ui-menu")!
    const box = menu.shadowRoot!.querySelector(".ui.menu")!.getBoundingClientRect()
    const control = part(host, "control")!.getBoundingClientRect()
    expect(getComputedStyle(menu).display).toBe("block")
    expect(Math.abs(box.width - control.width)).toBeLessThan(1)
    menu.hidden = true
    expect(getComputedStyle(menu).display).toBe("none")
  })

  it("draws a slotted input / select / dropdown compact:  30px tall, 14px, weight 500, 6px corners (I16)", async () => {
    const host = await ElementFixture.render(`<ui-brand-field label="Fonts" style="width: 300px">
      <ui-input value="Spell" aria-label="Name"></ui-input>
      <ui-select value="a"><ui-item value="a">Palatino</ui-item><ui-item value="b">Georgia</ui-item></ui-select>
      <ui-dropdown selection placeholder="Pick" aria-label="Pick"><ui-item value="a">One</ui-item></ui-dropdown>
    </ui-brand-field>`)
    await ElementFixture.settle()
    const boxes = {
      input: host.querySelector("ui-input")!.shadowRoot!.querySelector("input")!,
      select: host.querySelector("ui-select")!.shadowRoot!.querySelector<HTMLElement>(".ui.select")!,
      dropdown: host.querySelector("ui-dropdown")!.shadowRoot!.querySelector<HTMLElement>(".ui.dropdown")!
    }
    for (const [name, box] of Object.entries(boxes)) {
      const style = getComputedStyle(box)
      expect(Math.round(box.getBoundingClientRect().height), name).toBe(30)
      expect(style.fontSize, name).toBe("14px")
      expect(style.fontWeight, name).toBe("500")
      expect(Math.round(parseFloat(style.borderTopLeftRadius)), name).toBe(6)
    }

    // nested deeper (a row in a slotted `<div>`):  the page's size, untouched
    const nested = await ElementFixture.render(`<ui-brand-field label="RGB">
      <div><ui-input value="#8E96B5" aria-label="RGB"></ui-input></div>
    </ui-brand-field>`)
    await ElementFixture.settle()
    const input = nested.querySelector("ui-input")!.shadowRoot!.querySelector("input")!
    expect(getComputedStyle(input).fontSize).toBe("16px")
    expect(input.getBoundingClientRect().height).toBeGreaterThan(30)
  })

  it("draws a slotted segmented menu compact:  a 32px track of 26px options at 12px, 3px apart, no margin", async () => {
    const host = await ElementFixture.render(`<ui-brand-field label="Corners" style="width: 300px">
      <ui-menu appearance="segmented" alignment="fluid" equal link>
        <ui-item selected>Sharp</ui-item><ui-item>Soft</ui-item><ui-item>Round</ui-item>
      </ui-menu>
    </ui-brand-field>`)
    await ElementFixture.settle()
    const menu = host.querySelector("ui-menu")!
    const track = menu.shadowRoot!.querySelector<HTMLElement>(".ui.menu")!
    const items = [...menu.querySelectorAll("ui-item")].map((item) =>
      item.shadowRoot!.querySelector<HTMLElement>(".item")!
    )
    expect(Math.round(track.getBoundingClientRect().height)).toBe(32)
    expect(Math.round(track.getBoundingClientRect().top)).toBe(
      Math.round(part(host, "control")!.getBoundingClientRect().top)
    )
    expect(getComputedStyle(track).borderTopLeftRadius).toBe("9px")
    for (const item of items) {
      expect(Math.round(item.getBoundingClientRect().height)).toBe(26)
      expect(getComputedStyle(item).fontSize).toBe("12px")
      expect(getComputedStyle(item).fontWeight).toBe("500")
    }
    const [first, second] = items.map((item) => item.getBoundingClientRect())
    expect(Math.round(second!.left - first!.right)).toBe(3)
  })

  it("stretches a slotted colour set across the control row, under a 20px label row", async () => {
    const host = await ElementFixture.render(`<ui-brand-field label="Primary" style="width: 300px">
      <ui-brand-color-set columns="4"><ui-brand-color value="#6550CA"></ui-brand-color></ui-brand-color-set>
    </ui-brand-field>`)
    await ElementFixture.settle()
    const set = host.querySelector("ui-brand-color-set")!.getBoundingClientRect()
    expect(Math.abs(set.width - part(host, "control")!.getBoundingClientRect().width)).toBeLessThan(1)
    expect(Math.round(part(host, "row")!.getBoundingClientRect().height)).toBe(20)
  })

  it("names an unnamed control after its label, follows the label, and leaves a named one alone", async () => {
    const host = await ElementFixture.render(`<ui-brand-field label="Hue">
      <input type="range" id="a"><input type="text" id="b" aria-label="Own name">
    </ui-brand-field>`)
    const [a, b] = [host.querySelector("#a")!, host.querySelector("#b")!]
    expect(a.getAttribute("aria-label")).toBe("Hue")
    expect(b.getAttribute("aria-label")).toBe("Own name")
    host.setAttribute("label", "Hue drift")
    await ElementFixture.tick()
    expect(a.getAttribute("aria-label")).toBe("Hue drift")
    expect(b.getAttribute("aria-label")).toBe("Own name")
  })

  it("focuses the control when its label is clicked", async () => {
    const host = await ElementFixture.render(`<ui-brand-field label="Name"><input type="text"></ui-brand-field>`)
    part(host, "label")!.click()
    expect(document.activeElement).toBe(host.querySelector("input"))
  })

  it("shows `error`, then <ui-form>'s messages over it;  `[]` goes back to `error`", async () => {
    const host = await ElementFixture.render<FieldHost>(
      `<ui-brand-field label="Hex" error="That isn't a colour."><input type="text"></ui-brand-field>`
    )
    expect(part(host, "error")!.textContent).toBe("That isn't a colour.")
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

  it("takes <ui-form>'s validation like a <ui-field>", async () => {
    const form = await ElementFixture.render<HTMLElement & { validate(): boolean }>(`<ui-form><form>
      <ui-brand-field label="Name"><ui-input name="name" required></ui-input></ui-brand-field>
    </form></ui-form>`)
    await ElementFixture.settle()
    expect(form.validate()).toBe(false)
    await ElementFixture.tick()
    const field = form.querySelector("ui-brand-field")!
    expect(part(field, "error")!.textContent).toMatch(/\w/)
    expect(field.matches(":state(error)")).toBe(true)
  })

  it("is `inert` while disabled", async () => {
    const host = await ElementFixture.render(`<ui-brand-field label="Name" disabled><input></ui-brand-field>`)
    expect(part(host, "field")!.inert).toBe(true)
    expect(host.matches(":state(disabled)")).toBe(true)
  })
})
