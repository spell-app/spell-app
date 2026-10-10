import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { dividerVocabulary } from "./UIDivider.en"

import dividerCSS from "./UIDivider.css?inline"
import dividerRaw from "./UIDivider.css?raw"

/**
 * `UIDivider.css` on its own, before any element exists:  the sheet's source rules and the computed styles of the
 * light-DOM examples (the same class grammar the shadow root will use).
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

////////////////
// ## Source
////////////////

describe("UIDivider.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(dividerRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(dividerRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(dividerRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("divider"))).toBe(true)
  })

  it("parses with replaceSync", () => {
    for (const css of [dividerCSS, dividerRaw]) expect(Sheets.selectors(css).length).toBeGreaterThan(15)
  })

  it("covers every class word the vocabulary can emit", () => {
    const css = dividerRaw + colorsCSS
    for (const phrase of Sheets.classPhrases(dividerVocabulary)) expect(Sheets.covers(css, phrase), phrase).toBe(true)
  })
})

////////////////
// ## Examples
////////////////

describe("UIDivider.css examples", () => {
  it.each(Object.keys(EXAMPLES))("styles every divider in %s", (path) => {
    Sheets.adopt([...foundationCSS, dividerCSS])
    const root = Fixture.render(EXAMPLES[path]!)
    const dividers = root.querySelectorAll<HTMLElement>(".ui.divider")
    expect(dividers.length).toBeGreaterThan(0)
    for (const divider of dividers) {
      const style = getComputedStyle(divider)
      expect(style.textTransform, divider.outerHTML.slice(0, 80)).toBe("uppercase")
      expect(style.fontWeight).toBe("700")
      expect(style.userSelect).toBe("none")
    }
  })

  it("draws a plain divider as one hairline with space around it", () => {
    Sheets.adopt([...foundationCSS, dividerCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const style = getComputedStyle(root.querySelector('.ui.divider[class="ui divider"]')!)
    expect(style.borderTopStyle).toBe("solid")
    expect(style.borderTopWidth).toBe("1px")
    expect(parseFloat(style.marginTop)).toBe(parseFloat(style.fontSize))
  })

  it("draws rules either side of horizontal text, and drops one when aligned", () => {
    Sheets.adopt([...foundationCSS, dividerCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const horizontal = root.querySelector<HTMLElement>(".ui.horizontal.divider:not([class*='aligned'])")!
    expect(getComputedStyle(horizontal).display).toBe("flex")
    const before = getComputedStyle(horizontal, "::before")
    expect(before.borderTopStyle).toBe("solid")
    expect(parseFloat(before.width)).toBeGreaterThan(20)
    const left = root.querySelector("[class*='left aligned'].divider")!
    expect(getComputedStyle(left, "::before").display).toBe("none")
    expect(getComputedStyle(left, "::after").display).not.toBe("none")
  })

  it("centres a vertical divider in its owner", () => {
    Sheets.adopt([...foundationCSS, dividerCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const vertical = root.querySelector<HTMLElement>(".ui.vertical.divider")!
    const owner = vertical.parentElement!.getBoundingClientRect()
    const box = vertical.getBoundingClientRect()
    expect(getComputedStyle(vertical).position).toBe("absolute")
    expect(Math.abs(box.left + box.width / 2 - (owner.left + owner.width / 2))).toBeLessThan(1)
    expect(getComputedStyle(vertical, "::before").borderLeftStyle).toBe("solid")
  })

  it("hides, fits, sections, clears and inverts", () => {
    Sheets.adopt([...foundationCSS, dividerCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const style = (selector: string) => getComputedStyle(root.querySelector(selector)!)
    expect(style(".ui.hidden.divider").borderTopColor).toBe("rgba(0, 0, 0, 0)")
    expect(style(".ui.fitted.divider").marginTop).toBe("0px")
    expect(parseFloat(style(".ui.section.divider").marginTop)).toBe(
      2 * parseFloat(style(".ui.section.divider").fontSize)
    )
    expect(style(".ui.clearing.divider").clear).toBe("both")
    expect(style(".ui.inverted.divider").colorScheme).toBe("dark")
    const red = Fixture.render(`<span style="color: var(--ui-red)"></span>`)
    expect(style(".ui.red.divider").borderTopColor).toBe(getComputedStyle(red).color)
  })

  it("scales by size;  medium is the default", () => {
    Sheets.adopt([...foundationCSS, dividerCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const size = (selector: string) => parseFloat(getComputedStyle(root.querySelector(selector)!).fontSize)
    const ladder = ["mini", "tiny", "small", "large", "big", "huge", "massive"].map((name) =>
      size(`.ui.${name}.divider`)
    )
    expect([...ladder].sort((a, b) => a - b)).toEqual(ladder)
    expect(size(".ui.medium.divider")).toBe(size('.ui.divider[class="ui horizontal divider"]'))
  })
})

////////////////
// ## Tokens
////////////////

describe("UIDivider.css tokens", () => {
  it("takes a public token from a wrapper or the divider itself (static markup)", () => {
    Sheets.adopt([...foundationCSS, dividerCSS])
    const root = Fixture.render(
      `<div style="--ui-divider-margin: 20px"><div class="ui divider"></div></div>` +
        `<div class="ui divider" style="--ui-divider-line-width: 3px"></div>`
    )
    expect(getComputedStyle(root.firstElementChild!).marginTop).toBe("20px")
    expect(getComputedStyle(root.nextElementSibling!).borderTopWidth).toBe("3px")
  })
})

////////////////
// ## In shadow roots
////////////////

describe("UIDivider.css in shadow roots", () => {
  it("keeps the host out of layout and draws the root", () => {
    Sheets.adopt(foundationCSS)
    const host = Sheets.host(`<div class="ui divider" role="separator" part="divider"><slot></slot></div>`, [
      ...foundationCSS,
      dividerCSS
    ])
    expect(getComputedStyle(host).display).toBe("contents")
    expect(getComputedStyle(Sheets.inner(host)).borderTopWidth).toBe("1px")
  })
})
