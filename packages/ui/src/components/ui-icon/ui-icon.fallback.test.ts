import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { IconFallback } from "./ui-icon.fallback"

FallbackStub.define("x-fb-icon", (host, root, internals) =>
  IconFallback.render({ host, root, error: new Error("boom"), internals })
)

describe("IconFallback", () => {
  it("is an image with a hidden text when it has a label", async () => {
    const host = Fixture.render<StubHost>(
      `<x-fb-icon name="user" size="large" color="red" label="Profile"></x-fb-icon>`
    )
    const box = FallbackStub.shadow(host).querySelector("span")!
    expect(box.className).toBe("ui large red icon")
    expect(box.getAttribute("part")).toBe("icon")
    expect(box.getAttribute("role")).toBe("img")
    expect(box.getAttribute("aria-label")).toBe("Profile")
    expect(box.hasAttribute("aria-hidden")).toBe(false)
    expect(box.textContent).toBe("Profile")
    await expectAccessible(host)
  })

  it("is an empty aria-hidden box without a label", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-icon name="user"></x-fb-icon>`)
    const box = FallbackStub.shadow(host).querySelector("span")!
    expect(box.className).toBe("ui icon")
    expect(box.getAttribute("aria-hidden")).toBe("true")
    expect(box.hasAttribute("role")).toBe(false)
    expect(box.childNodes.length).toBe(0)
    await expectAccessible(host)
  })
})
