import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { InputFallback } from "./ui-input.fallback"

FallbackStub.define(
  "x-fb-input",
  (host, root, internals) => InputFallback.render(host, root, new Error("boom"), internals),
  true
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("InputFallback", () => {
  it("renders the box and a native input with the constraints and the label shorthand", async () => {
    const host = Fixture.render<StubHost>(
      `<x-fb-input size="small" label="http://" type="email" required placeholder="Site" value="a@b.co"></x-fb-input>`
    )
    const root = FallbackStub.shadow(host).firstElementChild!
    expect(root.className).toBe("ui small input labeled")
    expect(root.getAttribute("part")).toBe("input")
    const input = root.querySelector<HTMLInputElement>("input[part=control]")!
    expect([input.type, input.required, input.value]).toEqual(["email", true, "a@b.co"])
    expect(input.getAttribute("aria-label")).toBe("Site")
    expect(root.firstElementChild!.textContent).toBe("http://")
    await expectAccessible(host, AXE)
  })

  it("is still a form control:  value, validity, ui-input / ui-change", () => {
    const form = Fixture.render<HTMLFormElement>(
      `<form><x-fb-input name="q" required aria-label="Query"></x-fb-input></form>`
    )
    const host = form.querySelector<StubHost & { value?: string }>("x-fb-input")!
    expect(form.checkValidity()).toBe(false)
    const events: string[] = []
    host.addEventListener("ui-input", (event) => events.push(`input:${(event as CustomEvent).detail.value}`))
    host.addEventListener("ui-change", () => events.push("change"))
    const input = FallbackStub.shadow(host).querySelector("input")!
    input.value = "cats"
    input.dispatchEvent(new Event("input", { bubbles: true }))
    input.dispatchEvent(new Event("change", { bubbles: true }))
    expect(new FormData(form).get("q")).toBe("cats")
    expect(form.checkValidity()).toBe(true)
    expect(host.value).toBe("cats")
    expect(events).toEqual(["input:cats", "change"])
  })
})
