import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { NagFallback } from "./ui-nag.fallback"

FallbackStub.define("x-fb-nag", (host, root, internals) =>
  NagFallback.render({ host, root, error: new Error("boom"), internals })
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("NagFallback", () => {
  it("renders the bar in the class grammar around the slot, with a close button", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-nag color="teal" bottom fixed>Hello</x-fb-nag>`)
    const nag = FallbackStub.shadow(host).firstElementChild!
    expect(nag.getAttribute("part")).toBe("nag")
    expect(nag.className).toBe("ui teal bottom fixed nag")
    expect(nag.querySelector("slot")).not.toBeNull()
    expect(nag.querySelector("button")!.getAttribute("aria-label")).toBe("Close")
    await expectAccessible(host, AXE)
  })

  it("has no close button with closable=false", () => {
    const host = Fixture.render<StubHost>(`<x-fb-nag closable="false">Hello</x-fb-nag>`)
    expect(FallbackStub.shadow(host).querySelector("button")).toBeNull()
  })

  it("still closes:  hidden, then ui-hide", () => {
    const host = Fixture.render<StubHost>(`<x-fb-nag>Hello</x-fb-nag>`)
    const hides: Event[] = []
    host.addEventListener("ui-hide", (event) => hides.push(event))
    FallbackStub.shadow(host).querySelector("button")!.click()
    expect(host.hidden).toBe(true)
    expect(hides).toHaveLength(1)
  })
})
