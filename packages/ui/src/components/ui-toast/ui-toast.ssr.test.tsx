/// <reference types="node" />

import { parseHTML } from "linkedom"
import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UIToast } from "$/ui/components/ui-toast/UIToast"

/**
 * `<ui-toast>` written in a page, rendered statically (`$/ui/static`):  an ordinary block with its live-region role,
 * header, message and close icon.
 */
describe("ui-toast static render", () => {
  beforeAll(() => {
    StaticRender.define(UIToast)
  })

  it("renders a toast box with its parts and role", () => {
    const html = StaticRender.fragment(`<ui-toast header="Saved" message="All done." closable></ui-toast>`)
    const box = fragment(html).firstElementChild!
    expect(box.getAttribute("class")).toContain("toast-box")
    expect(box.getAttribute("data-ui")).toBe("toast")
    const toast = box.querySelector(":scope > .ui.toast")!
    expect(toast.getAttribute("role")).toBe("status")
    expect(toast.querySelector(".content > .header")!.textContent).toBe("Saved")
    expect(toast.querySelector(".content > .message")!.textContent).toBe("All done.")
    expect(toast.querySelector("button.close.icon")!.getAttribute("aria-label")).toBe("Close")
    expect(html).not.toMatch(/<ui-|<slot/)
  })

  it("makes an error toast an alert", () => {
    const html = StaticRender.fragment(`<ui-toast type="error" message="Failed."></ui-toast>`)
    const toast = fragment(html).querySelector(".ui.toast")!
    expect(toast.getAttribute("class")).toContain("error")
    expect(toast.getAttribute("role")).toBe("alert")
  })
})

/** `html` parsed as body content. */
function fragment(html: string): HTMLElement {
  return parseHTML(`<!doctype html><html><body>${html}</body></html>`).document.body
}
