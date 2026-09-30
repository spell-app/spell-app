import { describe, expect, it } from "vitest"

import { Fixture } from "$test/fixture"
import { expectAccessible } from "$test/a11y"
import { FallbackStub, type StubHost } from "$/components/fallback.stub"

import { TextFallback } from "./text.fallback"

FallbackStub.define("x-fb-text", (host, root, internals) =>
  TextFallback.render(host, root, new Error("boom"), internals)
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("TextFallback", () => {
  it("renders a span with the class grammar, part and slot", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-text size="large" color="red" state="error">Oops</x-fb-text>`)
    const span = FallbackStub.shadow(host).firstElementChild!
    expect(span.localName).toBe("span")
    expect(span.className).toBe("ui large red error text")
    expect(span.getAttribute("part")).toBe("text")
    expect(span.querySelector("slot")).not.toBeNull()
    expect(host.internals.states.has("errored")).toBe(true)
    await expectAccessible(host, AXE)
  })
})
