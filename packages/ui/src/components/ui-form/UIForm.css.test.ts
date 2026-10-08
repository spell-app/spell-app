import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { formVocabulary } from "./UIForm.vocabulary.en"
import { fieldsVocabulary } from "./UIFields.vocabulary.en"
import { fieldVocabulary } from "./UIField.vocabulary.en"

import checkboxCSS from "$/ui/components/ui-checkbox/UICheckbox.css?inline"
import inputCSS from "$/ui/components/ui-input/UIInput.css?inline"
import labelCSS from "$/ui/components/ui-label/UILabel.css?inline"
import messageCSS from "$/ui/components/ui-message/UIMessage.css?inline"
import formCSS from "./UIForm.css?inline"
import formRaw from "./UIForm.css?raw"

/**
 * `UIForm.css` on its own, before any element exists:  the sheet's source rules and the computed styles of the
 * light-DOM examples (Fomantic's class grammar), with the control sheets the examples use.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

/** The sheets a form page needs. */
const SHEETS = [...foundationCSS, labelCSS, inputCSS, checkboxCSS, messageCSS, formCSS]

describe("UIForm.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(formRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(formRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(formRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("form"))).toBe(true)
  })

  it("parses with replaceSync, keeping ::slotted labels, the size container and the style queries", () => {
    for (const css of [formCSS, formRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.length).toBeGreaterThan(50)
      expect(selectors.some((selector) => selector.includes(".field ::slotted(label)"))).toBe(true)
      expect(selectors.some((selector) => selector.includes("::slotted(label)::after"))).toBe(true)
      expect(css).toMatch(/container: ui-form \/ inline-size/)
      expect(css).toMatch(/@container style\(--_ui-fields-required: ?1\)/)
    }
  })

  it("covers every class word the vocabularies can emit", () => {
    const css = formRaw + colorsCSS
    for (const vocabulary of [formVocabulary, fieldVocabulary, fieldsVocabulary]) {
      for (const phrase of Sheets.classPhrases(vocabulary))
        expect(Sheets.covers(css, phrase), `${vocabulary.tag}: ${phrase}`).toBe(true)
    }
    expect(Sheets.covers(css, "sixteen wide")).toBe(true)
  })
})

describe("UIForm.css examples", () => {
  it.each(Object.keys(EXAMPLES))("styles every field in %s", (path) => {
    Sheets.adopt(SHEETS)
    const root = Fixture.render(`<div style="width: 900px">${EXAMPLES[path]!}</div>`)
    const fields = root.querySelectorAll<HTMLElement>(".ui.form .field")
    expect(fields.length).toBeGreaterThan(0)
    for (const field of fields) {
      expect(getComputedStyle(field).boxSizing, field.outerHTML.slice(0, 80)).toBe("border-box")
      const label = field.querySelector(":scope > label")
      if (label) expect(Number(getComputedStyle(label).fontWeight)).toBeGreaterThanOrEqual(700)
    }
  })

  it("shares rows by `two fields` and `N wide`, and gives equal width forms equal fields", () => {
    Sheets.adopt(SHEETS)
    const root = Fixture.render(`<div style="width: 900px">${EXAMPLES["./examples/variations.html"]!}</div>`)
    const [first, middle, last] = root.querySelectorAll<HTMLElement>(".fields:not(.inline, .grouped) > .field")
    expect(first!.getBoundingClientRect().width / middle!.getBoundingClientRect().width).toBeCloseTo(1.5, 1)
    expect(last!.getBoundingClientRect().width).toBeCloseTo(first!.getBoundingClientRect().width, 0)
    const content = Fixture.render(`<div style="width: 900px">${EXAMPLES["./examples/content.html"]!}</div>`)
    const [a, b] = content.querySelectorAll<HTMLElement>(".two.fields > .field")
    expect(a!.getBoundingClientRect().width).toBeCloseTo(b!.getBoundingClientRect().width, 0)
    expect(a!.getBoundingClientRect().top).toBe(b!.getBoundingClientRect().top)
  })

  it("marks required labels, and shows only the messages of the form's state", () => {
    Sheets.adopt(SHEETS)
    const root = Fixture.render(`<div style="width: 900px">${EXAMPLES["./examples/variations.html"]!}</div>`)
    const required = root.querySelector(".required.field > label")!
    expect(getComputedStyle(required, "::after").content).toBe('"*"')
    const states = Fixture.render(EXAMPLES["./examples/states.html"]!)
    const success = states.querySelector(".ui.success.form")!
    expect(getComputedStyle(success.querySelector(".success.message")!).display).toBe("block")
    expect(getComputedStyle(success.querySelector(".error.message")!).display).toBe("none")
  })

  it("dims a loading form behind a spinner", () => {
    Sheets.adopt(SHEETS)
    const states = Fixture.render(EXAMPLES["./examples/states.html"]!)
    const loading = states.querySelector(".ui.loading.form")!
    expect(getComputedStyle(loading, "::before").position).toBe("absolute")
    expect(getComputedStyle(loading, "::after").animationName).toBe("ui-form-spin")
    expect(getComputedStyle(loading).pointerEvents).toBe("none")
  })

  it("takes a public token from a wrapper (static markup)", () => {
    Sheets.adopt(SHEETS)
    const root = Fixture.render(
      `<div style="--ui-form-gutter: 40px; width: 800px"><div class="ui form"><div class="two fields"><div class="field">A</div><div class="field">B</div></div></div></div>`
    )
    expect(getComputedStyle(root.querySelector(".fields")!).marginLeft).toBe("-20px")
  })

  it("stacks a row on a narrow form", () => {
    Sheets.adopt(SHEETS)
    const root = Fixture.render(`<div style="width: 400px">${EXAMPLES["./examples/content.html"]!}</div>`)
    const [a, b] = root.querySelectorAll<HTMLElement>(".two.fields > .field")
    expect(b!.getBoundingClientRect().top).toBeGreaterThan(a!.getBoundingClientRect().top)
  })
})
