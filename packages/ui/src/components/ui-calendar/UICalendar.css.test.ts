import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { calendarVocabulary } from "./UICalendar.en"

import inputCSS from "$/ui/components/ui-input/UIInput.css?inline"
import segmentCSS from "$/ui/components/ui-segment/UISegment.css?inline"
import calendarCSS from "./UICalendar.css?inline"
import calendarRaw from "./UICalendar.css?raw"

/**
 * `UICalendar.css` on its own, before any element exists:  the sheet's source rules and the computed styles of the
 * light-DOM examples (the class grammar the shadow root uses).
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** Adopt the calendar sheets and render example `name`. */
function example(name: string): HTMLElement {
  Sheets.adopt([...foundationCSS, inputCSS, segmentCSS, calendarCSS])
  return Fixture.render(EXAMPLES[`./examples/${name}.html`]!)
}

/** The static calendar root in `root` whose grid is labelled by title `id`;  `"minutes"`:  the unlabelled one. */
function calendarOf(root: Element, id: string): HTMLElement {
  const grid = root.querySelector(id === "minutes" ? "table[aria-label]" : `table[aria-labelledby="${id}"]`)
  return grid!.closest<HTMLElement>(".ui.calendar:not(.popup)")!
}

/** Computed style of `selector` inside the calendar with title `id`. */
function styleIn(root: Element, id: string, selector: string, pseudo?: string): CSSStyleDeclaration {
  return getComputedStyle(calendarOf(root, id).querySelector(selector)!, pseudo)
}

/** Colour a token resolves to on the page. */
function color(token: string): string {
  return getComputedStyle(Fixture.render(`<span style="background: ${token}"></span>`)).backgroundColor
}

////////////////
// ## Source
////////////////

describe("UICalendar.css source", () => {
  it("never uses rem or !important", () => {
    const text = Sheets.withoutComments(calendarRaw)
    expect(text).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(text).not.toMatch(/!important/)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(calendarRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("calendar"))).toBe(true)
  })

  it("parses with replaceSync, keeping the host, popover and cell rules", () => {
    for (const css of [calendarCSS, calendarRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.length).toBeGreaterThan(40)
      expect(selectors).toContain(":host(:state(fluid))")
      expect(selectors).toContain(".ui.calendar > .ui.popup[popover]")
      expect(selectors).toContain(".ui.calendar .ui.table tr td.active")
    }
  })

  it("covers every class word the vocabulary can emit", () => {
    const css = calendarRaw + colorsCSS
    for (const phrase of Sheets.classPhrases(calendarVocabulary))
      expect(Sheets.covers(css, phrase), `${calendarVocabulary.tag}: ${phrase}`).toBe(true)
  })

  it("covers every position word the element adds to the popup", () => {
    for (const position of ["bottom left", "bottom right", "top left", "top right"])
      expect(Sheets.covers(calendarRaw, position), position).toBe(true)
  })
})

////////////////
// ## Examples
////////////////

