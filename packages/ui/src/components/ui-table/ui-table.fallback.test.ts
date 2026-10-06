import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { expectAccessible } from "$/ui/test/A11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { TableFallback } from "./ui-table.fallback"

FallbackStub.define("ui-table", (host, root, internals) =>
  TableFallback.render({ host, root, error: new Error("boom"), internals })
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

/** A small native table. */
const TABLE =
  `<table class="mine"><caption>People</caption><thead><tr><th>Name</th></tr></thead>` +
  `<tbody><tr><td>Jill</td></tr></tbody></table>`

/** Wait for the class mirror's observer:  a `MutationObserver` delivers in a microtask. */
async function observed() {
  await Promise.resolve()
}

describe("TableFallback", () => {
  it("renders the scroller part around a slot, and mirrors the classes onto the slotted table", async () => {
    const host = Fixture.render<StubHost>(`<ui-table size="small" celled basic="very">${TABLE}</ui-table>`)
    const scroller = FallbackStub.shadow(host).firstElementChild as HTMLElement
    expect(scroller.localName).toBe("div")
    expect(scroller.className).toBe("scroller")
    expect(scroller.getAttribute("part")).toBe("scroller")
    expect(scroller.querySelector("slot")).not.toBeNull()
    expect(scroller.hasAttribute("role")).toBe(false)
    const table = host.querySelector("table")!
    expect(table.className).toBe("mine ui small celled very basic table")
    table.className = "x"
    await observed()
    expect(table.className).toBe("x ui small celled very basic table")
    expect(host.handle!.degraded.join(" ")).toContain("sorting")
    await expectAccessible(host, AXE)
  })

  it("scrolls as a focusable region named by the host, else the caption", async () => {
    const host = Fixture.render<StubHost>(`<ui-table scrolling="short" attached="top">${TABLE}</ui-table>`)
    const scroller = FallbackStub.shadow(host).firstElementChild as HTMLElement
    expect(scroller.className).toBe("top attached short scrolling scroller")
    expect(scroller.getAttribute("role")).toBe("region")
    expect(scroller.getAttribute("tabindex")).toBe("0")
    expect(scroller.getAttribute("aria-label")).toBe("People")
    expect(host.querySelector("table")!.className).toBe("mine ui top attached short scrolling table")
    await expectAccessible(host, AXE)
    const named = Fixture.render<StubHost>(`<ui-table overflowing aria-label="Everyone">${TABLE}</ui-table>`)
    expect((FallbackStub.shadow(named).firstElementChild as HTMLElement).getAttribute("aria-label")).toBe("Everyone")
  })

  it("reads `no` booleans as false", () => {
    const host = Fixture.render<StubHost>(`<ui-table celled="no" striped>${TABLE}</ui-table>`)
    expect(host.querySelector("table")!.className).toBe("mine ui striped table")
  })
})
