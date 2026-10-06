import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"
import { ItemFallback } from "$/ui/components/ui-item/ui-item.fallback"

import { ListFallback } from "./ui-list.fallback"

// the fallbacks key on the host's and its parent's tags, so the stubs take the real tags
FallbackStub.define("ui-list", (host, root, internals) =>
  ListFallback.render({ host, root, error: new Error("boom"), internals })
)
FallbackStub.define("ui-item", (host, root, internals) =>
  ItemFallback.render({ host, root, error: new Error("boom"), internals })
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("ListFallback", () => {
  it("renders the list root with its classes, part, role and slot", async () => {
    const host = Fixture.render<StubHost>(
      `<ui-list size="large" divided relaxed="very" vertical-align="middle" aria-label="Fruit">` +
        `<ui-item>Apples</ui-item><ui-item>Pears</ui-item></ui-list>`
    )
    const root = FallbackStub.shadow(host).firstElementChild as HTMLElement
    expect(root.localName).toBe("ul")
    expect(root.className).toBe("ui large divided very relaxed middle aligned list")
    expect(root.getAttribute("part")).toBe("list")
    expect(root.getAttribute("role")).toBe("list")
    expect(root.getAttribute("aria-label")).toBe("Fruit")
    expect(root.querySelector("slot")).not.toBeNull()
    expect(host.handle!.degraded.length).toBeGreaterThan(0)
    for (const item of host.querySelectorAll<StubHost>("ui-item")) expect(item.internals.role).toBe("listitem")
    await expectAccessible(host, AXE)
  })

  it('renders an <ol> when ordered;  `ordered="no"` stays a <ul>', () => {
    const ordered = Fixture.render<StubHost>(`<ui-list ordered></ui-list>`)
    expect(FallbackStub.shadow(ordered).firstElementChild!.localName).toBe("ol")
    const not = Fixture.render<StubHost>(`<ui-list ordered="no"></ui-list>`)
    expect(FallbackStub.shadow(not).firstElementChild!.localName).toBe("ul")
  })

  it("renders the sub-list form inside an item, ordered when the outer list is", async () => {
    const host = Fixture.render<StubHost>(
      `<ui-list ordered><ui-item>One<ui-list bulleted><ui-item>A</ui-item></ui-list></ui-item></ui-list>`
    )
    const sub = host.querySelector<StubHost>("ui-list")!
    const root = FallbackStub.shadow(sub).firstElementChild!
    expect(root.localName).toBe("ol")
    expect(root.className).toBe("list")
    expect(root.getAttribute("part")).toBe("list")
    await expectAccessible(host, AXE)
  })
})
