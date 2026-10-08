import { describe, expect, test } from "vite-plus/test"

import { AccordionPanels } from "./AccordionPanels"

////////////////
// ## AccordionPanels.read()
////////////////

describe("AccordionPanels.read()", () => {
  test("pairs each title with the NEXT element, unless that's a title;  children before the first title are no panel", () => {
    const host = hostOf(`<p>ignored</p><b>A</b><i>a</i><b>B</b><b>C</b><i>c</i>`)
    const [, a, contentA, b, c, contentC] = host.children
    expect(AccordionPanels.read(host, isTitle)).toEqual([
      { title: a, content: contentA },
      { title: b, content: undefined },
      { title: c, content: contentC }
    ])
  })

  test("reuses a previous panel object while its title AND content are unchanged", () => {
    const host = hostOf(`<b>A</b><i>a</i><b>B</b><i>b</i>`)
    const previous = AccordionPanels.read(host, isTitle)
    host.lastElementChild!.replaceWith(document.createElement("i"))
    const next = AccordionPanels.read(host, isTitle, previous)
    expect(next[0]).toBe(previous[0])
    expect(next[1]).not.toBe(previous[1])
  })
})

////////////////
// ## AccordionPanels.isSame()
////////////////

describe("AccordionPanels.isSame()", () => {
  test("is true ONLY for the same panel objects in the same order", () => {
    const host = hostOf(`<b>A</b><i>a</i><b>B</b><i>b</i>`)
    const panels = AccordionPanels.read(host, isTitle)
    expect(AccordionPanels.isSame(panels, [...panels])).toBe(true)
    expect(AccordionPanels.isSame(panels, [...panels].reverse())).toBe(false)
    expect(AccordionPanels.isSame(panels, panels.slice(1))).toBe(false)
    expect(
      AccordionPanels.isSame(
        panels,
        panels.map((panel) => ({ ...panel }))
      )
    ).toBe(false)
  })
})

////////////////
// ## AccordionPanels.parse()
////////////////

describe("AccordionPanels.parse()", () => {
  test("reads space- or comma-separated indexes, ascending, without duplicates;  ignores other words", () => {
    expect(AccordionPanels.parse("2 0, 2,x 1.5 -1 1", { exclusive: false })).toEqual([0, 1, 2])
  })

  test("keeps only the FIRST index written while exclusive", () => {
    expect(AccordionPanels.parse("2 0", { exclusive: true })).toEqual([2])
  })

  test("reads null, undefined and empty text as no index", () => {
    for (const text of [null, undefined, "", "  "])
      expect(AccordionPanels.parse(text, { exclusive: false })).toEqual([])
  })
})

////////////////
// ## AccordionPanels.format()
////////////////

describe("AccordionPanels.format()", () => {
  test("writes indexes space-separated, which parse() reads back", () => {
    expect(AccordionPanels.format([0, 2])).toBe("0 2")
    expect(AccordionPanels.parse(AccordionPanels.format([0, 2]), { exclusive: false })).toEqual([0, 2])
  })
})

/** A detached `<div>` holding `html`. */
function hostOf(html: string): HTMLElement {
  const host = document.createElement("div")
  host.innerHTML = html
  return host
}

/** `<b>` children are the titles. */
function isTitle(element: Element): boolean {
  return element.localName === "b"
}
