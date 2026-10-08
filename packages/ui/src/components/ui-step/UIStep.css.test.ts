import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { stepsVocabulary } from "./UISteps.en"
import { stepVocabulary } from "./UIStep.en"

import stepCSS from "./UIStep.css?inline"
import stepRaw from "./UIStep.css?raw"
import partsCSS from "$/ui/components/ui-parts/UIParts.css?inline"

/**
 * `UIStep.css` (with `UIParts.css`, which draws the titles and descriptions) on the class-grammar examples:
 * the source rules, the group tokens, and what each variation does to the steps.
 * - Sheets are adopted into the document per test and removed again.
 * - Stacking answers to the group's PARENT width here (a size container), so tests wrap groups at fixed widths.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** Adopt the sheets and render example `name` at `width` px. */
function example(name: string, width = 1000): HTMLElement {
  Sheets.adopt([...foundationCSS, partsCSS, stepCSS])
  return Fixture.render(`<div style="width: ${width}px">${EXAMPLES[`./examples/${name}.html`]!}</div>`)
}

/** Steps of the first group matching `selector`. */
function steps(root: Element, selector: string): HTMLElement[] {
  return [...root.querySelector(selector)!.querySelectorAll<HTMLElement>(":scope > .step")]
}

////////////////
// ## Source
////////////////

describe("UIStep.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(stepRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it("never uses !important", () => {
    expect(Sheets.withoutComments(stepRaw)).not.toContain("!important")
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(stepRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("step"))).toBe(true)
  })

  it("parses with replaceSync, keeping the element and static selectors and the container rules", () => {
    const selectors = Sheets.selectors(stepCSS)
    expect(selectors.length).toBeGreaterThan(80)
    expect(selectors.some((selector) => selector.includes(":host > .step"))).toBe(true)
    expect(selectors.some((selector) => selector.includes(".ui.steps > .step"))).toBe(true)
    expect(stepCSS).toMatch(/@container ui-steps \(width < 768px\)|@container ui-steps \(max-width/)
  })

  it("covers every class word the vocabularies can emit", () => {
    const css = stepRaw + colorsCSS
    for (const vocabulary of [stepsVocabulary, stepVocabulary]) {
      for (const phrase of Sheets.classPhrases(vocabulary))
        expect(Sheets.covers(css, phrase), `${vocabulary.tag}: ${phrase}`).toBe(true)
    }
  })
})

////////////////
// ## Examples
////////////////

