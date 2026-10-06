import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vite-plus/test"

import { SiteDataBuilder } from "./SiteDataBuilder.ts"
import { SITE_PAGES } from "./tools.types.ts"

/**
 * The site's committed data (`site/_data/components.json`, `pages.json`, `icons.json`) and the shared
 * `ui/_data/search.json` are what `yarn site:data` would write now:  run it after changing a vocabulary, a family
 * sheet's tokens, `pages.json` or a page's sections (a page edit in ANY checkout:  the pages are shared).
 */
describe("SiteDataBuilder.build()", () => {
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
    expect(button).toMatchObject({
      folder: "ui-button",
      mainTag: "ui-button",
      main: true,
      href: "components/ui-button.html"
    })
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
    expect(theme("github")).toMatchObject({
      families: expect.arrayContaining(["ui-button", "ui-menu", "ui-table"]),
      global: true
    })
    expect(theme("systemfont")).toMatchObject({ families: [], global: true })
  }, 60_000)
})
