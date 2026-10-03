import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { StepFallback } from "./ui-step.fallback"

// the fallback keys its vocabulary on the host's tag, so the stubs take the real tags
for (const tag of ["ui-steps", "ui-step"]) {
  FallbackStub.define(tag, (host, root, internals) => StepFallback.render(host, root, new Error("boom"), internals))
}

describe("StepFallback", () => {
  it("renders a step:  class grammar, shorthand content, current step, hidden 'Completed'", () => {
    const host = Fixture.render<StubHost>(`<ui-step active completed header="Shipping" description="Choose"></ui-step>`)
    const step = FallbackStub.shadow(host).firstElementChild!
    expect(step.localName).toBe("div")
    expect(step.className).toBe("completed step active")
    expect(step.getAttribute("part")).toBe("step")
    expect(step.getAttribute("aria-current")).toBe("step")
    expect(step.querySelector(".content.in-step > .title.in-step")!.textContent).toBe("Shipping")
    expect(step.querySelector(".description.in-step")!.textContent).toBe("Choose")
    expect(step.querySelector("slot")).not.toBeNull()
    expect(step.querySelector(".ui-visually-hidden-force")!.textContent).toBe("Completed")
  })

  it("renders a link step, without href while disabled", () => {
    const link = Fixture.render<StubHost>(`<ui-step href="#a" header="A"></ui-step>`)
    expect(FallbackStub.shadow(link).firstElementChild!.getAttribute("href")).toBe("#a")
    const off = Fixture.render<StubHost>(`<ui-step href="#a" disabled header="A"></ui-step>`)
    const root = FallbackStub.shadow(off).firstElementChild!
    expect(root.localName).toBe("a")
    expect(root.hasAttribute("href")).toBe(false)
    expect(root.getAttribute("aria-disabled")).toBe("true")
  })

  it("renders the group as an ordered list, by the host's tag", async () => {
    const host = Fixture.render<StubHost>(
      `<ui-steps ordered vertical><ui-step header="One"></ui-step><ui-step selected header="Two"></ui-step></ui-steps>`
    )
    const steps = FallbackStub.shadow(host).firstElementChild!
    expect(steps.localName).toBe("ol")
    expect(steps.className).toBe("ui ordered vertical steps")
    expect(steps.getAttribute("role")).toBe("list")
    expect(steps.getAttribute("part")).toBe("steps")
    // the stub hosts have no `listitem` role (the real step sets it through internals)
    for (const step of host.querySelectorAll<StubHost>("ui-step")) step.internals.role = "listitem"
    await expectAccessible(host, { rules: { "color-contrast": { enabled: false } } })
  })
})
