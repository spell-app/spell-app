/// <reference types="node" />

import { parseHTML } from "linkedom"
import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UIContent } from "$/ui/components/ui-parts/UIContent"
import { UITitle } from "$/ui/components/ui-parts/UITitle"
import { UIAccordion } from "$/ui/components/ui-accordion/UIAccordion"

/**
 * `<ui-accordion>` rendered statically (`$/ui/static`):  its `<details>` / `<summary>` pairs built from the light
 * children, each child inside its panel, open panels open, an exclusive accordion's `name` unique on the page.
 */
describe("<ui-accordion> static render", () => {
  beforeAll(() => {
    StaticRender.define(UIAccordion, UITitle, UIContent)
  })

  it("pairs titles and contents into <details>, the open panel open", () => {
    const html = StaticRender.fragment(
      `<ui-accordion styled open="1"><ui-title>One</ui-title><ui-content><p>First</p></ui-content>` +
        `<ui-title>Two</ui-title><ui-content><p>Second</p></ui-content></ui-accordion>`
    )
    const root = fragment(html).firstElementChild!
    expect(root.localName).toBe("div")
    expect(root.getAttribute("class")).toBe("ui styled accordion")
    expect(root.getAttribute("data-ui")).toBe("accordion")
    const panels = [...root.children]
    expect(panels.map((panel) => panel.localName)).toEqual(["details", "details"])
    expect(panels.map((panel) => panel.hasAttribute("open"))).toEqual([false, true])
    expect(panels.map((panel) => panel.querySelector("summary")!.getAttribute("class"))).toEqual([
      "title",
      "active title"
    ])
    expect(panels[0]!.querySelector("summary > [data-ui=title]")!.textContent).toBe("One")
    expect(panels[1]!.querySelector(":scope > .active.content > [data-ui=content] > p")!.textContent).toBe("Second")
    expect(html).not.toMatch(/<ui-|<slot|\sslot=/)
  })

  it("names an exclusive accordion's panels (the default), uniquely per accordion", () => {
    const pair = `<ui-title>A</ui-title><ui-content>a</ui-content><ui-title>B</ui-title><ui-content>b</ui-content>`
    const html = StaticRender.fragment(
      `<ui-accordion exclusive>${pair}</ui-accordion><ui-accordion exclusive>${pair}</ui-accordion>`
    )
    const [first, second] = [...fragment(html).children].map((root) =>
      [...root.querySelectorAll("details")].map((details) => details.getAttribute("name"))
    )
    expect(first![0]).toBeTruthy()
    expect(first![1]).toBe(first![0])
    expect(second![0]).toBe(second![1])
    expect(second![0]).not.toBe(first![0])
    const open = StaticRender.fragment(`<ui-accordion exclusive="no">${pair}</ui-accordion>`)
    expect(fragment(open).querySelector("details")!.hasAttribute("name")).toBe(false)
  })

  it("drops children before the first title, as the element shows none of them", () => {
    const html = StaticRender.fragment(`<ui-accordion><p>Stray</p><ui-title>A</ui-title></ui-accordion>`)
    expect(html).not.toContain("Stray")
    expect(fragment(html).querySelector("details > summary")!.textContent).toBe("A")
  })
})

/** `html` parsed as body content. */
function fragment(html: string): HTMLElement {
  return parseHTML(`<!doctype html><html><body>${html}</body></html>`).document.body
}
