import { describe, expect, it } from "vite-plus/test"

import { END, LISTS, START, areaCards, epicOrder, listSection, skeleton } from "./index.js"

/** A described epic page (`describe()`'s shape) with `phases`, each a status. */
function epic(name, statuses, updated = new Date().toISOString().slice(0, 10)) {
  return {
    path: `epics/${name}/${name}.plan.html`,
    title: name,
    description: "",
    phases: statuses.map((status, i) => ({ status, label: `P${i + 1} · Phase` })),
    updated
  }
}

/** A described page at `path`. */
function page(path) {
  return { path, title: path, description: "", phases: [], updated: null }
}

describe("the docs home's cards", () => {
  it("come in the top bar's order (claude-design Q6), counted from the pages", () => {
    const cards = areaCards([
      epic("a", ["done", "done"]),
      epic("b", ["done", "active"]),
      epic("c", []),
      page("guides/x.html"),
      page("guides/y/y.html"),
      page("templates/durable.html"),
      page("brand/pony.html"),
      page("brand/compare.html"),
      page("brand/spell-design-system/Logo.spell.html"),
      page("brand/spell-design-system/Logo.dc.html"),
      page("brand/components/ui-brand-logo.html")
    ])
    expect(cards.map((card) => card.title)).toEqual([
      "Epics",
      "Guides",
      "Brand",
      "Spell UI",
      "Templates",
      "Goals",
      "App"
    ])
    const count = Object.fromEntries(cards.map((card) => [card.id, card.count]))
    expect(count.epics).toBe("2 running · 1 done")
    expect(count.guides).toBe("2 guides")
    expect(count.brand).toBe("1 copy · 1 element · 1 page")
    expect(count.templates).toBe("1 template")
    // the App is only on the page server:  no link from disk
    expect(cards.at(-1).href).toBeUndefined()
  })
})

describe("the list pages", () => {
  const epics = LISTS.find((list) => list.id === "epics")
  const guides = LISTS.find((list) => list.id === "guides")

  it("list open epics before done ones, the running epics' slot first, links from the list's folder", () => {
    const pages = [epic("a", ["done"]), epic("b", ["active", "todo"]), epic("c", [])]
    expect(epicOrder(pages).map((each) => each.title)).toEqual(["b", "c", "a"])
    const html = listSection(epics, pages)
    expect(html).toMatch(
      /<ui-cards class="spell-grid spell-epics" stackable>\n<!-- running-epics -->\n<ui-card data-epic="b"/
    )
    expect(html).toContain(`<a href="b/b.plan.html">b</a>`)
  })

  it("leave the Brand index's own pages to it, in a section of their own (claude-design P11)", () => {
    const brand = LISTS.find((list) => list.id === "brand")
    const paths = ["brand/pony.html", "brand/compare.html", "brand/spell-design-system/Logo.spell.html"]
    expect(paths.filter((path) => brand.has(path))).toEqual(["brand/pony.html"])
    const html = listSection(brand, [page("brand/pony.html")])
    expect(html).toMatch(/^<ui-section id="pulled" header="6\. From Claude Design"/)
    expect(html).toContain(`<a href="pony.html">brand/pony.html</a>`)
  })

  it("say so when an area has no pages", () => {
    expect(listSection(guides, [])).toContain(`<p class="meta">No guides yet.</p>`)
  })

  it("start from a skeleton:  site header, breadcrumb home, sticky title, the markers", () => {
    const html = skeleton(guides)
    expect(html).toContain(`<spell-site-header root=".."></spell-site-header>`)
    expect(html).toContain(
      `<ui-breadcrumb-section href="../pages/index.html" target="_self">Docs</ui-breadcrumb-section>`
    )
    expect(html).toContain(`<h1>Guides</h1>`)
    expect(html.indexOf(START)).toBeLessThan(html.indexOf(END))
    expect(skeleton(LISTS.find((list) => list.id === "templates"))).toContain(`id="writing-docs"`)
  })
})
