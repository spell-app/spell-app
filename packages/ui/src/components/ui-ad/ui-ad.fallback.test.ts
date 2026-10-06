import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { AdFallback } from "./ui-ad.fallback"

FallbackStub.define("x-fb-ad", (host, root, internals) =>
  AdFallback.render({ host, root, error: new Error("boom"), internals })
)

describe("AdFallback", () => {
  it("renders the class grammar, part and slot, with the test text", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-ad unit="medium rectangle" centered test></x-fb-ad>`)
    const ad = FallbackStub.shadow(host).firstElementChild as HTMLElement
    expect(ad.className).toBe("ui medium rectangle centered ad test")
    expect(ad.getAttribute("part")).toBe("ad")
    expect(ad.dataset.text).toBe("Ad")
    expect(ad.querySelector("slot")).not.toBeNull()
    await expectAccessible(host)
  })

  it("renders a given test text, and none without test", () => {
    const custom = Fixture.render<StubHost>(`<x-fb-ad test="Sponsor"></x-fb-ad>`)
    expect((FallbackStub.shadow(custom).firstElementChild as HTMLElement).dataset.text).toBe("Sponsor")
    const plain = Fixture.render<StubHost>(`<x-fb-ad unit="banner"></x-fb-ad>`)
    expect(FallbackStub.shadow(plain).firstElementChild!.hasAttribute("data-text")).toBe(false)
  })
})
