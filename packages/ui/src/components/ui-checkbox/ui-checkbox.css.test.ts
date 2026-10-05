import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/fixture"
import { Sheets } from "$/ui/test/sheets"

import { checkboxVocabulary } from "./ui-checkbox.vocabulary.en"
import { radioVocabulary } from "./ui-radio.vocabulary.en"

import checkboxCSS from "./ui-checkbox.css?inline"
import checkboxRaw from "./ui-checkbox.css?raw"

/**
 * `ui-checkbox.css` on its own, before any element exists:  the sheet's source rules and the computed styles of the
 * light-DOM examples (Fomantic's own markup, which the shadow root uses).
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** Transitions off, so computed styles are the end state at once. */
const NO_TRANSITIONS = "*, ::before, ::after { transition: none !important; }"

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

describe("ui-checkbox.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(checkboxRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(checkboxRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(checkboxRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("checkbox"))).toBe(true)
  })

  it("parses with replaceSync, keeping the mask marks", () => {
    for (const css of [checkboxCSS, checkboxRaw]) {
      expect(Sheets.selectors(css).length).toBeGreaterThan(50)
      expect(css).toMatch(/--_ui-checkbox-check: ?var\(\s*--ui-checkbox-check,\s*url\("data:image\/svg\+xml/)
    }
  })

  it("covers every class word the vocabularies can emit, and the types", () => {
    const css = checkboxRaw + colorsCSS
    for (const vocabulary of [checkboxVocabulary, radioVocabulary]) {
      for (const phrase of Sheets.classPhrases(vocabulary))
        expect(Sheets.covers(css, phrase), `${vocabulary.tag}: ${phrase}`).toBe(true)
    }
    for (const type of ["radio", "slider", "toggle"]) expect(Sheets.covers(css, type)).toBe(true)
  })
})

describe("ui-checkbox.css examples", () => {
  it.each(Object.keys(EXAMPLES))("styles every checkbox in %s", (path) => {
    Sheets.adopt([...foundationCSS, checkboxCSS])
    const root = Fixture.render(EXAMPLES[path]!)
    const boxes = root.querySelectorAll<HTMLElement>(".ui.checkbox")
    expect(boxes.length).toBeGreaterThan(0)
    for (const box of boxes) {
      const input = box.querySelector("input")!
      expect(getComputedStyle(input).opacity, box.outerHTML.slice(0, 80)).toBe("0")
      expect(getComputedStyle(input).position).toBe("absolute")
      if (box.classList.contains("invisible")) continue
      expect(getComputedStyle(box.querySelector("label")!, "::before").content).toBe('""')
    }
  })

  it("draws a box, fills its mark when checked, and a dash when indeterminate", () => {
    Sheets.adopt([...foundationCSS, checkboxCSS, NO_TRANSITIONS])
    const root = Fixture.render(
      `<div class="ui checkbox"><input type="checkbox" id="c1"><label for="c1">A</label></div>`
    )
    const input = root.querySelector("input")!
    const label = root.querySelector("label")!
    const box = getComputedStyle(label, "::before")
    const em = parseFloat(getComputedStyle(root).fontSize)
    expect(parseFloat(box.width)).toBeCloseTo(1.21428 * em, 0)
    expect(getComputedStyle(label, "::after").opacity).toBe("0")
    input.checked = true
    expect(getComputedStyle(label, "::after").opacity).toBe("1")
    expect(getComputedStyle(label, "::after").maskImage).toContain("M434.8")
    input.checked = false
    input.indeterminate = true
    expect(getComputedStyle(label, "::after").maskImage).toContain("M0 256")
  })

  it("rounds radios and moves a toggle's handle when checked", () => {
    Sheets.adopt([...foundationCSS, checkboxCSS, NO_TRANSITIONS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const radio = root.querySelector(".ui.radio.checkbox label")!
    expect(getComputedStyle(radio, "::before").borderTopLeftRadius).not.toBe("0px")
    const toggle = root.querySelector<HTMLElement>(".ui.toggle.checkbox")!
    const handle = () => parseFloat(getComputedStyle(toggle.querySelector("label")!, "::after").left)
    const off = handle()
    toggle.querySelector("input")!.checked = true
    expect(handle()).toBeGreaterThan(off + 10)
  })

  it("colours the chosen state from the remap", () => {
    Sheets.adopt([...foundationCSS, checkboxCSS, colorsCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const probe = Fixture.render(`<span style="background-color: var(--ui-green)"></span>`)
    const lane = getComputedStyle(root.querySelector(".ui.green.toggle.checkbox label")!, "::before")
    expect(lane.backgroundColor).toBe(getComputedStyle(probe).backgroundColor)
  })

  it("takes a public token from a wrapper (static markup)", () => {
    Sheets.adopt([...foundationCSS, checkboxCSS])
    const root = Fixture.render(
      `<div style="--ui-checkbox-radius: 6px"><div class="ui checkbox"><input type="checkbox" id="t"><label for="t">A</label></div></div>`
    )
    expect(getComputedStyle(root.querySelector("label")!, "::before").borderTopLeftRadius).toBe("6px")
  })

  it("fills a checked box from the CHECKED tokens;  a colour still wins", () => {
    Sheets.adopt([...foundationCSS, checkboxCSS, colorsCSS, NO_TRANSITIONS])
    const root = Fixture.render(
      `<div style="--ui-checkbox-checked-background: rgb(101, 80, 202); --ui-checkbox-checked-mark-color: rgb(255, 255, 255)">
        <div class="ui checkbox"><input type="checkbox" id="k1" checked><label for="k1">A</label></div>
        <div class="ui checkbox"><input type="checkbox" id="k2"><label for="k2">B</label></div>
        <div class="ui green checkbox"><input type="checkbox" id="k3" checked><label for="k3">C</label></div>
      </div>`
    )
    const [checked, unchecked, green] = [...root.querySelectorAll("label")]
    expect(getComputedStyle(checked!, "::before").backgroundColor).toBe("rgb(101, 80, 202)")
    expect(getComputedStyle(checked!, "::after").backgroundColor).toBe("rgb(255, 255, 255)")
    expect(getComputedStyle(unchecked!, "::before").backgroundColor).not.toBe("rgb(101, 80, 202)")
    expect(getComputedStyle(green!, "::before").backgroundColor).not.toBe("rgb(101, 80, 202)")
  })

  it("scales every part with `size`", () => {
    Sheets.adopt([...foundationCSS, checkboxCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const size = (selector: string) =>
      parseFloat(getComputedStyle(root.querySelector(`${selector} label`)!, "::before").width)
    expect(size(".ui.huge.checkbox") / size(".ui.mini.checkbox")).toBeGreaterThan(2)
  })
})
