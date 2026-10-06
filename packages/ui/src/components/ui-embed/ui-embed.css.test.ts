import { describe, expect, it } from "vite-plus/test"

import { foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { embedVocabulary } from "./ui-embed.vocabulary.en"

import embedCSS from "./ui-embed.css?inline"
import embedRaw from "./ui-embed.css?raw"

/**
 * `ui-embed.css` on its own, before any element exists:  the sheet's source rules and the computed styles of the
 * light-DOM examples (the same class grammar the shadow root uses).
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

////////////////
// ## Source
////////////////

describe("ui-embed.css source", () => {
  it("never uses rem, nor !important", () => {
    expect(Sheets.withoutComments(embedRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(Sheets.withoutComments(embedRaw)).not.toMatch(/!important/)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(embedRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("embed"))).toBe(true)
  })

  it("covers every class word the vocabulary can emit, and every ratio", () => {
    for (const phrase of Sheets.classPhrases(embedVocabulary))
      expect(Sheets.covers(embedRaw, phrase), `${embedVocabulary.tag}: ${phrase}`).toBe(true)
    for (const ratio of ["4:3", "16:9", "21:9"]) expect(Sheets.covers(embedRaw, ratio), ratio).toBe(true)
    expect(Sheets.covers(embedRaw, "square")).toBe(true)
  })
})

////////////////
// ## Examples
////////////////

describe("ui-embed.css examples", () => {
  it("sizes each box by its ratio, 16:9 by default", () => {
    Sheets.adopt([...foundationCSS, embedCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    expect(ratio(".ui.embed:not([class*=':'], .square)")).toBeCloseTo(16 / 9, 1)
    expect(ratio('.ui.embed[class*="4:3"]')).toBeCloseTo(4 / 3, 1)
    expect(ratio('.ui.embed[class*="21:9"]')).toBeCloseTo(21 / 9, 1)
    expect(ratio(".ui.square.embed")).toBeCloseTo(1, 1)

    /** Width over height of the box `selector` finds. */
    function ratio(selector: string) {
      const box = root.querySelector(selector)!.getBoundingClientRect()
      return box.width / box.height
    }
  })

  it("fills the box with the play button, the placeholder and the icon overlay", () => {
    Sheets.adopt([...foundationCSS, embedCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const embed = root.querySelector<HTMLElement>(".ui.embed")!
    const box = embed.getBoundingClientRect()
    for (const selector of [".play", ".placeholder", ".icon"]) {
      const part = embed.querySelector(selector)!.getBoundingClientRect()
      expect(part.width, selector).toBeCloseTo(box.width, 0)
      expect(part.height, selector).toBeCloseTo(box.height, 0)
    }
    const glyph = embed.querySelector<SVGElement>(".icon > svg")!.getBoundingClientRect()
    expect(glyph.left + glyph.width / 2).toBeCloseTo(box.left + box.width / 2, 0)
    expect(glyph.top + glyph.height / 2).toBeCloseTo(box.top + box.height / 2, 0)
    expect(glyph.width).toBeCloseTo(96, 0)
    const overlay = getComputedStyle(embed.querySelector(".icon")!, "::after")
    expect(overlay.opacity).toBe("0.5")
    expect(overlay.backgroundImage).toContain("radial-gradient")
    expect(getComputedStyle(embed.querySelector(".play")!).cursor).toBe("pointer")
  })

  it("shows an active embed's frame, edge to edge", () => {
    Sheets.adopt([...foundationCSS, embedCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const active = root.querySelector<HTMLElement>(".ui.active.embed")!
    const frame = active.querySelector("iframe")!
    expect(getComputedStyle(active.querySelector(".embed")!).display).toBe("block")
    expect(getComputedStyle(frame).borderTopStyle).toBe("none")
    expect(frame.getBoundingClientRect().width).toBeCloseTo(active.getBoundingClientRect().width, 0)
    expect(frame.getBoundingClientRect().height).toBeCloseTo(active.getBoundingClientRect().height, 0)
  })

  it("hides the placeholder parts once active, and the frame before", () => {
    Sheets.adopt([...foundationCSS, embedCSS])
    const root = Fixture.render(
      `<div class="ui active embed"><button class="play" type="button" aria-label="Play"></button></div>` +
        `<div class="ui embed"><div class="embed"></div></div>`
    )
    expect(getComputedStyle(root.querySelector(".play")!).display).toBe("none")
    expect(getComputedStyle(root.nextElementSibling!.querySelector(".embed")!).display).toBe("none")
  })
})

////////////////
// ## Tokens
////////////////

describe("ui-embed.css tokens", () => {
  it("takes a public token from a wrapper or the embed itself (static markup)", () => {
    Sheets.adopt([...foundationCSS, embedCSS])
    const root = Fixture.render(
      `<div style="--ui-embed-ratio: 2 / 1"><div class="ui embed"></div></div>` +
        `<div class="ui embed" style="--ui-embed-background: rgb(255, 0, 0)"></div>`
    )
    expect(getComputedStyle(root.firstElementChild!).aspectRatio).toBe("2 / 1")
    expect(getComputedStyle(root.nextElementSibling!).backgroundColor).toBe("rgb(255, 0, 0)")
  })
})
