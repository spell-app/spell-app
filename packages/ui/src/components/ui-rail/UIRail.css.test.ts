import { describe, expect, it } from "vite-plus/test"

import { foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { railVocabulary } from "./UIRail.vocabulary.en"

import railCSS from "./UIRail.css?inline"
import railRaw from "./UIRail.css?raw"
import segmentCSS from "$/ui/components/ui-segment/UISegment.css?inline"

/**
 * `UIRail.css` on the class-grammar examples (with `UISegment.css`:  a segment is the rails' container).
 * - Sheets are adopted into the document per test and removed again.
 */

/** The segment's border:  a rail is placed against the segment's PADDING box. */
const BORDER = 1

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** Adopt the sheets and render example `name` wide enough for outside rails. */
function example(name: string): HTMLElement {
  Sheets.adopt([...foundationCSS, segmentCSS, railCSS])
  return Fixture.render(`<div style="width: 1400px">${EXAMPLES[`./examples/${name}.html`]!}</div>`)
}

/** Rail `selector` and its container segment, measured. */
function measure(root: Element, selector: string) {
  const rail = root.querySelector<HTMLElement>(selector)!
  return {
    rail: rail.getBoundingClientRect(),
    segment: rail.parentElement!.getBoundingClientRect(),
    style: getComputedStyle(rail)
  }
}

////////////////
// ## Source
////////////////

describe("UIRail.css source", () => {
  it("never uses rem or !important", () => {
    const text = Sheets.withoutComments(railRaw)
    expect(text).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(text).not.toContain("!important")
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(railRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("rail"))).toBe(true)
  })

  it("covers every class word the vocabulary can emit, and both sides", () => {
    for (const phrase of Sheets.classPhrases(railVocabulary)) expect(Sheets.covers(railRaw, phrase), phrase).toBe(true)
    expect(Sheets.covers(railRaw, "left")).toBe(true)
    expect(Sheets.covers(railRaw, "right")).toBe(true)
  })
})

////////////////
// ## Examples
////////////////

describe("UIRail.css examples", () => {
  it("places rails outside, inside and dividing", () => {
    const root = example("types")
    const left = measure(root, ".ui.left.rail:not(.internal, .dividing)")
    expect(left.style.position).toBe("absolute")
    expect(left.segment.left + BORDER - left.rail.right).toBeCloseTo(32, 0)
    const internal = measure(root, ".ui.right.internal.rail")
    expect(internal.segment.right - BORDER - internal.rail.right).toBeCloseTo(32, 0)
    const dividing = measure(root, ".ui.right.dividing.rail")
    expect(dividing.style.borderLeftStyle).toBe("solid")
    expect(dividing.rail.left - (dividing.segment.right - BORDER)).toBeCloseTo(40, 0)
  })

  it("attaches, closes in and sizes", () => {
    const root = example("variations")
    const attached = measure(root, ".ui.left.attached.rail")
    expect(attached.rail.right).toBeCloseTo(attached.segment.left + BORDER, 0)
    const close = measure(root, ".ui.left.close.rail")
    expect(close.segment.left + BORDER - close.rail.right).toBeCloseTo(16, 0)
    const veryClose = measure(root, ".ui.right.very.close.rail")
    expect(veryClose.rail.left - (veryClose.segment.right - BORDER)).toBeCloseTo(8, 0)
    expect(parseFloat(measure(root, ".ui.large.rail").style.fontSize)).toBeCloseTo(18, 0)
  })
})

////////////////
// ## Tokens
////////////////

describe("UIRail.css tokens", () => {
  it("takes a public token from a wrapper or the rail itself (static markup)", () => {
    Sheets.adopt([...foundationCSS, railCSS])
    const root = Fixture.render(
      `<div style="--ui-rail-width: 200px"><div class="ui left rail">A</div></div>` +
        `<div class="ui left close rail" style="--ui-rail-close-distance: 40px">B</div>`
    )
    expect(getComputedStyle(root.firstElementChild!).width).toBe("200px")
    expect(getComputedStyle(root.nextElementSibling!).width).toBe("320px")
  })
})
