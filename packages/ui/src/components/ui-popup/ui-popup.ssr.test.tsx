/// <reference types="node" />

import { parseHTML } from "linkedom"
import { beforeAll, describe, expect, it } from "vitest"

import { StaticRender } from "$/ui/server"
import { UIButton } from "$/ui/components/ui-button/UIButton"
import { UIPopup } from "$/ui/components/ui-popup/UIPopup"

/**
 * `<ui-popup>` rendered statically (`$/ui/server`):  a hidden popover box right after its target, as phrasing
 * content, related to the target by id as the element's ARIA does.
 */
describe("ui-popup static render", () => {
  beforeAll(() => {
    StaticRender.define(UIPopup, UIButton)
  })

  it("renders a tooltip as a hidden popover that describes its target", () => {
    const html = StaticRender.fragment(
      `<p>Press <ui-button>Add</ui-button><ui-popup header="Add" content="Adds a row"></ui-popup> now.</p>`
    )
    const paragraph = fragment(html).firstElementChild!
    // phrasing content:  the paragraph stays one paragraph when a browser parses the page
    expect(paragraph.localName).toBe("p")
    const [button, popup] = [...paragraph.children]
    expect(button!.localName).toBe("button")
    expect(popup!.localName).toBe("span")
    expect(popup!.getAttribute("class")).toBe("ui popup top left")
    expect(popup!.getAttribute("popover")).toBe("manual")
    expect(popup!.getAttribute("role")).toBe("tooltip")
    expect(popup!.id).toMatch(/^ui-popup-\d+$/)
    expect(button!.getAttribute("aria-describedby")).toBe(popup!.id)
    expect([...popup!.children].map((child) => [child.localName, child.className, child.textContent])).toEqual([
      ["span", "header", "Add"],
      ["span", "content", "Adds a row"]
    ])
    expect(popup!.getAttribute("style")).toContain("position-area:top span-right")
    expect(html).not.toMatch(/<ui-|<slot|<div/)
  })

  it("renders a click popup as an auto popover dialog the target controls", () => {
    const html = StaticRender.fragment(
      `<ui-button id="plan">Plan</ui-button>` +
        `<ui-popup for="plan" on="click" header="Basic" id="plans"><p>Details</p></ui-popup>`
    )
    const [button, popup] = [...fragment(html).children]
    expect(popup!.id).toBe("plans")
    expect(popup!.getAttribute("popover")).toBe("auto")
    expect(popup!.getAttribute("role")).toBe("dialog")
    expect(popup!.getAttribute("aria-label")).toBe("Basic")
    expect(button!.getAttribute("aria-controls")).toBe("plans")
    expect(button!.getAttribute("aria-haspopup")).toBe("dialog")
    // a native invoker (P4) reports the popover's state itself
    expect(button!.hasAttribute("aria-expanded")).toBe(false)
    expect(popup!.querySelector(":scope > p")!.textContent).toBe("Details")
  })
})

/** `html` parsed as body content. */
function fragment(html: string): HTMLElement {
  return parseHTML(`<!doctype html><html><body>${html}</body></html>`).document.body
}
