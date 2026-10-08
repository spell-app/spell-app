import { describe, expect, test } from "vite-plus/test"

import { foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { treeDiagramVocabulary } from "./ui-tree-diagram.vocabulary.en"

import treeDiagramCSS from "./ui-tree-diagram.css?inline"
import treeDiagramRaw from "./ui-tree-diagram.css?raw"

/**
 * `ui-tree-diagram.css` on its own, before any element exists:  the sheet's source rules, and the computed styles of
 * the light-DOM example (the `<svg>` the element draws, in class grammar).
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

describe("ui-tree-diagram.css source", () => {
  test("never uses rem, nor !important", () => {
    expect(Sheets.withoutComments(treeDiagramRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(Sheets.withoutComments(treeDiagramRaw)).not.toMatch(/!important/)
  })

  test("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(treeDiagramRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("tree-diagram"))).toBe(true)
  })

  test("covers every class word the vocabulary can emit", () => {
    for (const phrase of Sheets.classPhrases(treeDiagramVocabulary))
      expect(Sheets.covers(treeDiagramRaw, phrase), phrase).toBe(true)
    expect(Sheets.selectors(treeDiagramCSS)).toContain(".ui.tree.diagram.empty")
  })

  // the layout sized the boxes for the `font-size` ATTRIBUTES:  a rule setting it on the texts would break the sizes
  test("never sets font-size on the drawing's texts", () => {
    const rules = Sheets.withoutComments(treeDiagramRaw).split("}")
    const textRules = rules.filter((rule) => /(\.label|\.detail|\.slot)[^{]*\{/.test(rule) && !/figure/.test(rule))
    for (const rule of textRules) expect(rule).not.toMatch(/(^|[\s;{])font-size\s*:/)
  })
})

describe("ui-tree-diagram.css examples", () => {
  test("sizes the svg from its natural width, in em of its own font size", () => {
    Sheets.adopt([...foundationCSS, treeDiagramCSS])
    const root = Fixture.render(
      `<div style="width: 2000px; font-size: 16px">${EXAMPLES["./examples/types.html"]}</div>`
    )
    const svg = root.querySelector("svg")!
    expect(getComputedStyle(svg).fontSize).toBe("13px")
    expect(svg.getBoundingClientRect().width).toBeCloseTo(37.35 * 13, 0)
    expect(svg.getBoundingClientRect().height).toBeCloseTo((37.35 * 13 * 257.5) / 448.2, 0)
  })

  test("draws boxes with a fill and border, edges as strokes with no fill, texts centred", () => {
    Sheets.adopt([...foundationCSS, treeDiagramCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const box = getComputedStyle(root.querySelector("g:not(.root) rect.box")!)
    const rootBox = getComputedStyle(root.querySelector("g.root rect.box")!)
    expect(box.fill).not.toBe("none")
    expect(box.fill).not.toBe(rootBox.fill)
    expect(rootBox.strokeWidth).toBe("2px")
    const edge = getComputedStyle(root.querySelector("path.edge")!)
    expect(edge.fill).toBe("none")
    expect(edge.stroke).not.toBe("none")
    const label = getComputedStyle(root.querySelector("text.label")!)
    expect(label.textAnchor).toBe("middle")
    expect(label.dominantBaseline).toBe("central")
  })
})
