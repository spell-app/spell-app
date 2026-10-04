import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { IncludeFallback } from "./ui-include.fallback"

FallbackStub.define("x-fb-include", (host, root, internals) =>
  IncludeFallback.render(host, root, new Error("boom"), internals)
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("IncludeFallback", () => {
  it("keeps the placeholder and links to the source", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-include source="/notes.html">Placeholder</x-fb-include>`)
    const box = FallbackStub.shadow(host).firstElementChild!
    expect(box.getAttribute("part")).toBe("content")
    expect(box.className).toBe("ui include")
    expect(box.querySelector("slot")).not.toBeNull()
    expect(box.querySelector("a")!.getAttribute("href")).toBe("/notes.html")
    await expectAccessible(host, AXE)
  })

  it("has no link without a source", () => {
    const host = Fixture.render<StubHost>(`<x-fb-include>Placeholder</x-fb-include>`)
    expect(FallbackStub.shadow(host).querySelector("a")).toBeNull()
  })
})
