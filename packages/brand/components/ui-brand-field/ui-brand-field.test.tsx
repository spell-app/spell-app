import { describe, expect, it } from "vitest"

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
