import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/fixture"
import { Sheets } from "$/ui/test/sheets"

import { flyoutVocabulary } from "./ui-flyout.vocabulary.en"

import buttonCSS from "$/ui/components/ui-button/ui-button.css?inline"
import flyoutCSS from "./ui-flyout.css?inline"
import flyoutRaw from "./ui-flyout.css?raw"

/**
 * `ui-flyout.css` on its own, before any element exists:  the sheet's source rules and the computed styles of the
 * light-DOM examples (the class grammar the shadow `<dialog>` uses, put in flow with `position: relative`).
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed:  none. */
const ALLOWED_IMPORTANT = 0

/** Adopt the sheets and render example `name`. */
function example(name: string): HTMLElement {
  Sheets.adopt([...foundationCSS, buttonCSS, flyoutCSS])
  return Fixture.render(EXAMPLES[`./examples/${name}.html`]!)
}

/** The static flyout in `root` whose first paragraph (or header) reads `text`. */
function flyoutNamed(root: Element, text: string): HTMLElement {
  const found = [...root.querySelectorAll<HTMLElement>(".ui.flyout")].find(
    (each) => (each.querySelector(".header") ?? each.querySelector("p"))?.textContent?.trim() === text
  )
  if (!found) throw new Error(`no flyout "${text}"`)
  return found
}

describe("ui-flyout.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(flyoutRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(flyoutRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(flyoutRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("flyout"))).toBe(true)
  })

  it("parses with replaceSync, keeping the dialog, backdrop and starting-style rules", () => {
    for (const css of [flyoutCSS, flyoutRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors).toContain("dialog.ui.flyout::backdrop")
      expect(selectors).toContain("dialog.ui.flyout[open]")
    }
    expect(flyoutCSS).toContain("@starting-style")
  })

  it("covers every class word the vocabulary can emit, and the word widths", () => {
    const css = flyoutRaw + colorsCSS
    for (const phrase of Sheets.classPhrases(flyoutVocabulary))
      expect(Sheets.covers(css, phrase), `${flyoutVocabulary.tag}: ${phrase}`).toBe(true)
    for (const phrase of ["left", "right", "top", "bottom", "thin", "very thin", "wide", "very wide"])
      expect(Sheets.covers(css, phrase), phrase).toBe(true)
  })

  it("declares the owner tokens the parts read, on every root", () => {
    expect(flyoutVocabulary.ownsParts).toEqual(["header", "content", "description", "actions"])
    expect(Sheets.withoutComments(flyoutRaw)).toMatch(/\.ui\.flyout \{[^}]*--ui-inverted: 0;/)
  })
})

describe("ui-flyout.css examples", () => {
  it("draws a visible flyout:  a column of header, growing content, actions;  a shadow", () => {
    const root = example("types")
    const flyout = flyoutNamed(root, "Archive old messages")
    const style = getComputedStyle(flyout)
    expect(style.display).toBe("flex")
    expect(style.flexDirection).toBe("column")
    expect(style.visibility).toBe("visible")
    expect(style.width).toBe("400px")
    expect(style.boxShadow).not.toBe("none")
    expect(getComputedStyle(flyout.querySelector(".header")!).borderBottomStyle).toBe("solid")
    const actions = flyout.querySelector<HTMLElement>(".actions")!
    expect(actions.getBoundingClientRect().bottom).toBeCloseTo(flyout.getBoundingClientRect().bottom, 0)
    expect(getComputedStyle(actions).textAlign).toBe("right")
  })

  it("widths:  thin 200px, four wide a quarter of its containing block;  top is full width", () => {
    const root = example("variations")
    expect(getComputedStyle(flyoutNamed(root, "Thin")).width).toBe("200px")
    const four = flyoutNamed(root, "Four wide")
    expect(Math.abs(four.offsetWidth - four.parentElement!.clientWidth / 4)).toBeLessThanOrEqual(1)
    const top = flyoutNamed(root, "Top flyout")
    expect(top.offsetWidth).toBe(top.parentElement!.clientWidth)
  })

  it("inverted is the dark scheme", () => {
    const root = example("variations")
    const inverted = flyoutNamed(root, "Inverted")
    expect(getComputedStyle(inverted).colorScheme).toBe("dark")
    expect(getComputedStyle(inverted).getPropertyValue("--ui-inverted").trim()).toBe("1")
  })

  it("hidden flyouts sit off their edge", () => {
    Sheets.adopt([...foundationCSS, flyoutCSS])
    // laid out (a hidden static flyout has `display: none`, which resolves no transform)
    const root = Fixture.render(
      `<div><div class="ui left flyout" style="display: flex"></div>` +
        `<div class="ui right flyout" style="display: flex"></div></div>`
    )
    const [left, right] = root.querySelectorAll<HTMLElement>(".flyout")
    expect(getComputedStyle(left!).visibility).toBe("hidden")
    expect(new DOMMatrix(getComputedStyle(left!).transform).m41).toBe(-400)
    expect(new DOMMatrix(getComputedStyle(right!).transform).m41).toBe(400)
  })
})

describe("ui-flyout.css tokens", () => {
  it("takes a public token set on a wrapper of static markup", () => {
    Sheets.adopt([...foundationCSS, flyoutCSS])
    const root = Fixture.render(
      `<div style="--ui-flyout-width: 321px"><div class="ui visible flyout"><div class="content">x</div></div></div>`
    )
    expect(getComputedStyle(root.querySelector(".ui.flyout")!).width).toBe("321px")
  })
})
