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
    // its card, as Card.spellx writes it, and as Solitaire.spellx teaches it to play
    expect(words.types.Card).toMatchObject({ name: "name", play: "play a card" })
    // a kind of pile:  the layout it gives every stock pile (its placeholder's drawing and its click handler are no members)
    expect(words.types.StockPile).toEqual({ layout: "layout" })
  })

  test("the counter library's (`counter`):  its own, as written", () => {
    const words = SP.SpellWords.read(fixtureWords("counter"))!
    expect(words.types.Counter).toMatchObject({ increment: "increment it", count: "count" })
  })

  test("Solitaire's card:  its own, as written", () => {
    const words = SP.SpellWords.read(fixtureWords("Solitaire"))!
    expect(words.types.Card).toMatchObject({
      isARank: "is a (rank)",
      isASuit: "is a (suit)",
      isTheRankOfSuit: "is the (rank) of (suit)",
      symbol: "symbol"
    })
    // what it is as a two sided view, `turn it over`, is the built-in template's words, not its own
    expect(words.types.Card).not.toHaveProperty("turnOver")
  })
})
