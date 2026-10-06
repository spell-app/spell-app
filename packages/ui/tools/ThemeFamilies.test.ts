import { describe, expect, test } from "vite-plus/test"

import { ThemeFamilies } from "./ThemeFamilies.ts"

describe("ThemeFamilies.touched()", () => {
  test("reads class grammar, tag selectors and declared tokens;  a box's remap isn't site-wide", () => {
    const tags = [
      {
        tag: "ui-button",
        noun: "button",
        folder: "ui-button",
        attributes: [{ name: "icon", kind: "icon", description: "" }]
      },
      { tag: "ui-icon", noun: "icon", folder: "ui-icon", attributes: [] },
      { tag: "ui-table", noun: "table", folder: "ui-table", attributes: [] },
      { tag: "ui-card", noun: "card", folder: "ui-card", attributes: [] }
    ]
    const families = new ThemeFamilies({ folder: "/nowhere", tags, families: {}, foundation: ["--ui-font-family"] })
    expect(families.touched(".ui.labeled.icon.button { color: red }")).toEqual({
      families: ["ui-button"],
      global: false
    })
    expect(families.touched(":where(ui-table) > td { color: red }").families).toEqual(["ui-table"])
    expect(families.touched(":root { --ui-card-radius: 0 }")).toEqual({ families: ["ui-card"], global: false })
    expect(families.touched(":root { --ui-font-family: serif }")).toEqual({ families: [], global: true })
    expect(families.touched(".ui:is(.red, .blue).button { --ui-color: red }")).toEqual({
      families: ["ui-button"],
      global: false
    })
    expect(families.touched("b, strong { font-weight: 600 }").global).toBe(true)
    expect(families.touched("@keyframes x { from { opacity: 0 } }").global).toBe(false)
  })
})

describe("ThemeFamilies.titleFor()", () => {
  test("takes a sheet's title from its header comment, else from its name", () => {
    expect(ThemeFamilies.titleFor("/*\n * GitHub theme:  port of ...", "github")).toBe("GitHub")
    expect(ThemeFamilies.titleFor("", "fixed-width")).toBe("Fixed width")
  })
})
