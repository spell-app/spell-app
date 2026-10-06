import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { CardFallback } from "./ui-card.fallback"

// the fallback keys on the host's and its parent's tags, so the stubs take the real tags
FallbackStub.define("ui-card", (host, root, internals) =>
  CardFallback.render({ host, root, error: new Error("boom"), internals })
)
FallbackStub.define("ui-cards", (host, root, internals) =>
  CardFallback.render({ host, root, error: new Error("boom"), internals })
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("CardFallback", () => {
  it("renders an article with the class grammar, the shorthands as static parts around the slot", async () => {
    const host = Fixture.render<StubHost>(
      `<ui-card raised color="red" image="data:," alt="Kristy" header="Kristy" description="Art director" extra="22 Friends">` +
        `<p>Slotted</p></ui-card>`
    )
    const card = FallbackStub.shadow(host).firstElementChild as HTMLElement
    expect(card.localName).toBe("article")
    expect(card.className).toBe("ui red raised card")
    expect(card.getAttribute("part")).toBe("card")
    expect([...card.children].map((child) => child.className || child.localName)).toEqual([
      "image",
      "content in-card",
      "slot",
      "extra in-card"
    ])
    expect(card.querySelector("img")!.alt).toBe("Kristy")
    expect(card.querySelector(".header")!.textContent).toBe("Kristy")
    expect(card.querySelector(".meta")).toBeNull()
    expect(host.handle!.degraded.length).toBeGreaterThan(0)
    await expectAccessible(host, AXE)
  })

  it("renders a link card;  disabled drops its href", () => {
    const link = Fixture.render<StubHost>(`<ui-card href="#a" target="_blank">A</ui-card>`)
    const root = FallbackStub.shadow(link).firstElementChild!
    expect(root.localName).toBe("a")
    expect(root.getAttribute("href")).toBe("#a")
    expect(root.getAttribute("target")).toBe("_blank")
    const disabled = Fixture.render<StubHost>(`<ui-card href="#a" disabled>A</ui-card>`)
    const off = FallbackStub.shadow(disabled).firstElementChild!
    expect(off.hasAttribute("href")).toBe(false)
    expect(off.getAttribute("aria-disabled")).toBe("true")
  })

  it("renders a group as a list;  its cards are list items", async () => {
    const group = Fixture.render<StubHost>(
      `<ui-cards columns="3" doubling><ui-card header="A"></ui-card><ui-card header="B"></ui-card></ui-cards>`
    )
    const root = FallbackStub.shadow(group).firstElementChild!
    expect(root.className).toBe("ui doubling three cards")
    expect(root.getAttribute("role")).toBe("list")
    expect(root.getAttribute("part")).toBe("group")
    for (const card of group.querySelectorAll<StubHost>("ui-card")) expect(card.internals.role).toBe("listitem")
    await expectAccessible(group, AXE)
  })
})
