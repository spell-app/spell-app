import { describe, expect, it, onTestFinished } from "vitest"

import { GRID_CONTAINER_NAME } from "$/ui/components/components.types"
import { expectAccessible } from "$/ui/test/a11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import "$/ui/components/ui-grid"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-grid/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** The root of `host`'s shadow. */
function rootOf(host: Element): HTMLElement {
  return host.shadowRoot!.firstElementChild as HTMLElement
}

/** Render `html` in a box `width` px wide;  returns the box. */
function inBox(width: number, html: string) {
  return ElementFixture.render<HTMLElement>(`<div style="width: ${width}px">${html}</div>`)
}

/** Width of each `<ui-column>` root under `box`, as a fraction of its grid root's width. */
function fractions(box: Element, grid = box.querySelector("ui-grid")!): number[] {
  const total = rootOf(grid).getBoundingClientRect().width
  return [...grid.querySelectorAll(":scope > ui-column, :scope > ui-row > ui-column")].map(
    (column) => rootOf(column).getBoundingClientRect().width / total
  )
}

describe("<ui-grid> classes", () => {
  it.each([
    ["", "ui grid"],
    ['columns="3"', "ui three column grid"],
    ['columns="1/4"', "ui four column grid"],
    ['columns="25%"', "ui four column grid"],
    ['columns="equal"', "ui equal width grid"],
    ["equal-width", "ui equal width grid"],
    ['divided="vertically" stackable', "ui stackable vertically divided grid"],
    ['celled="internally" relaxed="very"', "ui internally celled very relaxed grid"],
    ['padded="horizontally" compact', "ui horizontally padded compact grid"],
    ['centered="yes" doubling="no" inverted', "ui centered inverted grid"],
    ['only="mobile tablet"', "ui mobile only tablet only grid"],
    ['only="large screen"', "ui large screen only grid"],
    ['reversed="mobile tablet vertically"', "ui mobile reversed tablet vertically reversed grid"],
    ['text-align="center" vertical-align="middle"', "ui center aligned middle aligned grid"],
    ['columns="2" stretched text-align="justified"', "ui stretched two column justified grid"]
  ])("<ui-grid %s>", async (attributes, classes) => {
    const host = await ElementFixture.render<UIHost>(`<ui-grid ${attributes}></ui-grid>`)
    const root = rootOf(host)
    expect(root.localName).toBe("div")
    expect(root.className).toBe(classes)
    expect(root.getAttribute("part")).toBe("grid")
    expect(root.querySelector("slot")).not.toBeNull()
  })

  it.each([
    ["", "ui row"],
    ['color="red" columns="4"', "ui red four column row"],
    ['columns="equal" divided centered', "ui centered divided equal width row"],
    ['only="mobile" reversed="computer"', "ui mobile only computer reversed row"],
    ['text-align="right" vertical-align="bottom"', "ui right aligned bottom aligned row"]
  ])("<ui-row %s>", async (attributes, classes) => {
    const grid = await ElementFixture.render<UIHost>(`<ui-grid><ui-row ${attributes}></ui-row></ui-grid>`)
    const root = rootOf(grid.querySelector("ui-row")!)
    expect(root.className).toBe(classes)
    expect(root.getAttribute("part")).toBe("row")
  })

  it.each([
    ["", "ui column"],
    ['width="4"', "ui four wide column"],
    ['width="1/4"', "ui four wide column"],
    ['width="25%"', "ui four wide column"],
    ['width="sixteen"', "ui sixteen wide column"],
    ['width="4" width-mobile="16"', "ui four wide sixteen wide mobile column"],
    [
      'width-tablet="8" width-computer="4" width-large="3" width-widescreen="2"',
      "ui eight wide tablet four wide computer three wide large screen two wide widescreen column"
    ],
    ['color="teal" floated="right" attached="left"', "ui teal right floated left attached column"],
    ['centered stretched="no"', "ui centered column"],
    ['only="computer" text-align="center"', "ui computer only center aligned column"]
  ])("<ui-column %s>", async (attributes, classes) => {
    const grid = await ElementFixture.render<UIHost>(`<ui-grid><ui-column ${attributes}></ui-column></ui-grid>`)
    const root = rootOf(grid.querySelector("ui-column")!)
    expect(root.className).toBe(classes)
    expect(root.getAttribute("part")).toBe("column")
  })

  it("follows width changes", async () => {
    const grid = await ElementFixture.render<UIHost>(`<ui-grid><ui-column width="4"></ui-column></ui-grid>`)
    const column = grid.querySelector("ui-column")!
    column.setAttribute("width", "1/2")
    await ElementFixture.tick()
    expect(rootOf(column).className).toBe("ui eight wide column")
  })
})

