import { describe, expect, it } from "vite-plus/test"

import { foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/fixture"
import { Sheets } from "$/ui/test/sheets"

import { stickyVocabulary } from "./ui-sticky.vocabulary.en"

import stickyCSS from "./ui-sticky.css?inline"
import stickyRaw from "./ui-sticky.css?raw"

/**
 * `ui-sticky.css` on its own:  the sheet's source rules, and the light-DOM examples sticking with no element at all.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

describe("ui-sticky.css source", () => {
  it("never uses rem, nor !important", () => {
    expect(Sheets.withoutComments(stickyRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(Sheets.withoutComments(stickyRaw)).not.toMatch(/!important/)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(stickyRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("sticky"))).toBe(true)
  })

  it("covers every class word the vocabulary can emit, and the sentinels", () => {
    for (const phrase of Sheets.classPhrases(stickyVocabulary))
      expect(Sheets.covers(stickyRaw, phrase), `${stickyVocabulary.tag}: ${phrase}`).toBe(true)
    expect(Sheets.selectors(stickyCSS)).toContain(".bottom.sentinel")
  })
})

describe("ui-sticky.css examples", () => {
  it("sticks the rail's box at its offset as the frame scrolls", async () => {
    Sheets.adopt([...foundationCSS, stickyCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const sticky = root.querySelector<HTMLElement>(".ui.sticky:not(.pushing)")!
    const frame = sticky.closest<HTMLElement>("[role=region]")!
    expect(getComputedStyle(sticky).position).toBe("sticky")
    expect(getComputedStyle(sticky).top).toBe("8px")
    frame.scrollTop = 120
    await new Promise((resolve) => requestAnimationFrame(resolve))
    expect(sticky.getBoundingClientRect().top - frame.getBoundingClientRect().top - frame.clientTop).toBeCloseTo(8, 0)
  })

  it("keeps a pushing box in view at the bottom edge", () => {
    Sheets.adopt([...foundationCSS, stickyCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const sticky = root.querySelector<HTMLElement>(".ui.pushing.sticky")!
    const frame = sticky.closest<HTMLElement>("[role=region]")!
    expect(getComputedStyle(sticky).bottom).toBe("0px")
    const bottom = frame.getBoundingClientRect().top + frame.clientTop + frame.clientHeight
    expect(sticky.getBoundingClientRect().bottom).toBeLessThanOrEqual(bottom + 0.5)
  })

  it("gives sentinels no height in the flow", () => {
    Sheets.adopt([...foundationCSS, stickyCSS])
    const root = Fixture.render(`<div><div class="sentinel"></div><p style="margin: 0">x</p></div>`)
    const sentinel = root.querySelector<HTMLElement>(".sentinel")!
    expect(sentinel.getBoundingClientRect().height).toBe(1)
    expect(root.querySelector("p")!.getBoundingClientRect().top).toBe(sentinel.getBoundingClientRect().top)
  })
})

describe("ui-sticky.css tokens", () => {
  it("takes a public token from a wrapper or the box itself (static markup)", () => {
    Sheets.adopt([...foundationCSS, stickyCSS])
    const root = Fixture.render(
      `<div style="--ui-sticky-offset: 8px"><div class="ui sticky">A</div></div>` +
        `<div class="ui sticky" style="--ui-sticky-z-index: 7">B</div>`
    )
    expect(getComputedStyle(root.firstElementChild!).top).toBe("8px")
    expect(getComputedStyle(root.nextElementSibling!).zIndex).toBe("7")
  })
})
