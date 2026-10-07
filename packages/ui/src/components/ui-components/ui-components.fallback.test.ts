import { describe, expect, test } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { ComponentsFallback } from "./ui-components.fallback"

FallbackStub.define("x-fb-components", (host, root, internals) =>
  ComponentsFallback.render(host, root, new Error("boom"), internals)
)

describe("ComponentsFallback", () => {
  test("draws nothing, as the element", () => {
    const host = Fixture.render<StubHost>(`<x-fb-components source="x.pack.js"></x-fb-components>`)
    expect(FallbackStub.shadow(host).childElementCount).toBe(0)
  })
})
