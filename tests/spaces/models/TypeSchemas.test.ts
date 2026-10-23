import fs from "node:fs"
import path from "node:path"
import JSON5 from "json5"
import { describe, expect, it } from "vite-plus/test"

import { SPACES } from "spell-app/spaces"

/** The Solitaire example's compiled declarations, as committed beside it:  its cards, deck and piles among them. */
const CARDS = JSON5.parse(
  fs.readFileSync(
    path.resolve(import.meta.dirname, "../../../spaces/@spell/examples/Solitaire/Solitaire.declarations.json5"),
    "utf8"
  )
)

describe("SPACES.TypeSchemas.fromDeclarations()", () => {
  it("reads a type's properties:  choices from a value kind, types from a datatype, labels as written", () => {
    const card = SPACES.TypeSchemas.fromDeclarations(CARDS, "Card")!
    const byName = Object.fromEntries(card.attributes.map((spec) => [spec.name, spec]))
    expect(byName.suit).toMatchObject({ type: "choice", values: ["clubs", "diamonds", "hearts", "spades"] })
    expect(byName.rank!.values).toContain("ace")
    expect(byName.value).toMatchObject({ type: "number" })
    expect(byName.short_suit).toMatchObject({ type: "text", label: "Short suit" })
  })

  it("a property holding a value kind is a choice of its values:  a joker's color", () => {
    const joker = SPACES.TypeSchemas.fromDeclarations(CARDS, "Joker")!
    const color = joker.attributes.find((spec) => spec.name === "color")
    expect(color).toMatchObject({ type: "choice", values: ["red", "black"] })
  })

  it("is `undefined` for a type it doesn't declare;  typesIn() lists the ones it does", () => {
    expect(SPACES.TypeSchemas.fromDeclarations(CARDS, "Nope")).toBeUndefined()
    expect(SPACES.TypeSchemas.typesIn(CARDS)).toEqual(expect.arrayContaining(["Card", "Deck", "Pile"]))
  })
})

describe("SPACES.TypeSchemas.fromDeclarations():  rules (epic `property-editor` P9)", () => {
  const declarations = {
    statements: [
      { type: "Release", superType: "Thing" },
      { property: "version", of: "Release", datatype: "text", rules: [{ type: "empty" }] },
      { property: "stage", of: "Release", enumeration: ["alpha", "beta"], rules: [{ type: "empty" }] }
    ]
  }

  it("passes a property's rules on, for the form to check", () => {
    const release = SPACES.TypeSchemas.fromDeclarations(declarations, "Release")!
    expect(release.attributes.map((spec) => spec.rules)).toEqual([[{ type: "empty" }], [{ type: "empty" }]])
  })
})
