/// <reference types="node" />

import { parseHTML } from "linkedom"
import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UIContent } from "$/ui/components/ui-parts/UIContent"
import { UIHeader } from "$/ui/components/ui-parts/UIHeader"
import { UIFlyout } from "$/ui/components/ui-flyout/UIFlyout"

/**
 * `<ui-flyout>` rendered statically (`$/ui/static`):  `UIFlyout` loads WITHOUT the modal family's barrel (no
 * `customElements` in node), and renders `DialogElement`'s closed `<dialog>` with the flyout's classes.
 */
describe("ui-flyout static render", () => {
  beforeAll(() => {
    StaticRender.define(UIFlyout, UIHeader, UIContent)
  })

  it("renders a closed side <dialog>, its width word after the noun", () => {
    const html = StaticRender.fragment(
      `<ui-flyout id="side" position="right" width="thin"><ui-header>Profile</ui-header>` +
        `<ui-content>Body</ui-content></ui-flyout>`
    )
    const dialog = fragment(html).firstElementChild!
    expect(dialog.localName).toBe("dialog")
    expect(dialog.id).toBe("side")
    expect(dialog.getAttribute("class")).toBe("ui right flyout thin")
    expect(dialog.hasAttribute("open")).toBe(false)
    const heading = dialog.querySelector(":scope > .header.in-flyout")!
    expect(dialog.getAttribute("aria-labelledby")).toBe(heading.id)
    expect(dialog.querySelector(":scope > .content.in-flyout")!.textContent).toBe("Body")
    expect(html).not.toMatch(/<ui-|<slot/)
  })
})

/** `html` parsed as body content. */
function fragment(html: string): HTMLElement {
  return parseHTML(`<!doctype html><html><body>${html}</body></html>`).document.body
}
