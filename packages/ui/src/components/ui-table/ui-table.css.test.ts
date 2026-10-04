import { beforeEach, describe, expect, it } from "vite-plus/test"
import { page } from "vite-plus/test/browser"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/fixture"
import { Sheets } from "$/ui/test/sheets"

import { tableVocabulary } from "./ui-table.vocabulary.en"

import tableCSS from "./ui-table.css?inline"
import tableRaw from "./ui-table.css?raw"

/**
 * `ui-table.css` on its own, before any element exists:  the sheet's source rules, the computed styles of the
 * class-grammar examples (static markup, the page-sheet side), the base look of an un-upgraded
 * `<ui-table><table>`, and the shadow side (`:host`, `.scroller`) in a stand-in shadow root.
 * - Sheets are adopted into the document per test and removed again.
 * - The viewport is set per test:  static tables stack by the VIEWPORT (`@media`), as in Fomantic.
 */

/** Every class-grammar example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

/** A viewport no table stacks in. */
const DESKTOP = { width: 1200, height: 900 }

/** A viewport every stackable table stacks in. */
const MOBILE = { width: 500, height: 900 }

/** Shadow markup of a scrolling element. */
const SCROLLER = `<div class="short scrolling scroller" part="scroller" tabindex="0" role="region" aria-label="People"><slot></slot></div>`

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height)
})

describe("ui-table.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(tableRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(tableRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(tableRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("table"))).toBe(true)
  })

  it("parses with replaceSync, keeping host, scroller, container and style-query rules", () => {
    for (const css of [tableCSS, tableRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.length).toBeGreaterThan(100)
      expect(selectors).toContain(":host")
      expect(selectors.some((selector) => selector.includes(".scrolling.scroller"))).toBe(true)
      expect(css).toMatch(/@container \(width < 768px\)/)
      expect(css).toMatch(/@container not style\(--_table-hosted: ?1\)/)
    }
  })

  it("covers every class phrase the vocabulary can emit", () => {
    const css = tableRaw + colorsCSS
    for (const phrase of Sheets.classPhrases(tableVocabulary)) expect(covers(css, phrase), phrase).toBe(true)
  })
})

