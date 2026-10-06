import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { expectAccessible } from "$/ui/test/A11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { LoaderFallback } from "./ui-loader.fallback"

FallbackStub.define("x-fb-loader", (host, root, internals) =>
  LoaderFallback.render({ host, root, error: new Error("boom"), internals })
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("LoaderFallback", () => {
  it("renders a polite status with the class grammar and part, named while empty", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-loader active inline size="small"></x-fb-loader>`)
    const loader = FallbackStub.shadow(host).firstElementChild!
    expect(loader).toMatchObject({
      className: "ui small active inline loader",
      role: "status",
      ariaLive: "polite",
      ariaLabel: "Loading…"
    })
    expect(loader.getAttribute("part")).toBe("loader")
    await expectAccessible(host, AXE)
  })

  it("lets slotted text name it", () => {
    const host = Fixture.render<StubHost>(`<x-fb-loader active text>Wait</x-fb-loader>`)
    const loader = FallbackStub.shadow(host).firstElementChild!
    expect(loader.hasAttribute("aria-label")).toBe(false)
    expect(loader.querySelector("slot")).not.toBeNull()
  })
})
