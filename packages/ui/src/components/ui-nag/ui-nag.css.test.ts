import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { nagVocabulary } from "./ui-nag.vocabulary.en"

import nagCSS from "./ui-nag.css?inline"
import nagRaw from "./ui-nag.css?raw"

/**
 * `ui-nag.css` on its own, before any element exists:  the sheet's source rules and the computed styles of the
 * light-DOM examples (the same class grammar the shadow root uses).
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

////////////////
// ## Source
////////////////

describe("ui-nag.css source", () => {
  it("never uses rem, nor !important", () => {
    expect(Sheets.withoutComments(nagRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(Sheets.withoutComments(nagRaw)).not.toMatch(/!important/)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(nagRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("nag"))).toBe(true)
  })

  it("parses with replaceSync, keeping the ::slotted title rules", () => {
    const selectors = Sheets.selectors(nagCSS)
    expect(selectors.length).toBeGreaterThan(15)
    expect(selectors.some((selector) => selector.includes("::slotted(.title)"))).toBe(true)
  })

  it("covers every class word the vocabulary can emit", () => {
    const css = nagRaw + colorsCSS
    for (const phrase of Sheets.classPhrases(nagVocabulary))
      expect(Sheets.covers(css, phrase), `${nagVocabulary.tag}: ${phrase}`).toBe(true)
  })
})

////////////////
// ## Examples
////////////////

describe("ui-nag.css examples", () => {
  it("draws a nag as a full-width, centred, dark bar with light text", () => {
    Sheets.adopt([...foundationCSS, nagCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const nag = root.querySelector<HTMLElement>('.ui.nag[class="ui nag"]')!
    const style = getComputedStyle(nag)
    expect(style.position).toBe("relative")
    expect(style.textAlign).toBe("center")
    expect(nag.getBoundingClientRect().width).toBe(nag.parentElement!.getBoundingClientRect().width)
    expect(luminance(style.backgroundColor)).toBeLessThan(0.5)
    expect(luminance(style.color)).toBeGreaterThan(0.8)
    expect(parseFloat(style.borderTopLeftRadius)).toBeGreaterThan(0)
    const title = getComputedStyle(nag.querySelector(".title")!)
    expect(title.display).toBe("inline-block")
    const close = nag.querySelector<HTMLElement>(".close.icon")!
    expect(getComputedStyle(close).position).toBe("absolute")
    const bar = nag.getBoundingClientRect()
    const box = close.getBoundingClientRect()
    expect(Math.abs(box.top + box.height / 2 - (bar.top + bar.height / 2))).toBeLessThan(2)
  })

  it("puts overlay nags over the frame's top and bottom edges", () => {
    Sheets.adopt([...foundationCSS, nagCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const top = root.querySelector<HTMLElement>(".ui.overlay.nag:not(.bottom)")!
    const bottom = root.querySelector<HTMLElement>(".ui.bottom.overlay.nag")!
    const frame = top.parentElement!.getBoundingClientRect()
    expect(getComputedStyle(top).position).toBe("absolute")
    expect(top.getBoundingClientRect().top).toBeCloseTo(frame.top + 1, 0)
    expect(bottom.getBoundingClientRect().bottom).toBeCloseTo(frame.bottom - 1, 0)
    expect(getComputedStyle(top).borderTopLeftRadius).toBe("0px")
    expect(getComputedStyle(bottom).borderBottomLeftRadius).toBe("0px")
  })

  it("fixes a fixed nag to the viewport", () => {
    Sheets.adopt([...foundationCSS, nagCSS])
    const nag = Fixture.render(`<div class="ui bottom fixed nag">Fixed</div>`)
    expect(getComputedStyle(nag).position).toBe("fixed")
    expect(nag.getBoundingClientRect().bottom).toBeCloseTo(window.innerHeight, 0)
  })

  it("inverts light, and colours by remap", () => {
    Sheets.adopt([...foundationCSS, nagCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const inverted = getComputedStyle(root.querySelector('.ui.inverted.nag[class="ui inverted nag"]')!)
    expect(luminance(inverted.backgroundColor)).toBeGreaterThan(0.8)
    expect(luminance(inverted.color)).toBeLessThan(0.3)
    const probe = getComputedStyle(
      Fixture.render(`<span class="ui teal" style="background: var(--ui-color); color: var(--ui-color-on)"></span>`)
    )
    const teal = getComputedStyle(root.querySelector(".ui.teal.nag")!)
    expect(teal.backgroundColor).toBe(probe.backgroundColor)
    expect(teal.color).toBe(probe.color)
  })

  it("scales by size;  medium is the default", () => {
    Sheets.adopt([...foundationCSS, nagCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const size = (name: string) => parseFloat(getComputedStyle(root.querySelector(`.ui.${name}.nag`)!).fontSize)
    const ladder = ["mini", "small", "medium", "large", "huge"].map(size)
    expect([...ladder].sort((a, b) => a - b)).toEqual(ladder)
    expect(size("medium")).toBe(16)
    expect(getComputedStyle(root.querySelector(".ui.huge.nag")!).lineHeight).toBe(`${size("huge")}px`)
  })
})

/** Relative luminance (0..1) of a computed colour, via a canvas round trip. */
function luminance(color: string): number {
  const context = document.createElement("canvas").getContext("2d")!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data
  return (0.2126 * r! + 0.7152 * g! + 0.0722 * b!) / 255
}

////////////////
// ## Tokens
////////////////

describe("ui-nag.css tokens", () => {
  it("takes a public token set on a wrapper of static markup", () => {
    Sheets.adopt([...foundationCSS, nagCSS])
    const root = Fixture.render(`<div style="--ui-nag-radius: 20px"><div class="ui nag">x</div></div>`)
    expect(getComputedStyle(root.querySelector(".ui.nag")!).borderBottomLeftRadius).toBe("20px")
  })
})
