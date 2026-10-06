import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { RevealFallback } from "./ui-reveal.fallback"

FallbackStub.define("x-fb-reveal", (host, root, internals) =>
  RevealFallback.render({ host, root, error: new Error("boom"), internals })
)

describe("RevealFallback", () => {
  it("renders the class grammar, a tab stop, and the two content boxes around their slots", async () => {
    const host = Fixture.render<StubHost>(
      `<x-fb-reveal move="up" instant><span slot="visible">Front</span><span slot="hidden">Back</span></x-fb-reveal>`
    )
    const reveal = FallbackStub.shadow(host).firstElementChild!
    expect(reveal.className).toBe("ui instant up move reveal")
    expect(reveal.getAttribute("part")).toBe("reveal")
    expect(reveal.getAttribute("tabindex")).toBe("0")
    const [visible, hidden] = [...reveal.children]
    expect(visible!.className).toBe("visible content")
    expect(visible!.querySelector("slot[name=visible]")).not.toBeNull()
    expect(visible!.querySelector("slot:not([name])")).not.toBeNull()
    expect(hidden!.className).toBe("hidden content")
    expect(hidden!.querySelector("slot[name=hidden]")).not.toBeNull()
    await expectAccessible(host)
  })

  it("is no tab stop when disabled", () => {
    const host = Fixture.render<StubHost>(`<x-fb-reveal disabled>Front</x-fb-reveal>`)
    expect(FallbackStub.shadow(host).firstElementChild!.hasAttribute("tabindex")).toBe(false)
  })
})
