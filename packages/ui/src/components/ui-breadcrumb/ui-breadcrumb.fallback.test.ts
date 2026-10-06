import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { expectAccessible } from "$/ui/test/A11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { BreadcrumbFallback } from "./ui-breadcrumb.fallback"

// the fallback keys its vocabulary on the host's tag, so the stubs take the real tags
for (const tag of ["ui-breadcrumb", "ui-breadcrumb-section"]) {
  FallbackStub.define(tag, (host, root, internals) =>
    BreadcrumbFallback.render({ host, root, error: new Error("boom"), internals })
  )
}

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("BreadcrumbFallback", () => {
  it("renders the labelled nav, its list, and each section's divider and link / current page", async () => {
    const host = Fixture.render<StubHost>(
      `<ui-breadcrumb size="large" divider="›">` +
        `<ui-breadcrumb-section href="#home">Home</ui-breadcrumb-section>` +
        `<ui-breadcrumb-section active href="#here">Here</ui-breadcrumb-section>` +
        `</ui-breadcrumb>`
    )
    const nav = FallbackStub.shadow(host).firstElementChild as HTMLElement
    expect(nav.localName).toBe("nav")
    expect(nav.className).toBe("ui large breadcrumb")
    expect(nav.getAttribute("part")).toBe("breadcrumb")
    expect(nav.getAttribute("aria-label")).toBe("Breadcrumb")
    expect(nav.style.getPropertyValue("--ui-breadcrumb-divider")).toBe('"›"')
    expect(nav.querySelector("ol[part=list] slot")).not.toBeNull()
    const [home, here] = [...host.querySelectorAll<StubHost>("ui-breadcrumb-section")]
    const [divider, link] = [...FallbackStub.shadow(home!).children]
    expect(divider!.getAttribute("aria-hidden")).toBe("true")
    expect(link!.localName).toBe("a")
    expect(link!.getAttribute("part")).toBe("section")
    const current = FallbackStub.shadow(here!).children[1]!
    expect(current.localName).toBe("span")
    expect(current.className).toBe("active section")
    expect(current.getAttribute("aria-current")).toBe("page")
    expect(home!.internals.role).toBe("listitem")
    await expectAccessible(host, AXE)
  })
})
