import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/fixture"
import { Sheets } from "$/ui/test/sheets"

import { breadcrumbSectionVocabulary } from "./ui-breadcrumb-section.vocabulary.en"
import { breadcrumbVocabulary } from "./ui-breadcrumb.vocabulary.en"

import breadcrumbCSS from "./ui-breadcrumb.css?inline"
import breadcrumbRaw from "./ui-breadcrumb.css?raw"

/**
 * `ui-breadcrumb.css` on its own, before any element exists:  the sheet's source rules, the computed styles of the
 * light-DOM examples (Fomantic's markup and the semantic list form), and -- the part static markup can't show --
 * section hosts in their own shadow roots drawing the breadcrumb's divider tokens.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

/** A chevron as a CSS `url()`, the value the element publishes for `divider-icon`. */
const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Cpath d='M2 0l6 5-6 5z'/%3E%3C/svg%3E")`

describe("ui-breadcrumb.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(breadcrumbRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(breadcrumbRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(breadcrumbRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("breadcrumb"))).toBe(true)
  })

  it("parses with replaceSync, keeping host-position and icon-divider rules", () => {
    for (const css of [breadcrumbCSS, breadcrumbRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.length).toBeGreaterThan(15)
      expect(selectors.some((selector) => selector.includes(":host(:first-child) > .divider"))).toBe(true)
      expect(css).toMatch(/@container style\(--_ui-breadcrumb-divider-layout: ?icon\)/)
    }
  })

  it("covers every class word the vocabularies can emit", () => {
    const css = breadcrumbRaw + colorsCSS
    for (const vocabulary of [breadcrumbVocabulary, breadcrumbSectionVocabulary]) {
      for (const phrase of Sheets.classPhrases(vocabulary))
        expect(Sheets.covers(css, phrase), `${vocabulary.tag}: ${phrase}`).toBe(true)
    }
  })
})

