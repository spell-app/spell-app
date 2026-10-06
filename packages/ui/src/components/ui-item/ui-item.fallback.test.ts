import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { ItemFallback } from "./ui-item.fallback"

// the fallback keys on its PARENT's canonical tag, so the parents are plain elements with the real tags
FallbackStub.define("ui-item", (host, root, internals) =>
  ItemFallback.render({ host, root, error: new Error("boom"), internals })
)

describe("ItemFallback", () => {
  it("renders a bare slot outside a list or menu", () => {
    const host = Fixture.render<StubHost>(`<ui-item value="a">A</ui-item>`)
    expect(FallbackStub.shadow(host).innerHTML).toBe("<slot></slot>")
    expect(host.internals.role).toBeNull()
  })

  it("renders the item box in a menu:  a link with aria-current, a div, the header and colour classes", () => {
    const menu = Fixture.render(
      `<ui-menu><ui-item href="#a" active>A</ui-item><ui-item type="header" color="red">H</ui-item>` +
        `<ui-item href="#x" disabled>X</ui-item></ui-menu>`
    )
    const [a, header, disabled] = [...menu.querySelectorAll<StubHost>("ui-item")].map(
      (item) => FallbackStub.shadow(item).firstElementChild as HTMLElement
    )
    expect(a!.localName).toBe("a")
    expect(a!.className).toBe("item active")
    expect(a!.getAttribute("aria-current")).toBe("page")
    expect(a!.getAttribute("part")).toBe("item")
    expect(a!.querySelector("slot")).not.toBeNull()
    expect(header!.localName).toBe("div")
    expect(header!.className).toBe("red item header ui-red")
    expect(disabled!.localName).toBe("div")
    expect(disabled!.className).toBe("disabled item")
  })

  it("is a listitem host in a list", () => {
    const list = Fixture.render(`<ui-list><ui-item>A</ui-item></ui-list>`)
    const item = list.querySelector<StubHost>("ui-item")!
    expect(item.internals.role).toBe("listitem")
    expect(FallbackStub.shadow(item).firstElementChild!.className).toBe("item")
  })
})
