import { readFileSync } from "fs"
import { resolve } from "path"
import { describe, test, expect, afterEach } from "vite-plus/test"

import { core, List } from "$/core"
import { ParkMiller } from "$/core/ParkMiller"

/**
 * What the seeded random must give, from each seed:  made by lodash itself, on Park and Miller numbers.
 * - Python's core reads the same file, so the two cores deal the same cards
 *   (`tests/py/core/tests/test_seeded_random.py`).
 */
const EXPECTED = JSON.parse(
  readFileSync(resolve(import.meta.dirname, "..", "seededRandom.expected.json5"), "utf8")
) as SeededRandomExpected

// a test that seeds leaves the next one random again, as an unseeded program is
afterEach(() => core.seedRandom(ParkMiller.randomSeed()))

describe("the seeded random:  the same numbers as lodash's, and as Python's core", () => {
  for (const { seed, numbers, dice, shuffled, deck } of EXPECTED.seeds) {
    describe(`from seed ${seed}`, () => {
      test("random()", () => {
        core.seedRandom(seed)
        expect(numbers.map(() => core.random())).toEqual(numbers)
      })
      test("randomNumber(1, 6)", () => {
        core.seedRandom(seed)
        expect(dice.map(() => core.randomNumber(1, 6))).toEqual(dice)
      })
      test("shuffled():  lodash's own shuffle", () => {
        core.seedRandom(seed)
        expect(core.shuffled(EXPECTED.toShuffle)).toEqual(shuffled)
        core.seedRandom(seed)
        expect(core.shuffled(EXPECTED.deck)).toEqual(deck)
      })
      test("randomize():  a list shuffles as an array does", () => {
        core.seedRandom(seed)
        const cards = new List()
        cards.add(...EXPECTED.deck)
        core.randomize(cards)
        expect([...cards]).toEqual(deck)
      })
    })
  }
})

describe("core.seedRandom()", () => {
  test("starts the numbers again:  the same seed, the same numbers", () => {
    core.seedRandom(42)
    const rolls = [1, 2, 3, 4, 5].map(() => core.randomNumber(6))
    core.seedRandom(42)
    expect([1, 2, 3, 4, 5].map(() => core.randomNumber(6))).toEqual(rolls)
  })
  test("a random item, and random items, repeat too", () => {
    const pick = () => [core.randomItemOf(EXPECTED.deck), core.randomItemsOf(EXPECTED.deck, 3)]
    core.seedRandom(3)
    const picked = pick()
    core.seedRandom(3)
    expect(pick()).toEqual(picked)
  })
})

describe("core.shuffled()", () => {
  test("leaves its items as they were", () => {
    const items = [1, 2, 3]
    core.shuffled(items)
    expect(items).toEqual([1, 2, 3])
  })
  test("takes one number for every item, even the last, as lodash does", () => {
    core.seedRandom(3)
    core.shuffled([1])
    // the second number from seed 3:  as Python's core gives it
    expect(core.random()).toBe(0.3946133641475936)
  })
})

/** The shape of `seededRandom.expected.json5`. */
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