describe("ui-breadcrumb.css examples", () => {
  it.each(Object.keys(EXAMPLES))("styles every breadcrumb in %s", (path) => {
    Sheets.adopt([...foundationCSS, breadcrumbCSS])
    const root = Fixture.render(EXAMPLES[path]!)
    const breadcrumbs = root.querySelectorAll<HTMLElement>(".ui.breadcrumb")
    expect(breadcrumbs.length).toBeGreaterThan(0)
    for (const breadcrumb of breadcrumbs) {
      expect(getComputedStyle(breadcrumb).display, breadcrumb.outerHTML.slice(0, 80)).toBe("inline-block")
      for (const section of breadcrumb.querySelectorAll(".section"))
        expect(getComputedStyle(section).display).toBe("inline-block")
      const active = breadcrumb.querySelector(".active.section")
      if (active) expect(getComputedStyle(active).fontWeight).toBe("700")
    }
  })

  it("colours links, dims dividers and keeps the trail on one line", () => {
    Sheets.adopt([...foundationCSS, breadcrumbCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const breadcrumb = root.querySelector<HTMLElement>(".ui.breadcrumb")!
    const link = Fixture.render(`<span style="color: var(--ui-link)"></span>`)
    expect(getComputedStyle(breadcrumb.querySelector("a.section")!).color).toBe(getComputedStyle(link).color)
    const divider = getComputedStyle(breadcrumb.querySelector(".divider")!)
    expect(divider.opacity).toBe("0.7")
    expect(parseFloat(divider.marginLeft)).toBeGreaterThan(0)
    const [first, , last] = breadcrumb.querySelectorAll<HTMLElement>(".section")
    expect(first!.getBoundingClientRect().top).toBe(last!.getBoundingClientRect().top)
  })

  it("draws the token divider in the semantic form, hiding the first", () => {
    Sheets.adopt([...foundationCSS, breadcrumbCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const [plain, arrow] = root.querySelectorAll<HTMLElement>(".ui.breadcrumb:has(ol)")
    const dividers = plain!.querySelectorAll(".divider")
    expect(getComputedStyle(dividers[0]!).display).toBe("none")
    expect(getComputedStyle(dividers[1]!, "::before").content).toBe('"/"')
    expect(getComputedStyle(arrow!.querySelectorAll(".divider")[1]!, "::before").content).toBe('"›"')
    const icon = root.querySelector<HTMLElement>(
      ".ui.breadcrumb:has(ol)[style*='layout: icon'] li:nth-child(2) .divider"
    )!
    const before = getComputedStyle(icon, "::before")
    expect(before.maskImage).toContain("data:image/svg+xml")
    expect(before.width).toBe(before.height)
  })

  it("scales by size;  medium is the default", () => {
    Sheets.adopt([...foundationCSS, breadcrumbCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const size = (selector: string) => parseFloat(getComputedStyle(root.querySelector(selector)!).fontSize)
    const ladder = ["mini", "tiny", "small", "large", "big", "huge", "massive"].map((name) =>
      size(`.ui.${name}.breadcrumb`)
    )
    expect([...ladder].sort((a, b) => a - b)).toEqual(ladder)
    expect(size(".ui.medium.breadcrumb")).toBe(16)
  })

  it("takes a public token from a wrapper or the breadcrumb itself (static markup)", () => {
    Sheets.adopt([...foundationCSS, breadcrumbCSS])
    const root = Fixture.render(
      `<div style="--ui-breadcrumb-divider-opacity: 0.5"><nav class="ui breadcrumb">` +
        `<a class="section">A</a><span class="divider">/</span><span class="active section">B</span></nav></div>` +
        `<nav class="ui breadcrumb" style="--ui-breadcrumb-active-font-weight: 400">` +
        `<span class="active section">C</span></nav>`
    )
    expect(getComputedStyle(root.querySelector(".divider")!).opacity).toBe("0.5")
    expect(getComputedStyle(root.nextElementSibling!.querySelector(".active")!).fontWeight).toBe("400")
  })

  it("inverts to the dark scheme, the active section brightest", () => {
    Sheets.adopt([...foundationCSS, breadcrumbCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const breadcrumb = root.querySelector<HTMLElement>(".ui.inverted.breadcrumb")!
    expect(getComputedStyle(breadcrumb).colorScheme).toBe("dark")
    expect(getComputedStyle(breadcrumb).getPropertyValue("--ui-inverted").trim()).toBe("1")
    const active = luminance(getComputedStyle(breadcrumb.querySelector(".active.section")!).color)
    const text = luminance(getComputedStyle(breadcrumb).color)
    expect(active).toBeGreaterThan(0.8)
    // a small slack:  the canvas round trip of a translucent colour is off by a few 1/255 in Firefox
    expect(active).toBeGreaterThanOrEqual(text - 0.01)
  })
})

describe("ui-breadcrumb.css in shadow roots", () => {
  it("lets section hosts draw the breadcrumb's divider, text or icon, skipping the first", () => {
    Sheets.adopt(foundationCSS)
    const breadcrumb = Sheets.host(
      `<nav class="ui breadcrumb" part="breadcrumb" aria-label="Breadcrumb"><ol part="list"><slot></slot></ol></nav>`,
      sheets()
    )
    const sections = ["Home", "Store", "T-Shirt"].map((text, index) => {
      const section = document.createElement("span")
      breadcrumb.append(section)
      const inner =
        index === 2
          ? `<span class="active section" part="section" aria-current="page">${text}<slot></slot></span>`
          : `<a class="section" part="section" href="#${text}">${text}<slot></slot></a>`
      Sheets.attach(section, `<span class="divider" part="divider" aria-hidden="true"></span>${inner}`, sheets())
      return section
    })
    const divider = (index: number) => sections[index]!.shadowRoot!.querySelector(".divider")!
    expect(getComputedStyle(breadcrumb).display).toBe("contents")
    expect(getComputedStyle(sections[0]!).display).toBe("contents")
    expect(getComputedStyle(divider(0)).display).toBe("none")
    expect(getComputedStyle(divider(1)).display).toBe("inline-block")
    expect(getComputedStyle(divider(1), "::before").content).toBe('"/"')
    const link = Fixture.render(`<span style="color: var(--ui-link)"></span>`)
    expect(getComputedStyle(sections[0]!.shadowRoot!.querySelector("a")!).color).toBe(getComputedStyle(link).color)
    expect(getComputedStyle(sections[2]!.shadowRoot!.querySelector(".active")!).fontWeight).toBe("700")
    const nav = Sheets.inner(breadcrumb)
    nav.style.setProperty("--ui-breadcrumb-divider", `"›"`)
    expect(getComputedStyle(divider(2), "::before").content).toBe('"›"')
    nav.style.setProperty("--_ui-breadcrumb-divider-layout", "icon")
    nav.style.setProperty("--ui-breadcrumb-divider-icon", CHEVRON)
    const icon = getComputedStyle(divider(2), "::before")
    expect(icon.content).toBe('""')
    expect(icon.maskImage).toContain("data:image/svg+xml")
    expect(icon.backgroundColor).toBe(getComputedStyle(divider(2)).color)
    expect(parseFloat(getComputedStyle(divider(2)).fontSize)).toBeCloseTo(0.78571 * 16, 1)
  })
})

/** Foundation plus `ui-breadcrumb.css`, as a breadcrumb or section host adopts them. */
function sheets(): string[] {
  return [...foundationCSS, breadcrumbCSS]
}

/** Relative luminance (0..1) of a computed `rgb()` / `oklch()` colour, via a canvas round trip. */
function luminance(color: string): number {
  const context = document.createElement("canvas").getContext("2d")!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data
  return (0.2126 * r! + 0.7152 * g! + 0.0722 * b!) / 255
}
