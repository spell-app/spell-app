import { describe, expect, it } from "vitest"

import { Fixture } from "$test/fixture"
import { expectAccessible } from "$test/a11y"
import { FallbackStub, type StubHost } from "$/components/fallback.stub"

import { ContainerFallback } from "./container.fallback"

FallbackStub.define("x-fb-container", (host, root, internals) =>
  ContainerFallback.render(host, root, new Error("boom"), internals)
)

describe("ContainerFallback", () => {
  it("renders a div with the class grammar, part and slot", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-container text fluid="no">Hi</x-fb-container>`)
    const container = FallbackStub.shadow(host).firstElementChild!
    expect(container.className).toBe("ui text container")
    expect(container.getAttribute("part")).toBe("container")
    expect(container.querySelector("slot")).not.toBeNull()
    await expectAccessible(host)
  })
})
