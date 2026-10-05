import { describe, expect, it, onTestFinished } from "vite-plus/test"
import { page } from "vite-plus/test/browser"

import { ClassBuilder } from "$/ui/elements"
import { colorsCSS, foundationCSS } from "$/ui/styles"
import type { AttributeSpec, ComponentVocabulary } from "$/ui/vocabulary"

import { Fixture } from "$/ui/test/fixture"

import { searchVocabulary } from "./ui-search.vocabulary.en"

import inputCSS from "$/ui/components/ui-input/ui-input.css?inline"
import searchCSS from "./ui-search.css?inline"
import searchRaw from "./ui-search.css?raw"

/**
 * `ui-search.css` on its own, before any element exists:  the sheet's source rules, the computed styles of the
 * light-DOM examples, and the popover + anchor positioning contract.
 * - Sheets are adopted into the document per test (foundation, `ui-input.css`, then `ui-search.css`, the order
 *   `<ui-search>` adopts them in) and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** Sublayer order every component sheet declares first. */
const LAYERS =
  "@layer ui.components.search.types, ui.components.search.content, ui.components.search.variations, " +
  "ui.components.search.states;"

/** Sheets `<ui-search>` adopts, in order. */
const SHEETS = [...foundationCSS, inputCSS, searchCSS]

