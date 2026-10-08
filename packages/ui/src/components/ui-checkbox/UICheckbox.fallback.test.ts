import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { expectAccessible } from "$/ui/test/A11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { CheckboxFallback } from "./UICheckbox.fallback"

FallbackStub.define(
  "x-fb-checkbox",
  (host, root, internals) => CheckboxFallback.render({ domElement: host, root, error: new Error("boom"), internals }),
  true
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("CheckboxFallback", () => {
  it("renders Fomantic's markup:  the root, a native checkbox and its label around the slot", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-checkbox type="toggle" checked>Wifi</x-fb-checkbox>`)
    const root = FallbackStub.shadow(host).firstElementChild!
    expect(root.className).toBe("ui toggle checkbox")
    const input = root.querySelector<HTMLInputElement>("input[part=control]")!
    expect([input.type, input.checked, input.getAttribute("role")]).toEqual(["checkbox", true, "switch"])
    const label = root.querySelector("label[part=label]")!
    expect(label.getAttribute("for")).toBe(input.id)
    expect(label.querySelector("slot")).not.toBeNull()
    await expectAccessible(host, AXE)
  })

  it("is still a form control:  value while chosen, validity, ui-change", () => {
    const form = Fixture.render<HTMLFormElement>(
      `<form><x-fb-checkbox name="terms" value="yes" required>Terms</x-fb-checkbox></form>`
    )
    const host = form.querySelector<StubHost & { selected?: boolean }>("x-fb-checkbox")!
    expect(form.checkValidity()).toBe(false)
    const details: unknown[] = []
    host.addEventListener("ui-change", (event) => details.push((event as CustomEvent).detail.selected))
    FallbackStub.shadow(host).querySelector("input")!.click()
    expect(new FormData(form).get("terms")).toBe("yes")
    expect(form.checkValidity()).toBe(true)
    expect(host.selected).toBe(true)
    expect(details).toEqual([true])
  })

  it("submits `off-value` while unchosen, and says which value in ui-change", () => {
    const form = Fixture.render<HTMLFormElement>(
      `<form><x-fb-checkbox name="panel" value="open" off-value="closed">Open</x-fb-checkbox></form>`
    )
    const host = form.querySelector<StubHost>("x-fb-checkbox")!
    const values: unknown[] = []
    host.addEventListener("ui-change", (event) => values.push((event as CustomEvent).detail.value))
    expect(new FormData(form).get("panel")).toBe("closed")
    const input = FallbackStub.shadow(host).querySelector("input")!
    input.click()
    expect(new FormData(form).get("panel")).toBe("open")
    input.click()
    expect(new FormData(form).get("panel")).toBe("closed")
    expect(values).toEqual(["open", "closed"])
  })

  it("keeps readonly unchangeable", () => {
    const host = Fixture.render<StubHost>(`<x-fb-checkbox readonly>Locked</x-fb-checkbox>`)
    const input = FallbackStub.shadow(host).querySelector("input")!
    input.click()
    expect(input.checked).toBe(false)
  })
})
