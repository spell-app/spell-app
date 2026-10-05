import { describe, expect, it, onTestFinished } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"

import { ClassBuilder } from "$/ui/elements"
import { UI } from "$/ui/runtime"
import { colorsCSS, foundationCSS } from "$/ui/styles"
import type { AttributeSpec, ComponentVocabulary } from "$/ui/vocabulary"

import { Fixture } from "$/ui/test/fixture"

import { selectVocabulary } from "./ui-select.vocabulary.en"

import selectCSS from "./ui-select.css?inline"
import selectRaw from "./ui-select.css?raw"

/**
 * `ui-select.css` on its own, before any element exists:  the sheet's source rules, the computed styles of the
 * light-DOM examples (the closed box every browser draws, and the customizable picker Chromium draws).
 * - Sheets are adopted into the document per test (foundation, then `ui-select.css`) and removed again.
 */

/**
 * Customizable `<select>` (`appearance: base-select`):  Chromium only so far.  Where it is missing the browser drops
 * the `::picker(select)` / `selectedcontent` rules at parse time, so those assertions wait for the flag, like the
 * component's own `:state(customizable)`.
 */
const BASE_SELECT = (await UI.load()).browser.supports.baseSelect

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** Sublayer order every component sheet declares first. */
const LAYERS =
  "@layer ui.components.select.types, ui.components.select.content, ui.components.select.variations, " +
  "ui.components.select.states;"

/** Sheets `<ui-select>` adopts, in order. */
const SHEETS = [...foundationCSS, selectCSS]

describe("ui-select.css source", () => {
  it("never uses rem", () => {
    expect(withoutComments(selectRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it("never uses !important", () => {
    expect(withoutComments(selectRaw)).not.toMatch(/!important/)
  })

  it("declares its sublayer order before any rule", () => {
    expect(withoutComments(selectRaw).trim().replace(/\s+/g, " ").startsWith(LAYERS)).toBe(true)
  })

  it("keeps the customizable select behind @supports, after Lightning CSS", () => {
    for (const css of [selectCSS, selectRaw]) {
      const sheet = new CSSStyleSheet()
      sheet.replaceSync(css)
      const supports = [...sheet.cssRules].filter((rule) => rule instanceof CSSSupportsRule)
      expect(supports.map((rule) => (rule as CSSSupportsRule).conditionText)).toContain("(appearance: base-select)")
      const rules = styleRules(sheet)
      if (!BASE_SELECT) continue
      expect(rules.some((rule) => rule.selectorText.includes("::picker(select)"))).toBe(true)
      expect(rules.some((rule) => rule.selectorText.includes("selectedcontent"))).toBe(true)
    }
  })

  it("covers every class word the vocabulary can emit", () => {
    const css = selectRaw + colorsCSS
    for (const phrase of classPhrases(selectVocabulary)) {
      expect(covers(css, phrase), phrase).toBe(true)
    }
  })
})

describe("ui-select.css examples", () => {
  it.each(Object.keys(EXAMPLES))("draws every select in %s as a closed selection box", (path) => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(EXAMPLES[path]!)
    const selects = root.querySelectorAll<HTMLSelectElement>("select.ui.select")
    expect(selects.length).toBeGreaterThan(0)
    for (const select of selects) {
      const style = getComputedStyle(select)
      expect(parseFloat(style.borderTopWidth), select.className).toBeGreaterThan(0)
      expect(parseFloat(style.borderTopLeftRadius)).toBeGreaterThan(0)
      expect(parseFloat(style.paddingLeft)).toBeGreaterThan(0)
      expect(parseFloat(style.fontSize)).toBeGreaterThan(0)
    }
  })

  it("draws the caret in every browser:  two gradients in currentColor, room for it at the end", () => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const select = root.querySelector<HTMLSelectElement>("select.ui.select")!
    const style = getComputedStyle(select)
    expect(style.backgroundImage.match(/linear-gradient/g)).toHaveLength(2)
    expect(parseFloat(style.paddingRight)).toBeGreaterThan(parseFloat(style.paddingLeft))
    expect(parseFloat(style.minWidth)).toBeGreaterThan(100)
    const multiple = root.querySelector<HTMLSelectElement>("select.ui.multiple.select")!
    expect(getComputedStyle(multiple).backgroundImage).toBe("none")
  })

  it("greys the placeholder while it's shown", () => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const [placeholder, chosen] = root.querySelectorAll<HTMLSelectElement>("select.ui.select")
    expect(getComputedStyle(placeholder!).color).not.toBe(getComputedStyle(chosen!).color)
  })

  it.skipIf(!BASE_SELECT)("is the customizable select where supported, with a hidden picker icon", () => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const select = root.querySelector<HTMLSelectElement>("select.ui.select")!
    expect(getComputedStyle(select).appearance).toBe("base-select")
    expect(getComputedStyle(select, "::picker-icon").display).toBe("none")
  })

  it.skipIf(!BASE_SELECT)("opens the picker below the box, anchored and at least as wide", async () => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const select = root.querySelector<HTMLSelectElement>("select.ui.select")!
    await userEvent.click(select)
    await expect.poll(() => select.matches(":open")).toBe(true)
    onTestFinished(() => void (select.matches(":open") && select.blur()))
    const option = select.querySelector<HTMLOptionElement>("option.item")!
    const box = select.getBoundingClientRect()
    const rect = option.getBoundingClientRect()
    expect(rect.top).toBeGreaterThanOrEqual(box.bottom)
    expect(rect.top - box.bottom).toBeLessThan(80)
    expect(Math.abs(rect.left - box.left)).toBeLessThan(2)
    expect(getComputedStyle(option).display).toBe("flex")
    expect(getComputedStyle(option, "::checkmark").display).toBe("none")
    await userEvent.keyboard("{Escape}")
  })

  it("takes a public token from a wrapper (static markup)", () => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(
      `<div style="--ui-select-radius: 12px"><select class="ui select" aria-label="A"><option>A</option></select></div>`
    )
    expect(getComputedStyle(root.querySelector("select")!).borderTopLeftRadius).toBe("12px")
  })

  it("scales by size;  medium is the default", () => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const size = (selector: string) => parseFloat(getComputedStyle(root.querySelector(selector)!).fontSize)
    expect(size(".ui.mini.select")).toBeLessThan(size(".ui.massive.select"))
    expect(size(".ui.medium.select")).toBe(size(".ui.compact.select"))
  })

  it("fills its container when fluid, and drops the minimum width when compact", () => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(`<div style="width: 600px">${EXAMPLES["./examples/variations.html"]!}</div>`)
    const fluid = root.querySelector<HTMLElement>(".ui.fluid.select")!
    expect(Math.round(fluid.getBoundingClientRect().width)).toBe(600)
    expect(getComputedStyle(root.querySelector(".ui.compact.select")!).minWidth).toBe("0px")
  })

  it("tints form states, dims disabled, and switches inverted to the dark scheme", () => {
    adoptIntoPage(SHEETS)
    const states = Fixture.render(EXAMPLES["./examples/states.html"]!)
    const tint = Fixture.render(`<span style="background-color: var(--ui-error-background)"></span>`)
    expect(getComputedStyle(states.querySelector(".ui.error.select")!).backgroundColor).toBe(
      getComputedStyle(tint).backgroundColor
    )
    expect(parseFloat(getComputedStyle(states.querySelector(".ui.disabled.select")!).opacity)).toBeCloseTo(0.45, 2)
    const variations = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    expect(getComputedStyle(variations.querySelector(".ui.inverted.select")!).colorScheme).toBe("dark")
  })
})

