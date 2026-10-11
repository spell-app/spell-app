import { describe, test, expect } from "vite-plus/test"

import { spellCore, positionOf, List } from "$/core"
import { fromStartAt, toStartAt, zeroIndexOf } from "./positions"

/**
 * Positions, counted from where a project's lists start (epic `python-target` P2):
 * - spell counts from 1;  a project may count from 0 (`"listsStartAt": 0`), which compiled code passes as `startAt`
 * - negative positions count from the end either way
 * - a missing item is nothing, never `-1`
 */

/** A spell list of `items`. */
function listOf(...items: string[]): List<string> {
  return new List<string>().append(...items)
}

describe("fromStartAt() / toStartAt()", () => {
  test("counting from 0 shifts zero and up by one;  negatives and nothing stay", () => {
    expect([0, 1, -1, undefined].map((position) => fromStartAt(position, 0))).toEqual([1, 2, -1, undefined])
    expect([1, 2, -1, undefined].map((position) => toStartAt(position, 0))).toEqual([0, 1, -1, undefined])
  })
  test("counting from 1 changes nothing", () => {
    expect([0, 1, -1].map((position) => fromStartAt(position, 1))).toEqual([0, 1, -1])
    expect([0, 1, -1].map((position) => toStartAt(position, 1))).toEqual([0, 1, -1])
  })
  test("zeroIndexOf():  0 and past the front are no item", () => {
    expect([1, 3, -1, -3, 0, -4].map((position) => zeroIndexOf(position, 3))).toEqual([
      0,
      2,
      2,
      0,
      undefined,
      undefined
    ])
  })
})

describe("counting from 1 (spell's own)", () => {
  test("item 0 of a spell list is nothing, not the second item", () => {
    expect(listOf("a", "b", "c").getItem(0)).toBeUndefined()
    expect(spellCore.getItemAt(listOf("a", "b", "c"), 0)).toBeUndefined()
  })
  test("removing or setting item 0 changes nothing", () => {
    const list = listOf("a", "b", "c")
    list.removeItem(0)
    list.setItem(0, "z")
    expect(list.values).toEqual(["a", "b", "c"])
  })
  test("item -1 of a plain list is its last item", () => {
    expect(spellCore.getItemAt(["a", "b", "c"], -1)).toBe("c")
    expect(spellCore.getItemAt("abc", -1)).toBe("c")
  })
  test("removing item -1 of a plain list removes its last item", () => {
    const array = ["a", "b", "c"]
    spellCore.removeItemAt(array, -1)
    expect(array).toEqual(["a", "b"])
  })
  test("removing a position past the front changes nothing", () => {
    const array = ["a", "b", "c"]
    spellCore.removeItemAt(array, -5)
    const list = listOf("a", "b", "c")
    list.removeItem(-5)
    expect([array, list.values]).toEqual([
      ["a", "b", "c"],
      ["a", "b", "c"]
    ])
  })
})

describe("counting from 0", () => {
  test("an item:  0 is the first, -1 the last, past the end nothing", () => {
    for (const list of [["a", "b", "c"], listOf("a", "b", "c")]) {
      expect([0, 2, -1, 3].map((position) => spellCore.getItemAt(list, position, 0))).toEqual([
        "a",
        "c",
        "c",
        undefined
      ])
    }
  })
  test("a spell list's at() counts from 0, as an array's", () => {
    expect([0, 1, -1, 5].map((index) => listOf("a", "b", "c").at(index))).toEqual(["a", "b", "c", undefined])
  })
  test("the position of an item, from 0;  a missing one is nothing, never -1", () => {
    expect(positionOf(["a", "b", "c"], "a", 0)).toBe(0)
    expect(listOf("a", "b", "c").positionOf("c", 0)).toBe(2)
    expect(spellCore.positionOf(listOf("a", "b"), "z", 0)).toBeUndefined()
  })
  test("set and remove by position", () => {
    const list = listOf("a", "b", "c")
    list.setItem(0, "z", 0)
    spellCore.removeItemAt(list, 1, 0)
    expect(list.values).toEqual(["z", "c"])
  })
  test("ranges include their end", () => {
    expect(spellCore.rangeBetween(["a", "b", "c", "d"], 1, 2, 0)).toEqual(["b", "c"])
    expect(listOf("a", "b", "c", "d").between(0, 1, 0).values).toEqual(["a", "b"])
    expect(listOf("a", "b", "c", "d").startingFrom(2, 0).values).toEqual(["c", "d"])
  })
  test("removing a range", () => {
    const array = ["a", "b", "c", "d"]
    spellCore.removeRangeBetween(array, 1, 2, 0)
    expect(array).toEqual(["a", "d"])
  })
  test("a loop's position counts from 0", () => {
    const positions: unknown[] = []
    spellCore.forEach(["a", "b"], (_value, position) => positions.push(position), 0)
    listOf("a", "b").forEach((_value, position) => positions.push(position), 0)
    expect(positions).toEqual([0, 1, 0, 1])
    expect(spellCore.map(["a", "b"], (value, position) => `${value}${String(position)}`, 0)).toEqual(["a0", "b1"])
  })
})
