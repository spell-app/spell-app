import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { statisticsVocabulary } from "./UIStatistics.en"
import { statisticVocabulary } from "./UIStatistic.en"

import statisticCSS from "./UIStatistic.css?inline"
import statisticRaw from "./UIStatistic.css?raw"
import partsCSS from "$/ui/components/ui-parts/UIParts.css?inline"

/**
 * `UIStatistic.css` (with `UIParts.css`, which draws the values and labels) on the class-grammar examples:
 * the sheet's source rules, the boxes, and the owner tokens a statistic hands its parts.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** Root font size in px, the unit of the value ladder. */
const BASE = 16

/** Adopt the sheets and render example `name`. */
function example(name: string): HTMLElement {
  Sheets.adopt([...foundationCSS, partsCSS, statisticCSS])
  return Fixture.render(EXAMPLES[`./examples/${name}.html`]!)
}

/** Font size in px of the value in `statistic`. */
function valueSize(statistic: Element): number {
  return parseFloat(getComputedStyle(statistic.querySelector(".value")!).fontSize)
}

////////////////
// ## Source
////////////////

describe("UIStatistic.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(statisticRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it("never uses !important", () => {
    expect(Sheets.withoutComments(statisticRaw)).not.toContain("!important")
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(statisticRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("statistic"))).toBe(true)
  })

  it("parses with replaceSync, keeping the host and container rules", () => {
    const selectors = Sheets.selectors(statisticCSS)
    expect(selectors.length).toBeGreaterThan(30)
    expect(selectors).toContain(":host(:state(statistics))")
    expect(selectors.some((selector) => selector.includes("of :state(statistic)"))).toBe(true)
  })

  it("covers every class word the vocabularies can emit", () => {
    const css = statisticRaw + colorsCSS
    for (const vocabulary of [statisticVocabulary, statisticsVocabulary]) {
      for (const phrase of Sheets.classPhrases(vocabulary))
        expect(Sheets.covers(css, phrase), `${vocabulary.tag}: ${phrase}`).toBe(true)
    }
  })
})

////////////////
// ## Examples
////////////////

