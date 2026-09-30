import { describe, expect, it } from "vitest"

import { Fixture } from "$test/fixture"
import { expectAccessible } from "$test/a11y"
import { FallbackStub, type StubHost } from "$/components/fallback.stub"

import { SegmentFallback } from "./segment.fallback"

FallbackStub.define("x-fb-segment", (host, root, internals) =>
  SegmentFallback.render(host, root, new Error("boom"), internals)
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
