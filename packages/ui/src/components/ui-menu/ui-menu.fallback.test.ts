import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { expectAccessible } from "$/ui/test/A11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"
import { ItemFallback } from "$/ui/components/ui-item/ui-item.fallback"

import { MenuFallback } from "./ui-menu.fallback"

// the fallbacks key on the parent's tag, so the stubs take the real tags
FallbackStub.define("ui-menu", (host, root, internals) =>
  MenuFallback.render({ host, root, error: new Error("boom"), internals })
)
FallbackStub.define("ui-item", (host, root, internals) =>
  ItemFallback.render({ host, root, error: new Error("boom"), internals })
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("MenuFallback", () => {
  it("renders a labelled <nav> of item boxes, and a sub-menu as `right menu`", async () => {
    const host = Fixture.render<StubHost>(
      `<ui-menu secondary size="large" interactive aria-label="Main">` +
        `<ui-item href="#a" selected>A</ui-item><ui-item color="red" active>B</ui-item>` +
        `<ui-menu position="right"><ui-item href="#c">C</ui-item></ui-menu>` +
        `</ui-menu>`
    )
    const nav = FallbackStub.shadow(host).firstElementChild as HTMLElement
    expect(nav).toMatchObject({ localName: "nav", className: "ui large secondary menu", ariaLabel: "Main" })
    expect(nav.getAttribute("part")).toBe("menu")
    expect(nav.querySelector("slot")).not.toBeNull()
    const [a, b] = [...host.querySelectorAll<StubHost>(":scope > ui-item")].map(
      (item) => FallbackStub.shadow(item).firstElementChild as HTMLElement
    )
    expect(a).toMatchObject({ localName: "a", className: "active item", ariaCurrent: "page" })
    expect(b!.localName).toBe("div")
    expect(b!.className).toBe("red item active ui-red")
    const sub = host.querySelector<StubHost>("ui-menu")!
    const subRoot = FallbackStub.shadow(sub).firstElementChild as HTMLElement
    expect(subRoot.className).toBe("right menu")
    expect(subRoot.localName).toBe("div")
    await expectAccessible(host, AXE)
  })

  it("keeps `appearance`, `alignment` and `equal` in the class grammar", () => {
    const host = Fixture.render<StubHost>(
      `<ui-menu appearance="segmented" alignment="center" equal aria-label="Views">` +
        `<ui-item href="#a" selected>A</ui-item></ui-menu>`
    )
    const nav = FallbackStub.shadow(host).firstElementChild as HTMLElement
    expect(nav.className).toBe("ui segmented equal center aligned menu")
  })
})
