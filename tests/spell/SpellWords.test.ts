import { describe, test, expect } from "vite-plus/test"

import { SP } from "spell-lang/spell"
import { fixtureWords } from "spell-app/spaces/test"

/**
 * A frozen project's words (`SP.SpellWords`):  spell's wording of each member,
 * by the name its compiled javascript uses.
 * - The rest of `SpellWords`, over declarations written inline:  spell-lang's own `SpellWords.test.ts`.
 * - Each fixture's whole words file is pinned beside it:  `fixtures.test.ts`.
 */
describe("SpellWords", () => {
  test("Solitaire's:  every member of its types, by the names its javascript uses", () => {
    const words = SP.SpellWords.read(fixtureWords("solitaire"))!
    expect(Object.keys(words.types)).toEqual([
      "Card",
      "Deck",
      "Pile",
      "Game",
      "StockPile",
      "DiscardPile",
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
    expect(words.types.StockPile).toEqual({
      canPickUpCard: "can pick up (a card)",
      draw: "draw (a stock-pile)"
    })
  })
})
