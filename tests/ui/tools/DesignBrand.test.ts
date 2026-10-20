import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, test } from "vite-plus/test"

import { readJSON5File } from "$/util/node/json5"
import type { SiteDataFile } from "$/ui/docs-components/docs-components.types"
import { DesignBrand } from "$/ui/tools/DesignBrand"

/** The brand package's committed docs-set data. */
const BRAND_DATA = readJSON5File<SiteDataFile>(
  join(fileURLToPath(new URL("../../../packages/brand/", import.meta.url)), "docs/__data/components.json5")
)

describe("DesignBrand.examples()", () => {
  test("reads a docs page's examples from its Examples tab, titled by their sections, without comments' styles", () => {
    const page = `<!-- a <style> named in a comment -->
<style>.stage { position: relative }</style>
<ui-tabs><ui-tab value="examples" label="Examples">
<ui-section id="a" header="Types"><ui-section id="b" header="Phone">
<ui-docs-example description="x">
  <brand-phone></brand-phone>
</ui-docs-example>
</ui-section></ui-section>
</ui-tab><ui-tab value="usage" label="Usage"><ui-docs-example><b>not this</b></ui-docs-example></ui-tab></ui-tabs>`
    const brand = new DesignBrand({ root: "/nowhere", data: BRAND_DATA })
    ;(brand as unknown as { pages: Map<string, string> }).pages.set("brand-phone", page)
    expect(brand.examples("brand-phone")).toEqual([
      { title: "Phone", markup: "<brand-phone></brand-phone>", source: "packages/brand/docs/brand-phone.html" }
    ])
    expect(brand.style("brand-phone")).toBe(".stage { position: relative }")
  })
})
