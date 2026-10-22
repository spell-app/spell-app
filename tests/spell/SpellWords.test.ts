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
  test("Solitaire's:  every member of its own types -- and of the card library's it adds to -- by javascript's names", () => {
    const words = SP.SpellWords.read(fixtureWords("solitaire"))!
    expect(Object.keys(words.types)).toEqual(["StockPile", "Foundation", "Solitaire", "Card"])
    expect(words.types.Solitaire).toMatchObject({
      dealTheCards: "deal the cards",
      startANewGame: "start a new game",
      autoPlay: "auto play",
      draw: "draw it"
    })
    // the library's card, which Solitaire teaches to play
    expect(words.types.Card).toEqual({ play: "play a card" })
    expect(words.types.StockPile).toEqual({ draw: "draw it" })
  })

  test("the card library's:  the card's own, as written", () => {
    const words = SP.SpellWords.read(fixtureWords("@spell/library/cards"))!
    expect(words.types.Card).toMatchObject({
      turnOver: "turn it over",
      isFaceUp: "is face up",
      isASuit: "is a (suit)",
      shortRank: "short rank"
    })
    expect(words.types.Suit).toEqual({ color: "color", symbol: "symbol" })
  })
})
