import { describe, expect, it, onTestFinished } from "vite-plus/test"

import { ClassBuilder } from "$/ui/elements"
import { colorsCSS, foundationCSS } from "$/ui/styles"
import type { AttributeSpec, ComponentVocabulary } from "$/ui/vocabulary"

import { Fixture } from "$/ui/test/fixture"

import { dropdownVocabulary } from "./ui-dropdown.vocabulary.en"

import buttonCSS from "$/ui/components/ui-button/ui-button.css?inline"
import dropdownCSS from "./ui-dropdown.css?inline"
import dropdownRaw from "./ui-dropdown.css?raw"

/**
 * `ui-dropdown.css` on its own, before any element exists:  the sheet's source rules, the computed styles of the
 * light-DOM examples, and the popover + anchor positioning contract.
 * - Sheets are adopted into the document per test (foundation, then `ui-button.css`, then `ui-dropdown.css`, the
 *   order `<ui-dropdown>` adopts them in) and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

/** Sublayer order every component sheet declares first. */
const LAYERS =
  "@layer ui.components.dropdown.types, ui.components.dropdown.content, ui.components.dropdown.variations, " +
  "ui.components.dropdown.states;"

/** Sheets `<ui-dropdown>` adopts, in order. */
const SHEETS = [...foundationCSS, buttonCSS, dropdownCSS]

/** Class phrases with no rule of their own:  `top pointing` IS the default `pointing`. */
const DEFAULT_PHRASES = new Set(["top pointing"])

