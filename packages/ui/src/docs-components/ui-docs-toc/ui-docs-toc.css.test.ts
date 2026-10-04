import { describe, expect, it } from "vitest"

import { Sheets } from "$/ui/test/sheets"

import tocRaw from "./ui-docs-toc.css?raw"

/**
 * `ui-docs-toc.css`:  the sheet's source rules.
 * - The look is the widgets' own (`<ui-menu>`, `<ui-item>`, `<ui-header>`), tested in their families;  the element
 *   tests (`ui-docs-toc.test.tsx`) check what this sheet lays out.
 */
describe("ui-docs-toc.css source", () => {
  it("never uses rem or !important", () => {
    const text = Sheets.withoutComments(tocRaw)
    expect(text).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(text).not.toContain("!important")
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(tocRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("docs-toc"))).toBe(true)
  })

  it("declares no public token of its own:  private aliases only", () => {
    const declared = [...Sheets.withoutComments(tocRaw).matchAll(/(--ui-docs-toc-[\w-]+)\s*:/g)]
    expect(declared.map((match) => match[1])).toEqual([])
  })
})
