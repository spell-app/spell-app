import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { FlagFallback } from "./ui-flag.fallback"

FallbackStub.define("x-fb-flag", (host, root, internals) =>
  FlagFallback.render(host, root, new Error("boom"), internals)
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("FlagFallback", () => {
  it("renders the emoji as a named image, with the class grammar and part", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-flag country="france" size="large"></x-fb-flag>`)
    const flag = FallbackStub.shadow(host).firstElementChild!
    expect(flag.className).toBe("ui large flag fr")
    expect(flag.getAttribute("part")).toBe("flag")
    expect(flag.getAttribute("role")).toBe("img")
    expect(flag.getAttribute("aria-label")).toBe("France")
    expect(flag.textContent).toBe("🇫🇷")
    await expectAccessible(host, AXE)
  })

  it("names non-country flags in English, and leaves an unknown one unnamed", () => {
    const pride = Fixture.render<StubHost>(`<x-fb-flag country="pride"></x-fb-flag>`)
    expect(FallbackStub.shadow(pride).firstElementChild!.getAttribute("aria-label")).toBe("Rainbow flag")
    const unknown = Fixture.render<StubHost>(`<x-fb-flag country="atlantis"></x-fb-flag>`)
    const root = FallbackStub.shadow(unknown).firstElementChild!
    expect(root.hasAttribute("role")).toBe(false)
    expect(root.textContent).toBe("")
  })
})