describe("<ui-grid> layout across shadow roots", () => {
  it("makes the top-level grid host the size container, and slotted rows / columns boxless", async () => {
    const box = await inBox(800, `<ui-grid><ui-row><ui-column>A</ui-column></ui-row></ui-grid>`)
    const grid = box.querySelector("ui-grid")!
    expect(getComputedStyle(grid).display).toBe("block")
    expect(getComputedStyle(grid).containerName).toBe(GRID_CONTAINER_NAME)
    expect(getComputedStyle(box.querySelector("ui-row")!).display).toBe("contents")
    expect(getComputedStyle(box.querySelector("ui-column")!).display).toBe("contents")
    expect(getComputedStyle(rootOf(grid)).display).toBe("flex")
  })

  it("sizes columns by their own width:  4 / 8 / 4 => 25% / 50% / 25%", async () => {
    const box = await inBox(
      800,
      `<ui-grid><ui-column width="4">A</ui-column><ui-column width="8">B</ui-column>` +
        `<ui-column width="4">C</ui-column></ui-grid>`
    )
    const [a, b, c] = fractions(box)
    expect(a).toBeCloseTo(0.25, 3)
    expect(b).toBeCloseTo(0.5, 3)
    expect(c).toBeCloseTo(0.25, 3)
    // one line
    const tops = [...box.querySelectorAll("ui-column")].map((column) => rootOf(column).getBoundingClientRect().top)
    expect(new Set(tops).size).toBe(1)
  })

  it("takes the fraction and percentage forms as the same widths", async () => {
    const box = await inBox(
      800,
      `<ui-grid><ui-column width="1/4">A</ui-column><ui-column width="50%">B</ui-column>` +
        `<ui-column width="four">C</ui-column></ui-grid>`
    )
    expect(fractions(box).map((fraction) => fraction.toFixed(3))).toEqual(["0.250", "0.500", "0.250"])
  })

  it("hands the grid's count to columns in rows, and a row's own count wins", async () => {
    const box = await inBox(
      800,
      `<ui-grid columns="4"><ui-row><ui-column>A</ui-column><ui-column>B</ui-column></ui-row>` +
        `<ui-row columns="2"><ui-column>C</ui-column><ui-column>D</ui-column></ui-row></ui-grid>`
    )
    const [a, b, c, d] = fractions(box)
    expect(a).toBeCloseTo(0.25, 3)
    expect(b).toBeCloseTo(0.25, 3)
    expect(c).toBeCloseTo(0.5, 3)
    expect(d).toBeCloseTo(0.5, 3)
  })

  it("shares an equal-width line", async () => {
    const box = await inBox(
      900,
      `<ui-grid columns="equal"><ui-column>A</ui-column><ui-column>B</ui-column><ui-column>C</ui-column></ui-grid>`
    )
    for (const fraction of fractions(box)) expect(fraction).toBeCloseTo(1 / 3, 2)
  })

  it("keeps a nested grid clean of its parent's column count", async () => {
    const box = await inBox(
      800,
      `<ui-grid columns="4"><ui-column width="16"><ui-grid><ui-column width="8">In</ui-column></ui-grid>` +
        `</ui-column></ui-grid>`
    )
    const inner = box.querySelector("ui-grid ui-grid")!
    const [half] = fractions(box, inner)
    expect(half).toBeCloseTo(0.5, 3)
  })

  it("stacks a `stackable` grid in a narrow container, not in a wide one", async () => {
    const markup =
      `<ui-grid stackable columns="3"><ui-column>A</ui-column><ui-column>B</ui-column>` +
      `<ui-column>C</ui-column></ui-grid>`
    const wide = await inBox(900, markup)
    for (const fraction of fractions(wide)) expect(fraction).toBeCloseTo(1 / 3, 2)
    const narrow = await inBox(500, markup)
    for (const fraction of fractions(narrow)) expect(fraction).toBeCloseTo(1, 2)
    const tops = [...narrow.querySelectorAll("ui-column")].map((column) => rootOf(column).getBoundingClientRect().top)
    expect(new Set(tops).size).toBe(3)
  })

  it("applies per-device widths by the GRID's width, not the viewport's", async () => {
    const markup = `<ui-grid><ui-column width-computer="4" width-tablet="8" width-mobile="16">A</ui-column></ui-grid>`
    const [computer] = fractions(await inBox(1000, markup))
    const [tablet] = fractions(await inBox(800, markup))
    const [mobile] = fractions(await inBox(400, markup))
    expect(computer).toBeCloseTo(0.25, 3)
    expect(tablet).toBeCloseTo(0.5, 3)
    expect(mobile).toBeCloseTo(1, 3)
  })

  it("keeps a bare `width` outside the range of a wider device width", async () => {
    const markup = `<ui-grid><ui-column width="4" width-mobile="16">A</ui-column></ui-grid>`
    const [computer] = fractions(await inBox(1000, markup))
    const [mobile] = fractions(await inBox(400, markup))
    expect(computer).toBeCloseTo(0.25, 3)
    expect(mobile).toBeCloseTo(1, 3)
  })

  it("doubles a `doubling` grid's line count down at tablet widths", async () => {
    const markup =
      `<ui-grid doubling columns="4">` + [1, 2, 3, 4].map((n) => `<ui-column>${n}</ui-column>`).join("") + `</ui-grid>`
    const [computer] = fractions(await inBox(1000, markup))
    const [tablet] = fractions(await inBox(800, markup))
    expect(computer).toBeCloseTo(0.25, 3)
    expect(tablet).toBeCloseTo(0.5, 3)
  })

  it("reverses columns of a `reversed` grid in its range", async () => {
    const markup = `<ui-grid reversed="mobile" columns="2"><ui-column>A</ui-column><ui-column>B</ui-column></ui-grid>`
    const left = (box: Element, index: number) =>
      rootOf(box.querySelectorAll("ui-column")[index]!).getBoundingClientRect().left
    const wide = await inBox(1000, markup)
    expect(left(wide, 0)).toBeLessThan(left(wide, 1))
    const narrow = await inBox(600, markup)
    expect(left(narrow, 0)).toBeGreaterThan(left(narrow, 1))
  })

  it("fills a coloured column, never its plain neighbour", async () => {
    const box = await inBox(800, `<ui-grid><ui-column color="red">A</ui-column><ui-column>B</ui-column></ui-grid>`)
    const [red, plain] = [...box.querySelectorAll("ui-column")].map((column) => getComputedStyle(rootOf(column)))
    expect(red!.backgroundColor).not.toBe(plain!.backgroundColor)
    expect(plain!.backgroundColor).toBe("rgba(0, 0, 0, 0)")
  })
})

