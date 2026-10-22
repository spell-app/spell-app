import { describe, test, expect } from "vite-plus/test"

import { LSP } from "spell-app/lsp"

/** A type with a `<css>` block in its outline, as P4 of epic `drawable-thing` writes it. */
const CARD = [
  "a card is a drawable thing",
  "\t- it has a rank as a number",
  "\t<css>",
  "\t\t:host { display: inline-block }",
  "\t\t.red { col",
  "\t</css>",
  "to turn (a card) over"
].join("\n")

/** Offset of the end of `CARD`'s `line` (0-based). */
function endOfLine(line: number): number {
  const lines = CARD.split("\n")
  return lines.slice(0, line + 1).join("\n").length
}

describe("SpellCSS", () => {
  test("finds a block, from its <css> line to its </css> line", () => {
    const [region, ...others] = LSP.SpellCSS.regionsIn(CARD)
    expect(others).toEqual([])
    expect(CARD.slice(region!.start, region!.end)).toBe(
      "\t<css>\n\t\t:host { display: inline-block }\n\t\t.red { col\n\t</css>"
    )
    expect(CARD.slice(region!.cssStart, region!.cssEnd)).toBe("\t\t:host { display: inline-block }\n\t\t.red { col\n")
  })

  test("a block with no </css> runs to the end", () => {
    const text = "a card is a thing\n<css>\n.red { color: red }"
    const [region] = LSP.SpellCSS.regionsIn(text)
    expect(text.slice(region!.cssStart, region!.cssEnd)).toBe(".red { color: red }")
    expect(region!.end).toBe(text.length)
  })

  test("no block, no regions;  <css> inside a line isn't one", () => {
    expect(LSP.SpellCSS.regionsIn("a card is a thing\nprint '<css>'")).toEqual([])
  })

  test("the CSS document keeps every line and character in place", () => {
    const [region] = LSP.SpellCSS.regionsIn(CARD)
    const document = LSP.SpellCSS.documentFor(CARD, region!)
    expect(document.getText().length).toBe(CARD.length)
    expect(document.getText().split("\n")).toEqual([
      " ".repeat(26),
      " ".repeat(28),
      " ".repeat(6),
      "\t\t:host { display: inline-block }",
      "\t\t.red { col",
      " ".repeat(7),
      " ".repeat(21)
    ])
  })

  test("completes CSS in a block, nothing outside it", () => {
    const css = new LSP.SpellCSS()
    const offset = endOfLine(4)
    const labels = css.completion(CARD, offset, { line: 4, character: 12 })!.items.map((item) => item.label)
    expect(labels).toContain("color")
    expect(css.completion(CARD, endOfLine(1), { line: 1, character: 28 })).toBeUndefined()
  })

  test("hovering a property shows its docs", () => {
    const css = new LSP.SpellCSS()
    const hover = css.hover(CARD, endOfLine(2) + 12, { line: 3, character: 11 })
    expect(JSON.stringify(hover?.contents)).toMatch(/display/)
  })

  test("CSS mistakes are reported where they are in the file", () => {
    const css = new LSP.SpellCSS()
    const text = "a card is a thing\n<css>\n.red { colr: red }\n</css>"
    const [unknown] = css.diagnostics(text)
    expect(unknown!.message).toMatch(/Unknown property/)
    expect(unknown!.range).toEqual({ start: { line: 2, character: 7 }, end: { line: 2, character: 11 } })
  })
})