describe("ui-table.css on class-grammar examples", () => {
  it.each(Object.keys(EXAMPLES))("styles every table in %s", (path) => {
    Sheets.adopt([...foundationCSS, tableCSS])
    const root = Fixture.render(EXAMPLES[path]!)
    const tables = root.querySelectorAll<HTMLTableElement>(".ui.table")
    expect(tables.length).toBeGreaterThan(0)
    for (const table of tables) {
      const style = getComputedStyle(table)
      expect(["table", "block"], table.className).toContain(style.display)
      expect(style.borderCollapse).toBe(table.matches(".structured") ? "collapse" : "separate")
      const header = table.querySelector("thead th")
      if (header && !table.matches(".basic, .definition, .sortable, .inverted"))
        expect(getComputedStyle(header).fontWeight).toBe("700")
      const cell = table.querySelector<HTMLElement>("tbody td")!
      expect(parseFloat(getComputedStyle(cell).paddingTop), table.className).toBeGreaterThan(0)
    }
  })

  it("draws cell borders when celled, none on the first cell", () => {
    Sheets.adopt([...foundationCSS, tableCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const [first, second] = root.querySelector(".ui.celled.table:not(.sortable) tbody tr")!.children
    expect(getComputedStyle(second!).borderLeftStyle).toBe("solid")
    expect(getComputedStyle(first!).borderLeftStyle).toBe("none")
    const plain = root.querySelector(".ui.fixed.table tbody td + td")!
    expect(getComputedStyle(plain).borderLeftStyle).toBe("none")
  })

  it("takes a public token from a wrapper (static markup)", () => {
    Sheets.adopt([...foundationCSS, tableCSS])
    const root = Fixture.render(
      `<div style="--ui-table-radius: 12px"><table class="ui table"><tbody><tr><td>A</td></tr></tbody></table></div>`
    )
    expect(getComputedStyle(root.querySelector("table")!).borderTopLeftRadius).toBe("12px")
  })

  it("stripes even body rows", () => {
    Sheets.adopt([...foundationCSS, tableCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const [odd, even] = root.querySelectorAll(".ui.striped.table tbody tr")
    expect(getComputedStyle(odd!).backgroundColor).toBe("rgba(0, 0, 0, 0)")
    expect(getComputedStyle(even!).backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
  })

  it("highlights the definition column and blanks the corner", () => {
    Sheets.adopt([...foundationCSS, tableCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const table = root.querySelector(".ui.definition.table")!
    const definition = getComputedStyle(table.querySelector("tbody td")!)
    expect(definition.fontWeight).toBe("700")
    expect(definition.backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
    const corner = getComputedStyle(table.querySelector("thead tr > :first-child")!)
    expect(corner.backgroundColor).toBe(
      getComputedStyle(Fixture.render(`<i style="color: var(--ui-background)"></i>`)).color
    )
  })

  it("paints row and cell states, colours and marks from their tokens", () => {
    Sheets.adopt([...foundationCSS, tableCSS])
    const root = Fixture.render(EXAMPLES["./examples/states.html"]!)
    const token = (name: string) => getComputedStyle(Fixture.render(`<i style="color: var(${name})"></i>`)).color
    const positive = root.querySelector<HTMLElement>(".ui.table:not(.inverted) tr.positive")!
    expect(getComputedStyle(positive).backgroundColor).toBe(token("--ui-positive-background"))
    expect(getComputedStyle(positive).color).toBe(token("--ui-positive-text"))
    const red = root.querySelector<HTMLElement>("tr.red")!
    expect(getComputedStyle(red).backgroundColor).toBe(token("--ui-red-background"))
    const blueCell = root.querySelector<HTMLElement>("td.blue")!
    expect(getComputedStyle(blueCell).color).toBe(token("--ui-blue-text"))
    const marked = root.querySelector<HTMLElement>("td.left.red.marked")!
    expect(getComputedStyle(marked).boxShadow).toContain("inset")
    expect(getComputedStyle(marked).backgroundColor).toBe("rgba(0, 0, 0, 0)")
    // `red colored right blue marked`:  a red fill AND a blue edge
    const both = getComputedStyle(root.querySelector<HTMLElement>("td.colored.marked")!)
    expect(both.backgroundColor).toBe(token("--ui-red-background"))
    expect(both.boxShadow).toContain(token("--ui-blue"))
    const disabled = root.querySelector<HTMLElement>("tr.disabled td")!
    expect(getComputedStyle(disabled).pointerEvents).toBe("none")
  })

  it("inverts to the dark scheme;  a coloured inverted table fills with its colour", () => {
    Sheets.adopt([...foundationCSS, tableCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const inverted = root.querySelector<HTMLElement>(".ui.inverted.table:not(.blue)")!
    expect(getComputedStyle(inverted).colorScheme).toBe("dark")
    const blue = root.querySelector<HTMLElement>(".ui.inverted.blue.table")!
    const fill = getComputedStyle(
      Fixture.render(`<i class="ui-dark" style="color-scheme: dark; color: var(--ui-blue)"></i>`)
    ).color
    expect(getComputedStyle(blue).backgroundColor).toBe(fill)
  })

  it("edges a coloured table in its colour", () => {
    Sheets.adopt([...foundationCSS, tableCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const red = getComputedStyle(root.querySelector(".ui.red.table")!)
    expect(parseFloat(red.borderTopWidth)).toBeCloseTo(0.2 * 16, 0)
    expect(red.borderTopColor).not.toBe(red.borderLeftColor)
  })

  it("scales by size;  basic and very basic drop fills and edges", () => {
    Sheets.adopt([...foundationCSS, tableCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const size = (selector: string) => parseFloat(getComputedStyle(root.querySelector(selector)!).fontSize)
    expect(size(".ui.small.table")).toBeLessThan(size(".ui.fixed.table"))
    expect(size(".ui.large.table")).toBeGreaterThan(size(".ui.fixed.table"))
    const basicHeader = getComputedStyle(root.querySelector(".ui.basic.table:not([class*='very']) th")!)
    expect(basicHeader.backgroundColor).toBe("rgba(0, 0, 0, 0)")
    const veryBasic = getComputedStyle(root.querySelector(".ui[class*='very basic'].table")!)
    expect(veryBasic.borderTopStyle).toBe("none")
    expect(getComputedStyle(root.querySelector(".ui[class*='very basic'].table td")!).paddingLeft).toBe("0px")
  })

  it("makes stuck parts sticky and the static scrollers scroll", () => {
    Sheets.adopt([...foundationCSS, tableCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const stuck = root.querySelector<HTMLTableElement>(".ui.head.stuck.table")!
    expect(getComputedStyle(stuck.tHead!).position).toBe("sticky")
    expect(getComputedStyle(stuck.querySelector("tbody td:first-child")!).position).toBe("sticky")
    expect(getComputedStyle(stuck).display).toBe("block")
    expect(getComputedStyle(stuck).overflow).toBe("auto")
    const scrolling = root.querySelector<HTMLTableElement>(".ui.scrolling.table")!
    const body = getComputedStyle(scrolling.tBodies[0]!)
    expect(body.display).toBe("block")
    expect(body.overflowY).toBe("scroll")
    expect(scrolling.tBodies[0]!.scrollHeight).toBeGreaterThan(scrolling.tBodies[0]!.clientHeight)
    const long = root.querySelector<HTMLTableElement>(".ui.long.scrolling.table")!
    expect(parseFloat(getComputedStyle(long.tBodies[0]!).maxHeight)).toBeCloseTo(2 * parseFloat(body.maxHeight), 0)
  })

  it("draws the sort caret on the sorted header only;  an opted-out header has no pointer", () => {
    Sheets.adopt([...foundationCSS, tableCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const [name, status, , notes] = root.querySelectorAll(".ui.sortable.table th")
    expect(getComputedStyle(status!, "::after").display).toBe("inline-block")
    expect(getComputedStyle(status!, "::after").maskImage).toContain("data:image/svg+xml")
    expect(getComputedStyle(name!, "::after").display).toBe("none")
    expect(getComputedStyle(name!).cursor).toBe("pointer")
    expect(getComputedStyle(notes!).cursor).toBe("auto")
    const button = getComputedStyle(name!.querySelector("button")!)
    expect(button.backgroundColor).toBe("rgba(0, 0, 0, 0)")
    expect(button.borderTopStyle).toBe("none")
  })

  it("stacks rows on a narrow VIEWPORT (static markup), unless unstackable", async () => {
    await page.viewport(MOBILE.width, MOBILE.height)
    Sheets.adopt([...foundationCSS, tableCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const cell = (selector: string) => getComputedStyle(root.querySelector(`${selector} tbody td`)!)
    expect(cell(".ui.stackable.table").display).toBe("block")
    expect(cell(".ui[class*='tablet stackable'].table").display).toBe("block")
    expect(cell(".ui.unstackable.table").display).toBe("table-cell")
    expect(cell(".ui.celled.table:not(.sortable)").borderLeftStyle).toBe("none")
  })

  it("stacks `tablet stackable` below 992px only", async () => {
    await page.viewport(900, 900)
    Sheets.adopt([...foundationCSS, tableCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const cell = (selector: string) => getComputedStyle(root.querySelector(`${selector} tbody td`)!)
    expect(cell(".ui[class*='tablet stackable'].table").display).toBe("block")
    expect(cell(".ui.stackable:not([class*='tablet']).table").display).toBe("table-cell")
  })
})

describe("ui-table.css as the page sheet of an un-upgraded <ui-table>", () => {
  it("gives the bare slotted table the base look", () => {
    Sheets.adopt([...foundationCSS, tableCSS])
    const host = Fixture.render(
      `<ui-table><table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr>` +
        `<tr><td>3</td><td>4</td></tr></tbody></table></ui-table>`
    )
    const table = host.querySelector("table")!
    const style = getComputedStyle(table)
    expect(style.borderCollapse).toBe("separate")
    expect(style.borderTopStyle).toBe("solid")
    expect(getComputedStyle(table.querySelector("th")!).fontWeight).toBe("700")
    expect(getComputedStyle(table.querySelector("th")!).backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
    expect(getComputedStyle(table.querySelectorAll("tbody tr")[1]!.firstElementChild!).borderTopStyle).toBe("solid")
  })
})

describe("ui-table.css in a shadow root", () => {
  it("makes the host a block size container and the scrolling scroller a capped scrollport", () => {
    Sheets.adopt([...foundationCSS, tableCSS])
    const rows = Array.from({ length: 30 }, (_, index) => `<tr><td>${index}</td></tr>`).join("")
    const host = Fixture.render(
      `<span><table class="ui scrolling table"><thead><tr><th>N</th></tr></thead><tbody>${rows}</tbody></table></span>`
    )
    Sheets.attach(host, SCROLLER, [...foundationCSS, tableCSS])
    const style = getComputedStyle(host)
    expect(style.display).toBe("block")
    expect(style.containerType).toBe("inline-size")
    const scroller = Sheets.inner(host)
    expect(getComputedStyle(scroller).overflowY).toBe("auto")
    expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight)
    // hosted:  the head sticks inside the scroller, the body is not Fomantic's block scroller
    const table = host.querySelector("table")!
    expect(getComputedStyle(table.tHead!).position).toBe("sticky")
    expect(getComputedStyle(table.tBodies[0]!).display).toBe("table-row-group")
  })
})

/**
 * `css` styles `phrase`:  Fomantic's multi-word `[class*="..."]` phrases (`very short`, `tablet stackable`)
 * count for their words, the rest must appear as class selectors -- `Sheets.covers()` only takes a WHOLE
 * phrase as `[class*=]`.
 */
function covers(css: string, phrase: string): boolean {
  let rest = ` ${phrase} `
  for (const [, quoted] of css.matchAll(/\[class\*="([^"]+)"\]/g)) {
    if (quoted!.includes(" ")) rest = rest.replace(` ${quoted} `, " ")
  }
  return Sheets.covers(css, rest.trim() || phrase)
}
