import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS, tokensCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { textVocabulary } from "./UIText.vocabulary.en"

import textCSS from "./UIText.css?inline"
import textRaw from "./UIText.css?raw"

/**
 * `UIText.css` on its own, before any element exists:  the sheet's source rules, the computed styles of the
 * light-DOM examples (the same class grammar the shadow root will use), and what the element keeps out.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

////////////////
// ## Source
////////////////

describe("UIText.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(textRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(textRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(textRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("text"))).toBe(true)
  })

  it("parses with replaceSync", () => {
    for (const css of [textCSS, textRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors).toContain("span.ui.inverted.text")
      expect(selectors).toContain(":host([hidden])")
    }
  })

  it("covers every class word the vocabulary can emit", () => {
    const css = textRaw + colorsCSS
    for (const phrase of Sheets.classPhrases(textVocabulary))
      expect(Sheets.covers(css, phrase), `${textVocabulary.tag}: ${phrase}`).toBe(true)
    const [, , state] = textVocabulary.attributes
    for (const value of state.values) expect(colorsCSS).toContain(`.ui.${value},`)
  })

  it("never aliases a global --ui-text-* colour token", () => {
    const aliased = [...Sheets.withoutComments(textRaw).matchAll(/--_(ui-text-[\w-]+)\s*:/g)].map(
      (match) => `--${match[1]!}`
    )
    expect(aliased.length).toBeGreaterThan(0)
    for (const name of aliased) expect(tokensCSS + colorsCSS, name).not.toMatch(new RegExp(`${name}\\s*:`))
  })
})

////////////////
// ## Examples
////////////////

describe("UIText.css examples", () => {
  it.each(Object.keys(EXAMPLES))("styles every text in %s as one tight line", (path) => {
    Sheets.adopt([...foundationCSS, textCSS])
    const root = Fixture.render(EXAMPLES[path]!)
    const texts = root.querySelectorAll<HTMLElement>("span.ui.text")
    expect(texts.length).toBeGreaterThan(0)
    for (const text of texts) {
      const style = getComputedStyle(text)
      expect(style.display, text.outerHTML.slice(0, 80)).toBe("inline")
      // `toBeCloseTo`:  Firefox snaps the font size (6.4px) and the line height to different fractions
      expect(parseFloat(style.lineHeight)).toBeCloseTo(parseFloat(style.fontSize), 1)
    }
  })

  it("colours hues and semantic states with their text role", () => {
    Sheets.adopt([...foundationCSS, textCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    for (const name of ["red", "blue", "yellow", "primary", "info", "success", "warning", "error"]) {
      const probe = Fixture.render(`<span style="color: var(--ui-${name}-text)"></span>`)
      expect(getComputedStyle(root.querySelector(`.ui.${name}.text`)!).color, name).toBe(getComputedStyle(probe).color)
    }
    const plain = Fixture.render(`<p style="color: rgb(1, 2, 3)"><span class="ui text">plain</span></p>`)
    expect(getComputedStyle(plain.firstElementChild!).color).toBe("rgb(1, 2, 3)")
  })

  it("uses the inverted hue on dark surfaces;  uncoloured inverted text inherits", () => {
    Sheets.adopt([...foundationCSS, textCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const probe = Fixture.render(`<span style="color: var(--ui-red-inverted)"></span>`)
    expect(getComputedStyle(root.querySelector(".ui.inverted.red.text")!).color).toBe(getComputedStyle(probe).color)
    const plain = root.querySelector<HTMLElement>('.ui.inverted.text[class="ui inverted text"]')!
    expect(getComputedStyle(plain).color).toBe(getComputedStyle(plain.parentElement!).color)
  })

  it("sizes on Fomantic's text ladder, relative to the surrounding text", () => {
    Sheets.adopt([...foundationCSS, textCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const base = parseFloat(getComputedStyle(root.querySelector(".ui.medium.text")!.parentElement!).fontSize)
    const ratio = (size: string) =>
      parseFloat(getComputedStyle(root.querySelector(`.ui.${size}.text`)!).fontSize) / base
    const ratios = ["mini", "tiny", "small", "medium", "large", "big", "huge", "massive"].map(ratio)
    // close, not equal:  Firefox rounds the 0.4em of `mini` to 0.3999
    ratios.forEach((each, index) => expect(each).toBeCloseTo([0.4, 0.5, 0.75, 1, 1.5, 2, 4, 8][index]!, 2))
  })

  it("fades disabled text", () => {
    Sheets.adopt([...foundationCSS, textCSS])
    const root = Fixture.render(EXAMPLES["./examples/states.html"]!)
    expect(parseFloat(getComputedStyle(root.querySelector(".ui.disabled.text")!).opacity)).toBeCloseTo(0.45, 2)
  })
})

////////////////
// ## Shadow roots
////////////////

describe("UIText.css in shadow roots", () => {
  it("renders the host as contents and the root as the coloured, sized text", () => {
    Sheets.adopt(foundationCSS)
    const wrapper = Fixture.render(`<div style="font-size: 20px"><span></span></div>`)
    const host = wrapper.firstElementChild!
    Sheets.attach(host, `<span class="ui large error text" part="text"><slot></slot></span>`, sheets())
    host.textContent = "Oops"
    const inner = Sheets.inner(host)
    const probe = Fixture.render(`<span style="color: var(--ui-error-text)"></span>`)
    expect(getComputedStyle(host).display).toBe("contents")
    expect(getComputedStyle(inner).color).toBe(getComputedStyle(probe).color)
    expect(getComputedStyle(inner).fontSize).toBe("30px")
  })

  it("keeps a parent's colour and scale out", () => {
    Sheets.adopt(foundationCSS)
    const wrapper = Fixture.render(
      `<div class="ui-red ui-large" style="color: rgb(1, 2, 3); font-size: 20px"><span></span></div>`
    )
    const host = wrapper.firstElementChild!
    Sheets.attach(host, `<span class="ui text" part="text"><slot></slot></span>`, sheets())
    const inner = Sheets.inner(host)
    expect(getComputedStyle(inner).color).toBe("rgb(1, 2, 3)")
    expect(getComputedStyle(inner).fontSize).toBe("20px")
  })
})

/** The foundation plus `UIText.css`, as a `<ui-text>` adopts them. */
function sheets(): string[] {
  return [...foundationCSS, textCSS]
}

////////////////
// ## Tokens
////////////////

describe("UIText.css tokens", () => {
  it("takes a public token from a wrapper or the text itself (static markup)", () => {
    Sheets.adopt([...foundationCSS, textCSS])
    const root = Fixture.render(
      `<div style="--ui-text-disabled-opacity: 0.25"><span class="ui disabled text">A</span></div>` +
        `<span class="ui large text" style="--ui-text-size-large: 3">B</span>`
    )
    expect(getComputedStyle(root.firstElementChild!).opacity).toBe("0.25")
    expect(getComputedStyle(root.nextElementSibling!).fontSize).toBe("48px")
  })
})
