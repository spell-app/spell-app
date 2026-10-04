import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { ContainerFallback } from "./ui-container.fallback"

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