describe("UIStep.css examples", () => {
  it("draws steps in a bordered row with arrows, the current one darker", () => {
    const root = example("types")
    const group = root.querySelectorAll<HTMLElement>(".ui.steps")[1]!
    expect(getComputedStyle(group).display).toBe("inline-flex")
    expect(getComputedStyle(group).borderTopStyle).toBe("solid")
    const [first, active, last] = group.querySelectorAll<HTMLElement>(":scope > .step")
    expect(active!.getBoundingClientRect().top).toBe(first!.getBoundingClientRect().top)
    expect(getComputedStyle(first!, "::after").display).toBe("block")
    expect(getComputedStyle(last!, "::after").display).toBe("none")
    expect(getComputedStyle(active!).backgroundColor).not.toBe(getComputedStyle(first!).backgroundColor)
    expect(getComputedStyle(active!).getPropertyValue("--_ui-step-state").trim()).toBe("active")
    const title = getComputedStyle(active!.querySelector(".title")!)
    const link = Fixture.render(`<span style="color: var(--ui-link)"></span>`)
    expect(title.color).toBe(getComputedStyle(link).color)
    expect(getComputedStyle(last!).getPropertyValue("--_ui-step-state").trim()).toBe("disabled")
    expect(getComputedStyle(last!).pointerEvents).toBe("none")
  })

  it("numbers ordered steps and lays vertical ones out in a column", () => {
    const root = example("types")
    const [ordered] = steps(root, ".ui.ordered.steps")
    expect(getComputedStyle(ordered!, "::before").display).toBe("block")
    expect(getComputedStyle(ordered!, "::before").maskImage).toContain("url(")
    const vertical = steps(root, ".ui.vertical.steps")
    expect(vertical[1]!.getBoundingClientRect().top).toBeGreaterThan(vertical[0]!.getBoundingClientRect().top)
    expect(getComputedStyle(vertical[0]!, "::after").display).toBe("none")
    expect(getComputedStyle(vertical[2]!, "::after").display).toBe("block")
  })

  it("stacks by the parent's width unless unstackable", () => {
    const narrow = example("variations", 500)
    const stacked = steps(narrow, ".ui.tablet.stackable.steps")
    expect(stacked[1]!.getBoundingClientRect().top).toBeGreaterThan(stacked[0]!.getBoundingClientRect().top)
    expect(getComputedStyle(stacked[0]!).getPropertyValue("--_ui-step-layout").trim()).toBe("stacked")
    const kept = steps(narrow, ".ui.unstackable.steps")
    expect(kept[1]!.getBoundingClientRect().top).toBe(kept[0]!.getBoundingClientRect().top)
    const tablet = example("variations", 900)
    const inTablet = steps(tablet, ".ui.tablet.stackable.steps")
    expect(inTablet[1]!.getBoundingClientRect().top).toBeGreaterThan(inTablet[0]!.getBoundingClientRect().top)
    const wide = example("variations", 1100)
    const row = steps(wide, ".ui.tablet.stackable.steps")
    expect(row[1]!.getBoundingClientRect().top).toBe(row[0]!.getBoundingClientRect().top)
  })

  it("divides attached groups evenly and squares their joined corners", () => {
    const root = example("variations")
    const top = root.querySelector<HTMLElement>(".ui.three.top.attached.steps")!
    const [first] = top.querySelectorAll<HTMLElement>(":scope > .step")
    expect(first!.getBoundingClientRect().width).toBeCloseTo(top.getBoundingClientRect().width / 3, -1)
    expect(parseFloat(getComputedStyle(first!).borderTopLeftRadius)).toBeGreaterThan(0)
    expect(getComputedStyle(first!).borderBottomLeftRadius).toBe("0px")
    const [bottomFirst] = steps(root, ".ui.three.bottom.attached.steps")
    expect(getComputedStyle(bottomFirst!).borderTopLeftRadius).toBe("0px")
    expect(parseFloat(getComputedStyle(bottomFirst!).borderBottomLeftRadius)).toBeGreaterThan(0)
  })

  it("points a right vertical group's arrow the other way", () => {
    const root = example("variations")
    const [, active] = steps(root, ".ui.right.vertical.steps")
    const arrow = getComputedStyle(active!, "::after")
    expect(arrow.display).toBe("block")
    expect(arrow.left).toBe("0px")
  })

  it("scales steps with the group size, and inverts to the dark scheme", () => {
    const root = example("variations")
    const [mini] = steps(root, ".ui.mini.steps")
    const [large] = steps(root, ".ui.large.steps")
    expect(parseFloat(getComputedStyle(mini!).fontSize)).toBeCloseTo(10, 0)
    expect(parseFloat(getComputedStyle(large!).fontSize)).toBeCloseTo(18, 0)
    const [inverted] = steps(root, ".ui.inverted.steps")
    expect(getComputedStyle(inverted!).colorScheme).toBe("dark")
  })

  it("takes a public token from a wrapper of the group (static markup)", () => {
    Sheets.adopt([...foundationCSS, partsCSS, stepCSS])
    const root = Fixture.render(
      `<div style="width: 1000px; --ui-step-padding: 20px"><ol class="ui unstackable steps">` +
        `<li class="step"><div class="content"><div class="title">A</div></div></li>` +
        `<li class="step">B</li></ol></div>`
    )
    expect(getComputedStyle(root.querySelector(".step")!).paddingTop).toBe("20px")
  })

  it("draws circular steps as a line with rings;  a completed ring filled with the accent", () => {
    const root = example("variations")
    const [completed, active, last] = steps(root, ".ui.circular.steps:not(.ordered, .vertical)")
    expect(parseFloat(getComputedStyle(completed!).height)).toBeLessThan(4)
    const positive = Fixture.render(`<span style="color: var(--ui-positive)"></span>`)
    expect(getComputedStyle(completed!).backgroundColor).toBe(getComputedStyle(positive).color)
    expect(getComputedStyle(completed!, "::after").maskImage).toContain("url(")
    expect(getComputedStyle(active!, "::before").borderTopColor).toBe(getComputedStyle(positive).color)
    expect(getComputedStyle(last!, "::before").borderTopLeftRadius).toBe("50%")
    const red = Fixture.render(`<span style="color: var(--ui-red)"></span>`)
    const [, redActive] = steps(root, ".ui.red.circular.ordered.steps")
    expect(getComputedStyle(redActive!, "::before").borderTopColor).toBe(getComputedStyle(red).color)
    expect(getComputedStyle(redActive!, "::before").content).toContain("counter(ui-step)")
    const vertical = steps(root, ".ui.circular.vertical.steps")
    expect(vertical[1]!.getBoundingClientRect().top).toBeGreaterThan(vertical[0]!.getBoundingClientRect().top)
    expect(parseFloat(getComputedStyle(vertical[0]!).paddingLeft)).toBeGreaterThan(40)
  })
})
