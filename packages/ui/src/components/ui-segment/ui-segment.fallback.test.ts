import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { expectAccessible } from "$/ui/test/A11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { SegmentFallback } from "./ui-segment.fallback"

FallbackStub.define("x-fb-segment", (host, root, internals) =>
  SegmentFallback.render({ host, root, error: new Error("boom"), internals })
)

describe("SegmentFallback", () => {
  it("renders a div with the class grammar, part and slot", async () => {
    const host = Fixture.render<StubHost>(
      `<x-fb-segment raised color="red" text-align="center" loading>Hi</x-fb-segment>`
    )
    const segment = FallbackStub.shadow(host).firstElementChild!
    expect(segment.tagName).toBe("DIV")
    expect(segment.className).toBe("ui red loading raised center aligned segment")
    expect(segment.getAttribute("part")).toBe("segment")
    expect(segment.getAttribute("aria-busy")).toBe("true")
    expect(segment.querySelector("slot")).not.toBeNull()
    await expectAccessible(host)
  })
})
