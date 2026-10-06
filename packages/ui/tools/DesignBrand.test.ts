import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, test } from "vite-plus/test"

import type { SiteDataFile } from "../src/docs-components/docs-components.types.ts"
import { DesignBrand } from "./DesignBrand.ts"

/** The brand package's committed site data. */
const BRAND_DATA = JSON.parse(
  readFileSync(join(fileURLToPath(new URL("../../brand/", import.meta.url)), "_data/components.json"), "utf8")
) as SiteDataFile

describe("DesignBrand.examples()", () => {
  test("reads a docs page's examples from its Examples tab, titled by their sections, without comments' styles", () => {
    const page = `<!-- a <style> named in a comment -->
<style>.stage { position: relative }</style>
<ui-tabs><ui-tab value="examples" label="Examples">
<ui-section id="a" header="Types"><ui-section id="b" header="Phone">
<ui-docs-example description="x">
  <ui-brand-phone></ui-brand-phone>
</ui-docs-example>
</ui-section></ui-section>
</ui-tab><ui-tab value="usage" label="Usage"><ui-docs-example><b>not this</b></ui-docs-example></ui-tab></ui-tabs>`
    const brand = new DesignBrand({ root: "/nowhere", data: BRAND_DATA })
    ;(brand as unknown as { pages: Map<string, string> }).pages.set("ui-brand-phone", page)
    expect(brand.examples("ui-brand-phone")).toEqual([
      { title: "Phone", markup: "<ui-brand-phone></ui-brand-phone>", source: "brand/components/ui-brand-phone.html" }
    ])
    expect(brand.style("ui-brand-phone")).toBe(".stage { position: relative }")
  })
})
