import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { expectAccessible } from "$/ui/test/A11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { SidebarFallback } from "./ui-sidebar.fallback"

// the fallback keys on the host's tag, so the stubs take the real tags
for (const tag of ["ui-sidebar", "ui-pushable", "ui-pusher"]) {
  FallbackStub.define(tag, (host, root, internals) =>
    SidebarFallback.render({ host, root, error: new Error("boom"), internals })
  )
}

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("SidebarFallback", () => {
  it("renders a sidebar as a labelled <aside> in the class grammar, following `visible`", async () => {
    const host = Fixture.render<StubHost>(`<ui-sidebar position="right" width="thin" inverted>x</ui-sidebar>`)
    const panel = FallbackStub.shadow(host).querySelector<HTMLElement>("[part~=sidebar]")!
    expect(panel.localName).toBe("aside")
    expect(panel.className).toBe("ui right inverted sidebar thin")
    expect(panel.getAttribute("aria-label")).toBe("Sidebar")
    host.setAttribute("visible", "")
    await expect.poll(() => panel.className).toBe("ui right inverted visible sidebar thin")
    await expectAccessible(panel, AXE)
  })

  it("adds the vocabulary's default `position` (`left`) when the host has none, as the element does", () => {
    const host = Fixture.render<StubHost>(`<ui-sidebar>x</ui-sidebar>`)
    expect(FallbackStub.shadow(host).querySelector("[part~=sidebar]")!.className).toBe("ui left sidebar")
  })

  it("stops following `visible` once disposed", async () => {
    const host = Fixture.render<StubHost>(`<ui-sidebar visible aria-label="Site">x</ui-sidebar>`)
    const panel = FallbackStub.shadow(host).querySelector<HTMLElement>("[part~=sidebar]")!
    expect(panel.getAttribute("aria-label")).toBe("Site")
    host.handle!.dispose()
    host.removeAttribute("visible")
    // a `MutationObserver` delivers in a microtask:  one turn would have shown a change
    await Promise.resolve()
    expect(panel.classList.contains("visible")).toBe(true)
  })

  it.each([
    ["ui-pushable", "pushable"],
    ["ui-pusher", "pusher"]
  ])("renders a <%s> as its box around the slot", (tag, noun) => {
    const host = Fixture.render<StubHost>(`<${tag}>x</${tag}>`)
    const box = FallbackStub.shadow(host).querySelector(`[part~=${noun}]`)!
    expect(box.className).toBe(noun)
    expect(box.querySelector("slot")).not.toBeNull()
  })
})
