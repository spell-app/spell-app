import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { expectAccessible } from "$/ui/test/A11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { DividerFallback } from "./ui-divider.fallback"

FallbackStub.define("x-fb-divider", (host, root, internals) =>
  DividerFallback.render({ host, root, error: new Error("boom"), internals })
)

describe("DividerFallback", () => {
  it("renders a separator with the class grammar, part and slot", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-divider horizontal>Or</x-fb-divider>`)
    const divider = FallbackStub.shadow(host).firstElementChild!
    expect(divider.className).toBe("ui horizontal divider")
    expect(divider.getAttribute("role")).toBe("separator")
    expect(divider.getAttribute("part")).toBe("divider")
    expect(divider.hasAttribute("aria-orientation")).toBe(false)
    expect(divider.querySelector("slot")).not.toBeNull()
    await expectAccessible(host)
  })

  it("is vertical, or spacing only", () => {
    const vertical = Fixture.render<StubHost>(`<x-fb-divider vertical></x-fb-divider>`)
    expect(FallbackStub.shadow(vertical).firstElementChild!.getAttribute("aria-orientation")).toBe("vertical")
    const hidden = Fixture.render<StubHost>(`<x-fb-divider hidden vertical></x-fb-divider>`)
    const divider = FallbackStub.shadow(hidden).firstElementChild!
    expect(divider.getAttribute("role")).toBe("none")
    expect(divider.hasAttribute("aria-orientation")).toBe(false)
  })
})
