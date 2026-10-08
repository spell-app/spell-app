import { describe, expect, test } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { PAGE } from "$/ui/test/docsSearch.fixtures"

import { PageOutline } from "./PageOutline"

describe("PageOutline.read()", () => {
  test("reads sections and headers with ids, their trail through tabs and parents, never a demo's", () => {
    const page = Fixture.render(`
      <main>
        ${PAGE}
        <ui-header level="2" id="intro">Intro <ui-header>sub</ui-header></ui-header>
        <h3 id="more">More</h3>
        <ui-section id="untitled"></ui-section>
      </main>`)
    const entries = PageOutline.read(page)
    expect(entries.map((entry) => [entry.title, entry.context ?? "", entry.href])).toEqual([
      ["Types", "Examples", "#examples-types"],
      ["Divider", "Examples › Types", "#examples-types-divider"],
      ["Vertical Divider", "Examples › Types", "#examples-types-vertical-divider"],
      ["Keyboard", "Usage", "#usage-keyboard"],
      ["Intro", "", "#intro"],
      ["More", "", "#more"]
    ])
    expect(PageOutline.read(undefined)).toEqual([])
  })
})

describe("PageOutline.sections()", () => {
  test("lists titled sections as the search file does:  a top section's tab, an inner one's parent index", () => {
    expect(PageOutline.sections(Fixture.render(PAGE))).toEqual({
      sections: [
        { id: "examples-types", title: "Types", tab: "examples" },
        { id: "examples-types-divider", title: "Divider", parent: 0 },
        { id: "examples-types-vertical-divider", title: "Vertical Divider", parent: 0 },
        { id: "usage-keyboard", title: "Keyboard", tab: "usage" }
      ],
      tabs: { examples: "Examples", usage: "Usage" }
    })
  })
})
