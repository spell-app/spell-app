import { describe, test, expect } from "vite-plus/test"

import { spellCore, positionOf, List, position, spellPosition, withSpellPositions } from "$/core"
import { zeroIndexOf } from "./positions"

/**
 * Positions (epic `python-target` P23):  the core counts from 0, as javascript does;
 * spell code counting from 1 is turned into indexes as it compiles.
 * - negative positions count from the end
 * - a missing item is nothing, never `-1`
 * - `position()`, `spellPosition()`, `withSpellPositions()`:  for compiled code counting from 1
 */

/** A spell list of `items`. */
function listOf(...items: string[]): List<string> {
  return new List<string>().append(...items)
}

describe("position() / spellPosition():  spell's positions, from 1, to and from indexes", () => {
  test("position():  one less;  negatives as they are;  0 is no position", () => {
    expect([1, 3, -1, "key", undefined].map((n) => position(n))).toEqual([0, 2, -1, "key", undefined])
    expect(position(0)).toBeNaN()
  })
  test("spellPosition():  one more;  nothing stays nothing, never 0", () => {
    expect([0, 2, -1, undefined].map((index) => spellPosition(index))).toEqual([1, 3, -1, undefined])
  })
  test("withSpellPositions():  a loop's function gets spell's positions", () => {
    const positions: number[] = []
    listOf("a", "b").forEach(withSpellPositions((_value, n) => void positions.push(n)))
    expect(positions).toEqual([1, 2])
  })
  test("zeroIndexOf():  past the front, or not a whole number, is no item;  past the end, as it is", () => {
    expect([0, 2, -1, -3, 3, -4, Number.NaN, 1.5].map((index) => zeroIndexOf(index, 3))).toEqual([
      0,
      2,
      2,
      0,
      3,
      undefined,
      undefined,
      undefined
    ])
  })
})

describe("an item, by its index", () => {
  test("0 is the first, -1 the last, past the end nothing", () => {
    for (const list of [["a", "b", "c"], listOf("a", "b", "c")]) {
      expect([0, 2, -1, 3].map((index) => spellCore.getItemAt(list, index))).toEqual(["a", "c", "c", undefined])
    }
    expect(spellCore.getItemAt("abc", -1)).toBe("c")
  })
  test("item 0 counting from 1, position(0):  nothing, never the last item", () => {
    expect(listOf("a", "b", "c").getItem(position(0))).toBeUndefined()
    expect(spellCore.getItemAt(["a", "b", "c"], position(0))).toBeUndefined()
  })
  test("a spell list's at() is its getItem()", () => {
    expect([0, 1, -1, 5].map((index) => listOf("a", "b", "c").at(index))).toEqual(["a", "b", "c", undefined])
  })
  test("the index of an item;  a missing one is nothing, never -1", () => {
    expect(positionOf(["a", "b", "c"], "a")).toBe(0)
    expect(listOf("a", "b", "c").positionOf("c")).toBe(2)
    expect(spellCore.positionOf(listOf("a", "b"), "z")).toBeUndefined()
  })
  test("set and remove by index;  no such index changes nothing", () => {
    const list = listOf("a", "b", "c")
    list.setItem(0, "z")
    spellCore.removeItemAt(list, 1)
    list.removeItem(-5)
    list.setItem(position(0), "y")
    expect(list.values).toEqual(["z", "c"])
    const array = ["a", "b", "c"]
    spellCore.removeItemAt(array, -1)
    expect(array).toEqual(["a", "b"])
  })
})

describe("ranges, as an array's slice()", () => {
  test("from start up to, not including, end;  negative from the end", () => {
    expect(spellCore.rangeBetween(["a", "b", "c", "d"], 1, 3)).toEqual(["b", "c"])
    expect(listOf("a", "b", "c", "d").slice(0, 2).values).toEqual(["a", "b"])
    expect(listOf("a", "b", "c", "d").slice(-2).values).toEqual(["c", "d"])
    expect(listOf("a", "b", "c", "d").startingFrom(2).values).toEqual(["c", "d"])
  })
  test("count items from an index:  the last two", () => {
    expect(spellCore.rangeStartingAt(["a", "b", "c", "d"], -2, 2)).toEqual(["c", "d"])
    expect(spellCore.rangeStartingAt(["a", "b", "c", "d"], 0, 2)).toEqual(["a", "b"])
  })
  test("removing a range", () => {
    const array = ["a", "b", "c", "d"]
    spellCore.removeRangeBetween(array, 1, 3)
    expect(array).toEqual(["a", "d"])
  })
})

describe("loops", () => {
  test("a loop's position is an index", () => {
    const positions: unknown[] = []
    spellCore.forEach(["a", "b"], (_value, index) => positions.push(index))
    listOf("a", "b").forEach((_value, index) => positions.push(index))
    expect(positions).toEqual([0, 1, 0, 1])
    expect(spellCore.map(["a", "b"], (value, index) => `${value}${String(index)}`)).toEqual(["a0", "b1"])
  })
})
