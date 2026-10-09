import { parseHTML } from "linkedom"
import { describe, expect, it } from "vite-plus/test"

import { END, LISTS, START, areaCards, epicOrder, listSection, planOf, replaceBetween, skeleton } from "./index.js"

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

  it("carry the page notes Owen left in the list over when it's written again (epic airplane P3)", () => {
    const written = `${START}\n${listSection(guides, [page("guides/a.html")])}\n${END}`.replace(
      "</ui-section>",
      `<spell-notes for="guides"><spell-note id="n1" status="new" at="2026-10-10 14:02"><p>Group these?</p></spell-note></spell-notes>\n</ui-section>`
    )
    const again = replaceBetween(
      written,
      START,
      END,
      listSection(guides, [page("guides/a.html"), page("guides/b.html")])
    )
    expect(again).toContain(`<a href="b.html">`)
    expect(again).toMatch(
      /<a href="b.html">[\s\S]*<spell-note id="n1"[\s\S]*<\/spell-notes>\n<\/ui-section>\n<!-- index:end -->$/
    )
    expect(replaceBetween("no markers", START, END, "")).toBeUndefined()
  })
})

describe("planOf():  a plan doc's card data, either markup (epic-components P8)", () => {
  const expected = {
    phases: [
      { status: "done", label: "P1 · First Go" },
      { status: "active", label: "P2 · Second" }
    ],
    updated: "2026-10-06",
    future: false,
    followUps: ["question", "issue"]
  }

  it("reads the <epic-*> markup:  phases, the page's updated and future, open items' kinds", () => {
    const { document } = parseHTML(`<html><body><epic-page epic="x" title="X" updated="2026-10-06">
<epic-section id="phases" kind="phases"><epic-phase id="p1" title="First Go" status="done"></epic-phase>
<epic-phase id="p2" status="active"><span slot="title">Second</span></epic-phase></epic-section>
<epic-section id="decisions" kind="questions"><epic-item id="q1" title="a" status="open"></epic-item>
<epic-item id="q2" title="b" status="decided"></epic-item></epic-section>
<epic-section id="caveats" kind="caveats"><epic-item id="c1" title="c" status="open"></epic-item></epic-section>
<epic-section id="issues" kind="issues"><epic-item id="i1" title="d" status="open"></epic-item></epic-section>
</epic-page></body></html>`)
    expect(planOf(document)).toEqual(expected)
  })

  it("reads the old markup until the switch", () => {
    const { document } = parseHTML(`<html><body><time id="plan-updated">2026-10-06</time>
<ui-section id="phases"><ui-section data-phase="1" data-status="done" header="P1 · First Go"></ui-section>
<ui-section data-phase="2" data-status="active" header="P2 · Second"></ui-section></ui-section>
<ui-list class="plan-items"><ui-item id="q1" data-status="open"></ui-item><ui-item id="c1" data-status="open"></ui-item>
<ui-item id="i1" data-status="open"></ui-item></ui-list></body></html>`)
    expect(planOf(document)).toEqual(expected)
  })
})
