import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/fixture"
import { Sheets } from "$/ui/test/sheets"

import { ratingVocabulary } from "./ui-rating.vocabulary.en"

import ratingCSS from "./ui-rating.css?inline"
import ratingRaw from "./ui-rating.css?raw"

/**
 * `ui-rating.css` on its own, before any element exists:  the sheet's source rules and the computed styles of the
 * light-DOM examples (Fomantic's display markup, `<div class="ui rating"><i class="active icon">`).
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** Transitions off, so computed styles are the end state at once. */
const NO_TRANSITIONS = "*, ::before, ::after { transition: none !important; }"

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

/** Background colour `token` resolves to inside `parent`. */
function probe(token: string, parent: Element): string {
  const span = document.createElement("span")
  span.style.backgroundColor = `var(${token})`
  parent.append(span)
  return getComputedStyle(span).backgroundColor
}

describe("ui-rating.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(ratingRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(ratingRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(ratingRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("rating"))).toBe(true)
  })

  it("parses with replaceSync", () => {
    for (const css of [ratingCSS, ratingRaw]) expect(Sheets.selectors(css).length).toBeGreaterThan(15)
  })

  it("covers every class word the vocabulary can emit, and the icon states", () => {
    const css = ratingRaw + colorsCSS
    for (const phrase of Sheets.classPhrases(ratingVocabulary)) expect(Sheets.covers(css, phrase), phrase).toBe(true)
    for (const word of ["active", "partial", "selected", "fill"]) expect(Sheets.covers(css, word)).toBe(true)
  })
})

describe("ui-rating.css examples", () => {
  it.each(Object.keys(EXAMPLES))("draws every icon in %s", (path) => {
    Sheets.adopt([...foundationCSS, colorsCSS, ratingCSS, NO_TRANSITIONS])
    const root = Fixture.render(EXAMPLES[path]!)
    const ratings = root.querySelectorAll<HTMLElement>(".ui.rating")
    expect(ratings.length).toBeGreaterThan(0)
    for (const rating of ratings) {
      expect(getComputedStyle(rating).display).toMatch(/^(inline-)?flex$/)
      const icon = rating.querySelector<HTMLElement>(".icon")!
      const em = parseFloat(getComputedStyle(rating).fontSize)
      expect(parseFloat(getComputedStyle(icon).width)).toBeCloseTo(1.25 * em, 0)
    }
  })

  it("colours filled icons from the remap, empty ones faint", () => {
    Sheets.adopt([...foundationCSS, colorsCSS, ratingCSS, NO_TRANSITIONS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const star = root.querySelector<HTMLElement>(".ui.yellow.rating")!
    const [active, , , empty] = star.querySelectorAll<HTMLElement>(".icon")
    expect(getComputedStyle(active!).color).toBe(probe("--ui-yellow", star))
    expect(getComputedStyle(empty!).color).not.toBe(getComputedStyle(active!).color)
  })

  it("clips a partial icon's fill to `--full`", () => {
    Sheets.adopt([...foundationCSS, colorsCSS, ratingCSS, NO_TRANSITIONS])
    const root = Fixture.render(EXAMPLES["./examples/states.html"]!)
    const partial = root.querySelector<HTMLElement>(".partial.active.icon")!
    const fill = partial.querySelector(".fill")!
    expect(getComputedStyle(fill).clipPath).toBe("inset(0px 50% 0px 0px)")
    expect(getComputedStyle(fill).position).toBe("absolute")
    expect(getComputedStyle(partial).color).not.toBe(getComputedStyle(fill).color)
  })

  it("scales with `size`", () => {
    Sheets.adopt([...foundationCSS, colorsCSS, ratingCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const width = (selector: string) => parseFloat(getComputedStyle(root.querySelector(`${selector} .icon`)!).width)
    expect(width(".ui.massive.rating") / width(".ui.mini.rating")).toBeGreaterThan(3)
  })

  it("takes a public token from a wrapper (static markup)", () => {
    Sheets.adopt([...foundationCSS, colorsCSS, ratingCSS])
    const root = Fixture.render(
      `<div style="--ui-rating-icon-width: 40px"><div class="ui rating"><i class="active icon"></i></div></div>`
    )
    expect(getComputedStyle(root.querySelector(".icon")!).width).toBe("40px")
  })

  it("takes no pointer while disabled", () => {
    Sheets.adopt([...foundationCSS, colorsCSS, ratingCSS])
    const root = Fixture.render(EXAMPLES["./examples/states.html"]!)
    expect(getComputedStyle(root.querySelector(".ui.disabled.rating .icon")!).pointerEvents).toBe("none")
  })
})
