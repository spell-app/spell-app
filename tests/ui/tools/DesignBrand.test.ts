import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, test } from "vite-plus/test"

import { readJSON5File } from "$/util/node/json5"
import type { SiteDataFile } from "$/ui/docs-components/docs-components.types"
import { DesignBrand } from "$/ui/tools/DesignBrand"

/** Spell UI's folder, and the brand's beside it. */
const UI = fileURLToPath(new URL("../../../packages/ui/", import.meta.url))
const BRAND = join(UI, "../brand")

/** The brand package's committed docs-set data. */
const BRAND_DATA = readJSON5File<SiteDataFile>(join(BRAND, "docs/__data/components.json5"))

describe("DesignBrand.examples()", () => {
  test("reads a docs page's examples from its Examples tab, titled by their sections, without comments' styles", () => {
    const page = `<!-- a <style> named in a comment -->
<style>.stage { position: relative }</style>
<ui-tabs><ui-tab value="examples" label="Examples">
<ui-section id="a" label="Types"><ui-section id="b" label="Phone">
<ui-docs-example description="x">
  <brand-phone></brand-phone>
</ui-docs-example>
</ui-section></ui-section>
</ui-tab><ui-tab value="usage" label="Usage"><ui-docs-example><b>not this</b></ui-docs-example></ui-tab></ui-tabs>`
    const brand = new DesignBrand({ folder: join(UI, "../nowhere"), uiFolder: UI, data: BRAND_DATA })
    ;(brand as unknown as { pages: Map<string, string> }).pages.set("brand-phone", page)
    expect(brand.examples("brand-phone")).toEqual([
      { title: "Phone", markup: "<brand-phone></brand-phone>", source: "../nowhere/docs/brand-phone.html" }
    ])
    expect(brand.style("brand-phone")).toBe(".stage { position: relative }")
  })
})

describe("DesignBrand.read()", () => {
  test("reads the brand in the folder it's GIVEN, and records its paths relative to Spell UI", () => {
    const source = DesignBrand.read(BRAND, UI)!
    expect(source).toMatchObject({
      group: "Brand",
      componentsPath: "../brand/components",
      docsPaths: ["../brand/docs/__data/components.json5", "../brand/docs/brand-*.html"]
    })
    expect(Object.keys(source.data.families)).toContain("brand-phone")
    expect(DesignBrand.read(join(UI, "../nowhere"), UI)).toBeUndefined()
  })
})
