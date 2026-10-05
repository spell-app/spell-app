import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { EmojiFallback } from "./ui-emoji.fallback"
import { EmojiData } from "./EmojiData"

FallbackStub.define("x-fb-emoji", (host, root, internals) =>
  EmojiFallback.render(host, root, new Error("boom"), internals)
)

describe("EmojiFallback", () => {
  it("renders the class grammar and part, then the glyph once loaded", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-emoji name="party_popper" size="large" link></x-fb-emoji>`)
    const emoji = FallbackStub.shadow(host).firstElementChild!
    expect(emoji.localName).toBe("span")
    expect(emoji.className).toBe("ui large link emoji")
    expect(emoji.getAttribute("part")).toBe("emoji")
    await EmojiData.get("party_popper")
    await expect.poll(() => emoji.textContent).toBe("\u{1F389}")
    expect(emoji.hasAttribute("role")).toBe(false)
    await expectAccessible(host)
  })

  it("names a labelled emoji and hides a decorative one", async () => {
    await EmojiData.get("thumbs_up")
    const labelled = Fixture.render<StubHost>(`<x-fb-emoji name="thumbs_up" label="Approved"></x-fb-emoji>`)
    const root = FallbackStub.shadow(labelled).firstElementChild!
    expect(root.textContent).toBe("\u{1F44D}")
    expect(root.getAttribute("role")).toBe("img")
    expect(root.getAttribute("aria-label")).toBe("Approved")
    const decorative = Fixture.render<StubHost>(`<x-fb-emoji name="thumbs_up" label></x-fb-emoji>`)
    expect(FallbackStub.shadow(decorative).firstElementChild!.getAttribute("aria-hidden")).toBe("true")
  })
})
