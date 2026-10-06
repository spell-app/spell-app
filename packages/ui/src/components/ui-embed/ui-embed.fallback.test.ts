import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { EmbedFallback } from "./ui-embed.fallback"

FallbackStub.define("x-fb-embed", (host, root, internals) =>
  EmbedFallback.render({ host, root, error: new Error("boom"), internals })
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

/** A same-origin page to frame, so nothing reaches the network. */
const LOCAL = new URL("/src/components/ui-embed/examples/types.html", location.href).href

describe("EmbedFallback", () => {
  it("renders the box with a named play button, no frame", async () => {
    const host = Fixture.render<StubHost>(
      `<x-fb-embed source="youtube" video-id="abc" aspect-ratio="4:3" label="Intro"></x-fb-embed>`
    )
    const box = FallbackStub.shadow(host).firstElementChild!
    expect(box.getAttribute("part")).toBe("embed")
    expect(box.className).toBe("ui embed 4:3")
    const button = box.querySelector("button")!
    expect(button.getAttribute("aria-label")).toBe("Play Intro")
    expect(box.querySelector("iframe")).toBeNull()
    await expectAccessible(host, AXE)
  })

  it("still loads the frame on a click (only then)", () => {
    const host = Fixture.render<StubHost>(`<x-fb-embed url="${LOCAL}" label="Local"></x-fb-embed>`)
    const box = FallbackStub.shadow(host).firstElementChild!
    box.querySelector("button")!.click()
    const frame = box.querySelector("iframe")!
    expect(frame.src).toBe(LOCAL)
    expect(frame.title).toBe("Local")
    expect(box.classList.contains("active")).toBe(true)
  })

  it("refuses a non-http(s) url", () => {
    const host = Fixture.render<StubHost>(`<x-fb-embed url="javascript:alert(1)"></x-fb-embed>`)
    const box = FallbackStub.shadow(host).firstElementChild!
    box.querySelector("button")!.click()
    expect(box.querySelector("iframe")).toBeNull()
  })
})
