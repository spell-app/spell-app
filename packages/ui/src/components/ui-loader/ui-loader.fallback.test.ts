import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { LoaderFallback } from "./ui-loader.fallback"

FallbackStub.define("x-fb-loader", (host, root, internals) =>
  LoaderFallback.render(host, root, new Error("boom"), internals)
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("LoaderFallback", () => {
  it("renders a polite status with the class grammar and part, named while empty", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-loader active inline size="small"></x-fb-loader>`)
    const loader = FallbackStub.shadow(host).firstElementChild!
    expect(loader.className).toBe("ui small active inline loader")
    expect(loader.getAttribute("part")).toBe("loader")
    expect(loader.getAttribute("role")).toBe("status")
    expect(loader.getAttribute("aria-live")).toBe("polite")
    expect(loader.getAttribute("aria-label")).toBe("Loading…")
    await expectAccessible(host, AXE)
  })

  it("lets slotted text name it", () => {
    const host = Fixture.render<StubHost>(`<x-fb-loader active text>Wait</x-fb-loader>`)
    const loader = FallbackStub.shadow(host).firstElementChild!
    expect(loader.hasAttribute("aria-label")).toBe(false)
    expect(loader.querySelector("slot")).not.toBeNull()
  })
})
