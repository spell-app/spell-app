import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { RatingFallback } from "./ui-rating.fallback"

FallbackStub.define(
  "x-fb-rating",
  (host, root, internals) => RatingFallback.render(host, root, new Error("boom"), internals),
  true
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("RatingFallback", () => {
  it("renders a named radio group in the class grammar, one numbered radio per point", async () => {
    const host = Fixture.render<StubHost>(
      `<x-fb-rating color="yellow" max-rating="5" value="3" aria-label="Quality"></x-fb-rating>`
    )
    const group = FallbackStub.shadow(host).querySelector("fieldset")!
    expect(group.className).toBe("ui yellow rating")
    expect([group.getAttribute("role"), group.getAttribute("aria-label")]).toEqual(["radiogroup", "Quality"])
    const radios = [...group.querySelectorAll("input")]
    expect(radios.map((radio) => radio.checked)).toEqual([false, false, true, false, false])
    expect(group.querySelector("label")!.textContent!.trim()).toBe("1")
    await expectAccessible(host, AXE)
  })

  it("is still a form control:  value, validity, host.value, ui-change", () => {
    const form = Fixture.render<HTMLFormElement>(
      `<form><x-fb-rating name="stars" required aria-label="Stars"></x-fb-rating></form>`
    )
    const host = form.querySelector<StubHost & { value?: number }>("x-fb-rating")!
    expect(form.checkValidity()).toBe(false)
    const values: unknown[] = []
    host.addEventListener("ui-change", (event) => values.push((event as CustomEvent).detail.value))
    FallbackStub.shadow(host).querySelectorAll("input")[1]!.click()
    expect(new FormData(form).get("stars")).toBe("2")
    expect(form.checkValidity()).toBe(true)
    expect(host.value).toBe(2)
    expect(values).toEqual([2])
  })

  it("keeps readonly unchangeable", () => {
    const host = Fixture.render<StubHost>(`<x-fb-rating readonly value="1" aria-label="R"></x-fb-rating>`)
    const radios = FallbackStub.shadow(host).querySelectorAll("input")
    radios[2]!.click()
    expect([radios[0]!.checked, radios[2]!.checked]).toEqual([true, false])
  })
})