describe("ui-dropdown.css source", () => {
  it("never uses rem", () => {
    expect(withoutComments(dropdownRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(withoutComments(dropdownRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    expect(withoutComments(dropdownRaw).trim().replace(/\s+/g, " ").startsWith(LAYERS)).toBe(true)
  })

  it("parses with replaceSync, keeping the anchor positioning", () => {
    for (const css of [dropdownCSS, dropdownRaw]) {
      const sheet = new CSSStyleSheet()
      sheet.replaceSync(css)
      const rules = styleRules(sheet)
      expect(rules.length).toBeGreaterThan(80)
      expect(rules.some((rule) => rule.style.getPropertyValue("position-area") !== "")).toBe(true)
      expect(rules.some((rule) => rule.style.getPropertyValue("anchor-name") !== "")).toBe(true)
      expect(rules.some((rule) => rule.selectorText.includes(":has(> .menu:popover-open)"))).toBe(true)
    }
  })

  // NOTE: not `itemVocabulary`:  the dropdown draws its own `.item` rows (`active`, `disabled`);  a `<ui-item>`'s
  // own class words are its list / menu owners' to style
  it("covers every class word the vocabulary can emit", () => {
    const css = dropdownRaw + colorsCSS
    for (const vocabulary of [dropdownVocabulary]) {
      for (const phrase of classPhrases(vocabulary)) {
        if (DEFAULT_PHRASES.has(phrase)) continue
        expect(covers(css, phrase), `${vocabulary.tag}: ${phrase}`).toBe(true)
      }
    }
  })
})

describe("ui-dropdown.css examples", () => {
  it.each(Object.keys(EXAMPLES))("styles every dropdown in %s", (path) => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(EXAMPLES[path]!)
    const dropdowns = root.querySelectorAll<HTMLElement>(".ui.dropdown")
    expect(dropdowns.length).toBeGreaterThan(0)
    for (const dropdown of dropdowns) {
      const style = getComputedStyle(dropdown)
      expect(style.position, dropdown.className).toBe("relative")
      expect(style.anchorName).toBe("--ui-dropdown")
      expect(parseFloat(style.fontSize)).toBeGreaterThan(0)
    }
    for (const menu of root.querySelectorAll<HTMLElement>(".ui.dropdown > .menu[popover]")) {
      expect(getComputedStyle(menu).display).toBe("none")
    }
  })

  it("opens a popover menu below its root, anchored and as wide as a selection", () => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const dropdown = root.querySelector<HTMLElement>(".ui.selection.dropdown")!
    dropdown.style.setProperty("--_ui-dropdown-anchor", "--test-anchor")
    const menu = open(dropdown)
    const style = getComputedStyle(menu)
    expect(style.positionArea).not.toBe("")
    expect(style.positionArea).not.toBe("none")
    expect(style.positionAnchor).toBe("--test-anchor")
    expect(getComputedStyle(dropdown).anchorName).toBe("--test-anchor")
    const box = dropdown.getBoundingClientRect()
    const rect = menu.getBoundingClientRect()
    expect(rect.top).toBeGreaterThanOrEqual(box.bottom)
    expect(rect.top - box.bottom).toBeLessThan(16)
    expect(Math.abs(rect.left - box.left)).toBeLessThan(1)
    expect(Math.abs(rect.width - box.width)).toBeLessThan(1)
  })

  it("opens upward, toward the start, and beside the root when pointing sideways", () => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(`<div style="padding: 12em">${EXAMPLES["./examples/variations.html"]!}</div>`)
    const upward = root.querySelector<HTMLElement>(".ui.upward.dropdown")!
    expect(open(upward).getBoundingClientRect().bottom).toBeLessThanOrEqual(upward.getBoundingClientRect().top)
    close(upward)
    const left = root.querySelector<HTMLElement>(".ui.dropdown:has(> .left.menu)")!
    expect(Math.abs(open(left).getBoundingClientRect().right - left.getBoundingClientRect().right)).toBeLessThan(1)
    close(left)
    const pointing = root.querySelector<HTMLElement>('.ui[class="ui left pointing dropdown"]')!
    const menu = open(pointing)
    expect(menu.getBoundingClientRect().left).toBeGreaterThan(pointing.getBoundingClientRect().right)
    expect(getComputedStyle(menu, "::after").content).toBe('""')
    expect(getComputedStyle(menu).positionTryFallbacks).toBe("none")
  })

  it("shows a static menu on an active root, below it", () => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(EXAMPLES["./examples/states.html"]!)
    const dropdown = root.querySelector<HTMLElement>(".ui.active.selection.dropdown")!
    const menu = dropdown.querySelector<HTMLElement>(".menu")!
    expect(getComputedStyle(menu).display).toBe("block")
    // `top: 100%` of the padding box:  the menu overlaps the root's bottom border.
    expect(Math.abs(menu.getBoundingClientRect().top - dropdown.getBoundingClientRect().bottom)).toBeLessThanOrEqual(1)
    expect(getComputedStyle(menu.querySelector(".active.item")!).fontWeight).toBe("700")
    expect(getComputedStyle(menu.querySelector(".filtered.item")!).display).toBe("none")
  })

  it("takes a public token from a wrapper (static markup)", () => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(
      `<div style="--ui-dropdown-radius: 12px"><div class="ui selection dropdown"><span class="text">A</span></div></div>`
    )
    expect(getComputedStyle(root.querySelector(".ui.dropdown")!).borderTopLeftRadius).toBe("12px")
  })

  it("scales by size;  medium is the default", () => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const size = (selector: string) => parseFloat(getComputedStyle(root.querySelector(selector)!).fontSize)
    expect(size(".ui.mini.dropdown")).toBeLessThan(size(".ui.massive.dropdown"))
    expect(size(".ui.medium.dropdown")).toBe(size(".ui.compact.dropdown"))
  })

  it("tints form states, dims disabled, and hides delete icons when read-only", () => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(EXAMPLES["./examples/states.html"]!)
    const tint = Fixture.render(`<span style="background-color: var(--ui-error-background)"></span>`)
    const error = root.querySelector(".ui.error.dropdown")!
    expect(getComputedStyle(error).backgroundColor).toBe(getComputedStyle(tint).backgroundColor)
    expect(parseFloat(getComputedStyle(root.querySelector(".ui.disabled.dropdown")!).opacity)).toBeCloseTo(0.45, 2)
    expect(getComputedStyle(root.querySelector(".ui.read-only.dropdown .delete.icon")!).display).toBe("none")
    expect(
      getComputedStyle(root.querySelector(".ui.loading.dropdown > .dropdown.icon")!, "::after").animationName
    ).toBe("ui-dropdown-spin")
  })

  it("draws labels, hides the placeholder behind them, and draws icons without icon data", () => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const multiple = root.querySelector(".ui.multiple.selection.dropdown:not(.search)")!
    expect(getComputedStyle(multiple.querySelector(".default.text")!).display).toBe("none")
    expect(getComputedStyle(multiple.querySelector(".label")!).display).toBe("inline-block")
    expect(getComputedStyle(multiple.querySelector(".delete.icon")!, "::before").clipPath).toContain("polygon")
    const caret = root.querySelector(".ui.selection.dropdown > .dropdown.icon")!
    expect(getComputedStyle(caret).position).toBe("absolute")
    expect(getComputedStyle(caret, "::before").clipPath).toContain("polygon")
  })

  it("switches an inverted dropdown to the dark scheme", () => {
    adoptIntoPage(SHEETS)
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    expect(getComputedStyle(root.querySelector(".ui.inverted.dropdown")!).colorScheme).toBe("dark")
  })
})

