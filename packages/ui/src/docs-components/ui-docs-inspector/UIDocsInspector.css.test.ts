import { describe, expect, it } from "vite-plus/test"

import { Sheets } from "$/ui/test/Sheets"

import inspectorRaw from "./UIDocsInspector.css?raw"

/**
 * `UIDocsInspector.css`:  the sheet's source rules.
 * - The element tests (`UIDocsInspector.test.tsx`) check what it shows.
 */
describe("UIDocsInspector.css source", () => {
  it("never uses rem or !important", () => {
    const text = Sheets.withoutComments(inspectorRaw)
    expect(text).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(text).not.toContain("!important")
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(inspectorRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("docs-inspector"))).toBe(true)
  })

  it("declares no public token of its own:  private aliases only", () => {
    const declared = [...Sheets.withoutComments(inspectorRaw).matchAll(/(--ui-docs-inspector-[\w-]+)\s*:/g)]
    expect(declared.map((match) => match[1])).toEqual([])
  })

  it("keeps a changed row still under prefers-reduced-motion", () => {
    const text = Sheets.withoutComments(inspectorRaw).replace(/\s+/g, " ")
    expect(text).toContain("@media (prefers-reduced-motion: reduce) { .row { animation: none; } }")
  })
})
