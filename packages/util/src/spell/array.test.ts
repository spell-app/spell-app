import { describe, expect, it } from "vite-plus/test"

import { itemsWithHighest } from "$/util"

describe("itemsWithHighest()", () => {
  it("keeps every item tied for the highest score", () => {
    expect(itemsWithHighest(["a", "bb", "cc", "d"], (it) => it.length)).toEqual(["bb", "cc"])
  })

  it("keeps them in their original order, earliest first", () => {
    const items = [
      { name: "first", score: 2 },
      { name: "low", score: 1 },
      { name: "second", score: 2 }
    ]
    expect(itemsWithHighest(items, (it) => it.score).map((it) => it.name)).toEqual(["first", "second"])
  })

  it("handles negative scores and a single item", () => {
    expect(itemsWithHighest([-3, -1, -2], (it) => it)).toEqual([-1])
    expect(itemsWithHighest(["only"], () => 0)).toEqual(["only"])
  })

  it("returns nothing for no items", () => {
    expect(itemsWithHighest([], () => 0)).toEqual([])
  })
})