/**
 * Class phrases `vocabulary` can emit for class-bearing attributes, one attribute at a time.
 * - `size` / `color` kinds with shared sets are left out:  `sizes.css` / `colors.css` own those remaps.
 */
function classPhrases(vocabulary: ComponentVocabulary): string[] {
  const builder = new ClassBuilder(vocabulary)
  const skip = new Set(["ui", vocabulary.noun])
  const phrases = new Set<string>()
  for (const spec of vocabulary.attributes) {
    if (spec.kind === "size" || (spec.kind === "color" && !Array.isArray(spec.values))) continue
    const values: (string | true)[] =
      spec.kind === "keyOnly" ? [true] : spec.kind === "keyOrValueAndKey" ? [true, ...listOf(spec)] : listOf(spec)
    for (const value of values) {
      const phrase = builder
        .build({ [spec.name]: value })
        .split(" ")
        .filter((word) => !skip.has(word))
        .join(" ")
      if (phrase) phrases.add(phrase)
    }
  }
  return [...phrases]
}

/** Inline values of `spec`. */
function listOf(spec: AttributeSpec): string[] {
  return Array.isArray(spec.values) ? [...(spec.values as readonly string[])] : []
}

/** `css` styles `phrase`:  as a `[class*="..."]` phrase, or every word as a class selector. */
function covers(css: string, phrase: string): boolean {
  if (css.includes(`[class*="${phrase}"]`)) return true
  return phrase.split(" ").every((word) => new RegExp(`\\.${word}(?![\\w-])`).test(css))
}

/** Every `CSSStyleRule` in `sheet`, including those nested in `@layer` / `@media` / `@supports`. */
function styleRules(sheet: CSSStyleSheet | CSSGroupingRule): CSSStyleRule[] {
  const rules: CSSStyleRule[] = []
  for (const rule of sheet.cssRules) {
    if (rule instanceof CSSStyleRule) rules.push(rule)
    if (rule instanceof CSSGroupingRule) rules.push(...styleRules(rule))
  }
  return rules
}

/**
 * Adopt `css` into the document for the current test.
 * - SIDE EFFECT:  appended to `document.adoptedStyleSheets`, removed when the test finishes.
 */
function adoptIntoPage(css: readonly string[]) {
  const sheets = css.map((text) => {
    const sheet = new CSSStyleSheet()
    sheet.replaceSync(text)
    return sheet
  })
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, ...sheets]
  onTestFinished(() => {
    document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => !sheets.includes(sheet))
  })
}

/** `css` without comments. */
function withoutComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "")
}
