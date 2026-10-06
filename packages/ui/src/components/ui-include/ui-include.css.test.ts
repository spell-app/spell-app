import { describe, expect, it } from "vite-plus/test"

import { foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { includeVocabulary } from "./ui-include.vocabulary.en"

import includeCSS from "./ui-include.css?inline"
import includeRaw from "./ui-include.css?raw"

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

describe("ui-include.css source", () => {
  it("never uses rem, nor !important", () => {
    expect(Sheets.withoutComments(includeRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(Sheets.withoutComments(includeRaw)).not.toMatch(/!important/)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(includeRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("include"))).toBe(true)
  })

  it("covers every class word the vocabulary can emit", () => {
    for (const phrase of Sheets.classPhrases(includeVocabulary))
      expect(Sheets.covers(includeRaw, phrase), `${includeVocabulary.tag}: ${phrase}`).toBe(true)
  })
})

describe("ui-include.css examples", () => {
  it("makes the box a block that adds nothing of its own", () => {
    Sheets.adopt([...foundationCSS, includeCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const box = root.querySelector<HTMLElement>(".ui.include")!
    expect(getComputedStyle(box)).toMatchObject({ display: "block", paddingTop: "0px", borderTopStyle: "none" })
  })
})
