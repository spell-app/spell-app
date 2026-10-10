import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { loaderVocabulary } from "./UILoader.en"

import loaderCSS from "./UILoader.css?inline"
import loaderRaw from "./UILoader.css?raw"

/**
 * `UILoader.css` on its own, before any element exists:  the sheet's source rules, the computed styles of the
 * light-DOM examples (the same class grammar the shadow root will use), and a real shadow host.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

////////////////
// ## Source
////////////////

describe("UILoader.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(loaderRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(loaderRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(loaderRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("loader"))).toBe(true)
  })

  it("parses with replaceSync, keeping the host rules and its own keyframes", () => {
    for (const css of [loaderCSS, loaderRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.length).toBeGreaterThan(15)
      expect(selectors).toContain(":host")
      expect(selectors.some((selector) => selector.includes(":host(:empty) > .ui.elastic.inline.loader"))).toBe(true)
      const sheet = Sheets.from([css])[0]!
      const keyframes = [...sheet.cssRules].filter((rule) => rule instanceof CSSKeyframesRule)
      expect(keyframes.map((rule) => (rule as CSSKeyframesRule).name).sort()).toEqual([
        "ui-loader-elastic",
        "ui-loader-spin"
      ])
    }
  })

  it("covers every class word the vocabulary can emit", () => {
    const css = loaderRaw + colorsCSS
    for (const phrase of Sheets.classPhrases(loaderVocabulary))
      expect(Sheets.covers(css, phrase), `${loaderVocabulary.tag}: ${phrase}`).toBe(true)
    // `speed` is `kind: "valueOnly"` (value alone), which `classPhrases` skips.
    for (const speed of ["slow", "fast"]) expect(Sheets.covers(loaderRaw, speed), speed).toBe(true)
  })
})

////////////////
// ## Examples
////////////////

describe("UILoader.css examples", () => {
  it.each(Object.keys(EXAMPLES))("draws every active loader in %s with a track and a turning arc", (path) => {
    Sheets.adopt([...foundationCSS, loaderCSS])
    const root = Fixture.render(EXAMPLES[path]!)
    const loaders = root.querySelectorAll<HTMLElement>(".ui.active.loader:not(.disabled)")
    expect(loaders.length).toBeGreaterThan(0)
    for (const loader of loaders) {
      const label = loader.outerHTML.slice(0, 80)
      expect(getComputedStyle(loader).display, label).not.toBe("none")
      expect(loader.getBoundingClientRect().width, label).toBeGreaterThan(0)
      const track = getComputedStyle(loader, "::before")
      const arc = getComputedStyle(loader, "::after")
      expect(track.position, label).toBe("absolute")
      expect(parseFloat(track.borderTopWidth), label).toBeGreaterThan(0)
      expect(track.borderTopLeftRadius, label).toBe("50%")
      expect(arc, label).toMatchObject({
        animationName: "ui-loader-spin",
        animationIterationCount: "infinite",
        borderLeftColor: "rgba(0, 0, 0, 0)"
      })
    }
  })

  it("centres a loader over its positioned container, and shows it only when active", () => {
    Sheets.adopt([...foundationCSS, loaderCSS])
    const types = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const loader = types.querySelector<HTMLElement>('.ui.loader[class="ui active loader"]')!
    const box = loader.parentElement!.getBoundingClientRect()
    const rect = loader.getBoundingClientRect()
    expect(rect.left + rect.width / 2).toBeCloseTo(box.left + box.width / 2, 0)
    expect(rect.top + rect.height / 2).toBeCloseTo(box.top + box.height / 2, 0)
    expect(rect.width).toBeCloseTo(32, 0)
    const text = types.querySelector<HTMLElement>(".ui.text.loader")!
    expect(parseFloat(getComputedStyle(text).paddingTop)).toBeGreaterThan(32)
    expect(text.getBoundingClientRect().width).toBeGreaterThan(32)
    const states = Fixture.render(EXAMPLES["./examples/states.html"]!)
    expect(getComputedStyle(states.querySelector(".ui.disabled.loader")!).display).toBe("none")
    const idle = Fixture.render(`<div style="position: relative"><div class="ui loader"></div></div>`)
    expect(getComputedStyle(idle.firstElementChild!).display).toBe("none")
  })

  it("reverses and slows indeterminate loaders;  speeds scale the spin", () => {
    Sheets.adopt([...foundationCSS, loaderCSS])
    const states = Fixture.render(EXAMPLES["./examples/states.html"]!)
    const indeterminate = getComputedStyle(states.querySelector(".ui.indeterminate.loader")!, "::after")
    expect(indeterminate.animationDirection).toBe("reverse")
    expect(indeterminate.animationDuration).toBe("1.2s")
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const [slow, normal, fast] = [...root.querySelectorAll(".ui-cluster")[0]!.children].map(
      (loader) => getComputedStyle(loader, "::after").animationDuration
    )
    expect([slow, normal, fast]).toEqual(["0.9s", "0.6s", "0.3s"])
  })

  it("inlines, centres, doubles and stretches", () => {
    Sheets.adopt([...foundationCSS, loaderCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const style = (selector: string, pseudo?: string) => getComputedStyle(root.querySelector(selector)!, pseudo)
    expect(style("p > .ui.inline.loader").display).toBe("inline-block")
    expect(style("p > .ui.inline.loader").position).toBe("relative")
    const centered = root.querySelector<HTMLElement>(".ui.centered.inline.loader")!
    expect(getComputedStyle(centered).display).toBe("block")
    const parent = centered.parentElement!.getBoundingClientRect()
    const rect = centered.getBoundingClientRect()
    expect(rect.left - parent.left).toBeCloseTo(parent.right - rect.right, 0)
    const double = style('.ui.double.loader[class="ui active inline double loader"]', "::after")
    expect(double.borderBottomColor).toBe(double.borderTopColor)
    expect(style(".ui.inline.loader:not(.double)", "::after").borderBottomColor).toBe("rgba(0, 0, 0, 0)")
    expect(style('.ui.elastic.loader[class="ui active inline elastic loader"]', "::before").animationName).toBe(
      "ui-loader-elastic"
    )
    expect(style('.ui.elastic.loader[class="ui active inline elastic loader"]').animationName).toBe("ui-loader-spin")
    expect(style(".ui.fast.green.elastic.loader", "::after").animationDuration).toBe("0.5s")
    expect(style(".ui.fast.green.elastic.loader", "::after").animationDelay).toBe("0.15s")
  })

  it("colours the arc by remap, and inverts on dark backgrounds", () => {
    Sheets.adopt([...foundationCSS, loaderCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const red = Fixture.render(`<span style="color: var(--ui-red)"></span>`)
    const arc = getComputedStyle(root.querySelector(".ui.red.loader:not(.inverted)")!, "::after")
    expect(arc.borderTopColor).toBe(getComputedStyle(red).color)
    const plain = getComputedStyle(root.querySelector('.ui.loader[class="ui active inline loader"]')!, "::after")
    expect(plain.borderTopColor).not.toBe(arc.borderTopColor)
    const inverted = root.querySelector<HTMLElement>(".ui.inverted.text.loader")!
    expect(getComputedStyle(inverted).colorScheme).toBe("dark")
    expect(luminance(getComputedStyle(inverted).color)).toBeGreaterThan(0.7)
    expect(luminance(getComputedStyle(inverted, "::after").borderTopColor)).toBeGreaterThan(0.9)
  })

  it("scales by size;  medium is the default", () => {
    Sheets.adopt([...foundationCSS, loaderCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const size = (selector: string) => root.querySelector(selector)!.getBoundingClientRect().width
    const ladder = ["mini", "tiny", "small", "large", "big", "huge", "massive"].map((name) =>
      size(`.ui.${name}.loader:not(.text)`)
    )
    expect([...ladder].sort((a, b) => a - b)).toEqual(ladder)
    expect(ladder.at(-1)).toBeCloseTo(64, 0)
    expect(size(".ui.medium.loader")).toBe(size('.ui.loader[class="ui active inline loader"]'))
  })

  it("shows and inverts a loader inside a dimmer (static coupling);  an inverted dimmer keeps it light", () => {
    Sheets.adopt([...foundationCSS, loaderCSS])
    const root = Fixture.render(
      `<div><div class="ui dimmer"><div class="ui loader"></div></div>` +
        `<div class="ui inverted dimmer"><div class="ui loader"></div></div></div>`
    )
    const [dark, light] = root.querySelectorAll<HTMLElement>(".ui.loader")
    expect(getComputedStyle(dark!).display).toBe("block")
    expect(getComputedStyle(dark!).colorScheme).toBe("dark")
    expect(getComputedStyle(light!).display).toBe("block")
    expect(getComputedStyle(light!).colorScheme).toBe("light")
  })
})

////////////////
// ## Tokens
////////////////

describe("UILoader.css tokens", () => {
  it("takes a public token from a wrapper or the loader itself (static markup)", () => {
    Sheets.adopt([...foundationCSS, loaderCSS])
    const root = Fixture.render(
      `<div style="--ui-loader-size: 40px"><div class="ui active inline loader"></div></div>` +
        `<div class="ui active inline loader" style="--ui-loader-line-width: 5px"></div>`
    )
    expect(getComputedStyle(root.firstElementChild!).width).toBe("40px")
    expect(getComputedStyle(root.nextElementSibling!, "::before").borderTopWidth).toBe("5px")
  })
})

////////////////
// ## In a shadow root
////////////////

describe("UILoader.css in a shadow root", () => {
  it("renders through a display: contents host, centred against a positioned ancestor outside the shadow", () => {
    Sheets.adopt(foundationCSS)
    const box = Fixture.render(`<div style="position: relative; width: 300px; height: 200px"><span></span></div>`)
    const host = box.firstElementChild!
    Sheets.attach(host, `<div class="ui large red active text loader" part="loader"><slot></slot></div>`, sheets())
    host.textContent = "Loading"
    const loader = Sheets.inner(host)
    expect(getComputedStyle(host).display).toBe("contents")
    expect(getComputedStyle(loader).display).toBe("block")
    expect(getComputedStyle(loader, "::after").animationName).toBe("ui-loader-spin")
    expect(parseFloat(getComputedStyle(loader).fontSize)).toBeGreaterThan(16)
    const rect = loader.getBoundingClientRect()
    const outer = box.getBoundingClientRect()
    expect(rect.left + rect.width / 2).toBeCloseTo(outer.left + 150, 0)
    expect(rect.top + rect.height / 2).toBeCloseTo(outer.top + 100, 0)
    host.setAttribute("hidden", "")
    expect(getComputedStyle(host).display).toBe("none")
  })

  it("turns an empty elastic inline root as a whole, keyed on the host being empty", () => {
    Sheets.adopt(foundationCSS)
    const host = Sheets.host(`<div class="ui active inline elastic loader"><slot></slot></div>`, sheets())
    expect(getComputedStyle(Sheets.inner(host)).animationName).toBe("ui-loader-spin")
    host.textContent = "Loading"
    expect(getComputedStyle(Sheets.inner(host)).animationName).toBe("none")
  })
})

/** The foundation plus `UILoader.css`, as a `<ui-loader>` adopts them. */
function sheets(): string[] {
  return [...foundationCSS, loaderCSS]
}

/** Relative luminance (0..1) of a computed `rgb()` / `oklch()` colour, via a canvas round trip. */
function luminance(color: string): number {
  const context = document.createElement("canvas").getContext("2d")!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data
  return (0.2126 * r! + 0.7152 * g! + 0.0722 * b!) / 255
}
