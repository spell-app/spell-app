import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vite-plus/test"

import { FamilyTokens } from "./FamilyTokens.ts"
import { FoundationTokens } from "./FoundationTokens.ts"
import { SiteDataBuilder } from "./SiteDataBuilder.ts"
import { ThemeFamilies } from "./ThemeFamilies.ts"
import { SITE_PAGES } from "./tools.types.ts"

/**
 * The site's committed data (`site/_data/components.json`, `pages.json`, `icons.json`) and the shared
 * `ui/_data/search.json` are what `yarn site:data` would write now:  run it after changing a vocabulary, a family
 * sheet's tokens, `pages.json` or a page's sections (a page edit in ANY checkout:  the pages are shared).
 */
describe("site data", () => {
  it("is current (else run `yarn site:data`)", async () => {
    const builder = new SiteDataBuilder()
    const { data, pages } = await builder.build()
    expect(readFileSync(builder.pagesFile, "utf8"), "pages.json").toBe(SiteDataBuilder.stringify(pages))
    expect(readFileSync(builder.dataFile, "utf8") === SiteDataBuilder.stringify(data), "components.json").toBe(true)
    expect(readFileSync(builder.iconsFile, "utf8") === builder.iconsText(), "icons.json").toBe(true)
    expect(readFileSync(builder.searchFile, "utf8") === builder.searchText(), "search.json").toBe(true)
  }, 60_000)

  it("lists components and doc-only tags apart, each linked to its page", async () => {
    const { data } = await new SiteDataBuilder().build()
    const button = data.components.find((entry) => entry.tag === "ui-button")!
    expect(button).toMatchObject({ folder: "ui-button", mainTag: "ui-button", main: true })
    expect(button.href).toBe("components/ui-button.html")
    expect(data.components.find((entry) => entry.tag === "ui-or")!.href).toBe("components/ui-button.html#ui-or")
    expect(data.components.some((entry) => entry.tag.startsWith("ui-docs-"))).toBe(false)
    expect(data.docs.map((entry) => entry.tag)).toContain("ui-docs-example")
    expect(data.docs.every((entry) => entry.href === undefined)).toBe(true)
    expect(data.families["ui-parts"]!.mainTag).toBe("ui-header")
    expect(data.topics[0]).toEqual({ id: "basic", title: "Basic" })
  }, 60_000)

  it("links a sub-tag with a page of its own (pages.json `pages`) to that page", async () => {
    const { data } = await new SiteDataBuilder().build()
    const radio = data.components.find((entry) => entry.tag === "ui-radio")!
    expect(radio).toMatchObject({ folder: "ui-checkbox", main: false, page: true, href: "components/ui-radio.html" })
    expect(data.families["ui-checkbox"]!.pages!["ui-radio"]!.title).toBe("Radio")
    expect(data.components.find((entry) => entry.tag === "ui-or")!.page).toBe(false)
    expect(data.components.find((entry) => entry.tag === "ui-button")!.page).toBe(true)
    // every page the data names exists
    for (const entry of data.components.filter((tag) => tag.page))
      expect(() => readFileSync(join(import.meta.dirname, "..", SITE_PAGES, entry.href!)), entry.href).not.toThrow()
  }, 60_000)

  it("resolves shared value sets, and reads a family's tokens with types", async () => {
    const { data } = await new SiteDataBuilder().build()
    const color = data.components
      .find((entry) => entry.tag === "ui-button")!
      .attributes.find((a) => a.name === "color")!
    expect(color.valueSet).toBe("hues")
    expect(color.values).toContain("red")
    const radius = data.families["ui-button"]!.tokens.find((token) => token.name === "--ui-button-radius")!
    expect(radius.type).toBe("length")
  }, 60_000)
})

describe("FamilyTokens.typeFor()", () => {
  it.each([
    ["--ui-x-color", "var(--ui-text-color)", "color"],
    ["--ui-x-background", "oklch(0.5 0 0)", "color"],
    ["--ui-x-radius", "var(--ui-radius)", "length"],
    ["--ui-x-padding-block", "0.5em", "length"],
    ["--ui-x-duration", "var(--ui-duration-fast)", "time"],
    ["--ui-x-opacity", "0.5", "number"],
    ["--ui-x-shadow", "0 1px 2px var(--ui-border-color)", "other"]
  ])("%s: %s => %s", (name, value, type) => {
    expect(FamilyTokens.typeFor(name, value)).toBe(type)
  })
})

describe("theme data (ThemeFamilies)", () => {
  it("lists every theme sheet with its title and the families it touches", async () => {
    const { data } = await new SiteDataBuilder().build()
    const theme = (name: string) => data.themes.find((entry) => entry.name === name)!
    expect(data.themes.map((entry) => entry.name)).toContain("classic")
    expect(theme("bootstrap3")).toEqual({
      name: "bootstrap3",
      title: "Bootstrap 3",
      families: ["ui-button"],
      global: false
    })
    // `.ui.flag.ad` is Andorra's flag, not an ad
    expect(theme("famfamfam").families).toEqual(["ui-flag"])
    expect(theme("timeline").families).toEqual(["ui-feed"])
    expect(theme("github").families).toEqual(expect.arrayContaining(["ui-button", "ui-menu", "ui-table"]))
    expect(theme("github").global).toBe(true)
    expect(theme("systemfont")).toMatchObject({ families: [], global: true })
  }, 60_000)

  it("reads class grammar, tag selectors and declared tokens;  a box's remap isn't site-wide", () => {
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
    expect(ThemeFamilies.titleFor("/*\n * GitHub theme:  port of ...", "github")).toBe("GitHub")
    expect(ThemeFamilies.titleFor("", "fixed-width")).toBe("Fixed width")
  })
})

describe("foundation data (FoundationTokens)", () => {
  it("groups every :root token of the generated sheets, none left over, colours typed", () => {
    const groups = new FoundationTokens(new URL("../src/styles/", import.meta.url).pathname).groups()
    const ids = groups.map((group) => group.id)
    expect(ids).toEqual(expect.arrayContaining(["typography", "spacing", "radii", "palette", "brand", "semantic"]))
    expect(ids).not.toContain("other")
    const all = groups.flatMap((group) => group.tokens)
    expect(all.find((token) => token.name === "--ui-font-size")).toMatchObject({ default: "16px", type: "length" })
    expect(all.find((token) => token.name === "--ui-red-hover")).toMatchObject({ type: "color" })
    expect(all.some((token) => token.name.startsWith("--ui-sheet-"))).toBe(false)
    expect(all.every((token) => token.description)).toBe(true)
  })
})
