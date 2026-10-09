import { describe, expect, test } from "vite-plus/test"

import { E, UI } from "$/ui/core"
import { ElementFixture } from "$/ui/test/ElementFixture"

import "$/ui/components/ui-item"
import * as Components from "$/epics/components"

////////////////
// ## Helpers
////////////////

/** Every sheet the barrel's classes register, as `<Class>: <sheet name>`. */
const SHEETS = Object.entries(Components).flatMap(([name, Class]) =>
  Class.prototype instanceof E.UIComponent
    ? Object.keys(Class.prototype.elementSetup.styleSheets).map((sheet) => `${name}: ${sheet}`)
    : []
)

////////////////
// ## Tests
////////////////

describe("the epics pack's sheets", () => {
  test("every sheet the pack registers is named `epic-...`:  Spell UI keeps ONE sheet per name, the first registered", () => {
    expect(SHEETS.length).toBeGreaterThan(20)
    expect(SHEETS.filter((sheet) => !sheet.includes(": epic-"))).toEqual([])
  })

  test("an `<epic-item>` after a `<ui-item>` draws with ITS sheet, not `<ui-item>`'s (I9)", async () => {
    // the `<ui-item>` first:  its sheet registers first, as on a guide page whose meta list comes before the items
    await ElementFixture.render(`<ui-item>Meta</ui-item>`)
    const host = await ElementFixture.render(`<epic-item id="q1" title="Which colour names?"></epic-item>`)
    const root = host.shadowRoot!
    // `EpicItem.css` lays the line out in a row:  `UIItem.css` would leave it a block
    expect(getComputedStyle(root.querySelector("[part~='line']")!).display).toBe("flex")
    expect(root.adoptedStyleSheets).toContain(UI.styles.sheet("epic-item"))
  })
})
