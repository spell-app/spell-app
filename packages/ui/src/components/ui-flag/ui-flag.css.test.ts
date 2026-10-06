import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { UIT } from "$/ui/core"
import { FLAG_ALIASES } from "./ui-flag.types"
import { flagVocabulary } from "./ui-flag.vocabulary.en"

import flagCSS from "./ui-flag.css?inline"
import flagRaw from "./ui-flag.css?raw"

/**
 * `ui-flag.css` on its own, before any element exists:  the sheet's source rules, the computed styles of the
 * light-DOM examples (the same class grammar the shadow root will use), and the country data the element
 * resolves `country` with.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

////////////////
// ## Source
////////////////

describe("ui-flag.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(flagRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(flagRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(flagRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("flag"))).toBe(true)
  })

  it("parses with replaceSync", () => {
    for (const css of [flagCSS, flagRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors).toContain(".ui.medium.flag")
      expect(selectors).toContain(":host([hidden])")
    }
  })

  it("covers every class word the vocabulary can emit, and every size it offers", () => {
    const css = flagRaw + colorsCSS
    for (const phrase of Sheets.classPhrases(flagVocabulary))
      expect(Sheets.covers(css, phrase), `${flagVocabulary.tag}: ${phrase}`).toBe(true)
    const [size] = flagVocabulary.attributes
    for (const value of size.values) expect(flagRaw).toContain(`--_ui-flag-size-${value}:`)
  })
})

////////////////
// ## Examples
////////////////

describe("ui-flag.css examples", () => {
  it.each(Object.keys(EXAMPLES))("draws every flag in %s as a one-line emoji box", (path) => {
    Sheets.adopt([...foundationCSS, flagCSS])
    const root = Fixture.render(EXAMPLES[path]!)
    const flags = root.querySelectorAll<HTMLElement>(".ui.flag")
    expect(flags.length).toBeGreaterThan(0)
    for (const flag of flags) {
      const style = getComputedStyle(flag)
      expect(style.display, flag.outerHTML.slice(0, 80)).toBe("inline-block")
      // `toBeCloseTo`:  Firefox snaps the font size and the line height to different fractions
      expect(parseFloat(style.lineHeight)).toBeCloseTo(parseFloat(style.fontSize), 1)
      expect(style.fontFamily).toContain("Color Emoji")
      expect(parseFloat(style.marginRight)).toBeGreaterThan(0)
      expect(flag.getAttribute("role")).toBe("img")
      expect(flag.getAttribute("aria-label")).toBeTruthy()
    }
  })

  it("sizes on Fomantic's flag ladder, relative to the surrounding text", () => {
    Sheets.adopt([...foundationCSS, flagCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const base = parseFloat(getComputedStyle(root.querySelector(".ui.small.flag")!.parentElement!).fontSize)
    const ratio = (size: string) =>
      parseFloat(getComputedStyle(root.querySelector(`.ui.${size}.flag`)!).fontSize) / base
    expect(["small", "medium", "large", "big", "huge", "massive"].map(ratio)).toEqual([1.5, 3, 6, 7.5, 9, 12])
    expect(getComputedStyle(root.querySelector(".ui.large.flag")!).verticalAlign).toBe("middle")
  })

  it("autosizes an unsized flag to the text around it, on its baseline", () => {
    Sheets.adopt([...foundationCSS, flagCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    for (const flag of root.querySelectorAll<HTMLElement>('.ui.flag[class="ui flag"]')) {
      const style = getComputedStyle(flag)
      expect(style.fontSize).toBe(getComputedStyle(flag.parentElement!).fontSize)
      expect(style.verticalAlign).toBe("baseline")
    }
  })
})

////////////////
// ## In shadow roots
////////////////

describe("ui-flag.css in shadow roots", () => {
  it("renders the host as contents and ignores a parent's scale", () => {
    Sheets.adopt(foundationCSS)
    const wrapper = Fixture.render(`<div class="ui-huge" style="font-size: 20px"><span></span><span></span></div>`)
    const [plain, large] = [...wrapper.children].map((host, index) => {
      const size = index ? "large " : ""
      Sheets.attach(host, `<span class="ui ${size}flag" part="flag" role="img" aria-label="France">🇫🇷</span>`, [
        ...foundationCSS,
        flagCSS
      ])
      return Sheets.inner(host)
    })
    expect(getComputedStyle(wrapper.firstElementChild!).display).toBe("contents")
    expect(getComputedStyle(plain!).fontSize).toBe("20px")
    expect(getComputedStyle(large!).fontSize).toBe("120px")
    expect(plain!.getBoundingClientRect().width).toBeGreaterThan(0)
  })
})

////////////////
// ## FLAG_ALIASES / UIT.SpecialFlags
////////////////

describe("FLAG_ALIASES / UIT.SpecialFlags", () => {
  it("normalizes every alias and maps it to a two-letter code or a SpecialFlags key", () => {
    const aliases: Readonly<Record<string, string>> = FLAG_ALIASES
    expect(Object.keys(aliases).length).toBeGreaterThan(250)
    for (const [name, code] of Object.entries(aliases)) {
      expect(name, name).toBe(name.trim().toLowerCase().replaceAll("_", " ").replace(/\s+/g, " "))
      expect(name).not.toBe(code)
      expect(/^[a-z]{2}$/.test(code) || code in UIT.SpecialFlags, `${name} => ${code}`).toBe(true)
    }
    expect(aliases).toMatchObject({
      "united states": "us",
      america: "us",
      uk: "gb",
      england: "gb-eng",
      pride: "rainbow"
    })
  })

  it("names every two-letter code through Intl.DisplayNames", () => {
    const names = new Intl.DisplayNames(["en"], { type: "region" })
    const codes = new Set(Object.values(FLAG_ALIASES as Readonly<Record<string, string>>))
    for (const code of codes) {
      if (code in UIT.SpecialFlags) continue
      const name = names.of(code.toUpperCase())
      expect(name, code).toBeTruthy()
      expect(name, code).not.toBe(code.toUpperCase())
    }
  })

  it("labels every non-country flag through the vocabulary's texts, and the examples use them", () => {
    const keys = new Set<string>(flagVocabulary.texts.map((text) => text.key))
    const types = EXAMPLES["./examples/types.html"]!
    for (const [code, emoji] of Object.entries(UIT.SpecialFlags)) {
      expect(keys.has(code.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase())), code).toBe(true)
      expect(types, code).toContain(emoji)
    }
  })
})

////////////////
// ## Tokens
////////////////

describe("ui-flag.css tokens", () => {
  it("takes a public token from a wrapper or the flag itself (static markup)", () => {
    Sheets.adopt([...foundationCSS, flagCSS])
    const root = Fixture.render(
      `<div style="--ui-flag-distance: 10px"><span class="ui flag">🇫🇷</span></div>` +
        `<span style="--ui-flag-line-height: 3px" class="ui flag">🇫🇷</span>`
    )
    expect(getComputedStyle(root.firstElementChild!).marginRight).toBe("10px")
    expect(getComputedStyle(root.nextElementSibling!).lineHeight).toBe("3px")
  })
})
