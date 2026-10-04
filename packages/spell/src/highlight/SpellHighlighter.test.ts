import { describe, expect, it } from "vite-plus/test"

import { SP } from "$/spell"

/** Pieces of `text` coloured `kind`. */
function coloured(text: string, kind: string): string[] {
  return SP.SpellHighlighter.spans(text)
    .filter((span) => span.kind === kind)
    .map((span) => text.slice(span.start, span.end))
}

/** A real file:  `projects/system/library/cards/Pile.spell`'s opening. */
const PILE = `## Pile of playing cards
a pile is a list of cards

the value of a pile is:
\tif it is empty return 0
\treturn the value of its last card

// "move" a card
to move (a card) to (a pile)
\tset the pile of the card to the pile
`

describe("SpellHighlighter", () => {
  it("colours tokens:  heading comments, comments, numbers, text", () => {
    expect(coloured(PILE, "section")).toEqual(["## Pile of playing cards"])
    expect(coloured(PILE, "comment")).toEqual(['// "move" a card'])
    expect(coloured(PILE, "number")).toEqual(["0"])
    expect(coloured(`set x to "hi"`, "string")).toEqual(['"hi"'])
  })

  it("colours what the parse found:  keywords and more", () => {
    const kinds = new Set(SP.SpellHighlighter.spans(PILE).map((span) => span.kind))
    expect(kinds.has("keyword")).toBe(true)
    expect(coloured(PILE, "keyword")).toEqual(expect.arrayContaining(["return"]))
  })

  it("returns spans in order, never overlapping, inside the text", () => {
    const spans = SP.SpellHighlighter.spans(PILE)
    for (let i = 1; i < spans.length; i++) expect(spans[i]!.start).toBeGreaterThanOrEqual(spans[i - 1]!.end)
    for (const span of spans) {
      expect(span.start).toBeGreaterThanOrEqual(0)
      expect(span.end).toBeLessThanOrEqual(PILE.length)
    }
  })

  it("never throws, whatever it's given", () => {
    for (const text of ["", "))) ((( '", "to to to\n\t\t\tis is", "<div>{</div>"]) {
      expect(() => SP.SpellHighlighter.spans(text)).not.toThrow()
    }
  })
})
