import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { expectAccessible } from "$/ui/test/A11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { RailFallback } from "./ui-rail.fallback"

FallbackStub.define("x-fb-rail", (host, root, internals) =>
  RailFallback.render({ host, root, error: new Error("boom"), internals })
)

describe("RailFallback", () => {
  it("renders a div with the class grammar, part and slot", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-rail position="right" close="very" dividing>Rail</x-fb-rail>`)
    const rail = FallbackStub.shadow(host).firstElementChild!
    expect(rail.localName).toBe("div")
    expect(rail.className).toBe("ui right dividing very close rail")
    expect(rail.getAttribute("part")).toBe("rail")
    expect(rail.querySelector("slot")).not.toBeNull()
    await expectAccessible(host)
  })
})
