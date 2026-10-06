import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"
import { Viewport } from "$/ui/test/Viewport"

import { gridVocabulary } from "./ui-grid.vocabulary.en"
import { columnVocabulary } from "./ui-column.vocabulary.en"
import { rowVocabulary } from "./ui-row.vocabulary.en"

import gridCSS from "./ui-grid.css?inline"
import gridRaw from "./ui-grid.css?raw"

/**
 * `ui-grid.css` on its own, before any element exists:  the sheet's source rules, the computed layout of the
 * light-DOM examples (the same class grammar the shadow roots will use), and -- the part static markup can't
 * show -- columns in their OWN shadow roots, slotted through row and grid shadow roots, taking their widths and
 * responsive behaviour from inherited tokens and the grid host's container.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

////////////////
// ## Source
////////////////

describe("ui-grid.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(gridRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(gridRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(gridRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("grid"))).toBe(true)
  })

  it("parses with replaceSync, keeping host-position rules, container queries and inlined breakpoints", () => {
    for (const css of [gridCSS, gridRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.length).toBeGreaterThan(150)
      expect(selectors.some((selector) => selector.includes(":host(:first-child) > .ui.column"))).toBe(true)
      expect(css).toMatch(/@container \(width ?< ?768px\)/)
      expect(css).toMatch(/@container style\(--_grid-stackable: ?1\)/)
    }
    expect(gridCSS).not.toContain("--ui-mobile")
    expect(gridCSS).toMatch(/width\s*>=\s*1920px|min-width:\s*1920px/)
  })

  it("covers every class word the vocabularies can emit", () => {
    const css = gridRaw + colorsCSS
    for (const vocabulary of [gridVocabulary, rowVocabulary, columnVocabulary]) {
      for (const phrase of Sheets.classPhrases(vocabulary))
        expect(Sheets.covers(css, phrase), `${vocabulary.tag}: ${phrase}`).toBe(true)
    }
  })

  it("has a width rule for every column count and every device", () => {
    for (const word of ["one", "four", "nine", "sixteen"]) {
      expect(gridRaw).toContain(`[class*="${word} column"]`)
      expect(gridRaw).toContain(`[class*="${word} wide"]`)
      for (const device of ["mobile", "tablet", "computer", "large screen", "widescreen"])
        expect(gridRaw).toContain(`[class*="${word} wide ${device}"]`)
    }
  })
})

////////////////
// ## Tokens
////////////////

describe("ui-grid.css tokens", () => {
  it("takes a public token from a wrapper or the grid itself;  columns follow (static markup)", () => {
    Sheets.adopt([...foundationCSS, gridCSS])
    const root = Fixture.render(
      `<div style="--ui-grid-gutter: 40px"><div class="ui grid"><div class="ui column">A</div></div></div>` +
        `<div><div class="ui celled grid" style="--ui-grid-celled-padding: 7px"><div class="ui column">B</div></div></div>`
    )
    const grid = root.querySelector<HTMLElement>(".ui.grid")!
    expect(getComputedStyle(grid).marginLeft).toBe("-20px")
    expect(getComputedStyle(grid.firstElementChild!).paddingLeft).toBe("20px")
    expect(getComputedStyle(root.nextElementSibling!.querySelector(".column")!).paddingTop).toBe("7px")
  })
})

////////////////
// ## Examples
////////////////

describe("ui-grid.css examples", () => {
  it.each(Object.keys(EXAMPLES))("lays out every column in %s", (path) => {
    Sheets.adopt([...foundationCSS, gridCSS])
    const root = Fixture.render(EXAMPLES[path]!)
    const columns = root.querySelectorAll<HTMLElement>(".ui.column:not(.grid, .row)")
    expect(columns.length).toBeGreaterThan(0)
    for (const column of columns) {
      if (!column.checkVisibility()) continue
      const style = getComputedStyle(column)
      expect(style.position, column.outerHTML.slice(0, 80)).toBe("relative")
      expect(style.boxSizing).toBe("border-box")
      expect(column.getBoundingClientRect().width).toBeGreaterThan(0)
    }
    for (const grid of root.querySelectorAll<HTMLElement>(".ui.grid")) {
      if (!grid.checkVisibility()) continue
      expect(getComputedStyle(grid).display).toBe("flex")
      expect(getComputedStyle(grid).flexWrap).toBe("wrap")
    }
  })

  it("sizes columns by width, by count, by row count and as an only child", () => {
    Sheets.adopt([...foundationCSS, gridCSS])
    const root = Fixture.render(`<div style="width: 800px">${EXAMPLES["./examples/variations.html"]}</div>`)
    const [four, eight, lastFour] = sizes(root, "section:nth-of-type(2) .ui.grid > .column")
    const width = (selector: string) => root.querySelector(selector)!.getBoundingClientRect().width
    const grid = width("section:nth-of-type(2) .ui.grid")
    expect(four! / grid).toBeCloseTo(0.25, 3)
    expect(eight! / grid).toBeCloseTo(0.5, 3)
    expect(lastFour! / grid).toBeCloseTo(0.25, 3)
    const five = width(".ui.five.column.grid")
    for (const column of sizes(root, ".ui.five.column.grid > .column")) expect(column / five).toBeCloseTo(0.2, 3)
    const two = width(".ui.two.column.grid")
    expect(sizes(root, ".ui.two.column.grid > .column")[0]! / two).toBeCloseTo(0.5, 3)
    expect(sizes(root, ".ui.four.column.row > .column")[0]! / two).toBeCloseTo(0.25, 3)
    const content = Fixture.render(`<div style="width: 800px">${EXAMPLES["./examples/content.html"]}</div>`)
    const only = content.querySelector<HTMLElement>("section:nth-of-type(3) .column")!
    expect(only.getBoundingClientRect().width).toBeCloseTo(only.parentElement!.getBoundingClientRect().width, 0)
    const sixteenth = content.querySelector<HTMLElement>("section:nth-of-type(2) .column")!
    expect(
      sixteenth.getBoundingClientRect().width / sixteenth.parentElement!.getBoundingClientRect().width
    ).toBeCloseTo(1 / 16, 3)
  })

  it("pulls gutters out with negative margins, relaxes, compacts and pads them", () => {
    Sheets.adopt([...foundationCSS, gridCSS])
    const root = Fixture.render(`<div style="width: 800px">${EXAMPLES["./examples/variations.html"]}</div>`)
    const style = (selector: string) => getComputedStyle(root.querySelector(selector)!)
    const plain = style("section:nth-of-type(2) .ui.grid")
    expect(plain.marginLeft).toBe("-16px")
    expect(plain.marginTop).toBe("-16px")
    expect(style("section:nth-of-type(2) .ui.grid > .column").paddingLeft).toBe("16px")
    expect(style(".ui.relaxed.grid:not(.very) > .column").paddingLeft).toBe("24px")
    expect(style(".ui.very.relaxed.grid > .column").paddingLeft).toBe("40px")
    expect(style(".ui.compact.grid:not(.very) > .column").paddingLeft).toBe("8px")
    expect(style(".ui.very.compact.grid > .column").paddingTop).toBe("4px")
    expect(style(".ui.padded.grid:not(.horizontally, .vertically)").marginLeft).toBe("0px")
    expect(style(".ui.horizontally.padded.grid").marginLeft).toBe("0px")
    expect(style(".ui.horizontally.padded.grid").marginTop).toBe("-16px")
    expect(style(".ui.vertically.padded.grid").marginTop).toBe("0px")
  })

  it("draws dividers and cells, skipping each line's first column", () => {
    Sheets.adopt([...foundationCSS, gridCSS])
    const root = Fixture.render(`<div style="width: 800px">${EXAMPLES["./examples/types.html"]}</div>`)
    const style = (selector: string, pseudo?: string) => getComputedStyle(root.querySelector(selector)!, pseudo)
    expect(style(".ui.divided.grid > .row > .column:first-child").boxShadow).toBe("none")
    expect(style(".ui.divided.grid > .row > .column:nth-child(2)").boxShadow).toMatch(/-1px 0px 0px 0px/)
    expect(style(".ui.vertically.divided.grid > .row:nth-child(2)", "::before").boxShadow).toMatch(/0px -1px/)
    expect(style(".ui.vertically.divided.grid > .row:first-child", "::before").boxShadow).toBe("none")
    expect(style(".ui.vertically.divided.grid > .row > .column").marginTop).toBe("0px")
    expect(style(".ui.vertically.divided.grid > .row:nth-child(2) > .column").marginTop).toBe("16px")
    const celled = style(".ui.celled.grid:not(.internally)")
    expect(celled.boxShadow).toMatch(/0px 0px 0px 1px/)
    expect(celled.marginLeft).toBe("0px")
    expect(style(".ui.celled.grid:not(.internally) > .row").boxShadow).toMatch(/0px -1px/)
    expect(style(".ui.celled.grid:not(.internally) > .row > .column").paddingTop).toBe("16px")
    expect(style(".ui.internally.celled.grid").boxShadow).toBe("none")
    expect(style(".ui.internally.celled.grid > .row:first-child").boxShadow).toBe("none")
    expect(style(".ui.internally.celled.grid > .row:nth-child(2)").boxShadow).toMatch(/0px -1px/)
  })

  it("aligns, floats, centres, stretches and grows columns", () => {
    Sheets.adopt([...foundationCSS, gridCSS])
    const root = Fixture.render(`<div style="width: 800px">${EXAMPLES["./examples/variations.html"]}</div>`)
    const style = (selector: string) => getComputedStyle(root.querySelector(selector)!)
    expect(style(".ui.left.floated.column").marginRight).not.toBe("0px")
    expect(style(".ui.right.floated.column").marginLeft).not.toBe("0px")
    const right = root.querySelector(".ui.right.floated.column")!.getBoundingClientRect().right
    expect(right).toBeCloseTo(
      root.querySelector(".ui.right.floated.column")!.parentElement!.getBoundingClientRect().right,
      0
    )
    expect(style(".ui.centered.grid").justifyContent).toBe("center")
    expect(style(".ui.centered.grid > .column").textAlign).toBe("left")
    expect(style(".ui.centered.eight.wide.column").marginLeft).toBe(style(".ui.centered.eight.wide.column").marginRight)
    expect(style(".ui.center.aligned.grid > .column:first-child").textAlign).toBe("center")
    expect(style(".ui.center.aligned.grid > .left.aligned.column").textAlign).toBe("left")
    expect(style(".ui.center.aligned.grid > .justified.column").textAlign).toBe("justify")
    expect(style(".ui.middle.aligned.grid > .column:first-child").alignSelf).toBe("center")
    expect(style(".ui.middle.aligned.grid > .top.aligned.column").alignSelf).toBe("flex-start")
    const stretched = sizes(root, ".ui.stretched.grid > .column", "height")
    expect(Math.max(...stretched) - Math.min(...stretched)).toBeLessThan(1)
    // `inline-flex`, blockified as a flex item.
    expect(style(".ui.stretched.grid > .column").display).toBe("flex")
    const [first, wide, third] = sizes(root, ".ui.equal.width.grid > .column")
    expect(first).toBeCloseTo(third!, 0)
    expect(wide! / root.querySelector(".ui.equal.width.grid")!.getBoundingClientRect().width).toBeCloseTo(0.5, 2)
    const row = sizes(root, ".ui.equal.width.row > .column")
    expect(Math.max(...row) - Math.min(...row)).toBeLessThan(1)
    expect(style(".ui.left.attached.column").paddingRight).toBe("0px")
  })

  it("fills coloured rows and columns, never plain ones", () => {
    Sheets.adopt([...foundationCSS, gridCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const red = Fixture.render(`<span style="color: var(--ui-red)"></span>`)
    expect(getComputedStyle(root.querySelector(".ui.red.column")!).backgroundColor).toBe(getComputedStyle(red).color)
    const plain = root.querySelector(".ui.five.column.grid > .column:not(.red, .orange, .teal, .blue)")!
    expect(getComputedStyle(plain).backgroundColor).toBe("rgba(0, 0, 0, 0)")
    expect(getComputedStyle(root.querySelector(".ui.violet.row")!).backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
    const inverted = getComputedStyle(root.querySelector(".ui.inverted.grid > .row > .column:nth-child(2)")!)
    expect(inverted.boxShadow).toMatch(/-1px/)
  })

  it("stacks, doubles, reverses and re-sizes columns by the grid's width", () => {
    Sheets.adopt([...foundationCSS, gridCSS])
    const root = Fixture.render(EXAMPLES["./examples/responsive.html"]!)
    // the example's wrappers (850px, 1000px) clamp to their column:  give it room
    root.style.width = "1100px"
    const stacked = root.querySelectorAll<HTMLElement>(".ui.stackable.grid > .column")
    const stackWidth = stacked[0]!.parentElement!.getBoundingClientRect().width
    for (const column of stacked) expect(column.getBoundingClientRect().width).toBeCloseTo(stackWidth, 0)
    expect(getComputedStyle(stacked[0]!).borderTopStyle).toBe("none")
    expect(getComputedStyle(stacked[1]!).borderTopStyle).toBe("solid")
    expect(getComputedStyle(stacked[1]!).boxShadow).toBe("none")
    const tablet = root.querySelector<HTMLElement>(".ui.doubling.four.column.grid")!
    expect(
      sizes(root, ".ui.doubling.four.column.grid > .column")[0]! / tablet.getBoundingClientRect().width
    ).toBeCloseTo(0.5, 3)
    const mobile = root.querySelector<HTMLElement>(".ui.doubling.six.column.grid")!
    expect(
      sizes(root, ".ui.doubling.six.column.grid > .column")[0]! / mobile.getBoundingClientRect().width
    ).toBeCloseTo(0.5, 3)
    const [first, , third] = root.querySelectorAll<HTMLElement>(".ui.mobile.reversed.grid > .column")
    expect(getComputedStyle(first!.parentElement!).flexDirection).toBe("row-reverse")
    expect(first!.getBoundingClientRect().left).toBeGreaterThan(third!.getBoundingClientRect().left)
    const row = root.querySelectorAll<HTMLElement>(".ui.mobile.reversed.row > .column")
    expect(row[0]!.getBoundingClientRect().left).toBeGreaterThan(row[2]!.getBoundingClientRect().left)
    expect(getComputedStyle(row[0]!).boxShadow).toMatch(/-1px/)
    expect(getComputedStyle(row[2]!).boxShadow).toBe("none")
    const [narrow] = root.querySelectorAll<HTMLElement>(".sixteen.wide.mobile.column")
    expect(narrow!.getBoundingClientRect().width).toBeCloseTo(narrow!.parentElement!.getBoundingClientRect().width, 0)
    const computer = root.querySelector<HTMLElement>(".four.wide.computer.column")!
    expect(computer.getBoundingClientRect().width / computer.parentElement!.getBoundingClientRect().width).toBeCloseTo(
      0.25,
      3
    )
  })

  it("follows the SCREEN under `--ui-stack-with: page` (static markup)", async () => {
    Sheets.adopt([...foundationCSS, gridCSS])
    const root = Fixture.render(EXAMPLES["./examples/responsive.html"]!)
    root.style.width = "1100px"
    root.style.setProperty("--ui-stack-with", "page")
    await Viewport.resize(1200)
    const stacked = root.querySelectorAll<HTMLElement>(".ui.stackable.grid > .column")
    const stackWidth = stacked[0]!.parentElement!.getBoundingClientRect().width
    expect(stacked[0]!.getBoundingClientRect().width).toBeLessThan(stackWidth / 2)
    const [narrow] = root.querySelectorAll<HTMLElement>(".sixteen.wide.mobile.column")
    expect(narrow!.getBoundingClientRect().width).toBeLessThan(narrow!.parentElement!.getBoundingClientRect().width)
  })

  it("shows `only` rows and columns by the viewport", () => {
    Sheets.adopt([...foundationCSS, gridCSS])
    const root = Fixture.render(EXAMPLES["./examples/responsive.html"]!)
    const shown = (selector: string) => getComputedStyle(root.querySelector(selector)!).display !== "none"
    const width = window.innerWidth
    expect(shown(".ui.mobile.only.two.column.row")).toBe(width < 768)
    expect(shown(".ui.mobile.only.tablet.only.row")).toBe(width < 992)
    expect(shown(".ui.computer.only.row")).toBe(width >= 992)
    expect(shown(".ui.large.screen.only.column")).toBe(width >= 1200)
    expect(shown(".ui.widescreen.only.column")).toBe(width >= 1920)
    if (shown(".ui.mobile.only.two.column.row"))
      expect(getComputedStyle(root.querySelector(".ui.mobile.only.two.column.row")!).display).toBe("flex")
  })
})

////////////////
// ## In shadow roots
////////////////

describe("ui-grid.css in shadow roots", () => {
  it("lays out slotted column hosts by their own width:  4 / 8 / 4 => 25% / 50% / 25%", () => {
    Sheets.adopt(foundationCSS)
    const frame = Fixture.render(`<div style="width: 800px"></div>`)
    const grid = host(frame, `<div class="ui grid" part="grid"><slot></slot></div>`)
    const columns = ["four", "eight", "four"].map((word) =>
      Sheets.inner(host(grid, `<div class="ui ${word} wide column" part="column"><slot></slot></div>`))
    )
    expect(getComputedStyle(grid).display).toBe("block")
    expect(getComputedStyle(grid).containerType).toBe("inline-size")
    expect(getComputedStyle(grid.children[0]!).display).toBe("contents")
    const total = Sheets.inner(grid).getBoundingClientRect().width
    expect(total).toBeCloseTo(832, 0)
    expect(columns.map((column) => column.getBoundingClientRect().width / total)).toEqual([
      expect.closeTo(0.25, 3),
      expect.closeTo(0.5, 3),
      expect.closeTo(0.25, 3)
    ])
    expect(columns[1]!.getBoundingClientRect().top).toBe(columns[0]!.getBoundingClientRect().top)
  })

  it("hands a grid's and a row's count, gutters and dividers to columns in rows, through three shadow roots", () => {
    Sheets.adopt(foundationCSS)
    const frame = Fixture.render(`<div style="width: 800px"></div>`)
    const grid = host(frame, `<div class="ui divided relaxed three column grid" part="grid"><slot></slot></div>`)
    const row = host(grid, `<div class="ui row" part="row"><slot></slot></div>`)
    const counted = host(grid, `<div class="ui four column row" part="row"><slot></slot></div>`)
    const inRow = [1, 2, 3].map(() => Sheets.inner(host(row, `<div class="ui column"><slot></slot></div>`)))
    const inCounted = [1, 2].map(() => Sheets.inner(host(counted, `<div class="ui column"><slot></slot></div>`)))
    const width = Sheets.inner(row).getBoundingClientRect().width
    expect(inRow[0]!.getBoundingClientRect().width / width).toBeCloseTo(1 / 3, 3)
    expect(inCounted[0]!.getBoundingClientRect().width / width).toBeCloseTo(1 / 4, 3)
    expect(getComputedStyle(inRow[0]!)).toMatchObject({ paddingLeft: "24px", paddingTop: "0px", boxShadow: "none" })
    expect(getComputedStyle(inRow[1]!).boxShadow).toMatch(/-1px 0px 0px 0px/)
    expect(getComputedStyle(Sheets.inner(row)).paddingTop).toBe("16px")
  })

  it("keeps a nested grid, a column's colour and its content clean of inherited layout", () => {
    Sheets.adopt(foundationCSS)
    // Wide enough that 1/16 of the nested grid beats a column's own gutter padding.
    const frame = Fixture.render(`<div style="width: 1600px"></div>`)
    const grid = host(frame, `<div class="ui two column grid"><slot></slot></div>`)
    const red = host(grid, `<div class="ui red eight wide column"><slot></slot></div>`)
    const plain = Sheets.inner(host(grid, `<div class="ui column"><slot></slot></div>`))
    const nested = host(red, `<div class="ui grid"><slot></slot></div>`)
    const inner = [1, 2].map(() => Sheets.inner(host(nested, `<div class="ui column"><slot></slot></div>`)))
    const probe = document.createElement("span")
    red.append(probe)
    expect(getComputedStyle(nested).display).toBe("block")
    expect(getComputedStyle(nested).containerType).toBe("inline-size")
    const nestedWidth = Sheets.inner(nested).getBoundingClientRect().width
    expect(inner[0]!.getBoundingClientRect().width / nestedWidth).toBeCloseTo(1 / 16, 3)
    const redColor = Fixture.render(`<span style="color: var(--ui-red)"></span>`)
    expect(getComputedStyle(Sheets.inner(red)).backgroundColor).toBe(getComputedStyle(redColor).color)
    expect(getComputedStyle(plain).backgroundColor).toBe("rgba(0, 0, 0, 0)")
    expect(getComputedStyle(inner[0]!).backgroundColor).toBe("rgba(0, 0, 0, 0)")
    expect(getComputedStyle(probe).getPropertyValue("--ui-color").trim()).toBe("")
  })

  it("stacks and reverses slotted columns by the grid host's width", () => {
    Sheets.adopt(foundationCSS)
    const frame = Fixture.render(`<div style="width: 600px"></div>`)
    const grid = host(frame, `<div class="ui stackable mobile reversed three column grid"><slot></slot></div>`)
    const columns = [1, 2, 3].map(() => Sheets.inner(host(grid, `<div class="ui column"><slot></slot></div>`)))
    const width = Sheets.inner(grid).getBoundingClientRect().width
    for (const column of columns) expect(column.getBoundingClientRect().width).toBeCloseTo(width, 0)
    expect(getComputedStyle(Sheets.inner(grid)).flexDirection).toBe("column-reverse")
    expect(columns[0]!.getBoundingClientRect().top).toBeGreaterThan(columns[2]!.getBoundingClientRect().top)
    frame.style.width = "1000px"
    expect(columns[0]!.getBoundingClientRect().width / Sheets.inner(grid).getBoundingClientRect().width).toBeCloseTo(
      1 / 3,
      3
    )
    expect(getComputedStyle(Sheets.inner(grid)).flexDirection).toBe("row")
  })
})

/** Append a fixture `<span>` host to `parent`, with an open shadow root adopting the grid sheets and `html`. */
function host(parent: Element, html: string): HTMLElement {
  const element = document.createElement("span")
  parent.append(element)
  Sheets.attach(element, html, [...foundationCSS, gridCSS])
  return element
}

/** Border-box `width` / `height` of every match of `selector` in `root`. */
function sizes(root: Element, selector: string, axis: "width" | "height" = "width"): number[] {
  return [...root.querySelectorAll(selector)].map((element) => element.getBoundingClientRect()[axis])
}
