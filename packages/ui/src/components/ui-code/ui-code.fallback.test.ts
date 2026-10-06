import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { expectAccessible } from "$/ui/test/A11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { CodeFallback } from "./ui-code.fallback"

FallbackStub.define("x-fb-code", (host, root, internals) =>
  CodeFallback.render({ host, root, error: new Error("boom"), internals })
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("CodeFallback", () => {
  it("shows the element's own text, uncoloured", async () => {
    const host = Fixture.render<StubHost>(
      `<x-fb-code line-numbers><script type="text/plain">a < b\n  c</script></x-fb-code>`
    )
    const box = FallbackStub.shadow(host).firstElementChild!
    expect(box.getAttribute("part")).toBe("box")
    expect(box.className).toBe("ui numbered code")
    expect(box.querySelector("code")!.textContent).toBe("a < b\n  c")
    await expectAccessible(host, AXE)
  })
})
