import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { StickyFallback } from "./ui-sticky.fallback"

FallbackStub.define("x-fb-sticky", (host, root, internals) =>
  StickyFallback.render({ host, root, error: new Error("boom"), internals })
)

describe("StickyFallback", () => {
  it("renders the sticky box around the slot, with its offsets inline", () => {
    const host = Fixture.render<StubHost>(`<x-fb-sticky offset="12" bottom-offset="4" pushing>S</x-fb-sticky>`)
    const box = FallbackStub.shadow(host).firstElementChild as HTMLElement
    expect(box.getAttribute("part")).toBe("sticky")
    expect(box.className).toBe("ui pushing sticky")
    expect(box.style.getPropertyValue("--_ui-sticky-offset")).toBe("12px")
    expect(box.style.getPropertyValue("--_ui-sticky-bottom-offset")).toBe("4px")
    expect(box.querySelector("slot")).not.toBeNull()
  })

  it("defaults the offsets to 0", () => {
    const host = Fixture.render<StubHost>(`<x-fb-sticky>S</x-fb-sticky>`)
    const box = FallbackStub.shadow(host).firstElementChild as HTMLElement
    expect(box.className).toBe("ui sticky")
    expect(box.style.getPropertyValue("--_ui-sticky-offset")).toBe("0px")
  })
})
