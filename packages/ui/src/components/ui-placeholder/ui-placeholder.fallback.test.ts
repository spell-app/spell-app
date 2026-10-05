import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { PlaceholderFallback } from "./ui-placeholder.fallback"

// the fallback keys its vocabulary on the host's tag, so the stubs take the real tags
for (const tag of ["ui-placeholder", "ui-placeholder-header", "ui-placeholder-line", "ui-placeholder-image"]) {
  FallbackStub.define(tag, (host, root, internals) =>
    PlaceholderFallback.render(host, root, new Error("boom"), internals)
  )
}

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("PlaceholderFallback", () => {
  it("renders the placeholder root and keeps its host contract", async () => {
    const host = Fixture.render<StubHost>(`<ui-placeholder fluid></ui-placeholder>`)
    const root = FallbackStub.shadow(host).firstElementChild!
    expect(root.className).toBe("ui fluid placeholder")
    expect(root.getAttribute("part")).toBe("placeholder")
    expect(root.querySelector("slot")).not.toBeNull()
    expect(host.internals.ariaHidden).toBe("true")
    expect(host.internals.states.has("placeholder")).toBe(true)
    await expectAccessible(host, AXE)
  })

  it.each([
    ["ui-placeholder-header", "image", "image header", "header", true],
    ["ui-placeholder-line", 'length="very short"', "very short line", "line", false],
    ["ui-placeholder-image", "square", "square image", "image", false]
  ])("renders <%s %s> as `%s`", (tag, attributes, classes, part, slotted) => {
    const host = Fixture.render<StubHost>(`<${tag} ${attributes}></${tag}>`)
    const root = FallbackStub.shadow(host).firstElementChild!
    expect(root.className).toBe(classes)
    expect(root.getAttribute("part")).toBe(part)
    expect(!!root.querySelector("slot")).toBe(slotted)
    expect(host.internals.states.has("placeholder")).toBe(false)
  })
})
