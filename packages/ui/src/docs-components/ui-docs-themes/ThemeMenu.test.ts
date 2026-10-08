import { describe, expect, test } from "vite-plus/test"

import { DOCS_PLAIN_THEME, type SiteDataFile } from "$/ui/docs-components/docs-components.types"

import { ThemeMenu } from "./ThemeMenu"
import { CLASSIC, SPELL, SPELL_BRAND } from "./UIDocsThemes.types"

describe("new ThemeMenu()", () => {
  test("no data:  every theme under its sheet name;  an unknown `for` tag filters nothing", () => {
    const menu = new ThemeMenu({
      names: ["fixed-width", "github"],
      data: undefined,
      forTag: "ui-button",
      text: keyText
    })
    expect(menu.themes).toEqual(["fixed-width", "github"])
    expect(menu.titleFor("fixed-width")).toBe("Fixed width")
    const data = { components: [], docs: [], families: {}, themes: [] } as unknown as SiteDataFile
    expect(new ThemeMenu({ names: ["github"], data, forTag: "ui-nope", text: keyText }).themes).toEqual(["github"])
  })
})

describe("ThemeMenu.entries", () => {
  test("lists our own looks first, then a header over the Fomantic themes", () => {
    const menu = new ThemeMenu({ names: ["github"], data: undefined, text: keyText })
    expect(menu.entries.map((entry) => ("value" in entry ? entry.value : entry.type))).toEqual([
      SPELL,
      SPELL_BRAND,
      DOCS_PLAIN_THEME,
      CLASSIC,
      "divider",
      "header",
      "github"
    ])
  })
})

describe("ThemeMenu.labelFor()", () => {
  test("`1 theme`, and the chosen look (never `0 themes`) for a family no theme touches", () => {
    const one = new ThemeMenu({ names: ["github"], data: undefined, forTag: "ui-button", text: englishText as never })
    expect(one.labelFor(undefined)).toBe("1 theme")
    const none = new ThemeMenu({ names: [], data: undefined, forTag: "ui-sticky", text: englishText as never })
    expect(none.labelFor(undefined)).toBe("Default theme")
  })
})

/** A `text()` that answers with the key itself. */
function keyText(key: string) {
  return key
}

/** A `text()` with the few English strings `labelFor()` needs;  the key for any other. */
function englishText(key: string, values?: Record<string, unknown>) {
  const texts: Record<string, string> = {
    themeCount: `${values?.count} themes`,
    themeCountOne: "1 theme",
    themeLabel: `${values?.title} theme`,
    default: "Default"
  }
  return texts[key] ?? key
}
