/// <reference types="node" />

import { parseHTML } from "linkedom"
import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UIButton } from "$/ui/components/ui-button/UIButton"
import { UIActions } from "$/ui/components/ui-parts/UIActions"
import { UIContent } from "$/ui/components/ui-parts/UIContent"
import { UIHeader } from "$/ui/components/ui-parts/UIHeader"
import { UIModal } from "$/ui/components/ui-modal/UIModal"

/**
 * `<ui-modal>` rendered statically (`$/ui/static`):  a CLOSED `<dialog>` (its initial state:  opening needs JS, or
 * P4's invoker commands), its content in the HTML, named by its heading through an id.
 */
describe("ui-modal static render", () => {
  beforeAll(() => {
    StaticRender.define(UIModal, UIHeader, UIContent, UIActions, UIButton)
  })

  it("renders a closed <dialog> holding its parts, named by the slotted header", () => {
    const html = StaticRender.fragment(
      `<ui-modal id="profile" size="small" closable><ui-header>Profile</ui-header><ui-content><p>Body</p></ui-content>` +
        `<ui-actions><ui-button positive>Yes</ui-button></ui-actions></ui-modal>`
    )
    const dialog = fragment(html).firstElementChild!
    expect(dialog.localName).toBe("dialog")
    expect(dialog.id).toBe("profile")
    expect(dialog.getAttribute("class")).toBe("ui small modal")
    expect(dialog.getAttribute("data-ui")).toBe("modal")
    expect(dialog.hasAttribute("open")).toBe(false)
    const heading = dialog.querySelector(":scope > .header.in-modal")!
    expect(heading.textContent).toBe("Profile")
    expect(heading.id).toMatch(/^ui-modal-heading-\d+$/)
    expect(dialog.getAttribute("aria-labelledby")).toBe(heading.id)
    expect(dialog.querySelector(":scope > .content.in-modal > p")!.textContent).toBe("Body")
    expect(dialog.querySelector(":scope > .actions.in-modal > button.ui.positive.button")!.textContent).toBe("Yes")
    const close = dialog.querySelector(":scope > button.close.icon")!
    expect(close.getAttribute("aria-label")).toBe("Close")
    expect(html).not.toMatch(/<ui-|<slot/)
  })

  it("names the dialog by its header shorthand, or the host's aria-label", () => {
    const shorthand = fragment(StaticRender.fragment(`<ui-modal header="Archive" content="Sure?"></ui-modal>`))
    const dialog = shorthand.firstElementChild!
    const header = dialog.querySelector(":scope > .header")!
    expect(header.textContent).toBe("Archive")
    expect(dialog.getAttribute("aria-labelledby")).toBe(header.id)
    expect(dialog.querySelector(":scope > .content")!.textContent).toBe("Sure?")
    const labelled = fragment(StaticRender.fragment(`<ui-modal aria-label="Named" header="Archive"></ui-modal>`))
    expect(labelled.firstElementChild!.getAttribute("aria-label")).toBe("Named")
    expect(labelled.firstElementChild!.hasAttribute("aria-labelledby")).toBe(false)
  })

  it("stays closed when written open:  showing a modal needs JS", () => {
    const dialog = fragment(StaticRender.fragment(`<ui-modal open header="Hi"></ui-modal>`)).firstElementChild!
    expect(dialog.localName).toBe("dialog")
    expect(dialog.hasAttribute("open")).toBe(false)
  })
})

/** `html` parsed as body content. */
function fragment(html: string): HTMLElement {
  return parseHTML(`<!doctype html><html><body>${html}</body></html>`).document.body
}