describe("ui-dropdown.css in a shadow root", () => {
  it("anchors the menu to its root with the fallback name", () => {
    adoptIntoPage(foundationCSS)
    const host = Fixture.render(`<span></span>`)
    const shadow = host.attachShadow({ mode: "open" })
    shadow.adoptedStyleSheets = toSheets(SHEETS)
    shadow.innerHTML = `
      <div class="ui selection dropdown">
        <button class="trigger" role="combobox" aria-label="Pick"></button>
        <span class="text">Pick</span><span class="dropdown icon"></span>
        <div class="menu" role="listbox" popover="manual"><div class="item" role="option">One</div></div>
      </div>`
    const dropdown = shadow.querySelector<HTMLElement>(".ui.dropdown")!
    const menu = open(dropdown)
    expect(getComputedStyle(host).display).toBe("inline-block")
    expect(getComputedStyle(menu).positionAnchor).toBe("--ui-dropdown")
    expect(menu.getBoundingClientRect().top).toBeGreaterThanOrEqual(dropdown.getBoundingClientRect().bottom)
    expect(Math.abs(menu.getBoundingClientRect().left - dropdown.getBoundingClientRect().left)).toBeLessThan(1)
  })

  it('sizes a fallback icon inside the caret\'s <slot name="icon"> to the icon box, not the caret block', () => {
    // Regression for the slot-fallback-vs-child-selector bug (the Lit spike report's "(j)" item 1, tag
    // `archive/lit-spike`):  the svg is FALLBACK content of `<slot name="icon">`, one level deeper than
    // `.dropdown.icon`'s own children, so a `>` selector (the old rule) would leave it unstyled and it'd render at
    // the browser's default SVG size.
    adoptIntoPage(foundationCSS)
    const host = Fixture.render(`<span></span>`)
    const shadow = host.attachShadow({ mode: "open" })
    shadow.adoptedStyleSheets = toSheets(SHEETS)
    shadow.innerHTML = `
      <div class="ui selection dropdown">
        <button class="trigger" role="combobox" aria-label="Pick"></button>
        <span class="text">Pick</span>
        <span class="dropdown icon" part="icon"><slot name="icon">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 2 22h20z" /></svg>
        </slot></span>
      </div>`
    const iconBox = shadow.querySelector<HTMLElement>(".dropdown.icon")!
    const svg = shadow.querySelector<SVGSVGElement>(".dropdown.icon svg")!
    const boxWidth = iconBox.getBoundingClientRect().width
    expect(boxWidth).toBeGreaterThan(0)
    expect(boxWidth).toBeLessThan(30)
    expect(svg.getBoundingClientRect().width).toBeCloseTo(boxWidth, 1)
  })

  it('sizes an icon slotted as custom "trigger" content, not the whole selection box', () => {
    // Regression for the same bug at `.text > .icon` (ui-dropdown.css:550-ish):  `.text` wraps
    // `<slot name="trigger">` (the "custom trigger content" slot), so a real replacement is TOP-LEVEL
    // slotted content, reached only through `::slotted()` -- the old rule had none, so the icon would fall
    // back to the browser's default SVG size instead of the ~1.18em icon token.
    adoptIntoPage(foundationCSS)
    const host = Fixture.render(`<span></span>`)
    const shadow = host.attachShadow({ mode: "open" })
    shadow.adoptedStyleSheets = toSheets(SHEETS)
    shadow.innerHTML = `
      <div class="ui selection dropdown">
        <button class="trigger" role="combobox" aria-label="Pick"></button>
        <span class="text" part="text"><slot name="trigger">Pick</slot></span>
        <span class="dropdown icon"></span>
      </div>`
    host.innerHTML = `<svg slot="trigger" viewBox="0 0 32 32" aria-hidden="true"><path d="M0 0h32v32H0z" /></svg>`
    const reference = Fixture.render(`<span style="display: inline-block; width: 1.18em"></span>`)
    const slotted = host.querySelector<SVGSVGElement>("svg")!
    expect(slotted.getBoundingClientRect().width).toBeCloseTo(reference.getBoundingClientRect().width, 1)
  })
})

/**
 * Open `dropdown`'s popover menu;  return it.
 * - SIDE EFFECT:  closed again when the test finishes.
 */
function open(dropdown: Element): HTMLElement {
  const menu = dropdown.querySelector<HTMLElement>(":scope > .menu")!
  menu.showPopover()
  onTestFinished(() => close(dropdown))
  return menu
}

/** Close `dropdown`'s popover menu, if open. */
function close(dropdown: Element) {
  const menu = dropdown.querySelector<HTMLElement>(":scope > .menu")
  if (menu?.matches(":popover-open")) menu.hidePopover()
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

/** Every `CSSStyleRule` in `sheet`, including those nested in `@layer` / `@media`. */
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
  const sheets = toSheets(css)
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, ...sheets]
  onTestFinished(() => {
    document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => !sheets.includes(sheet))
  })
}

/** Constructable sheets from CSS text. */
function toSheets(css: readonly string[]): CSSStyleSheet[] {
  return css.map((text) => {
    const sheet = new CSSStyleSheet()
    sheet.replaceSync(text)
    return sheet
  })
}

/** `css` without comments. */
function withoutComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "")
}
