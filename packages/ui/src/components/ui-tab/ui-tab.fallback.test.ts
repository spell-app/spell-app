import { describe, expect, it } from "vitest"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { TabFallback } from "./ui-tab.fallback"

// the fallback keys on the host's (and its parent's) tag, so the stubs take the real tags
FallbackStub.define("ui-tabs", (host, root, internals) => TabFallback.render(host, root, new Error("boom"), internals))
FallbackStub.define("ui-tab", (host, root, internals) => TabFallback.render(host, root, new Error("boom"), internals))

/** Axe without contrast:  the stubs have no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("TabFallback", () => {
  it("renders the tab list from the panes' labels, the `value` one selected, and the panes' slot", async () => {
    const host = Fixture.render<StubHost>(
      `<ui-tabs tabular basic value="b" aria-label="Sections">` +
        `<ui-tab label="Alpha">A</ui-tab><ui-tab value="b" label="Beta">B</ui-tab><ui-tab>C</ui-tab>` +
        `</ui-tabs>`
    )
    const root = FallbackStub.shadow(host).firstElementChild as HTMLElement
    expect(root.className).toBe("ui basic tabular tabs")
    expect(root.getAttribute("part")).toBe("tabs")
    const menu = root.querySelector<HTMLElement>("[part~=menu]")!
    expect(menu.className).toBe("ui tabular menu")
    expect(menu.getAttribute("role")).toBe("tablist")
    const tabs = [...menu.querySelectorAll("button")]
    expect(tabs.map((tab) => tab.textContent)).toEqual(["Alpha", "Beta", "2"])
    expect(tabs.map((tab) => tab.getAttribute("aria-selected"))).toEqual(["false", "true", "false"])
    expect(tabs[1]!.className).toBe("active item")
    expect(tabs[1]!.getAttribute("role")).toBe("tab")
    expect(root.querySelector(":scope > slot")).not.toBeNull()
    const pane = host.querySelector<StubHost>("ui-tab")!
    const box = FallbackStub.shadow(pane).firstElementChild as HTMLElement
    expect(box.className).toBe("ui tab segment")
    expect(pane.internals.role).toBe("tabpanel")
    expect(pane.internals.states.has("pane")).toBe(true)
    await expectAccessible(host, AXE)
  })

  it("puts `appearance`, `alignment` and `equal` on the tab list too", () => {
    const host = Fixture.render<StubHost>(
      `<ui-tabs appearance="segmented" alignment="fluid" equal basic><ui-tab label="A">A</ui-tab></ui-tabs>`
    )
    const root = FallbackStub.shadow(host).firstElementChild as HTMLElement
    expect(root.className).toBe("ui segmented basic equal fluid aligned tabs")
    expect(root.querySelector("[part~=menu]")!.className).toBe("ui segmented equal fluid aligned menu")
  })

  it("selects the first `selected` / `active` pane without a `value`, else the first", () => {
    const chosen = Fixture.render<StubHost>(`<ui-tabs><ui-tab>A</ui-tab><ui-tab active>B</ui-tab></ui-tabs>`)
    const selected = (host: StubHost) =>
      [...FallbackStub.shadow(host).querySelectorAll("button")].map((tab) => tab.getAttribute("aria-selected"))
    expect(selected(chosen)).toEqual(["false", "true"])
    const first = Fixture.render<StubHost>(`<ui-tabs><ui-tab>A</ui-tab><ui-tab>B</ui-tab></ui-tabs>`)
    expect(selected(first)).toEqual(["true", "false"])
  })

  it("renders a selected pane active and shown, alone", () => {
    const pane = Fixture.render<StubHost>(`<ui-tab selected loading>Busy</ui-tab>`)
    const box = FallbackStub.shadow(pane).firstElementChild as HTMLElement
    expect(box.className).toBe("ui loading active tab segment")
    expect(box.getAttribute("aria-busy")).toBe("true")
    expect(pane.internals.states.has("selected")).toBe(true)
    expect(pane.internals.role).toBeNull()
    const alias = Fixture.render<StubHost>(`<ui-tab active>Shown</ui-tab>`)
    expect((FallbackStub.shadow(alias).firstElementChild as HTMLElement).className).toBe("ui tab segment active")
  })
})