describe("UIStatistic.css examples", () => {
  it("draws a statistic as a flex column with a 4x value and an uppercase label", () => {
    const root = example("types")
    const statistic = root.querySelector<HTMLElement>(".ui.statistic")!
    const style = getComputedStyle(statistic)
    expect(style.display).toBe("inline-flex")
    expect(style.flexDirection).toBe("column")
    expect(style.getPropertyValue("--_ui-statistic-layout").trim()).toBe("vertical")
    expect(valueSize(statistic)).toBeCloseTo(4 * BASE, 0)
    expect(getComputedStyle(statistic.querySelector(".label")!).textTransform).toBe("uppercase")
  })

  it("lays a group out as a wrapping row, members with the group gutters", () => {
    const root = example("types")
    const group = root.querySelector<HTMLElement>(".ui.statistics")!
    expect(getComputedStyle(group).display).toBe("flex")
    expect(getComputedStyle(group).flexWrap).toBe("wrap")
    const [first, second] = group.querySelectorAll<HTMLElement>(":scope > .statistic")
    expect(getComputedStyle(first!).marginRight).toBe("24px")
    expect(getComputedStyle(second!).marginBottom).toBe("16px")
    expect(second!.getBoundingClientRect().top).toBe(first!.getBoundingClientRect().top)
    const text = group.querySelector<HTMLElement>(".text.value")!
    expect(parseFloat(getComputedStyle(text).fontSize)).toBeCloseTo(2 * BASE, 0)
  })

  it("puts a horizontal statistic's label beside its value, on the horizontal ladder", () => {
    const root = example("variations")
    const statistic = root.querySelector<HTMLElement>(".ui.horizontal.statistic")!
    expect(getComputedStyle(statistic).flexDirection).toBe("row")
    expect(getComputedStyle(statistic).getPropertyValue("--_ui-statistic-layout").trim()).toBe("horizontal")
    expect(valueSize(statistic)).toBeCloseTo(3 * BASE, 0)
    const group = root.querySelector<HTMLElement>(".ui.horizontal.statistics")!
    expect(getComputedStyle(group).flexDirection).toBe("column")
    const member = group.querySelector<HTMLElement>(".statistic")!
    expect(getComputedStyle(member).flexDirection).toBe("row")
    expect(getComputedStyle(member).getPropertyValue("--_ui-statistic-layout").trim()).toBe("horizontal")
    expect(valueSize(member)).toBeCloseTo(3 * BASE, 0)
  })

  it("sizes values on Fomantic's ladder", () => {
    const root = example("variations")
    const size = (name: string) => valueSize(root.querySelector(`.ui.${name}.statistic`)!)
    expect(size("mini")).toBeCloseTo(1.5 * BASE, 0)
    expect(size("small")).toBeCloseTo(3 * BASE, 0)
    expect(size("large")).toBeCloseTo(5 * BASE, 0)
    expect(size("huge")).toBeCloseTo(6 * BASE, 0)
    const mini = root.querySelector(".ui.mini.statistics > .statistic")!
    expect(valueSize(mini)).toBeCloseTo(1.5 * BASE, 0)
  })

  it("colours values, and inverts to the dark scheme", () => {
    const root = example("variations")
    const red = Fixture.render(`<span style="color: var(--ui-red)"></span>`)
    const value = root.querySelector(".ui.red.statistic:not(.inverted) > .value")!
    expect(getComputedStyle(value).color).toBe(getComputedStyle(red).color)
    const inverted = root.querySelector<HTMLElement>(".ui.inverted.statistic:not(.red)")!
    expect(getComputedStyle(inverted).colorScheme).toBe("dark")
    expect(getComputedStyle(inverted).getPropertyValue("--ui-inverted").trim()).toBe("1")
  })

  it("divides a counted group evenly, floats floated statistics", () => {
    const root = example("variations")
    const three = root.querySelector<HTMLElement>(".ui.three.statistics:not(.stackable)")!
    const members = [...three.querySelectorAll<HTMLElement>(":scope > .statistic")]
    const width = three.getBoundingClientRect().width
    expect(members[0]!.getBoundingClientRect().width).toBeGreaterThanOrEqual(width / 3 - 1)
    expect(getComputedStyle(root.querySelector(".ui.right.floated.statistic")!).float).toBe("right")
  })

  it("stacks a stackable group by its parent's width", () => {
    Sheets.adopt([...foundationCSS, partsCSS, statisticCSS])
    const markup = (width: number) =>
      `<div style="width: ${width}px"><div class="ui stackable three statistics">` +
      `<div class="statistic"><div class="value in-statistic">1</div></div>` +
      `<div class="statistic"><div class="value in-statistic">2</div></div></div></div>`
    const narrow = Fixture.render(markup(400))
    const [a, b] = narrow.querySelectorAll<HTMLElement>(".statistic")
    expect(a!.getBoundingClientRect().width).toBeCloseTo(400, 0)
    expect(b!.getBoundingClientRect().top).toBeGreaterThanOrEqual(a!.getBoundingClientRect().bottom - 1)
    const wide = Fixture.render(markup(900))
    const [c, d] = wide.querySelectorAll<HTMLElement>(".statistic")
    expect(d!.getBoundingClientRect().top).toBe(c!.getBoundingClientRect().top)
  })
})

////////////////
// ## Tokens
////////////////

describe("UIStatistic.css tokens", () => {
  it("takes a public token set on a wrapper of static markup", () => {
    Sheets.adopt([...foundationCSS, statisticCSS])
    const root = Fixture.render(
      `<div style="--ui-statistic-horizontal-spacing: 20px"><div class="ui statistics"><div class="statistic">x</div></div></div>`
    )
    expect(getComputedStyle(root.querySelector(".ui.statistics")!).marginLeft).toBe("-20px")
  })
})