describe("ui-search.css source", () => {
  it("never uses rem", () => {
    expect(withoutComments(searchRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it("never uses !important", () => {
    expect(withoutComments(searchRaw)).not.toMatch(/!important/)
  })

  it("declares its sublayer order before any rule", () => {
    expect(withoutComments(searchRaw).trim().replace(/\s+/g, " ").startsWith(LAYERS)).toBe(true)
  })

  it("parses with replaceSync, keeping the anchor positioning", () => {
    for (const css of [searchCSS, searchRaw]) {
      const sheet = new CSSStyleSheet()
      sheet.replaceSync(css)
      const rules = styleRules(sheet)
      expect(rules.length).toBeGreaterThan(50)
      expect(rules.some((rule) => rule.style.getPropertyValue("position-area") !== "")).toBe(true)
      expect(rules.some((rule) => rule.style.getPropertyValue("anchor-name") !== "")).toBe(true)
    }
  })

  it("covers every class word the vocabulary can emit", () => {
    const css = searchRaw + colorsCSS
    for (const phrase of classPhrases(searchVocabulary)) {
      expect(covers(css, phrase), phrase).toBe(true)
    }
  })
})

describe("ui-search.css examples", () => {
  it.each(Object.keys(EXAMPLES))("styles every search in %s", (path) => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(EXAMPLES[path]!)
    const searches = root.querySelectorAll<HTMLElement>(".ui.search")
    expect(searches.length).toBeGreaterThan(0)
    for (const search of searches) {
      const style = getComputedStyle(search)
      expect(style.position, search.className).toBe("relative")
      expect(style.anchorName).toBe("--ui-search")
      const prompt = search.querySelector<HTMLElement>(".prompt")!
      expect(parseFloat(getComputedStyle(prompt).borderTopLeftRadius)).toBeGreaterThan(100)
    }
    for (const results of root.querySelectorAll<HTMLElement>(".ui.search > .results[popover]")) {
      expect(getComputedStyle(results).display).toBe("none")
    }
  })

  it("draws results:  dividers, the highlighted one, price, image room, links without underlines", () => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const results = root.querySelector<HTMLElement>(".ui.search > .visible.results")!
    expect(getComputedStyle(results).display).toBe("block")
    const [apple, apricot, grape] = results.querySelectorAll<HTMLElement>(".result")
    expect(parseFloat(getComputedStyle(apple!).borderBottomWidth)).toBeGreaterThan(0)
    expect(parseFloat(getComputedStyle(grape!).borderBottomWidth)).toBe(0)
    expect(getComputedStyle(apple!).backgroundColor).not.toBe(getComputedStyle(apricot!).backgroundColor)
    expect(getComputedStyle(apricot!.querySelector(".price")!).float).toBe("inline-end")
    expect(getComputedStyle(grape!).textDecorationLine).toBe("none")
    expect(getComputedStyle(apple!.querySelector(".title")!).fontWeight).toBe("700")
  })

  it("opens a popover below its root, anchored, 18em wide;  right aligned lines up the ends", async () => {
    await page.viewport(1000, 800)
    onTestFinished(() => page.viewport(414, 896))
    adoptIntoPage(SHEETS)
    const root = Fixture.render(`<div style="padding-left: 20em">${EXAMPLES["./examples/types.html"]!}</div>`)
    const search = root.querySelector<HTMLElement>(".ui.search")!
    search.style.setProperty("--_ui-search-anchor", "--test-search")
    const results = open(search)
    expect(getComputedStyle(results).positionAnchor).toBe("--test-search")
    const box = search.getBoundingClientRect()
    const rect = results.getBoundingClientRect()
    expect(rect.top).toBeGreaterThanOrEqual(box.bottom)
    expect(Math.abs(rect.left - box.left)).toBeLessThan(1)
    expect(Math.round(rect.width)).toBe(Math.round(18 * parseFloat(getComputedStyle(search).fontSize)))
    search.classList.add("right", "aligned")
    const right = results.getBoundingClientRect()
    expect(Math.abs(right.right - box.right)).toBeLessThan(1)
  })

  it("lays categories out as a table:  the name beside its results;  horizontal stacks them", () => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(`<div>${EXAMPLES["./examples/types.html"]!}</div>`)
    const search = root.querySelector<HTMLElement>(".ui.category.search")!
    const results = search.querySelector<HTMLElement>(":scope > .results")!
    expect(getComputedStyle(results).display).toBe("table")
    const category = results.querySelector<HTMLElement>(".category")!
    expect(getComputedStyle(category).display).toBe("table-row")
    expect(getComputedStyle(category.querySelector(".name")!).display).toBe("table-cell")
    search.classList.add("horizontal")
    expect(getComputedStyle(category.querySelector(".name")!).display).toBe("block")
  })

  it("spins while loading, dims when disabled, and draws the messages", () => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(`<div>${EXAMPLES["./examples/states.html"]!}</div>`)
    const icon = root.querySelector(".ui.loading.search .search.icon")!
    expect(getComputedStyle(icon, "::after").animationName).toMatch(/^ui-(input|search)-spin$/)
    expect(parseFloat(getComputedStyle(root.querySelector(".ui.disabled.search")!).opacity)).toBeCloseTo(0.45, 2)
    const header = root.querySelector(".empty.message .header")!
    expect(getComputedStyle(header).fontWeight).toBe("700")
    expect(parseFloat(getComputedStyle(root.querySelector(".empty.message")!).paddingTop)).toBeGreaterThan(0)
  })

  it("scales by size and fills its container when fluid", () => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(`<div style="width: 600px">${EXAMPLES["./examples/variations.html"]!}</div>`)
    const size = (selector: string) => parseFloat(getComputedStyle(root.querySelector(selector)!).fontSize)
    expect(size(".ui.mini.search")).toBeLessThan(size(".ui.massive.search"))
    expect(size(".ui.mini.search .prompt")).toBeLessThan(size(".ui.massive.search .prompt"))
    const fluid = root.querySelector<HTMLElement>(".ui.fluid.search")!
    expect(Math.round(fluid.querySelector(".prompt")!.getBoundingClientRect().width)).toBe(600)
  })

  it("takes a public token from a wrapper (static markup), over the viewport's default", () => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(
      `<div style="--ui-search-results-max-height: 100px">${EXAMPLES["./examples/variations.html"]!}</div>`
    )
    expect(getComputedStyle(root.querySelector(".ui.scrolling.search > .results")!).maxHeight).toBe("100px")
  })

  it("scrolls results after a height with `scrolling`", () => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const results = root.querySelector<HTMLElement>(".ui.scrolling.search > .results")!
    expect(getComputedStyle(results).overflowY).toBe("auto")
    expect(getComputedStyle(results).maxHeight).not.toBe("none")
  })
})

/**
 * Open `search`'s popover results;  return them.
 * - SIDE EFFECT:  closed again when the test finishes.
 */
function open(search: Element): HTMLElement {
  const results = search.querySelector<HTMLElement>(":scope > .results")!
  results.showPopover()
  onTestFinished(() => {
    if (results.matches(":popover-open")) results.hidePopover()
  })
  return results
}

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
