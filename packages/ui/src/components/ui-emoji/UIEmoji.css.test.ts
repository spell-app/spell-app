import { describe, expect, it } from "vite-plus/test"

import { foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { emojiVocabulary } from "./UIEmoji.vocabulary.en"

import emojiCSS from "./UIEmoji.css?inline"
import emojiRaw from "./UIEmoji.css?raw"

/**
 * `UIEmoji.css` on the class-grammar examples:  the source rules, the glyph box, Fomantic's size ladder, states.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

////////////////
// ## Source
////////////////

describe("UIEmoji.css source", () => {
  it("never uses rem or !important", () => {
    const text = Sheets.withoutComments(emojiRaw)
    expect(text).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(text).not.toContain("!important")
  })

  it("declares its sublayer order before any rule (after its keyframes)", () => {
    const text = Sheets.withoutComments(emojiRaw).replace(/\s+/g, " ").trim()
    expect(text.startsWith(Sheets.layers("emoji"))).toBe(true)
  })

  it("covers every class word the vocabulary can emit", () => {
    for (const phrase of Sheets.classPhrases(emojiVocabulary))
      expect(Sheets.covers(emojiRaw, phrase), phrase).toBe(true)
  })
})

////////////////
// ## Examples
////////////////

describe("UIEmoji.css examples", () => {
  it("draws one emoji glyph per box, in an emoji font", () => {
    Sheets.adopt([...foundationCSS, emojiCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const emoji = root.querySelector<HTMLElement>(".ui.emoji")!
    const style = getComputedStyle(emoji)
    expect(style.display).toBe("inline-block")
    expect(style.fontFamily).toContain("Emoji")
    expect(style.lineHeight).toBe(style.fontSize)
  })

  it("sizes on Fomantic's ladder, dims, spins and points", () => {
    Sheets.adopt([...foundationCSS, emojiCSS])
    const root = Fixture.render(`<div style="font-size: 16px">${EXAMPLES["./examples/variations.html"]!}</div>`)
    const sizes = [...root.querySelectorAll<HTMLElement>("section:first-child .ui.emoji")].map((emoji) =>
      parseFloat(getComputedStyle(emoji).fontSize)
    )
    expect(sizes).toEqual([24, 16, 96, 120])
    expect(getComputedStyle(root.querySelector(".ui.link.emoji")!).cursor).toBe("pointer")
    expect(parseFloat(getComputedStyle(root.querySelector(".ui.disabled.emoji")!).opacity)).toBeCloseTo(0.45, 2)
    expect(getComputedStyle(root.querySelector(".ui.loading.emoji")!).animationName).toBe("ui-emoji-spin")
    const medium = Fixture.render(`<p style="font-size: 16px"><span class="ui medium emoji">x</span></p>`)
    expect(parseFloat(getComputedStyle(medium.querySelector(".ui.emoji")!).fontSize)).toBe(48)
  })
})

////////////////
// ## Tokens
////////////////

describe("UIEmoji.css tokens", () => {
  it("takes a public token from a wrapper or the emoji itself (static markup)", () => {
    Sheets.adopt([...foundationCSS, emojiCSS])
    const root = Fixture.render(
      `<div style="--ui-emoji-opacity: 0.5"><span class="ui emoji">😄</span></div>` +
        `<span style="--ui-emoji-line-height: 3px" class="ui emoji">😄</span>`
    )
    expect(getComputedStyle(root.firstElementChild!).opacity).toBe("0.5")
    expect(getComputedStyle(root.nextElementSibling!).lineHeight).toBe("3px")
  })
})
