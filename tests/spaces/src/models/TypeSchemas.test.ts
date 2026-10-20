import fs from "node:fs"
import path from "node:path"
import JSON5 from "json5"
import { describe, expect, it } from "vite-plus/test"

import { SPACES } from "$/spaces"

/** Solitaire's compiled declarations, as committed. */
const SOLITAIRE = JSON5.parse(
  fs.readFileSync(
    path.resolve(
      import.meta.dirname,
      "../../../../packages/spaces/@spell/examples/solitaire/solitaire.declarations.json5"
    ),
    "utf8"
  )
)

describe("SPACES.TypeSchemas.fromDeclarations()", () => {
  it("reads a type's properties:  choices from an enumeration, types from a datatype, labels as written", () => {
    const card = SPACES.TypeSchemas.fromDeclarations(SOLITAIRE, "Card")!
    const byName = Object.fromEntries(card.attributes.map((spec) => [spec.name, spec]))
    expect(byName.suit).toMatchObject({ type: "choice", values: ["clubs", "diamonds", "hearts", "spades"] })
    expect(byName.rank!.values).toContain("ace")
    expect(byName.value).toMatchObject({ type: "number" })
    expect(byName.short_suit).toMatchObject({ type: "text", label: "Short suit" })
    // worked out from others (`constants`):  a person can't set it
    expect(byName.color).toBeUndefined()
  })

  it("is `undefined` for a type it doesn't declare;  typesIn() lists the ones it does", () => {
    expect(SPACES.TypeSchemas.fromDeclarations(SOLITAIRE, "Nope")).toBeUndefined()
    expect(SPACES.TypeSchemas.typesIn(SOLITAIRE)).toEqual(expect.arrayContaining(["Card", "Deck", "Pile"]))
  })
})
