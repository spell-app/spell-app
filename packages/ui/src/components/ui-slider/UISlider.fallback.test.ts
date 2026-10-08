import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { expectAccessible } from "$/ui/test/A11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { SliderFallback } from "./UISlider.fallback"

FallbackStub.define(
  "x-fb-slider",
  (host, root, internals) => SliderFallback.render({ domElement: host, root, error: new Error("boom"), internals }),
  true
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

/** Move `input` to `value` as the user would, firing `input` and `change`. */
function slide(input: HTMLInputElement, value: string) {
  input.value = value
  input.dispatchEvent(new Event("input", { bubbles: true }))
  input.dispatchEvent(new Event("change", { bubbles: true }))
}

describe("SliderFallback", () => {
  it("renders a native range input in the class grammar, with Fomantic's defaults", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-slider color="blue" value="5" aria-label="Volume"></x-fb-slider>`)
    const root = FallbackStub.shadow(host).firstElementChild!
    expect(root.className).toBe("ui blue slider")
    const input = root.querySelector<HTMLInputElement>("input[type=range][part=thumb]")!
    expect([input.min, input.max, input.step, input.value]).toEqual(["0", "20", "1", "5"])
    expect(input.getAttribute("aria-label")).toBe("Volume")
    await expectAccessible(host, AXE)
  })

  it("is still a form control:  value, host.value, ui-input / ui-change", () => {
    const form = Fixture.render<HTMLFormElement>(
      `<form><x-fb-slider name="volume" value="5" aria-label="Volume"></x-fb-slider></form>`
    )
    const host = form.querySelector<StubHost & { value?: number }>("x-fb-slider")!
    expect(new FormData(form).get("volume")).toBe("5")
    const names: string[] = []
    for (const name of ["ui-input", "ui-change"]) host.addEventListener(name, () => names.push(name))
    slide(FallbackStub.shadow(host).querySelector("input")!, "12")
    expect(new FormData(form).get("volume")).toBe("12")
    expect(host.value).toBe(12)
    expect(names).toEqual(["ui-input", "ui-change"])
  })

  it("a range:  two named inputs, two form entries, kept in order", async () => {
    const form = Fixture.render<HTMLFormElement>(
      `<form><x-fb-slider name="price" range value="4" end="9" aria-label="Price"></x-fb-slider></form>`
    )
    const host = form.querySelector<StubHost & { end?: number }>("x-fb-slider")!
    const [low, high] = FallbackStub.shadow(host).querySelectorAll("input")
    expect([low!.getAttribute("aria-label"), high!.getAttribute("aria-label")]).toEqual(["Minimum", "Maximum"])
    expect(new FormData(form).getAll("price")).toEqual(["4", "9"])
    slide(low!, "15")
    expect(new FormData(form).getAll("price")).toEqual(["9", "9"])
    expect(host.end).toBe(9)
    await expectAccessible(host, AXE)
  })
})
