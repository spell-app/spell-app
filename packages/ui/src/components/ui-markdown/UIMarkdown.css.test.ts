import { describe, expect, it } from "vite-plus/test"

import { foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { markdownVocabulary } from "./UIMarkdown.vocabulary.en"

import markdownCSS from "./UIMarkdown.css?inline"
import markdownRaw from "./UIMarkdown.css?raw"

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

describe("UIMarkdown.css source", () => {
  it("never uses rem, nor !important", () => {
    expect(Sheets.withoutComments(markdownRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(Sheets.withoutComments(markdownRaw)).not.toMatch(/!important/)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(markdownRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("markdown"))).toBe(true)
  })

  it("covers every class word the vocabulary can emit", () => {
    for (const phrase of Sheets.classPhrases(markdownVocabulary))
      expect(Sheets.covers(markdownRaw, phrase), `${markdownVocabulary.tag}: ${phrase}`).toBe(true)
  })
})

describe("UIMarkdown.css examples", () => {
  it("draws GitHub's look:  ruled h1 / h2, bordered cells, task items without bullets", () => {
    Sheets.adopt([...foundationCSS, markdownCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const h1 = getComputedStyle(root.querySelector("h1")!)
    expect(h1.borderBottomStyle).toBe("solid")
    expect(parseFloat(h1.fontSize)).toBeCloseTo(32, 0)
    expect(getComputedStyle(root.querySelector("td")!).borderTopStyle).toBe("solid")
    expect(getComputedStyle(root.querySelector("li")!).listStyleType).toBe("none")
    expect(getComputedStyle(root.querySelector("blockquote")!).borderLeftStyle).toBe("solid")
  })

  it("restyles headings, rules, bold and inline code by token (the brand's serif headings)", () => {
    Sheets.adopt([...foundationCSS, markdownCSS])
    const root = Fixture.render(
      `<article class="ui markdown" style="--ui-markdown-heading-font-family: serif; --ui-markdown-heading-weight: 700;` +
        ` --ui-markdown-heading-rule: none; --ui-markdown-heading-rule-gap: 0; --ui-markdown-h2-size: 28px;` +
        ` --ui-markdown-heading-margin: 30px 10px; --ui-markdown-hr-height: 1px;` +
        ` --ui-markdown-strong-color: rgb(255, 0, 0); --ui-markdown-code-color: rgb(0, 0, 255)">` +
        `<p>x</p><h2>Two</h2><hr><p><strong>bold</strong> <code>code</code></p></article>`
    )
    const h2 = getComputedStyle(root.querySelector("h2")!)
    expect(h2).toMatchObject({
      fontFamily: "serif",
      fontWeight: "700",
      fontSize: "28px",
      borderBottomStyle: "none",
      paddingBottom: "0px",
      marginTop: "30px",
      marginBottom: "10px"
    })
    expect(getComputedStyle(root.querySelector("hr")!).height).toBe("1px")
    expect(getComputedStyle(root.querySelector("strong")!).color).toBe("rgb(255, 0, 0)")
    expect(getComputedStyle(root.querySelector("code")!).color).toBe("rgb(0, 0, 255)")
  })

  it("keeps GitHub's look with no tokens:  headings in the text's font, bold and code in its colour", () => {
    Sheets.adopt([...foundationCSS, markdownCSS])
    const root = Fixture.render(
      `<article class="ui markdown" style="font-family: monospace; color: rgb(1, 2, 3)">` +
        `<p>x</p><h2>Two</h2><p><strong>bold</strong> <code>code</code></p></article>`
    )
    const h2 = getComputedStyle(root.querySelector("h2")!)
    expect([h2.fontFamily, h2.fontWeight, h2.borderBottomStyle]).toEqual(["monospace", "600", "solid"])
    expect(getComputedStyle(root.querySelector("strong")!).color).toBe("rgb(1, 2, 3)")
    expect(getComputedStyle(root.querySelector("code")!).color).toBe("rgb(1, 2, 3)")
  })

  it("scales with `size`", () => {
    Sheets.adopt([...foundationCSS, markdownCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const normal = parseFloat(getComputedStyle(root.querySelector(".ui.markdown:not(.small)")!).fontSize)
    const small = parseFloat(getComputedStyle(root.querySelector(".ui.small.markdown")!).fontSize)
    expect(small).toBeLessThan(normal)
  })
})
