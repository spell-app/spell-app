import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { inputVocabulary } from "./ui-input.vocabulary.en"
import { textareaVocabulary } from "./ui-textarea.vocabulary.en"

import buttonCSS from "$/ui/components/ui-button/ui-button.css?inline"
import labelCSS from "$/ui/components/ui-label/ui-label.css?inline"
import inputCSS from "./ui-input.css?inline"
import inputRaw from "./ui-input.css?raw"

/**
 * `ui-input.css` on its own, before any element exists:  the sheet's source rules and the computed styles of the
 * light-DOM examples (the class grammar the shadow root uses), with `ui-label.css` / `ui-button.css` for the joined
 * labels and action buttons.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

/** The sheets an input page needs. */
const SHEETS = [...foundationCSS, labelCSS, buttonCSS, inputCSS]

////////////////
// ## Source
////////////////

describe("ui-input.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(inputRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(inputRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(inputRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("input"))).toBe(true)
  })

  it("parses with replaceSync, keeping the ::slotted action rules and the owner width", () => {
    for (const css of [inputCSS, inputRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.length).toBeGreaterThan(60)
      expect(selectors.some((selector) => selector.includes(".ui.action.input > ::slotted(*)"))).toBe(true)
      expect(css).toMatch(/inline-size: var\(--_ui-input-owner-width, auto\)/)
    }
  })

  it("covers every class word the vocabularies can emit", () => {
    const css = inputRaw + colorsCSS
    for (const vocabulary of [inputVocabulary, textareaVocabulary]) {
      for (const phrase of Sheets.classPhrases(vocabulary))
        expect(Sheets.covers(css, phrase), `${vocabulary.tag}: ${phrase}`).toBe(true)
    }
    expect(Sheets.covers(css, "file")).toBe(true)
    expect(Sheets.covers(css, "icon")).toBe(true)
  })
})

////////////////
// ## Examples
////////////////

describe("ui-input.css examples", () => {
  it.each(Object.keys(EXAMPLES))("styles every input in %s", (path) => {
    Sheets.adopt(SHEETS)
    const root = Fixture.render(EXAMPLES[path]!)
    const controls = root.querySelectorAll<HTMLElement>(".ui.input > :is(input, textarea)")
    expect(controls.length).toBeGreaterThan(0)
    for (const control of controls) {
      const style = getComputedStyle(control)
      expect(style.boxSizing, control.outerHTML.slice(0, 80)).toBe("border-box")
      if (!control.closest(".transparent, .file")) expect(style.borderTopWidth).toBe("1px")
      expect(control.getBoundingClientRect().height).toBeGreaterThan(0)
    }
  })

  it("draws Fomantic's box:  padding, radius, focus border", () => {
    Sheets.adopt(SHEETS)
    const root = Fixture.render(`<div class="ui input"><input aria-label="x"></div>`)
    const input = root.querySelector("input")!
    const style = getComputedStyle(input)
    const em = parseFloat(style.fontSize)
    expect(parseFloat(style.paddingLeft)).toBeCloseTo(em, 1)
    expect(parseFloat(style.paddingTop)).toBeCloseTo(0.67857 * em, 1)
    expect(parseFloat(style.borderTopLeftRadius)).toBeGreaterThan(0)
    const before = style.borderTopColor
    input.focus()
    expect(getComputedStyle(input).borderTopColor).not.toBe(before)
  })

  it("makes room for the icon at the end, or the start with `left icon`", () => {
    Sheets.adopt(SHEETS)
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const [right, left] = root.querySelectorAll<HTMLElement>(".ui.icon.input:not(.fluid)")
    const rightInput = getComputedStyle(right!.querySelector("input")!)
    expect(parseFloat(rightInput.paddingRight)).toBeGreaterThan(parseFloat(rightInput.paddingLeft))
    const leftInput = getComputedStyle(left!.querySelector("input")!)
    expect(parseFloat(leftInput.paddingLeft)).toBeGreaterThan(parseFloat(leftInput.paddingRight))
    const leftIcon = left!.querySelector<HTMLElement>(".icon")!.getBoundingClientRect()
    expect(Math.round(leftIcon.left)).toBe(Math.round(left!.getBoundingClientRect().left))
  })

  it("squares the seam of a joined label and action button", () => {
    Sheets.adopt(SHEETS)
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const labeled = root.querySelector(".ui.labeled.input:not(.right, .corner)")!
    expect(getComputedStyle(labeled.querySelector(".label")!).borderTopRightRadius).toBe("0px")
    expect(getComputedStyle(labeled.querySelector("input")!).borderTopLeftRadius).toBe("0px")
    const action = root.querySelector(".ui.action.input:not([class*='left action'])")!
    expect(getComputedStyle(action.querySelector("input")!).borderTopRightRadius).toBe("0px")
    expect(getComputedStyle(action.querySelector(".button")!).borderTopLeftRadius).toBe("0px")
    expect(parseFloat(getComputedStyle(action.querySelector(".button")!).borderTopRightRadius)).toBeGreaterThan(0)
  })

  it("tints a stated input from its remap", () => {
    Sheets.adopt([...SHEETS, colorsCSS])
    const root = Fixture.render(EXAMPLES["./examples/states.html"]!)
    const probe = Fixture.render(`<span style="background-color: var(--ui-error-background)"></span>`)
    const error = getComputedStyle(root.querySelector(".ui.error.input > input")!)
    expect(error.backgroundColor).toBe(getComputedStyle(probe).backgroundColor)
  })

  it("takes an owner field's resolved state tokens, which its own state beats", () => {
    Sheets.adopt(SHEETS)
    const root = Fixture.render(`<div style="--_ui-field-state-background: rgb(1, 2, 3)">
      <div class="ui input"><input aria-label="a"></div><div class="ui info input"><input aria-label="b"></div></div>`)
    const [plain, own] = root.querySelectorAll("input")
    expect(getComputedStyle(plain!).backgroundColor).toBe("rgb(1, 2, 3)")
    expect(getComputedStyle(own!).backgroundColor).not.toBe("rgb(1, 2, 3)")
  })

  it("takes a public token from a wrapper (static markup)", () => {
    Sheets.adopt(SHEETS)
    const root = Fixture.render(
      `<div style="--ui-input-radius: 12px"><div class="ui input"><input aria-label="x"></div></div>`
    )
    expect(getComputedStyle(root.querySelector("input")!).borderTopLeftRadius).toBe("12px")
  })

  it("scales with `size` and dims when disabled", () => {
    Sheets.adopt(SHEETS)
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const mini = parseFloat(getComputedStyle(root.querySelector(".ui.mini.input")!).fontSize)
    const huge = parseFloat(getComputedStyle(root.querySelector(".ui.huge.input")!).fontSize)
    expect(huge / mini).toBeGreaterThan(2)
    const states = Fixture.render(EXAMPLES["./examples/states.html"]!)
    expect(Number(getComputedStyle(states.querySelector(".ui.disabled.input")!).opacity)).toBeLessThan(1)
  })
})
