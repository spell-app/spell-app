/**
 * Tests of `BlockAnchors.js`:  which elements are a page's major blocks, their anchors, and finding a block again
 * after its page changed.  On linkedom, as the runtime runs it on the live page.
 */
import { parseHTML } from "linkedom"
import { describe, expect, test } from "vite-plus/test"

import {
  anchorOf,
  blocksIn,
  excerptOf,
  findBlock,
  kindOf,
  offsetIn,
  quoteIn,
  targetOf,
  textOf
} from "./BlockAnchors.js"

/** A guide:  a list before any section, a section with two tables, an aside and a code block, a nested section. */
const PAGE = `<main class="spell-doc-main">
  <ui-sticky class="spell-h1"><header class="spell-page-head"><h1>Page</h1><ul><li>crumb</li></ul></header></ui-sticky>
  <ul><li>before any section</li></ul>
  <ui-section id="memory" header="2. Memory">
    <p>Text.</p>
    <ui-table><table><tr><td>Name</td><td>Size</td></tr></table></ui-table>
    <ui-table id="sizes"><table><tr><td>Kind</td></tr></table></ui-table>
    <ui-table><table><tr><td>Third</td></tr></table></ui-table>
    <ui-accordion class="spell-aside"><ui-title>Why</ui-title><ui-content><ui-table><table></table></ui-table></ui-content></ui-accordion>
    <ui-accordion class="spell-code"><ui-title>Code</ui-title><ui-content><pre><code>x</code></pre></ui-content></ui-accordion>
    <spell-notes for="memory"><spell-note><ul><li>a note's list</li></ul></spell-note></spell-notes>
    <ui-section id="deep" header="2.1 Deep"><ui-message>Careful</ui-message></ui-section>
  </ui-section>
</main>`

/** `PAGE`'s main, parsed. */
function mainOf(html = PAGE) {
  return parseHTML(`<!doctype html><html><body>${html}</body></html>`).document.querySelector("main")!
}

describe("blocksIn()", () => {
  test("the OUTERMOST blocks only:  not a table in an aside, code in its accordion, the header's or a note's list", () => {
    const main = mainOf()
    expect(blocksIn(main).map((block: Element) => `${kindOf(block)} ${anchorOf(block, main)}`)).toEqual([
      "list page#list-1",
      "section memory",
      "table memory#table-1",
      "table sizes",
      "table memory#table-3",
      "aside memory#aside-1",
      "code memory#code-1",
      "section deep",
      "message deep#message-1"
    ])
  })
})

describe("excerptOf()", () => {
  test("a section's title;  else the block's text, white space squashed", () => {
    const main = mainOf()
    expect(excerptOf(main.querySelector("#memory"))).toBe("2. Memory")
    expect(excerptOf(main.querySelector("ui-table"))).toBe("Name Size")
  })
})

describe("findBlock()", () => {
  test("by id, by position, and the page header for the page", () => {
    const main = mainOf()
    expect(findBlock(main, { anchor: "sizes" })).toMatchObject({ block: { id: "sizes" }, exact: true })
    const third = findBlock(main, { anchor: "memory#table-3", excerpt: "Third" })
    expect([excerptOf(third.block), third.exact]).toEqual(["Third", true])
    expect(findBlock(main, { anchor: "page" }).block.localName).toBe("ui-sticky")
  })

  test("a block that MOVED is found by its excerpt;  one whose text changed by its place;  else its section", () => {
    const moved = mainOf(
      PAGE.replace("<p>Text.</p>", "<p>Text.</p><ui-table><table><tr><td>New</td></tr></table></ui-table>")
    )
    const found = findBlock(moved, { anchor: "memory#table-1", excerpt: "Name Size" })
    expect([anchorOf(found.block, moved), found.exact]).toEqual(["memory#table-2", false])
    const changed = findBlock(mainOf(), { anchor: "memory#table-1", excerpt: "Name Size Unit" })
    expect([excerptOf(changed.block), changed.exact]).toEqual(["Name Size", false])
    const gone = findBlock(mainOf(), { anchor: "memory#steps-1", excerpt: "x" })
    expect([gone.block.id, gone.exact]).toEqual(["memory", false])
    expect(findBlock(mainOf(), { anchor: "nowhere" })).toEqual({ block: null, exact: false })
  })
})

describe("blocksIn() on a plan doc", () => {
  test("items, a phase's fields, the summary, Overview prose;  never the log or a status card", () => {
    const main = mainOf(`<main><epic-page>
      <epic-overview id="overview"><epic-summary>Lets Owen work.</epic-summary>
        <epic-section id="o1" title="What works"><p>One.</p><p>Two.</p></epic-section></epic-overview>
      <epic-section id="questions"><epic-item id="q3" title="Which file?"><p>Body <ul><li>x</li></ul></p>
        <epic-status slot="status"><p>Underway</p></epic-status></epic-item></epic-section>
      <epic-section id="phases"><epic-phase id="p3" title="Notes"><epic-field name="symptom">No way.</epic-field>
        <epic-field name="goal"><ul><li>a</li></ul></epic-field></epic-phase></epic-section>
      <epic-section id="log"><epic-event>P3 done</epic-event></epic-section>
    </epic-page></main>`)
    expect(blocksIn(main).map((block: Element) => `${kindOf(block)} ${anchorOf(block, main)}`)).toEqual([
      "summary overview#summary-1",
      "prose o1#prose-1",
      "prose o1#prose-2",
      "item q3",
      "field p3#field-1",
      "field p3#field-2"
    ])
    expect(excerptOf(main.querySelector("#q3"))).toBe("Which file?")
  })
})

describe("offsetIn() and quoteIn()", () => {
  test("a quote found again by its offset, where the block says it twice;  added content never counts", () => {
    const main = mainOf(`<main><ui-section id="s"><p>the inbox file,  then
      <b>the inbox</b> file again</p><div data-spell-added>the inbox file</div></ui-section></main>`)
    const paragraph = main.querySelector("p")!
    const bold = main.querySelector("b")!.firstChild!
    const offset = offsetIn(paragraph, bold, 0)
    expect(offset).toBe(21)
    const second = quoteIn(paragraph, "the inbox  file", offset)!
    expect([second.start[0], second.start[1], second.end[0].textContent, second.end[1]]).toEqual([
      bold,
      0,
      " file again",
      5
    ])
    expect(quoteIn(paragraph, "the inbox file", 0)!.start).toEqual([paragraph.firstChild, 0])
    expect(quoteIn(paragraph, "not there", 0)).toBeNull()
    expect(textOf(main.querySelector("ui-section"))).toBe("the inbox file, then the inbox file again")
  })
})

describe("targetOf()", () => {
  test("the id a link lands on:  the block's or its section's;  none for the page", () => {
    expect([targetOf("sizes"), targetOf("memory#table-2"), targetOf("page#list-1"), targetOf("page")]).toEqual([
      "sizes",
      "memory",
      "",
      ""
    ])
  })
})
