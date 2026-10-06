/// <reference types="node" />

import { parseHTML } from "linkedom"
import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UIShape } from "$/ui/components/ui-shape/UIShape"
import { UISide } from "$/ui/components/ui-shape/UISide"

/**
 * `<ui-shape>` rendered statically (`$/ui/static`):  every side in the HTML, the `active-index` one shown (its state),
 * the rest `inactive`;  a `text` shape as `<span>`s, so it stays inside its paragraph.
 */
describe("ui-shape static render", () => {
  beforeAll(() => {
    StaticRender.define(UIShape, UISide)
  })

  it("marks the active-index side shown and the others inactive", () => {
    const html = StaticRender.fragment(
      `<ui-shape id="cube" cube active-index="1"><ui-side>1</ui-side><ui-side>2</ui-side><ui-side>3</ui-side></ui-shape>`
    )
    const root = fragment(html).firstElementChild!
    expect(root.id).toBe("cube")
    expect(root.getAttribute("class")).toBe("ui cube shape")
    const sides = [...root.querySelectorAll(":scope > .sides > .side")]
    expect(sides.map((side) => side.textContent)).toEqual(["1", "2", "3"])
    expect(sides.map((side) => side.getAttribute("data-state"))).toEqual([
      "inactive side",
      "active side",
      "inactive side"
    ])
    expect(root.querySelector(".sides")!.getAttribute("aria-live")).toBe("polite")
    expect(html).not.toMatch(/<ui-|<slot/)
  })

  it("renders a text shape as phrasing content, inside its paragraph", () => {
    const html = StaticRender.fragment(
      `<p>Flip to <ui-shape text><ui-side>Scale</ui-side><ui-side>Fade</ui-side></ui-shape> now</p>`
    )
    const paragraph = fragment(html).firstElementChild!
    expect(paragraph.localName).toBe("p")
    const shape = paragraph.querySelector(":scope > .ui.text.shape")!
    expect(shape.localName).toBe("span")
    expect([...shape.querySelectorAll("*")].map((element) => element.localName)).toEqual(["span", "span", "span"])
    expect(html).not.toContain("<div")
  })
})

/** `html` parsed as body content. */
function fragment(html: string): HTMLElement {
  return parseHTML(`<!doctype html><html><body>${html}</body></html>`).document.body
}
