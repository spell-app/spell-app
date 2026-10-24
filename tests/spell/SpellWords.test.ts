import { describe, test, expect } from "vite-plus/test"

import { SP } from "spell-parser/spell"
import { fixtureWords } from "spell-app/spaces/test"

/**
 * A test project's words (`SP.SpellWords`):  spell's wording of each member,
 * by the name its compiled javascript uses.
 * - The rest of `SpellWords`, over declarations written inline:  spell-parser's own `SpellWords.test.ts`.
 * - Each test project's whole words file is pinned with its snapshots:  `fixtures.test.ts`.
 */
describe("SpellWords", () => {
  test("Solitaire's:  every member of its types, its own cards, deck and piles too, by javascript's names", () => {
    const words = SP.SpellWords.read(fixtureWords("Solitaire"))!
    expect(Object.keys(words.types)).toEqual([
      "Card",
      "Joker",
      "Deck",
      "Pile",
      "StockPile",
      "DiscardPile",
      "Foundation",
      "Tableau",
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
    // a kind of pile:  the layout it gives every stock pile (its placeholder's drawing is no member)
    expect(words.types.StockPile).toEqual({ layout: "layout" })
  })

  test("the counter library's (`counter`):  its own, as written", () => {
    const words = SP.SpellWords.read(fixtureWords("counter"))!
    expect(words.types.Counter).toMatchObject({ increment: "increment it", count: "count" })
  })

  test("Solitaire's card:  its own, as written", () => {
    const words = SP.SpellWords.read(fixtureWords("Solitaire"))!
    expect(words.types.Card).toMatchObject({
      turnOver: "turn it over",
      isFaceDirection: "is face (direction)",
      isASuit: "is a (suit)",
      symbol: "symbol"
    })
    // a joker's phrase:  a static method of its own, which any card may be asked
    expect(words.types.Joker).toMatchObject({ isTheColorJoker: "is the (color) joker" })
  })
})
