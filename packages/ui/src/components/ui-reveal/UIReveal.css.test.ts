import { describe, expect, it } from "vite-plus/test"

import { foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { revealVocabulary } from "./UIReveal.vocabulary.en"

import revealCSS from "./UIReveal.css?inline"
import revealRaw from "./UIReveal.css?raw"

/**
 * `UIReveal.css` on the class-grammar examples:  the source rules, the stacked contents, and what each type does
 * once revealed (`.active` stands in for hover).
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** Adopt the sheet and render `html`. */
function render(html: string): HTMLElement {
  Sheets.adopt([...foundationCSS, revealCSS])
  return Fixture.render(html)
}

/** The visible content of the reveal in `root` matching `selector`. */
function visible(root: Element, selector: string): CSSStyleDeclaration {
  return getComputedStyle(root.querySelector(`${selector} > .visible.content`)!)
}

////////////////
// ## Source
////////////////

describe("UIReveal.css source", () => {
  it("never uses rem or !important", () => {
    const text = Sheets.withoutComments(revealRaw)
    expect(text).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(text).not.toContain("!important")
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(revealRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("reveal"))).toBe(true)
  })

  it("covers every class word the vocabulary can emit, and reveals on focus as on hover", () => {
    for (const phrase of Sheets.classPhrases(revealVocabulary))
      expect(Sheets.covers(revealRaw, phrase), phrase).toBe(true)
    const selectors = Sheets.selectors(revealCSS)
    const revealed = selectors.filter((selector) => selector.includes(":hover"))
    expect(revealed.length).toBeGreaterThan(10)
    for (const selector of revealed) expect(selector, selector).toContain(":focus-within")
  })
})

////////////////
// ## Examples
////////////////

describe("UIReveal.css examples", () => {
  it("stacks the visible content over the hidden one", () => {
    const root = render(EXAMPLES["./examples/types.html"]!)
    const reveal = root.querySelector<HTMLElement>(".ui.fade.reveal")!
    expect(getComputedStyle(reveal).position).toBe("relative")
    expect(getComputedStyle(reveal).display).toBe("inline-block")
    const front = reveal.querySelector(".visible.content")!.getBoundingClientRect()
    const back = reveal.querySelector(".hidden.content")!.getBoundingClientRect()
    expect(front.top).toBe(back.top)
    expect(front.left).toBe(back.left)
  })

  it("moves, rotates, slides and fades the visible content once revealed", () => {
    const root = render(
      `<div>` +
        ["fade", "move", "move right", "move up", "rotate", "rotate left", "slide", "slide down"]
          .map(
            (type) =>
              `<div class="ui instant active ${type} reveal" data-type="${type}">` +
              `<div class="visible content">A</div><div class="hidden content">B</div></div>`
          )
          .join("") +
        `</div>`
    )
    const style = (type: string) => visible(root, `[data-type="${type}"]`)
    expect(style("fade").opacity).toBe("0")
    expect(style("move").transform).toMatch(/^matrix\(1, 0, 0, 1, -/)
    expect(style("move right").transform).toMatch(/^matrix\(1, 0, 0, 1, \d/)
    expect(style("move up").transform).toMatch(/, -[\d.]+\)$/)
    expect(style("rotate").transform).not.toBe("none")
    expect(style("rotate").transformOrigin).toMatch(/px \d+(\.\d+)?px$/)
    expect(style("slide").transform).toMatch(/^matrix\(1, 0, 0, 1, -/)
    expect(style("slide down").transform).toMatch(/, [\d.]+\)$/)
    const hidden = getComputedStyle(root.querySelector('[data-type="slide"] > .hidden.content')!)
    expect(hidden.transform).toBe("matrix(1, 0, 0, 1, 0, 0)")
  })

  it("delays transitions unless instant, and clips unless visible", () => {
    const root = render(EXAMPLES["./examples/variations.html"]!)
    expect(visible(root, ".ui.instant.reveal").transitionDelay).toBe("0s")
    expect(visible(root, ".ui.small.fade.reveal").transitionDelay).toBe("0.1s")
    expect(getComputedStyle(root.querySelector(".ui.visible.reveal")!).overflow).toBe("visible")
  })
})

////////////////
// ## Tokens
////////////////

describe("UIReveal.css tokens", () => {
  it("takes a public token from a wrapper or the reveal itself (static markup)", () => {
    Sheets.adopt([...foundationCSS, revealCSS])
    const root = Fixture.render(
      `<div style="--ui-reveal-duration: 1s"><div class="ui fade reveal"><div class="visible content">A</div>` +
        `<div class="hidden content">B</div></div></div>` +
        `<div class="ui rotate reveal" style="--ui-reveal-duration: 2s"><div class="visible content">A</div>` +
        `<div class="hidden content">B</div></div>`
    )
    expect(getComputedStyle(root.querySelector(".visible")!).transitionDuration).toBe("1s")
    expect(getComputedStyle(root.nextElementSibling!.querySelector(".visible")!).transitionDuration).toBe("2s")
  })
})
