import { describe, expect, test } from "vite-plus/test"

import { languagesOf, mergedWords, wordsAt, wordsOfLanguages } from "spell-app/app/runner"

/**
 * A run's words, for its Thing Explorer -- see `words.ts`.
 * - Loading a words file's module needs a browser (`blob:` imports):  `words.browser.test.ts`.
 */
describe("a run's words", () => {
  test("its program's, then each project's it imports:  a type's words from the first that has it", () => {
    const program = { lang: "en", types: { Card: { moveToPile: "move (a card) to (a pile)" } } }
    const cards = { lang: "en", types: { Card: { shuffle: "shuffle" }, Deck: { deal: "deal (a deck)" } } }
    expect(mergedWords([program, undefined, cards])).toEqual({
      lang: "en",
      types: { Card: { moveToPile: "move (a card) to (a pile)" }, Deck: { deal: "deal (a deck)" } }
    })
  })

  test("one project's words files, one per language:  each type's members from all of them, the first's messages", () => {
    const english = { lang: "en", types: { Card: { flip: "flip a card" } } }
    const spanish = {
      lang: "es",
      types: { Card: { voltear: "voltear una carta" }, Mazo: { preparar: "preparar un mazo" } }
    }
    expect(wordsOfLanguages([english, spanish])).toEqual({
      lang: "en",
      types: { Card: { flip: "flip a card", voltear: "voltear una carta" }, Mazo: { preparar: "preparar un mazo" } }
    })
    expect(languagesOf({ statements: [], languages: ["es", "en"] })).toEqual(["es", "en"])
    expect(languagesOf({ statements: [], language: "es" })).toEqual(["es"])
    expect(languagesOf(undefined)).toEqual(["en"])
  })

  test("none of them has any:  none", () => {
    expect(mergedWords([])).toBeUndefined()
    expect(mergedWords([undefined, undefined])).toBeUndefined()
  })

  test("no URL:  none, and nothing fetched", async () => {
    expect(await wordsAt(undefined)).toBeUndefined()
  })
})
