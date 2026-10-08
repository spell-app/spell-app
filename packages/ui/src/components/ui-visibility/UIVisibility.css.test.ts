import { describe, expect, it } from "vite-plus/test"

import { foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { visibilityVocabulary } from "./UIVisibility.en"

import visibilityCSS from "./UIVisibility.css?inline"
import visibilityRaw from "./UIVisibility.css?raw"

/**
 * `UIVisibility.css` on its own:  the DOM element's box.  Visibility has no look;  the examples are plain content.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

describe("UIVisibility.css source", () => {
  it("never uses rem, nor !important", () => {
    expect(Sheets.withoutComments(visibilityRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(Sheets.withoutComments(visibilityRaw)).not.toMatch(/!important/)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(visibilityRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("visibility"))).toBe(true)
  })

  it("emits no class words (a behaviour, no look)", () => {
    expect(Sheets.classPhrases(visibilityVocabulary)).toEqual([])
  })

  it("makes the host a block, hidden with `hidden`", () => {
    Sheets.adopt(foundationCSS)
    const visible = Sheets.host(`<slot></slot>`, [...foundationCSS, visibilityCSS])
    expect(getComputedStyle(visible).display).toBe("block")
    const hidden = Sheets.host(`<slot></slot>`, [...foundationCSS, visibilityCSS])
    hidden.hidden = true
    expect(getComputedStyle(hidden).display).toBe("none")
  })
})

describe("UIVisibility.css examples", () => {
  it.each(Object.keys(EXAMPLES))("renders the content of %s", (path) => {
    Sheets.adopt([...foundationCSS, visibilityCSS])
    const root = Fixture.render(EXAMPLES[path]!)
    for (const image of root.querySelectorAll("img")) expect(image.getBoundingClientRect().width).toBe(96)
  })
})
