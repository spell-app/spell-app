import { describe, expect, it, onTestFinished } from "vite-plus/test"

import { ClassBuilder } from "$/ui/elements"
import { colorsCSS, foundationCSS } from "$/ui/styles"
import type { ComponentVocabulary } from "$/ui/vocabulary"

import { Fixture } from "$/ui/test/fixture"

import { buttonsVocabulary } from "./ui-buttons.vocabulary.en"
import { buttonVocabulary } from "./ui-button.vocabulary.en"
import { orVocabulary } from "./ui-or.vocabulary.en"

import buttonCSS from "./ui-button.css?inline"
import buttonRaw from "./ui-button.css?raw"

/**
 * `ui-button.css` on its own, before any element exists:  the sheet's source rules, and the computed styles of
 * the light-DOM examples (the same class grammar the shadow roots will use).
 * - Sheets are adopted into the document per test and removed again.
 * - The shadow-DOM tests build hosts by hand, standing in for `<ui-button>` / `<ui-buttons>` / `<ui-or>`.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

/** Sublayer order every component sheet declares first. */
const LAYERS =
  "@layer ui.components.button.types, ui.components.button.content, ui.components.button.variations, " +
  "ui.components.button.states;"

describe("ui-button.css source", () => {
  it("never uses rem", () => {
    expect(withoutComments(buttonRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(withoutComments(buttonRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = withoutComments(buttonRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(LAYERS)).toBe(true)
  })

  it("parses with replaceSync, keeping the ::slotted and :state() group rules", () => {
    for (const css of [buttonCSS, buttonRaw]) {
      const sheet = new CSSStyleSheet()
      sheet.replaceSync(css)
      const selectors = styleRules(sheet).map((rule) => rule.selectorText)
      expect(selectors.length).toBeGreaterThan(80)
      expect(selectors.some((selector) => selector.includes("::slotted(:not(:state(or)))"))).toBe(true)
      expect(selectors.some((selector) => selector.includes(":host(:state(fluid))"))).toBe(true)
    }
  })

  it("covers every class word the vocabularies can emit", () => {
    const css = buttonRaw + colorsCSS
    for (const vocabulary of [buttonVocabulary, buttonsVocabulary, orVocabulary]) {
      for (const phrase of classPhrases(vocabulary))
        expect(covers(css, phrase), `${vocabulary.tag}: ${phrase}`).toBe(true)
    }
  })
})

describe("ui-button.css examples", () => {
  it.each(Object.keys(EXAMPLES))("styles every button in %s", (path) => {
    adoptIntoPage([...foundationCSS, buttonCSS])
    const root = Fixture.render(EXAMPLES[path]!)
    const buttons = root.querySelectorAll<HTMLElement>(".ui.button")
    expect(buttons.length).toBeGreaterThan(0)
    for (const button of buttons) {
      const style = getComputedStyle(button)
      expect(style.borderTopStyle, button.outerHTML).toBe("none")
      expect(style.fontFamily).toContain("system-ui")
      expect(parseFloat(style.fontSize)).toBeGreaterThan(0)
    }
  })

  it("takes a public token from a wrapper or the button itself (static markup)", () => {
    adoptIntoPage([...foundationCSS, buttonCSS])
    const root = Fixture.render(
      `<div style="--ui-button-radius: 20px"><button class="ui button">A</button></div>` +
        `<button class="ui button" style="--ui-button-padding-block: 20px">B</button>`
    )
    const wrapped = root.querySelector(".ui.button")!
    expect(getComputedStyle(wrapped).borderTopLeftRadius).toBe("20px")
    expect(getComputedStyle(root.nextElementSibling!).paddingTop).toBe("20px")
  })

  it("fills primary with the resolved --ui-blue", () => {
    adoptIntoPage([...foundationCSS, buttonCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const blue = Fixture.render(`<span style="background-color: var(--ui-blue)"></span>`)
    const primary = root.querySelector(".ui.primary.button:not(.basic)")!
    expect(getComputedStyle(primary).backgroundColor).toBe(getComputedStyle(blue).backgroundColor)
  })

  it("scales by size;  medium is the default", () => {
    adoptIntoPage([...foundationCSS, buttonCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const size = (selector: string) => parseFloat(getComputedStyle(root.querySelector(selector)!).fontSize)
    expect(size(".ui.mini.button")).toBeLessThan(size(".ui.massive.button"))
    expect(size(".ui.mini.button")).toBeLessThan(size(".ui.small.button"))
    const plain = Fixture.render(`<button class="ui button">Plain</button>`)
    expect(size(".ui.medium.button")).toBe(parseFloat(getComputedStyle(plain).fontSize))
  })

  it("dims disabled buttons, by class or attribute", () => {
    adoptIntoPage([...foundationCSS, buttonCSS])
    const root = Fixture.render(EXAMPLES["./examples/states.html"]!)
    for (const button of root.querySelectorAll(".ui.disabled.button, .ui.button:disabled")) {
      expect(parseFloat(getComputedStyle(button).opacity)).toBeCloseTo(0.45, 2)
    }
  })

  it("draws basic buttons as a transparent ring, and loading ones with a spinner", () => {
    adoptIntoPage([...foundationCSS, buttonCSS])
    const root = Fixture.render(EXAMPLES["./examples/states.html"]!)
    const basic = getComputedStyle(root.querySelector(".ui.basic.active.button")!)
    expect(basic.boxShadow).toContain("inset")
    const loading = root.querySelector(".ui.loading.button")!
    expect(getComputedStyle(loading).color).toBe("rgba(0, 0, 0, 0)")
    expect(getComputedStyle(loading, "::after").animationName).toBe("ui-button-spin")
  })

  it("keeps inverted buttons transparent with an outline on dark surfaces", () => {
    adoptIntoPage([...foundationCSS, buttonCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    for (const button of root.querySelectorAll(".ui.inverted.button")) {
      const style = getComputedStyle(button)
      expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)")
      expect(style.boxShadow).toContain("inset")
    }
  })

  it("rounds only a group's outer corners", () => {
    adoptIntoPage([...foundationCSS, buttonCSS])
    const root = Fixture.render(EXAMPLES["./examples/groups.html"]!)
    const [first, middle, last] = root.querySelectorAll<HTMLElement>(".ui.buttons > .button")
    expect(radius(first!, "start-start")).toBeGreaterThan(0)
    expect(radius(first!, "start-end")).toBe(0)
    expect(radius(middle!, "start-start") + radius(middle!, "end-end")).toBe(0)
    expect(radius(last!, "end-end")).toBeGreaterThan(0)
    expect(radius(last!, "end-start")).toBe(0)
    const vertical = root.querySelector(".ui.vertical.buttons:not(.basic, .labeled) > .button")!
    expect(radius(vertical, "start-end")).toBeGreaterThan(0)
    expect(radius(vertical, "end-start")).toBe(0)
  })

  it("gives equal-width groups equal buttons, and basic groups one border", () => {
    adoptIntoPage([...foundationCSS, buttonCSS])
    const root = Fixture.render(EXAMPLES["./examples/groups.html"]!)
    const widths = [...root.querySelectorAll(".ui.three.buttons > .button")].map((b) => b.getBoundingClientRect().width)
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1)
    const basic = root.querySelector(".ui.basic.buttons:not(.vertical)")!
    expect(getComputedStyle(basic).borderTopStyle).toBe("solid")
    const child = getComputedStyle(basic.querySelector(".button")!)
    expect(child.backgroundColor).toBe("rgba(0, 0, 0, 0)")
    expect(child.fontWeight).toBe("400")
  })

  it("draws the or badge between buttons", () => {
    adoptIntoPage([...foundationCSS, buttonCSS])
    const root = Fixture.render(EXAMPLES["./examples/content.html"]!)
    const [or, translated] = root.querySelectorAll(".or")
    expect(getComputedStyle(or!, "::before").content).toBe('"or"')
    expect(getComputedStyle(translated!, "::before").content).toBe('"ou"')
  })
})

describe("ui-button.css in shadow roots", () => {
  it("styles a host's inner <button> and keeps the host inline-flex", () => {
    adoptIntoPage(foundationCSS)
    const host = shadowHost(`<button class="ui primary button" part="button">Save</button>`)
    const blue = Fixture.render(`<span style="background-color: var(--ui-blue)"></span>`)
    expect(getComputedStyle(host).display).toBe("inline-flex")
    expect(getComputedStyle(inner(host)).backgroundColor).toBe(getComputedStyle(blue).backgroundColor)
  })

  it("hands a group's look and corners to slotted hosts, and never stretches an or", () => {
    adoptIntoPage(foundationCSS)
    defineTestOr()
    const group = shadowHost(`<div class="ui basic three buttons" role="group"><slot></slot></div>`)
    group.style.display = "block"
    group.style.width = "600px"
    const children = ["One", "Two"].map((text) => {
      const child = document.createElement("span")
      shadowInto(child, `<button class="ui button">${text}</button>`)
      return child
    })
    const or = document.createElement("test-button-or")
    group.append(children[0]!, or, children[1]!)
    const [first, second] = children.map(inner)
    expect(getComputedStyle(first!).backgroundColor).toBe("rgba(0, 0, 0, 0)")
    expect(radius(first!, "start-start")).toBeGreaterThan(0)
    expect(radius(first!, "start-end")).toBe(0)
    expect(radius(second!, "start-start")).toBe(0)
    expect(radius(second!, "end-end")).toBeGreaterThan(0)
    expect(getComputedStyle(second!).boxShadow).toContain("inset")
    expect(or.getBoundingClientRect().width).toBeLessThan(10)
    expect(
      Math.abs(children[0]!.getBoundingClientRect().width - children[1]!.getBoundingClientRect().width)
    ).toBeLessThan(1)
  })

  it('sizes a fallback icon inside <slot name="icon"> to the icon box, not the button block', () => {
    // Regression for the slot-fallback-vs-child-selector bug (the Lit spike report's "(j)" item 1, tag
    // `archive/lit-spike`):  the svg here is FALLBACK content of `<slot name="icon">`, one level deeper than
    // `.icon`'s own children, so a `>` selector (the old rule) would leave it unstyled and it'd render at the
    // browser's default SVG size.
    // NOTE:  the outer `<button>` deliberately does NOT also carry class `icon` here (unlike a real
    // icon-only `<ui-button>`), so `.icon` unambiguously selects the inner `<span>`, not the button.
    adoptIntoPage(foundationCSS)
    const host = shadowHost(
      `<button class="ui button" part="button">` +
        `<span class="icon" part="icon"><slot name="icon">` +
        `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 2 22h20z" /></svg>` +
        `</slot></span>` +
        `</button>`
    )
    const iconBox = host.shadowRoot!.querySelector<HTMLElement>(".icon")!
    const svg = host.shadowRoot!.querySelector<SVGSVGElement>(".icon svg")!
    const boxWidth = iconBox.getBoundingClientRect().width
    expect(boxWidth).toBeGreaterThan(0)
    expect(boxWidth).toBeLessThan(30)
    expect(svg.getBoundingClientRect().width).toBeCloseTo(boxWidth, 1)
    expect(svg.getBoundingClientRect().height).toBeCloseTo(iconBox.getBoundingClientRect().height, 1)
  })

  it('sizes a real <svg slot="icon"> replacement the same way as the fallback', () => {
    adoptIntoPage(foundationCSS)
    const host = shadowHost(
      `<button class="ui button" part="button">` +
        `<span class="icon" part="icon"><slot name="icon">` +
        `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 2 22h20z" /></svg>` +
        `</slot></span>` +
        `</button>`
    )
    host.innerHTML = `<svg slot="icon" viewBox="0 0 32 32" aria-hidden="true"><path d="M0 0h32v32H0z" /></svg>`
    const iconBox = host.shadowRoot!.querySelector<HTMLElement>(".icon")!
    const slotted = host.querySelector<SVGSVGElement>("svg")!
    expect(slotted.getBoundingClientRect().width).toBeCloseTo(iconBox.getBoundingClientRect().width, 1)
  })
})

/**
 * Class phrases `vocabulary` can emit for class-bearing attributes, one attribute at a time.
 * - `size` / `color` are left out:  `sizes.css` / `colors.css` own those remaps.
 */
function classPhrases(vocabulary: ComponentVocabulary): string[] {
  const builder = new ClassBuilder(vocabulary)
  const skip = new Set(["ui", vocabulary.noun])
  const phrases = new Set<string>()
  for (const spec of vocabulary.attributes) {
    if (spec.kind === "size" || spec.kind === "color") continue
    const values: (string | true)[] =
      spec.kind === "keyOnly"
        ? [true]
        : spec.kind === "keyOrValueAndKey"
          ? [true, ...listOf(spec.values)]
          : listOf(spec.values)
    if (spec.kind === "width") values.push("equal")
    for (const value of values) {
      const text = builder.build({ [spec.name]: value })
      const phrase = text
        .split(" ")
        .filter((word) => !skip.has(word))
        .join(" ")
      if (phrase) phrases.add(phrase)
    }
  }
  return [...phrases]
}

/** Inline values of a spec, or the first few of a shared set. */
function listOf(values: ComponentVocabulary["attributes"][number]["values"]): string[] {
  if (!values) return []
  if (typeof values === "string")
    return values === "widths" ? ["2", "3", "12"] : values === "floats" ? ["left", "right"] : []
  return [...values]
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

/** Resolved px of one logical corner radius, e.g. `start-end`. */
function radius(element: Element, corner: "start-start" | "start-end" | "end-start" | "end-end"): number {
  const style = getComputedStyle(element) as unknown as Record<string, string>
  const name = `border${corner.replace(/(^|-)(\w)/g, (_, _dash, letter: string) => letter.toUpperCase())}Radius`
  return parseFloat(style[name] ?? "0")
}

/**
 * A fixture host whose open shadow root adopts the foundation + `ui-button.css` and holds `html`.
 * - Stands in for a `<ui-button>` / `<ui-buttons>` element.
 */
function shadowHost(html: string): HTMLElement {
  const host = Fixture.render(`<span></span>`)
  shadowInto(host, html)
  return host
}

/** Attach a shadow root to `host` adopting the foundation + `ui-button.css`, holding `html`. */
function shadowInto(host: HTMLElement, html: string) {
  const root = host.attachShadow({ mode: "open" })
  root.adoptedStyleSheets = toSheets([...foundationCSS, buttonCSS])
  root.innerHTML = html
}

/** First element of `host`'s shadow root. */
function inner(host: Element): HTMLElement {
  return host.shadowRoot!.firstElementChild as HTMLElement
}

/**
 * Define `<test-button-or>`:  a stand-in `<ui-or>` with the `or` custom state and `ui-button.css`.
 * - Idempotent:  custom elements can only be defined once per page.
 */
function defineTestOr() {
  if (customElements.get("test-button-or")) return
  customElements.define(
    "test-button-or",
    class extends HTMLElement {
      constructor() {
        super()
        this.attachInternals().states.add("or")
        shadowInto(this, `<span class="or"></span>`)
      }
    }
  )
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
