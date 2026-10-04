import { describe, expect, it } from "vite-plus/test"

import { foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/fixture"
import { Sheets } from "$/ui/test/sheets"

import { codeVocabulary } from "./ui-code.vocabulary.en"

import codeCSS from "./ui-code.css?inline"
import codeRaw from "./ui-code.css?raw"

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

describe("ui-code.css source", () => {
  it("never uses rem, nor !important", () => {
    expect(Sheets.withoutComments(codeRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(Sheets.withoutComments(codeRaw)).not.toMatch(/!important/)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(codeRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("code"))).toBe(true)
  })

  it("covers every class word the vocabulary can emit", () => {
    for (const phrase of Sheets.classPhrases(codeVocabulary))
      expect(Sheets.covers(codeRaw, phrase), `${codeVocabulary.tag}: ${phrase}`).toBe(true)
  })
})

describe("ui-code.css examples", () => {
  it("sets code in the mono font, one block per line, coloured by group", () => {
    Sheets.adopt([...foundationCSS, codeCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const pre = root.querySelector("pre")!
    expect(getComputedStyle(pre).fontFamily).toMatch(/mono/i)
    const lines = root.querySelectorAll(".ui.code:not(.numbered) .line")
    expect(getComputedStyle(lines[0]!).display).toBe("block")
    const keyword = getComputedStyle(root.querySelector(".hljs-keyword")!).color
    const string = getComputedStyle(root.querySelector(".hljs-string")!).color
    expect(keyword).not.toBe(string)
    expect(getComputedStyle(root.querySelector(".hljs-comment")!).fontStyle).toBe("italic")
  })

  it("numbers lines past the counter reset, and wraps under the text, not the number", () => {
    Sheets.adopt([...foundationCSS, codeCSS])
    const root = Fixture.render(`<div style="width: 20em">${EXAMPLES["./examples/types.html"]!}</div>`)
    const lines = root.querySelectorAll<HTMLElement>(".ui.numbered.code .line")
    expect(getComputedStyle(root.querySelector(".ui.numbered.code pre")!).counterReset).toBe("line 9")
    expect(getComputedStyle(lines[0]!).counterIncrement).toBe("line 1")
    expect(getComputedStyle(lines[0]!, "::before").content).toBe("counter(line)")
    expect(getComputedStyle(root.querySelector(".ui.numbered.code code")!).whiteSpace).toBe("pre-wrap")
    const style = getComputedStyle(lines[1]!)
    expect(parseFloat(style.paddingInlineStart)).toBeGreaterThan(0)
    expect(parseFloat(style.textIndent)).toBe(-parseFloat(style.paddingInlineStart))
  })

  it("takes a public colour token from the page", () => {
    Sheets.adopt([...foundationCSS, codeCSS])
    const root = Fixture.render(
      `<div style="--ui-code-keyword: rgb(255, 0, 0)">${EXAMPLES["./examples/types.html"]!}</div>`
    )
    expect(getComputedStyle(root.querySelector(".hljs-keyword")!).color).toBe("rgb(255, 0, 0)")
  })
})
