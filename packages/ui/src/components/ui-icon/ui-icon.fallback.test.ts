import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { expectAccessible } from "$/ui/test/A11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

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
    expect(box).toMatchObject({
      className: "ui large red icon",
      role: "img",
      ariaLabel: "Profile",
      ariaHidden: null,
      textContent: "Profile"
    })
    expect(box.getAttribute("part")).toBe("icon")
    await expectAccessible(host)
  })

  it("is an empty aria-hidden box without a label", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-icon name="user"></x-fb-icon>`)
    const box = FallbackStub.shadow(host).querySelector("span")!
    expect(box).toMatchObject({ className: "ui icon", ariaHidden: "true", role: null })
    expect(box.childNodes).toHaveLength(0)
    await expectAccessible(host)
  })
})
