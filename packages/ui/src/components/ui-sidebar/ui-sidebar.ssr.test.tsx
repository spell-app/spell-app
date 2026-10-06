/// <reference types="node" />

import { parseHTML } from "linkedom"
import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UIPushable } from "$/ui/components/ui-sidebar/UIPushable"
import { UIPusher } from "$/ui/components/ui-sidebar/UIPusher"
import { UISidebar } from "$/ui/components/ui-sidebar/UISidebar"

/**
 * `<ui-pushable>` / `<ui-sidebar>` / `<ui-pusher>` rendered statically (`$/ui/static`):  a modal sidebar as a CLOSED
 * `<dialog>`, a persistent one as an `<aside>`, the pusher around the page content.
 */
describe("<ui-sidebar> static render", () => {
  beforeAll(() => {
    StaticRender.define(UIPushable, UISidebar, UIPusher)
  })

  it("renders the pushable, a closed modal sidebar and the pusher", () => {
    const html = StaticRender.fragment(
      `<ui-pushable><ui-sidebar id="menu" inverted aria-label="Site"><a href="#home">Home</a></ui-sidebar>` +
        `<ui-pusher><p>Page</p></ui-pusher></ui-pushable>`
    )
    const root = fragment(html).firstElementChild!
    expect(root.getAttribute("class")).toBe("pushable")
    const [sidebar, pusher] = [...root.children]
    expect(sidebar!.localName).toBe("dialog")
    expect(sidebar!.id).toBe("menu")
    expect(sidebar!.getAttribute("class")).toBe("ui left uncover inverted sidebar")
    expect(sidebar!.hasAttribute("open")).toBe(false)
    expect(sidebar!.getAttribute("aria-label")).toBe("Site")
    expect(sidebar!.querySelector(":scope > a")!.textContent).toBe("Home")
    expect(pusher!.getAttribute("class")).toBe("pusher")
    expect(pusher!.querySelector(":scope > p")!.textContent).toBe("Page")
    expect(html).not.toMatch(/<ui-|<slot/)
  })

  it("renders a persistent visible sidebar as an <aside>, named by default", () => {
    const html = StaticRender.fragment(
      `<ui-pushable><ui-sidebar persistent visible transition="push">Nav</ui-sidebar><ui-pusher>Page</ui-pusher>` +
        `</ui-pushable>`
    )
    const sidebar = fragment(html).querySelector("[data-ui=sidebar]")!
    expect(sidebar.localName).toBe("aside")
    expect(sidebar.getAttribute("class")).toBe("ui left push visible sidebar")
    expect(sidebar.getAttribute("aria-label")).toBe("Sidebar")
  })
})

/** `html` parsed as body content. */
function fragment(html: string): HTMLElement {
  return parseHTML(`<!doctype html><html><body>${html}</body></html>`).document.body
}
