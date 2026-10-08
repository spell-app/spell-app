import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { progressVocabulary } from "./UIProgress.en"

import progressCSS from "./UIProgress.css?inline"
import progressRaw from "./UIProgress.css?raw"

/**
 * `UIProgress.css` on its own, before any element exists:  the sheet's source rules and the computed styles of the
 * light-DOM examples (Fomantic's own markup, which the shadow root uses).
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** Transitions and animations off, so computed styles are the end state at once. */
const STILL = "*, ::before, ::after { transition: none !important; animation: none !important; }"

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

/** Render `html` with the progress sheet;  returns the first `.ui.progress`. */
function render(html: string, css: readonly string[] = []): HTMLElement {
  Sheets.adopt([...foundationCSS, colorsCSS, progressCSS, STILL, ...css])
  const root = Fixture.render(html)
  return root.matches(".ui.progress") ? root : root.querySelector<HTMLElement>(".ui.progress")!
}

////////////////
// ## Source
////////////////

describe("UIProgress.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(progressRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(progressRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(progressRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("progress"))).toBe(true)
  })

  it("parses with replaceSync", () => {
    for (const css of [progressCSS, progressRaw]) expect(Sheets.selectors(css).length).toBeGreaterThan(40)
  })

  it("covers every class word the vocabulary can emit", () => {
    const css = progressRaw + colorsCSS
    for (const phrase of Sheets.classPhrases(progressVocabulary)) {
      expect(Sheets.covers(css, phrase), phrase).toBe(true)
    }
    for (const word of ["success", "warning", "error", "slow", "fast"]) expect(Sheets.covers(css, word)).toBe(true)
  })
})

////////////////
// ## Examples
////////////////

describe("UIProgress.css examples", () => {
  it.each(Object.keys(EXAMPLES))("draws a track and bars in %s", (path) => {
    Sheets.adopt([...foundationCSS, colorsCSS, progressCSS, STILL])
    const root = Fixture.render(EXAMPLES[path]!)
    const progresses = root.querySelectorAll<HTMLElement>(".ui.progress")
    expect(progresses.length).toBeGreaterThan(0)
    for (const progress of progresses) {
      expect(getComputedStyle(progress).display).toBe("flex")
      const bar = progress.querySelector<HTMLElement>(".bar")!
      expect(parseFloat(getComputedStyle(bar).height), progress.outerHTML.slice(0, 80)).toBeGreaterThan(0)
    }
  })

  it("keeps a text bar's minimum width, and sizes the bar height per size", () => {
    const progress = render(`<div class="ui progress" data-percent="1">
      <div class="bar" style="width: 1%"><div class="progress">1%</div></div></div>`)
    const bar = progress.querySelector<HTMLElement>(".bar")!
    const em = parseFloat(getComputedStyle(progress).fontSize)
    expect(parseFloat(getComputedStyle(bar).minWidth)).toBeCloseTo(2.5 * em, 0)
    const small = render(`<div class="ui small progress" data-percent="5"><div class="bar"></div></div>`)
    const large = render(`<div class="ui large progress" data-percent="5"><div class="bar"></div></div>`)
    const height = (element: HTMLElement) => parseFloat(getComputedStyle(element.querySelector(".bar")!).height)
    expect(height(large) / height(small)).toBeGreaterThan(2)
  })

  it("colours the bar:  remap, per-bar hue, indicating by percent, states over everything", () => {
    const bar = (element: HTMLElement) => getComputedStyle(element.querySelector(".bar")!).backgroundColor
    const red = render(`<div class="ui red progress" data-percent="40"><div class="bar"></div></div>`)
    expect(bar(red)).toBe(probe("--ui-red"))
    const hue = render(`<div class="ui progress" data-percent="40"><div class="ui-teal bar"></div></div>`)
    expect(bar(hue)).toBe(probe("--ui-teal"))
    const low = render(`<div class="ui indicating progress" data-percent="15"><div class="bar"></div></div>`)
    const high = render(`<div class="ui indicating progress" data-percent="95"><div class="bar"></div></div>`)
    expect(bar(low)).toBe(probe("--_ui-progress-indicating-1", low))
    expect(bar(high)).not.toBe(bar(low))
    const success = render(`<div class="ui red indicating success progress" data-percent="100">
      <div class="bar"></div></div>`)
    expect(bar(success)).toBe(probe("--ui-success"))

    /** `token` as a background colour, computed on a probe in `parent` (else a fresh fixture). */
    function probe(token: string, parent?: HTMLElement) {
      const span = document.createElement("span")
      span.style.backgroundColor = `var(${token})`
      ;(parent ?? Fixture.render("<div></div>")).append(span)
      return getComputedStyle(span).backgroundColor
    }
  })

  it("hides the colour of a text bar at 0%", () => {
    const zero = render(`<div class="ui red progress" data-percent="0">
      <div class="bar"><div class="progress">0%</div></div></div>`)
    expect(getComputedStyle(zero.querySelector(".bar")!).backgroundColor).toBe("rgba(0, 0, 0, 0)")
  })

  it("thins an attached bar and drops its margins", () => {
    const attached = render(`<div class="ui top attached progress" data-percent="40"><div class="bar"></div></div>`)
    const em = parseFloat(getComputedStyle(attached).fontSize)
    expect(parseFloat(getComputedStyle(attached).height)).toBeCloseTo(0.2 * em, 0)
    expect(getComputedStyle(attached).marginBottom).toBe("0px")
  })

  it("fills the track while indeterminate, and animates its piece", () => {
    Sheets.adopt([...foundationCSS, colorsCSS, progressCSS])
    const root = Fixture.render(`<div style="width: 400px"><div class="ui sliding indeterminate progress">
      <div class="bar"></div></div></div>`)
    const bar = root.querySelector<HTMLElement>(".bar")!
    expect(getComputedStyle(bar).width).toBe("400px")
    const piece = getComputedStyle(bar, "::before")
    expect(piece.content).toBe('""')
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) expect(piece.animationName).toBe("progress-sliding")
  })
})

////////////////
// ## Tokens
////////////////

describe("UIProgress.css tokens", () => {
  it("takes a public token set on a wrapper of static markup", () => {
    Sheets.adopt([...foundationCSS, progressCSS])
    const root = Fixture.render(
      `<div style="--ui-progress-bar-height: 20px"><div class="ui progress" data-percent="40"><div class="bar" style="width: 40%"></div></div></div>`
    )
    expect(getComputedStyle(root.querySelector(".ui.progress .bar")!).height).toBe("20px")
  })
})
