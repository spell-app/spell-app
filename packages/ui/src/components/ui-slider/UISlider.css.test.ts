import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { sliderVocabulary } from "./UISlider.en"

import sliderCSS from "./UISlider.css?inline"
import sliderRaw from "./UISlider.css?raw"

/**
 * `UISlider.css` on its own, before any element exists:  the sheet's source rules and the computed layout of the
 * light-DOM examples (Fomantic's markup with the ratios the element writes).
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** Transitions off, so computed styles are the end state at once. */
const NO_TRANSITIONS = "*, ::before, ::after { transition: none !important; }"

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

/** A static slider in a 400px wide box;  returns its root. */
function render(classes: string, inner: string, thumbs: string, extra = ""): HTMLElement {
  Sheets.adopt([...foundationCSS, colorsCSS, sliderCSS, NO_TRANSITIONS])
  const box = Fixture.render(`<div style="width: 400px; height: 300px"><div class="${classes}">
    <div class="inner" style="${inner}"><div class="track"></div><div class="track-fill"></div>${thumbs}</div>
    ${extra}</div></div>`)
  return box.firstElementChild as HTMLElement
}

/** Centre of `element` along x (or y), relative to `origin`'s box. */
function centre(element: Element, origin: Element, axis: "x" | "y" = "x"): number {
  const box = element.getBoundingClientRect()
  const from = origin.getBoundingClientRect()
  return axis === "x" ? box.left + box.width / 2 - from.left : box.top + box.height / 2 - from.top
}

////////////////
// ## Source
////////////////

describe("UISlider.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(sliderRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(sliderRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(sliderRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("slider"))).toBe(true)
  })

  it("parses with replaceSync", () => {
    for (const css of [sliderCSS, sliderRaw]) expect(Sheets.selectors(css).length).toBeGreaterThan(40)
  })

  it("covers every class word the vocabulary can emit", () => {
    const css = sliderRaw + colorsCSS
    for (const phrase of Sheets.classPhrases(sliderVocabulary)) expect(Sheets.covers(css, phrase), phrase).toBe(true)
    for (const word of ["halftick", "track-fill", "inner"]) expect(Sheets.covers(css, word)).toBe(true)
  })
})

////////////////
// ## Examples
////////////////

