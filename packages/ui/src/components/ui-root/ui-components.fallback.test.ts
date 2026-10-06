import { describe, expect, test } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { ComponentsFallback } from "./ui-components.fallback"

FallbackStub.define("x-fb-components", (host, root, internals) =>
  ComponentsFallback.render({ host, root, error: new Error("boom"), internals })
)

describe("ComponentsFallback", () => {
  test("draws nothing, as the element doesn't", () => {
    const host = Fixture.render<StubHost>(`<x-fb-components source="pack.json">text</x-fb-components>`)
    expect(FallbackStub.shadow(host).childNodes).toHaveLength(0)
  })
})