describe("<ui-grid celled> outer margin", () => {
  it("sits on the HOST, so it collapses with the heading above as class grammar's does", async () => {
    const box = await inBox(
      900,
      `<h4 style="margin: 0 0 10px">Heading</h4><ui-grid celled><ui-column>a</ui-column></ui-grid>` +
        `<ui-grid celled="internally"><ui-column>b</ui-column></ui-grid>`
    )
    const [celled, internally] = [...box.querySelectorAll("ui-grid")]
    expect(celled!.matches(":state(celled)")).toBe(true)
    expect(getComputedStyle(celled!).marginTop).toBe("16px")
    expect(getComputedStyle(rootOf(celled!)).marginTop).toBe("0px")
    // max(10px, 16px), not their sum
    expect(
      rootOf(celled!).getBoundingClientRect().top - box.querySelector("h4")!.getBoundingClientRect().bottom
    ).toBeCloseTo(16, 0)
    expect(internally!.matches(":state(celled)")).toBe(false)
    expect(getComputedStyle(internally!).marginTop).toBe("0px")
  })

  it("keeps the margin on the root of a grid slotted into a grid (a `display: contents` host)", async () => {
    const box = await inBox(900, `<ui-grid><ui-grid celled><ui-column>a</ui-column></ui-grid></ui-grid>`)
    const inner = box.querySelectorAll("ui-grid")[1]!
    expect(getComputedStyle(inner).display).toBe("contents")
    expect(getComputedStyle(rootOf(inner)).marginTop).toBe("16px")
  })
})

describe("<ui-grid> tokens from outside", () => {
  /** The inner box's margin left. */
  function measure(host: Element): string {
    return getComputedStyle(host.shadowRoot!.querySelector("[part~=grid]")!).marginLeft
  }

  /** The element under test. */
  const MARKUP = `<ui-grid><ui-column>A</ui-column></ui-grid>`

  it("takes a token set on the HOST", async () => {
    const host = await ElementFixture.render(MARKUP.replace("<ui-grid", `<ui-grid style="--ui-grid-gutter: 40px"`))
    expect(measure(host)).toBe("-20px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-grid-gutter: 40px"><div>${MARKUP}</div></section>`
    )
    expect(measure(wrapper.querySelector("ui-grid")!)).toBe("-20px")
  })

  it("takes a token set through `::part(grid)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(grid) { --ui-grid-gutter: 40px }</style>${MARKUP.replace("<ui-grid", '<ui-grid class="themed"')}</div>`
    )
    expect(measure(wrapper.querySelector("ui-grid")!)).toBe("-20px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-grid-gutter", "40px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-grid-gutter")
    })
    const host = await ElementFixture.render(MARKUP)
    expect(measure(host)).toBe("-20px")
  })

  it("keeps its defaults when nothing is set", async () => {
    const host = await ElementFixture.render(MARKUP)
    expect(measure(host)).toBe("-16px")
  })

  it("reaches the columns, set on the grid", async () => {
    const host = await ElementFixture.render(MARKUP.replace("<ui-grid", `<ui-grid style="--ui-grid-gutter: 40px"`))
    const column = host.querySelector("ui-column")!.shadowRoot!.querySelector("[part~=column]")!
    expect(getComputedStyle(column).paddingLeft).toBe("20px")
  })

  it("variations:  `relaxed` swaps in its own token, whatever the base", async () => {
    const host = await ElementFixture.render(
      `<ui-grid relaxed style="--ui-grid-gutter: 40px"><ui-column>A</ui-column></ui-grid>`
    )
    expect(measure(host)).toBe("-24px")
    host.style.setProperty("--ui-grid-relaxed-gutter", "60px")
    expect(measure(host)).toBe("-30px")
  })
})

describe("<ui-grid> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })
})