describe("UISlider.css examples", () => {
  it.each(Object.keys(EXAMPLES))("lays out every slider in %s", (path) => {
    Sheets.adopt([...foundationCSS, colorsCSS, sliderCSS, NO_TRANSITIONS])
    const root = Fixture.render(EXAMPLES[path]!)
    const sliders = root.querySelectorAll<HTMLElement>(".ui.slider")
    expect(sliders.length).toBeGreaterThan(0)
    for (const slider of sliders) {
      const thumb = slider.querySelector<HTMLElement>(".thumb")!
      const em = parseFloat(getComputedStyle(slider).fontSize)
      expect(getComputedStyle(thumb).position).toBe("absolute")
      expect(parseFloat(getComputedStyle(thumb).width)).toBeCloseTo(1.5 * em, 0)
    }
  })

  it("puts the thumb's centre at its ratio, the fill up to it", () => {
    const root = render("ui slider", "--_slider-to: 0.25", `<div class="thumb" style="--_slider-at: 0.25"></div>`)
    const inner = root.querySelector(".inner")!
    const thumb = root.querySelector(".thumb")!
    const size = thumb.getBoundingClientRect().width
    const length = inner.getBoundingClientRect().width - size
    expect(centre(thumb, inner)).toBeCloseTo(size / 2 + 0.25 * length, 0)
    const fill = root.querySelector(".track-fill")!.getBoundingClientRect()
    expect(fill.left).toBeCloseTo(inner.getBoundingClientRect().left, 0)
    expect(fill.right - inner.getBoundingClientRect().left).toBeCloseTo(centre(thumb, inner), 0)
  })

  it("fills a range between the thumbs' centres", () => {
    const root = render(
      "ui range slider",
      "--_slider-from: 0.2; --_slider-to: 0.6",
      `<div class="thumb" style="--_slider-at: 0.2"></div><div class="second thumb" style="--_slider-at: 0.6"></div>`
    )
    const inner = root.querySelector(".inner")!
    const [first, second] = root.querySelectorAll(".thumb")
    const fill = root.querySelector(".track-fill")!.getBoundingClientRect()
    const left = inner.getBoundingClientRect().left
    expect(fill.left - left).toBeCloseTo(centre(first!, inner), 0)
    expect(fill.right - left).toBeCloseTo(centre(second!, inner), 0)
  })

  it("mirrors a reversed slider and runs a vertical one downward", () => {
    const reversed = render(
      "ui reversed slider",
      "--_slider-to: 0.25",
      `<div class="thumb" style="--_slider-at: 0.25"></div>`
    )
    const inner = reversed.querySelector(".inner")!
    const width = inner.getBoundingClientRect().width
    expect(centre(reversed.querySelector(".thumb")!, inner)).toBeGreaterThan(width / 2)
    expect(reversed.querySelector(".track-fill")!.getBoundingClientRect().right).toBeCloseTo(
      inner.getBoundingClientRect().right,
      0
    )
    const vertical = render(
      "ui vertical slider",
      "--_slider-to: 0.75",
      `<div class="thumb" style="--_slider-at: 0.75"></div>`
    )
    const upright = vertical.querySelector(".inner")!
    const height = upright.getBoundingClientRect().height
    expect(height).toBeGreaterThan(200)
    expect(centre(vertical.querySelector(".thumb")!, upright, "y")).toBeGreaterThan(height / 2)
  })

  it("places labels over their steps, ticks under them", () => {
    const labels = `<ul class="auto labels"><li class="label" style="--_slider-at: 0">0</li>
      <li class="halftick label" style="--_slider-at: 0.5"></li><li class="label" style="--_slider-at: 1">2</li></ul>`
    const root = render(
      "ui labeled ticked slider",
      "--_slider-to: 1",
      `<div class="thumb" style="--_slider-at: 1"></div>`,
      labels
    )
    const inner = root.querySelector(".inner")!
    const [first, half, last] = root.querySelectorAll(".label")
    const size = root.querySelector(".thumb")!.getBoundingClientRect().width
    expect(centre(first!, inner)).toBeCloseTo(size / 2, 0)
    expect(centre(last!, inner)).toBeCloseTo(inner.getBoundingClientRect().width - size / 2, 0)
    expect(first!.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      root.querySelector(".track")!.getBoundingClientRect().top
    )
    const tick = parseFloat(getComputedStyle(first!, "::after").height)
    expect(parseFloat(getComputedStyle(half!, "::after").height)).toBeCloseTo(tick / 2, 0)
  })

  it("colours the fill from the remap, and basic thumbs too", () => {
    const root = render(
      "ui basic red slider",
      "--_slider-to: 0.5",
      `<div class="thumb" style="--_slider-at: 0.5"></div>`
    )
    const probe = document.createElement("span")
    probe.style.backgroundColor = "var(--ui-red)"
    root.append(probe)
    const red = getComputedStyle(probe).backgroundColor
    expect(getComputedStyle(root.querySelector(".track-fill")!).backgroundColor).toBe(red)
    expect(getComputedStyle(root.querySelector(".thumb")!).backgroundColor).toBe(red)
  })

  it("takes a public token from a wrapper (static markup)", () => {
    Sheets.adopt([...foundationCSS, colorsCSS, sliderCSS, NO_TRANSITIONS])
    const box = Fixture.render(`<div style="--ui-slider-track-height: 10px"><div class="ui slider">
      <div class="inner"><div class="track"></div></div></div></div>`)
    expect(getComputedStyle(box.querySelector(".track")!).height).toBe("10px")
  })

  it("scales with `size`", () => {
    const thumb = (classes: string) =>
      render(classes, "", `<div class="thumb"></div>`).querySelector(".thumb")!.getBoundingClientRect().width
    expect(thumb("ui big slider") / thumb("ui small slider")).toBeCloseTo(1.25 / 0.875, 1)
  })
})
