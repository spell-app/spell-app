/// <reference types="node" />

import { parseHTML } from "linkedom"
import { beforeAll, describe, expect, it } from "vitest"

import { StaticRender } from "$/ui/server"
import { UITab } from "$/ui/components/ui-tab/UITab"
import { UITabs } from "$/ui/components/ui-tab/UITabs"

/**
 * `<ui-tabs>` rendered statically (`$/ui/server`):  the tab list built from the panes, the selected pane shown, the
 * others in the HTML but hidden (no `active`), tabs and panes related by ids.
 */
describe("ui-tab static render", () => {
  beforeAll(() => {
    StaticRender.define(UITabs, UITab)
  })

  it("builds the tab list from the panes, the selected one active", () => {
    const html = StaticRender.fragment(
      `<ui-tabs tabular attached aria-label="Demo"><ui-tab label="First">One</ui-tab>` +
        `<ui-tab label="Second" selected>Two</ui-tab><ui-tab label="Third" disabled>Three</ui-tab></ui-tabs>`
    )
    const root = fragment(html).firstElementChild!
    expect(root.getAttribute("class")).toBe("ui tabular top attached tabs")
    const list = root.querySelector(":scope > [role=tablist]")!
    expect(list.getAttribute("class")).toBe("ui tabular top attached menu")
    expect(list.getAttribute("aria-label")).toBe("Demo")
    const tabs = [...list.querySelectorAll("button[role=tab]")]
    expect(tabs.map((tab) => tab.textContent)).toEqual(["First", "Second", "Third"])
    expect(tabs.map((tab) => tab.getAttribute("aria-selected"))).toEqual(["false", "true", "false"])
    expect(tabs.map((tab) => tab.getAttribute("class"))).toEqual(["item", "active item", "disabled item"])
    expect(tabs[2]!.getAttribute("aria-disabled")).toBe("true")
    const panes = [...root.querySelectorAll(":scope > [role=tabpanel]")]
    expect(panes.map((pane) => pane.textContent)).toEqual(["One", "Two", "Three"])
    expect(panes.map((pane) => pane.getAttribute("aria-label"))).toEqual(["First", "Second", "Third"])
    expect(panes.map((pane) => pane.classList.contains("active"))).toEqual([false, true, false])
    expect(panes[1]!.getAttribute("class")).toBe("ui active bottom attached tab segment in-tabs")
    expect(panes[1]!.getAttribute("data-state")).toBe("in-tabs pane selected")
    // each tab controls its pane, by id
    expect(tabs.map((tab) => tab.getAttribute("aria-controls"))).toEqual(panes.map((pane) => pane.id))
    expect(new Set(panes.map((pane) => pane.id)).size).toBe(3)
    expect(html).not.toMatch(/<ui-|<slot/)
  })

  it("keeps a pane's own id, and selects the first enabled pane by default", () => {
    const html = StaticRender.fragment(
      `<ui-tabs><ui-tab label="A" disabled>a</ui-tab><ui-tab id="mine" label="B">b</ui-tab></ui-tabs>`
    )
    const root = fragment(html).firstElementChild!
    expect(root.querySelector("[aria-selected=true]")!.getAttribute("aria-controls")).toBe("mine")
    expect(root.querySelector(".active.tab")!.id).toBe("mine")
  })
})

/** `html` parsed as body content. */
function fragment(html: string): HTMLElement {
  return parseHTML(`<!doctype html><html><body>${html}</body></html>`).document.body
}
