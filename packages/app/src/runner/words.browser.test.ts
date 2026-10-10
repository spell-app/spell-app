import { describe, expect, test } from "vite-plus/test"

import { wordsAt, wordsIn } from "$/app/runner"

/** A words file, as `SP.SpellWords.script()` writes it. */
const SOLITAIRE = `/*! SPELL: WORDS Solitaire en */
export const words = {
  lang: "en",
  types: {
    Card: {
      moveToPile: "move (a card) to (a pile)",
      isFaceUp: "is face up"
    }
  }
}
`

/** Loading a words file's module, as a runner does -- in a browser, for its `blob:` imports. */
describe("loading a project's words", () => {
  test("a words file's module:  its words", async () => {
    expect(await wordsIn(SOLITAIRE)).toEqual({
      lang: "en",
      types: { Card: { moveToPile: "move (a card) to (a pile)", isFaceUp: "is face up" } }
    })
  })

  test("what isn't one:  none -- never a throw", async () => {
    expect(await wordsIn("export const words = 1")).toBeUndefined()
    expect(await wordsIn("export default {}")).toBeUndefined()
    expect(await wordsIn("this isn't javascript (")).toBeUndefined()
  })

  test("a URL with nothing there:  none", async () => {
    expect(await wordsAt("/nowhere/Nope.en.js")).toBeUndefined()
  })
})
