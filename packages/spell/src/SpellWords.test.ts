import { describe, test, expect } from "vite-plus/test"

import { SP } from "$/spell"
import { fixtureWords } from "$/spell/test"

/** Declarations holding just `statements`, as a project's would. */
function declarationsOf(...statements: SP.SpellDeclaration[]): SP.SpellDeclarationsData {
  return { spellVersion: SP.SPELL_VERSION, provides: [], statements }
}

/**
 * A project's words:  spell's wording of each member, by the name its compiled javascript uses --
 * what a runner's Thing Explorer labels things' members by.
 * - Each fixture's whole words file is pinned beside it:  `fixtures.test.ts`.
 */
describe("SpellWords", () => {
  test("a method by its wording, keyed by its compiled name:  the slots are back", () => {
    const words = SP.SpellWords.of(
      declarationsOf(
        { type: "Card", superType: "Thing" },
        { output: "move_to_$pile", of: "Card", kind: "method", name: "move (a card) to (a pile)" },
        { output: "turn_over", of: "Card", kind: "method", name: "turn (a card) over" }
      )
    )
    expect(words).toEqual({
      lang: "en",
      types: { Card: { moveToPile: "move (a card) to (a pile)", turnOver: "turn (a card) over" } }
    })
  })

  test("a method read as a property loses its quotes;  a property keeps its words as written", () => {
    const words = SP.SpellWords.of(
      declarationsOf(
        { output: "is_face_up", of: "Card", kind: "method", name: '"is face up"', returns: "choice" },
        { property: "short_rank", asWritten: "short rank", of: "Card", datatype: "text", getter: true },
        { property: "rank", of: "Card" }
      )
    )
    expect(words.types.Card).toEqual({ isFaceUp: "is face up", shortRank: "short rank", rank: "rank" })
  })

  test("keyed by the writer's names, whatever they are", () => {
    const shouting = { nameOf: (name: string) => name.toUpperCase() }
    const words = SP.SpellWords.of(
      declarationsOf({ output: "set_up", of: "Deck", kind: "method", name: "set up (a deck)" }),
      shouting
    )
    expect(words.types).toEqual({ Deck: { SET_UP: "set up (a deck)" } })
  })

  test("left out:  top-level functions, a type's class variables, a type with no members", () => {
    const words = SP.SpellWords.of(
      declarationsOf(
        { type: "Game", superType: "App" },
        { output: "deal_the_cards", kind: "function" },
        { classVariable: "Ranks", of: "Card", enumeration: ["'ace'", 2] }
      )
    )
    expect(words.types).toEqual({})
  })

  test("a type's own method comes first, should two statements name the same member", () => {
    const words = SP.SpellWords.of(
      declarationsOf(
        { output: "draw", of: "Card", kind: "method", name: "draw (a card)" },
        { output: "draw", of: "Card", kind: "method", name: "draw (a card) again" }
      )
    )
    expect(words.types.Card).toEqual({ draw: "draw (a card)" })
  })

  test("written as a module, one member a line;  read back as it was", () => {
    const words: SP.SpellWordsData = {
      lang: "en",
      types: { Card: { moveToPile: "move (a card) to (a pile)", "is-odd": 'is "odd"' }, Deck: { setUp: "set up" } }
    }
    const script = SP.SpellWords.script(words, "Solitaire")
    expect(script).toBe(
      [
        "/*! SPELL: WORDS Solitaire en */",
        "export const words = {",
        '  lang: "en",',
        "  types: {",
        "    Card: {",
        '      moveToPile: "move (a card) to (a pile)",',
        '      "is-odd": "is \\"odd\\""',
        "    },",
        "    Deck: {",
        '      setUp: "set up"',
        "    }",
        "  }",
        "}",
        ""
      ].join("\n")
    )
    expect(SP.SpellWords.read(script)).toEqual(words)
  })

  test("no types:  still a module, read back as one", () => {
    const script = SP.SpellWords.script({ lang: "en", types: {} }, "Empty")
    expect(script).toContain("  types: {}\n}")
    expect(SP.SpellWords.read(script)).toEqual({ lang: "en", types: {} })
  })

  test("`read()` is `undefined` for what isn't a words file", () => {
    expect(SP.SpellWords.read("")).toBeUndefined()
    expect(SP.SpellWords.read("export default 1")).toBeUndefined()
    expect(SP.SpellWords.read("export const words = { nope")).toBeUndefined()
    expect(SP.SpellWords.read("export const words = { types: {} }")).toBeUndefined()
  })

  test("a words file is its project's name, a language, then `.js`", () => {
    expect(SP.SpellWords.isWordsFile("Solitaire.en.js", "Solitaire")).toBe(true)
    expect(SP.SpellWords.isWordsFile("Solitaire.pt-BR.js", "Solitaire")).toBe(true)
    expect(SP.SpellWords.isWordsFile("Solitaire.compiled.js", "Solitaire")).toBe(false)
    expect(SP.SpellWords.isWordsFile("Solitaire.en.snapshot.js", "Solitaire")).toBe(false)
    expect(SP.SpellWords.isWordsFile("Klondike.en.js", "Solitaire")).toBe(false)
    expect(SP.SpellWords.isWordsFile("helpers.js", "Solitaire")).toBe(false)
  })

  test("Solitaire's:  every member of its types, by the names its javascript uses", () => {
    const words = SP.SpellWords.read(fixtureWords("Solitaire"))!
    expect(Object.keys(words.types)).toEqual([
      "Card",
      "Deck",
      "Pile",
      "Game",
      "Stock_Pile",
      "Discard_Pile",
      "Foundation",
      "Tableau"
    ])
    expect(words.types.Card).toMatchObject({
      moveToPile: "move (a card) to (a pile)",
      turnOver: "turn (a card) over",
      isFaceUp: "is face up",
      isASuit: "is a (suit)",
      shortRank: "short-rank"
    })
    expect(words.types.Stock_Pile).toEqual({
      canPickUpCard: "can pick up (a card)",
      draw: "draw (a stock-pile)"
    })
  })
})
