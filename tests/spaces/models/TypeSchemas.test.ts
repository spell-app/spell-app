import fs from "node:fs"
import path from "node:path"
import JSON5 from "json5"
import { describe, expect, it } from "vite-plus/test"

import { compiledSpellProject } from "spell-parser/spell/test"
import { SPACES } from "spell-app/spaces"

/**
 * The Solitaire example's compiled declarations, as its fixture snapshot pins them:  its cards, deck and piles among them.
 * - Its own `Solitaire.declarations.json5` is built, in `build/`, not committed (epic `elemental-spell` P4).
 */
const CARDS = JSON5.parse(
  fs.readFileSync(
    path.resolve(import.meta.dirname, "../../spell/__examples__/Solitaire/Solitaire.snapshot.declarations.json5"),
    "utf8"
  )
)

/**
 * A chip's declarations, compiled from spell here:  what Solitaire's cards don't have.
 * - a value kind, `colors`, which its `color` holds
 * - a property of two words, `face value`
 */
const CHIPS = compiledSpellProject([
  {
    path: "/Chips.spell",
    contents: [
      "a chip is a thing where:",
      '\t- "colors" as one of red, white or blue',
      '\t- its "color" is a color',
      '\t- its "face value" is a number'
    ].join("\n")
  }
]).declarations!

describe("SPACES.TypeSchemas.fromDeclarations()", () => {
  it("reads a type's properties:  choices from an enumeration, types from a datatype", () => {
    const card = SPACES.TypeSchemas.fromDeclarations(CARDS, "Card")!
    const byName = Object.fromEntries(card.attributes.map((spec) => [spec.name, spec]))
    expect(byName.suit).toMatchObject({ type: "choice", values: ["clubs", "diamonds", "hearts", "spades"] })
    expect(byName.rank!.values).toContain("ace")
    expect(byName.value).toMatchObject({ type: "number" })
  })

  it("labels a property as written:  a chip's `face value` is `Face value`", () => {
    const chip = SPACES.TypeSchemas.fromDeclarations(CHIPS, "Chip")!
    const faceValue = chip.attributes.find((spec) => spec.name === "face_value")
    expect(faceValue).toMatchObject({ type: "number", label: "Face value" })
  })

  it("a property holding a value kind is a choice of its values:  a chip's color", () => {
    const chip = SPACES.TypeSchemas.fromDeclarations(CHIPS, "Chip")!
    const color = chip.attributes.find((spec) => spec.name === "color")
    expect(color).toMatchObject({ type: "choice", values: ["red", "white", "blue"] })
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
