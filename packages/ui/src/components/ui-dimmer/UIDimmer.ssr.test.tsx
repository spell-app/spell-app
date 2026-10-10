/// <reference types="node" />

import { parseHTML } from "linkedom"
import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UIDimmer } from "$/ui/components/ui-dimmer/UIDimmer"

/**
 * `<ui-dimmer>` rendered statically (`$/ui/static`):  an element dimmer as its `<div>` (shown while `active`),
 * a page dimmer as a CLOSED `<dialog>` with its name.
 */
describe("<ui-dimmer> static render", () => {
  beforeAll(() => {
    StaticRender.define(UIDimmer)
  })

  it("renders a visible element dimmer around its content (`active`)", () => {
    const html = StaticRender.fragment(`<ui-dimmer visible id="dim"><p>Dimmed</p></ui-dimmer>`)
    const root = fragment(html).firstElementChild!
    expect(root.localName).toBe("div")
    expect(root.id).toBe("dim")
    expect(root.getAttribute("class")).toBe("ui active dimmer")
    expect(root.getAttribute("data-state")).toBe("dimmer")
    expect(root.querySelector(":scope > .content > p")!.textContent).toBe("Dimmed")
    expect(html).not.toMatch(/<ui-|<slot/)
  })

  it("renders a page dimmer as a closed, named <dialog>", () => {
    const page = fragment(StaticRender.fragment(`<ui-dimmer page><h2>Hi</h2></ui-dimmer>`)).firstElementChild!
    expect(page.localName).toBe("dialog")
    expect(page.getAttribute("class")).toBe("ui page dimmer")
    expect(page.hasAttribute("open")).toBe(false)
    expect(page.getAttribute("aria-label")).toBe("Dimmed page")
    expect(page.querySelector(":scope > .content > h2")!.textContent).toBe("Hi")
    const named = fragment(StaticRender.fragment(`<ui-dimmer page aria-label="Wait"></ui-dimmer>`)).firstElementChild!
    expect(named.getAttribute("aria-label")).toBe("Wait")
  })
})

/** `html` parsed as body content. */
function fragment(html: string): HTMLElement {
  return parseHTML(`<!doctype html><html><body>${html}</body></html>`).document.body
}
