import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { shapeVocabulary } from "./ui-shape.vocabulary.en"

import shapeCSS from "./ui-shape.css?inline"
import shapeRaw from "./ui-shape.css?raw"

/**
 * `ui-shape.css` on its own, before any element exists:  the sheet's source rules and the computed styles of the
 * light-DOM example (Fomantic's class grammar:  only the `active` side shows).
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed:  none (Fomantic's on `.side` margins and `* backface-visibility` aren't needed). */
const ALLOWED_IMPORTANT = 0

/** Adopt the sheets and render the example. */
function example(): HTMLElement {
  Sheets.adopt([...foundationCSS, shapeCSS])
  return Fixture.render(EXAMPLES["./examples/shape.html"]!)
}

////////////////
// ## Source
////////////////

describe("ui-shape.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(shapeRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(shapeRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(shapeRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("shape"))).toBe(true)
  })

  it("parses with replaceSync, keeping the side host states and the type queries", () => {
    for (const css of [shapeCSS, shapeRaw]) {
      const selectors = Sheets.selectors(css).join("\n")
      expect(selectors).toContain(":host(:state(inactive))")
      expect(selectors).toContain(":host(:state(animating))")
    }
    expect(shapeCSS).toContain("@container style(--_ui-shape-type: cube)")
  })

  it("covers every class word the vocabulary can emit", () => {
    const css = shapeRaw + colorsCSS
    for (const phrase of Sheets.classPhrases(shapeVocabulary))
      expect(Sheets.covers(css, phrase), `${shapeVocabulary.tag}: ${phrase}`).toBe(true)
    expect(Sheets.covers(css, "animating")).toBe(true)
  })
})

////////////////
// ## Examples
////////////////

describe("ui-shape.css examples", () => {
  it("only the active side shows;  the stage is an inline block with perspective", () => {
    const root = example()
    const stage = root.querySelector<HTMLElement>(".ui.shape")!
    expect(getComputedStyle(stage).display).toBe("inline-block")
    expect(getComputedStyle(stage).perspective).toBe("2000px")
    const sides = [...stage.querySelectorAll<HTMLElement>(".side")]
    expect(sides.map((side) => getComputedStyle(side).display)).toEqual(["block", "none", "none"])
    expect(getComputedStyle(stage.querySelector(".sides")!).transformStyle).toBe("preserve-3d")
  })

  it("cube faces are 15em squares;  text sides don't wrap", () => {
    const root = example()
    const face = root.querySelector<HTMLElement>(".ui.cube.shape .active.side")!
    expect(face.offsetHeight).toBe(15 * 16)
    expect(parseFloat(getComputedStyle(face).minWidth)).toBe(15 * 16)
    expect(getComputedStyle(root.querySelector(".ui.text.shape .side")!).whiteSpace).toBe("nowrap")
  })

  it("animating:  the sides box goes absolute, the staged side over it, the leaving side fades", () => {
    Sheets.adopt([...foundationCSS, shapeCSS])
    const root = Fixture.render(
      `<div class="ui animating shape"><div class="sides"><div class="active hidden side">A</div>` +
        `<div class="animating side">B</div></div></div>`
    )
    expect(getComputedStyle(root.querySelector(".sides")!).position).toBe("absolute")
    const staged = root.querySelector<HTMLElement>(".animating.side")!
    expect(getComputedStyle(staged).position).toBe("absolute")
    expect(getComputedStyle(staged).display).toBe("block")
    expect(getComputedStyle(root.querySelector(".hidden.side")!).opacity).toBe("0.6")
  })
})

////////////////
// ## Tokens
////////////////

describe("ui-shape.css tokens", () => {
  it("takes a public token from a wrapper or the shape itself (static markup)", () => {
    Sheets.adopt([...foundationCSS, shapeCSS])
    const root = Fixture.render(
      `<div style="--ui-shape-cube-size: 100px"><div class="ui cube shape"><div class="sides">` +
        `<div class="active side">A</div></div></div></div>`
    )
    expect(getComputedStyle(root.querySelector(".side")!).height).toBe("100px")
  })
})
