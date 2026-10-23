import { describe, test, expect } from "vite-plus/test"

import { SP } from "spell-lang/spell"
import { fixtureWords } from "spell-app/spaces/test"

/**
 * A test project's words (`SP.SpellWords`):  spell's wording of each member,
 * by the name its compiled javascript uses.
 * - The rest of `SpellWords`, over declarations written inline:  spell-lang's own `SpellWords.test.ts`.
 * - Each test project's whole words file is pinned with its snapshots:  `fixtures.test.ts`.
 */
describe("SpellWords", () => {
  test("Solitaire's:  every member of its types, its own cards, deck and piles too, by javascript's names", () => {
    const words = SP.SpellWords.read(fixtureWords("Solitaire"))!
    expect(Object.keys(words.types)).toEqual([
      "Card",
      "Joker",
      "Suit",
      "Rank",
      "Deck",
      "Pile",
      "StockPile",
      "Foundation",
      "Solitaire"
    ])
    expect(words.types.Solitaire).toMatchObject({
      dealTheCards: "deal the cards",
      startANewGame: "start a new game",
      autoPlay: "auto play",
      draw: "draw it"
    })
    // its card, as Card.spell writes it, and as Solitaire.spell teaches it to play
    expect(words.types.Card).toMatchObject({ turnOver: "turn it over", play: "play a card" })
    expect(words.types.StockPile).toEqual({ draw: "draw it" })
  })

  test("the frozen card library's (`cards`):  the card's own, as written", () => {
    const words = SP.SpellWords.read(fixtureWords("cards"))!
    expect(words.types.Card).toMatchObject({
      turnOver: "turn it over",
      isFaceUp: "is face up",
      isASuit: "is a (suit)",
      shortRank: "short rank"
    })
    expect(words.types.Suit).toEqual({ color: "color", symbol: "symbol" })
  })
})
