import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { VisibilityFallback } from "./ui-visibility.fallback"

FallbackStub.define("x-fb-visibility", (host, root, internals) =>
  VisibilityFallback.render({ host, root, error: new Error("boom"), internals })
)

/** A 1x1 GIF. */
const PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

describe("VisibilityFallback", () => {
  it("renders the box around a slot", () => {
    const host = Fixture.render<StubHost>(`<x-fb-visibility><p>Content</p></x-fb-visibility>`)
    const root = FallbackStub.shadow(host).firstElementChild!
    expect(root.className).toBe("ui visibility")
    expect(root.getAttribute("part")).toBe("visibility")
    expect([...root.children].map((child) => child.localName)).toEqual(["slot"])
  })

  it("gives lazy images their source at once, natively lazy, with type=image", () => {
    const host = Fixture.render<StubHost>(
      `<x-fb-visibility type="image"><img alt="A" data-src="${PIXEL}" data-srcset="${PIXEL} 1x"></x-fb-visibility>`
    )
    const image = host.querySelector("img")!
    expect(image.getAttribute("src")).toBe(PIXEL)
    expect(image.getAttribute("srcset")).toBe(`${PIXEL} 1x`)
    expect(image.loading).toBe("lazy")
  })

  it("leaves images alone otherwise", () => {
    const host = Fixture.render<StubHost>(`<x-fb-visibility><img alt="A" data-src="${PIXEL}"></x-fb-visibility>`)
    expect(host.querySelector("img")!.hasAttribute("src")).toBe(false)
  })
})