describe("UICalendar.css examples", () => {
  it("draws the picker box:  surface, strong border, radius;  the popup floats with a shadow", () => {
    const root = example("types")
    const box = calendarOf(root, "t-day").querySelector<HTMLElement>(".calendar")!
    const style = getComputedStyle(box)
    expect(style.backgroundColor).toBe(color("var(--ui-surface)"))
    expect(style.borderTopColor).toBe(color("var(--ui-border-color-strong)"))
    expect(parseFloat(style.borderTopLeftRadius)).toBeGreaterThan(0)
    const popup = getComputedStyle(root.querySelector(".ui.calendar.popup.visible")!)
    expect(popup.display).toBe("block")
    expect(popup.boxShadow).not.toBe("none")
  })

  it("sizes each view's grid by Fomantic's widths (em), prev / next a seventh of the header", () => {
    const root = example("types")
    const font = parseFloat(getComputedStyle(calendarOf(root, "t-day")).fontSize)
    expect(styleIn(root, "t-day", "table").minWidth).toBe(`${18 * font}px`)
    expect(styleIn(root, "t-month", "table").minWidth).toBe(`${15 * font}px`)
    expect(styleIn(root, "t-hour", "table").minWidth).toBe(`${20 * font}px`)
    expect(styleIn(root, "minutes", "table").minWidth).toBe(`${15 * font}px`)
    const header = calendarOf(root, "t-day").querySelector<HTMLElement>(".header")!
    const previous = header.querySelector<HTMLElement>(".prev")!
    expect(previous.getBoundingClientRect().width).toBeCloseTo(header.clientWidth / 7, 0)
    expect(getComputedStyle(header).backgroundColor).toBe(color("var(--ui-surface-muted)"))
  })

  it("cells:  celled borders, centred text, 0.5em padding", () => {
    const root = example("types")
    const cells = calendarOf(root, "t-day").querySelectorAll<HTMLElement>("tbody td")
    const second = getComputedStyle(cells[8]!)
    expect(second.textAlign).toBe("center")
    expect(parseFloat(second.borderLeftWidth)).toBeGreaterThan(0)
    expect(parseFloat(second.borderTopWidth)).toBeGreaterThan(0)
    expect(parseFloat(getComputedStyle(cells[7]!).borderLeftWidth)).toBe(0)
    expect(parseFloat(second.paddingTop)).toBeCloseTo(0.5 * parseFloat(second.fontSize), 1)
    expect(second.cursor).toBe("pointer")
  })

  it("states:  chosen grey, today bold, adjacent muted, disabled grey, range tinted, the focus ring while focused", () => {
    const root = example("states")
    const cell = (label: string) => calendarOf(root, "s-cells").querySelector<HTMLElement>(`td[aria-label="${label}"]`)!
    const chosen = getComputedStyle(cell("Friday, September 18, 2026"))
    expect(chosen.backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
    expect(getComputedStyle(cell("Wednesday, September 9, 2026")).fontWeight).toBe("700")
    // an adjacent day is disabled too (no `select-adjacent-days`):  the disabled grey wins
    expect(getComputedStyle(cell("Sunday, August 30, 2026")).color).toBe(color("var(--ui-text-disabled)"))
    expect(getComputedStyle(cell("Saturday, September 5, 2026")).color).toBe(color("var(--ui-text-disabled)"))
    expect(getComputedStyle(cell("Tuesday, September 15, 2026")).backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
    const stop = cell("Friday, September 18, 2026")
    expect(getComputedStyle(stop).boxShadow).toBe("none")
    stop.focus()
    expect(getComputedStyle(stop).boxShadow).toContain("inset")
  })

  it("colours:  the chosen cell fills with the hue;  the range takes its light background", () => {
    const root = example("variations")
    const red = calendarOf(root, "v-red").querySelector<HTMLElement>("td.active")!
    expect(getComputedStyle(red).backgroundColor).toBe(color("var(--ui-red)"))
    const teal = calendarOf(root, "v-teal")
    const inRange = teal.querySelector<HTMLElement>("td.range:not(.active)")!
    expect(getComputedStyle(inRange).backgroundColor).toBe(color("var(--ui-teal-background)"))
  })

  it("takes a public token from a wrapper (static markup)", () => {
    Sheets.adopt([...foundationCSS, inputCSS, segmentCSS, calendarCSS])
    const root = Fixture.render(
      `<div style="--ui-calendar-cell-padding: 20px">${EXAMPLES["./examples/types.html"]!}</div>`
    )
    expect(styleIn(root, "t-day", "tbody td").paddingTop).toBe("20px")
  })

  it("inverted:  the picker in the dark scheme;  compact:  tighter cells;  sizes by the remap", () => {
    const root = example("variations")
    const dark = calendarOf(root, "v-inverted").querySelector<HTMLElement>(".calendar")!
    expect(getComputedStyle(dark).colorScheme).toBe("dark")
    const light = calendarOf(root, "v-compact").querySelector<HTMLElement>(".calendar")!
    expect(getComputedStyle(dark).backgroundColor).not.toBe(getComputedStyle(light).backgroundColor)
    const compact = getComputedStyle(light.querySelector("td")!)
    expect(parseFloat(compact.paddingTop)).toBeCloseTo(0.3 * parseFloat(compact.fontSize), 1)
    const small = parseFloat(getComputedStyle(calendarOf(root, "v-small")).fontSize)
    const large = parseFloat(getComputedStyle(calendarOf(root, "v-large")).fontSize)
    expect(small / large).toBeCloseTo(0.875 / 1.125, 2)
  })

  it("fluid:  the field takes the row;  disabled:  faded, inert", () => {
    const variations = example("variations")
    const fluid = variations.querySelector<HTMLElement>(".ui.fluid.calendar")!
    expect(fluid.getBoundingClientRect().width).toBeCloseTo(fluid.parentElement!.clientWidth, 0)
    const states = example("states")
    const disabled = states.querySelector<HTMLElement>(".ui.disabled.calendar")!
    expect(parseFloat(getComputedStyle(disabled).opacity)).toBeLessThan(1)
    expect(getComputedStyle(disabled.querySelector(".ui.input")!).pointerEvents).toBe("none")
  })

  it("the field has its own width, wide enough for a date-time value (no engine default)", () => {
    const root = example("types")
    const input = root.querySelector<HTMLElement>(".ui.calendar > .ui.input > input")!
    const em = parseFloat(getComputedStyle(input).fontSize)
    expect(input.getBoundingClientRect().width).toBeCloseTo(20 * em, 0)
  })

  it("the field's icon box is a clickable button", () => {
    const root = example("types")
    const button = root.querySelector<HTMLElement>(".ui.calendar > .ui.input > button.icon")!
    expect(getComputedStyle(button)).toMatchObject({ pointerEvents: "auto", cursor: "pointer", position: "absolute" })
  })
})
