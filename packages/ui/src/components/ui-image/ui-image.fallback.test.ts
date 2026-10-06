import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { ImageFallback } from "./ui-image.fallback"

// the fallback keys its vocabulary on the host's tag, so the stubs take the real tags
for (const tag of ["ui-image", "ui-images"]) {
  FallbackStub.define(tag, (host, root, internals) =>
    ImageFallback.render({ host, root, error: new Error("boom"), internals })
  )
}

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("ImageFallback", () => {
  it("renders the <img> with the class grammar, part and native attributes", async () => {
    const host = Fixture.render<StubHost>(
      `<ui-image size="small" rounded src="data:," alt="Photo" width="20" height="10" loading="lazy"></ui-image>`
    )
    const img = FallbackStub.shadow(host).firstElementChild as HTMLImageElement
    expect(img.localName).toBe("img")
    expect(img.className).toBe("ui small rounded image")
    expect(img.getAttribute("part")).toBe("image")
    expect(img.alt).toBe("Photo")
    expect(img.getAttribute("width")).toBe("20")
    expect(img.loading).toBe("lazy")
    // `loading` is the native attribute here, not a busy flag
    expect(img.hasAttribute("aria-busy")).toBe(false)
    await expectAccessible(host, AXE)
  })

  it("wraps it in a link with href, and renders a group's slot", async () => {
    const host = Fixture.render<StubHost>(`<ui-image href="/p" src="data:," alt="Profile"></ui-image>`)
    const link = FallbackStub.shadow(host).firstElementChild!
    expect(link.localName).toBe("a")
    expect(link.getAttribute("part")).toBe("image")
    expect(link.querySelector("img")!.getAttribute("part")).toBe("img")
    await expectAccessible(host, AXE)
    const group = Fixture.render<StubHost>(`<ui-images size="tiny"></ui-images>`)
    const root = FallbackStub.shadow(group).firstElementChild!
    expect(root.className).toBe("ui tiny images")
    expect(root.getAttribute("part")).toBe("group")
    expect(root.querySelector("slot")).not.toBeNull()
  })
})
