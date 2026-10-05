import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { RailFallback } from "./ui-rail.fallback"

FallbackStub.define("x-fb-rail", (host, root, internals) =>
  RailFallback.render(host, root, new Error("boom"), internals)
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
