import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"
import { ItemFallback } from "$/ui/components/ui-item/ui-item.fallback"

import { ItemsFallback } from "./ui-items.fallback"

// the item fallback keys on its parent's tag, so the stubs take the real tags
FallbackStub.define("ui-items", (host, root, internals) =>
  ItemsFallback.render({ host, root, error: new Error("boom"), internals })
)
FallbackStub.define("ui-item", (host, root, internals) =>
  ItemFallback.render({ host, root, error: new Error("boom"), internals })
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("ItemsFallback", () => {
  it("renders the group root with its classes, part, role and slot;  its items are list items", async () => {
    const host = Fixture.render<StubHost>(
      `<ui-items divided relaxed="very" aria-label="Places"><ui-item>One</ui-item><ui-item href="#b">Two</ui-item></ui-items>`
    )
    const root = FallbackStub.shadow(host).firstElementChild as HTMLElement
    expect(root.localName).toBe("div")
    expect(root.className).toBe("ui divided very relaxed items")
    expect(root.getAttribute("part")).toBe("items")
    expect(root.getAttribute("role")).toBe("list")
    expect(root.getAttribute("aria-label")).toBe("Places")
    expect(root.querySelector("slot")).not.toBeNull()
    expect(host.handle!.degraded.length).toBeGreaterThan(0)
    const [one, two] = host.querySelectorAll<StubHost>("ui-item")
    expect(one!.internals.role).toBe("listitem")
    expect(FallbackStub.shadow(one!).firstElementChild!.className).toBe("item")
    expect(FallbackStub.shadow(two!).firstElementChild!.localName).toBe("a")
    await expectAccessible(host, AXE)
  })
})
