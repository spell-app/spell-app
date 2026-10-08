import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { iconVocabulary } from "./UIIcon.vocabulary.en"
import { iconsVocabulary } from "./UIIcons.vocabulary.en"

import iconCSS from "./UIIcon.css?inline"
import iconRaw from "./UIIcon.css?raw"

/**
 * `UIIcon.css` on its own, before any element exists:  the sheet's source rules, the computed styles of the
 * light-DOM examples (the same class grammar the shadow roots will use), and the `:state(in-icons)` contract.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

////////////////
// ## Source
////////////////

describe("UIIcon.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(iconRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(iconRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(iconRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("icon"))).toBe(true)
  })

  it("parses with replaceSync, keeping the :state(in-icons) group rules", () => {
    for (const css of [iconCSS, iconRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.length).toBeGreaterThan(30)
      expect(selectors.some((selector) => selector.includes(":host(:state(in-icons):first-child)"))).toBe(true)
      expect(selectors.some((selector) => selector.includes(":host(:state(in-icons)) > .ui.corner.icon"))).toBe(true)
    }
  })

  it("covers every class word the vocabularies can emit", () => {
    const css = iconRaw + colorsCSS
    for (const vocabulary of [iconVocabulary, iconsVocabulary]) {
      for (const phrase of Sheets.classPhrases(vocabulary))
        expect(Sheets.covers(css, phrase), `${vocabulary.tag}: ${phrase}`).toBe(true)
    }
  })
})

////////////////
// ## Examples
////////////////

describe("UIIcon.css examples", () => {
  it.each(Object.keys(EXAMPLES))("draws every icon in %s as a one-line glyph box", (path) => {
    Sheets.adopt([...foundationCSS, iconCSS])
    const root = Fixture.render(EXAMPLES[path]!)
    const icons = root.querySelectorAll<HTMLElement>(".ui.icon")
    expect(icons.length).toBeGreaterThan(0)
    for (const icon of icons) {
      const style = getComputedStyle(icon)
      // Absolutely positioned (grouped) icons are blockified:  `flex`.
      expect(style.display, icon.outerHTML.slice(0, 80)).toMatch(/^(inline-)?flex$/)
      expect(icon.getBoundingClientRect().height).toBeGreaterThan(0)
      expect(getComputedStyle(icon.querySelector("svg")!).fill).not.toBe("")
    }
  })

  it("scales with the surrounding text on Fomantic's ladder;  medium is the default", () => {
    Sheets.adopt([...foundationCSS, iconCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const size = (selector: string) => parseFloat(getComputedStyle(root.querySelector(selector)!).fontSize)
    const text = parseFloat(getComputedStyle(root).fontSize)
    const ladder = ["mini", "tiny", "small", "large", "big", "huge", "massive"].map((name) => size(`.ui.${name}.icon`))
    expect([...ladder].sort((a, b) => a - b)).toEqual(ladder)
    expect(size(".ui.huge.icon")).toBeCloseTo(text * 4, 1)
    expect(size(".ui.mini.icon")).toBeCloseTo(text * 0.4, 1)
    expect(size(".ui.medium.icon")).toBe(size('section:nth-of-type(2) > span[class="ui icon"]'))
    expect(size(".ui.medium.icon")).toBe(text)
  })

  it("colours with the resolved hue and dims disabled icons", () => {
    Sheets.adopt([...foundationCSS, iconCSS])
    const variations = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const red = Fixture.render(`<span style="color: var(--ui-red)"></span>`)
    expect(getComputedStyle(variations.querySelector(".ui.red.icon")!).color).toBe(getComputedStyle(red).color)
    const states = Fixture.render(EXAMPLES["./examples/states.html"]!)
    expect(parseFloat(getComputedStyle(states.querySelector(".ui.disabled.icon")!).opacity)).toBeCloseTo(0.45, 2)
    expect(getComputedStyle(states.querySelector(".ui.loading.icon")!).animationName).toBe("ui-icon-spin")
  })

  it("rings circular and bordered icons, and fills inverted ones", () => {
    Sheets.adopt([...foundationCSS, iconCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const circular = root.querySelector<HTMLElement>(".ui.circular.icon:not(.inverted)")!
    const box = circular.getBoundingClientRect()
    expect(box.width).toBeCloseTo(box.height, 1)
    expect(getComputedStyle(circular).borderTopLeftRadius).toBe("50%")
    expect(getComputedStyle(circular).boxShadow).toContain("inset")
    const filled = getComputedStyle(root.querySelector(".ui.teal.circular.inverted.icon")!)
    expect(filled.boxShadow).toBe("none")
    expect(filled.backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
  })

  it("flips and rotates with one transform", () => {
    Sheets.adopt([...foundationCSS, iconCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const matrix = (selector: string) => new DOMMatrix(getComputedStyle(root.querySelector(selector)!).transform)
    expect(matrix("[class*='horizontally flipped']").a).toBeCloseTo(-1)
    expect(matrix("[class*='vertically flipped']").d).toBeCloseTo(-1)
    expect(matrix("[class*='counterclockwise rotated']").b).toBeCloseTo(-1)
    expect(matrix(".ui[class~='clockwise']").b).toBeCloseTo(1)
  })

  it("stacks a group on its first icon and pins corners", () => {
    Sheets.adopt([...foundationCSS, iconCSS])
    const root = Fixture.render(EXAMPLES["./examples/groups.html"]!)
    const group = root.querySelector<HTMLElement>(".ui.huge.icons:has([class*='top left'])")!
    const [base, corner] = group.querySelectorAll<HTMLElement>(".icon")
    expect(getComputedStyle(base!).position).toBe("static")
    expect(getComputedStyle(corner!).position).toBe("absolute")
    const outer = group.getBoundingClientRect()
    const pinned = corner!.getBoundingClientRect()
    expect(Math.abs(pinned.top - outer.top)).toBeLessThan(1)
    expect(Math.abs(pinned.left - outer.left)).toBeLessThan(1)
    expect(pinned.width).toBeLessThan(base!.getBoundingClientRect().width)
    const ringed = root.querySelector(".ui.bordered.icons > .icon:first-child")!
    expect(getComputedStyle(ringed).position).toBe("absolute")
  })
})

////////////////
// ## In shadow roots
////////////////

describe("UIIcon.css in shadow roots", () => {
  it("resets an inherited scale and colour on the host", () => {
    Sheets.adopt(foundationCSS)
    const wrapper = Fixture.render(`<div class="ui-large ui-red"><span></span></div>`)
    const host = wrapper.querySelector("span")!
    Sheets.attach(host, `<span class="ui icon" part="icon"><svg viewBox="0 0 10 10"></svg></span>`, [
      ...foundationCSS,
      iconCSS
    ])
    const inner = Sheets.inner(host)
    expect(getComputedStyle(host).display).toBe("contents")
    expect(parseFloat(getComputedStyle(inner).fontSize)).toBe(parseFloat(getComputedStyle(wrapper).fontSize))
    expect(getComputedStyle(inner).color).toBe(getComputedStyle(wrapper).color)
  })

  it("positions a slotted <ui-icon> by its in-icons state", () => {
    Sheets.adopt(foundationCSS)
    defineTestIcon()
    const group = Sheets.host(`<span class="ui huge icons" part="icons"><slot></slot></span>`, [
      ...foundationCSS,
      iconCSS
    ])
    group.innerHTML = `<test-icon></test-icon><test-icon corner></test-icon>`
    const [base, corner] = [...group.querySelectorAll("test-icon")].map((icon) => Sheets.inner(icon))
    expect(getComputedStyle(base!).position).toBe("static")
    expect(getComputedStyle(corner!).position).toBe("absolute")
    expect(parseFloat(getComputedStyle(corner!).fontSize)).toBeLessThan(parseFloat(getComputedStyle(base!).fontSize))
    const outer = Sheets.inner(group).getBoundingClientRect()
    expect(outer.bottom - corner!.getBoundingClientRect().bottom).toBeLessThan(1)
  })
})

/**
 * Define `<test-icon>`:  a stand-in `<ui-icon>` with the `in-icons` state and `UIIcon.css`;
 * `corner` renders a bottom-right corner icon.
 * - Idempotent:  custom elements can only be defined once per page.
 */
function defineTestIcon() {
  if (customElements.get("test-icon")) return
  customElements.define(
    "test-icon",
    class extends HTMLElement {
      connectedCallback() {
        if (this.shadowRoot) return
        this.attachInternals().states.add("in-icons")
        const classes = this.hasAttribute("corner") ? "ui corner icon" : "ui icon"
        Sheets.attach(this, `<span class="${classes}"><svg viewBox="0 0 10 10"></svg></span>`, [
          ...foundationCSS,
          iconCSS
        ])
      }
    }
  )
}

////////////////
// ## Tokens
////////////////

describe("UIIcon.css tokens", () => {
  it("takes a public token set on a wrapper of static markup", () => {
    Sheets.adopt([...foundationCSS, iconCSS])
    const root = Fixture.render(`<div style="--ui-icon-width: 30px"><span class="ui icon"></span></div>`)
    expect(getComputedStyle(root.querySelector("span.ui.icon")!).width).toBe("30px")
  })
})
