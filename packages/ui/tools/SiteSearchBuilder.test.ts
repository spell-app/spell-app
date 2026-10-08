import { describe, expect, it } from "vite-plus/test"

import { SiteSearchBuilder } from "./SiteSearchBuilder.ts"

/**
 * `SiteSearchBuilder`:  a page's entry in `site/_data/search.json`, from its markup.  (That the committed file is
 * current:  `SiteDataBuilder.test.ts`.)
 */
describe("SiteSearchBuilder.page()", () => {
  const PAGE = `<!doctype html>
    <html><head><title>Divider | Spell UI</title><meta name="description" content="Segments content."></head>
    <body><main id="main" data-toc-header="Divider">
      <ui-tabs id="site-tabs">
        <ui-tab value="examples" label="Examples">
          <ui-section id="examples-types" header="Types">
            <ui-section id="examples-types-vertical-divider" header="Vertical   Divider">
              <ui-docs-example><ui-section id="demo" header="Demo"></ui-section></ui-docs-example>
            </ui-section>
          </ui-section>
        </ui-tab>
        <ui-tab value="usage" label="Usage">
          <ui-section id="usage-slots"><span slot="header">The <code>header</code> slot</span></ui-section>
        </ui-tab>
      </ui-tabs>
      <template><ui-section id="templated" header="Never"></ui-section></template>
    </main></body></html>`

  it("reads the title, summary, tabs and every section with its parent and tab;  never a demo's", () => {
    expect(SiteSearchBuilder.page("components/ui-divider.html", PAGE)).toEqual({
      path: "components/ui-divider.html",
      title: "Divider",
      summary: "Segments content.",
      tag: "ui-divider",
      tabs: { examples: "Examples", usage: "Usage" },
      sections: [
        { id: "examples-types", title: "Types", tab: "examples" },
        { id: "examples-types-vertical-divider", title: "Vertical Divider", parent: 0 },
        { id: "usage-slots", title: "The header slot", tab: "usage" }
      ]
    })
  })

  it("lists a page without sections by its headers with ids;  titles from `<title>` without the suffix", () => {
    const page = SiteSearchBuilder.page(
      "index.html",
      `<title>Spell UI | Spell UI</title><main id="main">
        <ui-header level="2" id="design" icon="star">Design <ui-header>Sub header</ui-header></ui-header>
        <h3 id="more">More</h3><ui-header level="5" id="tiny">Too deep</ui-header></main>`
    )
    expect(page).toEqual({
      path: "index.html",
      title: "Spell UI",
      sections: [
        { id: "design", title: "Design" },
        { id: "more", title: "More" }
      ]
    })
  })
})
