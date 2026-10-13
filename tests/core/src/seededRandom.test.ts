import { readFileSync } from "fs"
import { resolve } from "path"
import { describe, test, expect, afterEach } from "vite-plus/test"

import { spellCore, List } from "$/core"
import { ParkMiller } from "$/core/ParkMiller"

/**
 * What the seeded random must give, from each seed:  made by lodash itself, on Park and Miller numbers.
 * - Python's core reads the same file, so the two cores deal the same cards
 *   (`packages/py/core/tests/test_seeded_random.py`).
 */
const EXPECTED = JSON.parse(
  readFileSync(resolve(import.meta.dirname, "..", "seededRandom.expected.json"), "utf8")
) as SeededRandomExpected

// a test that seeds leaves the next one random again, as an unseeded program is
afterEach(() => spellCore.seedRandom(ParkMiller.randomSeed()))

describe("the seeded random:  the same numbers as lodash's, and as Python's core", () => {
  for (const { seed, numbers, dice, shuffled, deck } of EXPECTED.seeds) {
    describe(`from seed ${seed}`, () => {
      test("random()", () => {
        spellCore.seedRandom(seed)
        expect(numbers.map(() => spellCore.random())).toEqual(numbers)
      })
      test("randomNumber(1, 6)", () => {
        spellCore.seedRandom(seed)
        expect(dice.map(() => spellCore.randomNumber(1, 6))).toEqual(dice)
      })
      test("shuffled():  lodash's own shuffle", () => {
        spellCore.seedRandom(seed)
        expect(spellCore.shuffled(EXPECTED.toShuffle)).toEqual(shuffled)
        spellCore.seedRandom(seed)
        expect(spellCore.shuffled(EXPECTED.deck)).toEqual(deck)
      })
      test("randomize():  a list shuffles as an array does", () => {
        spellCore.seedRandom(seed)
        const cards = new List()
        cards.add(...EXPECTED.deck)
        spellCore.randomize(cards)
        expect([...cards]).toEqual(deck)
      })
    })
  }
})

describe("spellCore.seedRandom()", () => {
  test("starts the numbers again:  the same seed, the same numbers", () => {
    spellCore.seedRandom(42)
    const rolls = [1, 2, 3, 4, 5].map(() => spellCore.randomNumber(6))
    spellCore.seedRandom(42)
    expect([1, 2, 3, 4, 5].map(() => spellCore.randomNumber(6))).toEqual(rolls)
  })
  test("a random item, and random items, repeat too", () => {
    const pick = () => [spellCore.randomItemOf(EXPECTED.deck), spellCore.randomItemsOf(EXPECTED.deck, 3)]
    spellCore.seedRandom(3)
    const picked = pick()
    spellCore.seedRandom(3)
    expect(pick()).toEqual(picked)
  })
})

describe("spellCore.shuffled()", () => {
  test("leaves its items as they were", () => {
    const items = [1, 2, 3]
    spellCore.shuffled(items)
    expect(items).toEqual([1, 2, 3])
  })
  test("takes one number for every item, even the last, as lodash does", () => {
    spellCore.seedRandom(3)
    spellCore.shuffled([1])
    // the second number from seed 3:  as Python's core gives it
    expect(spellCore.random()).toBe(0.3946133641475936)
  })
})

/** The shape of `seededRandom.expected.json`. */
type SeededRandomExpected = {
  /** how it was made */
  about: string[]
  /** what `shuffled` shuffles */
  toShuffle: number[]
  /** what `deck` shuffles:  52 cards, `ace-clubs` to `king-spades` */
  deck: string[]
  /** what each seed gives, every list starting again from it */
  seeds: Array<{ seed: number; numbers: number[]; dice: number[]; shuffled: number[]; deck: string[] }>
}
