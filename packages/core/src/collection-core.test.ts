import { describe, test, expect, expectTypeOf, beforeEach, vi } from "vite-plus/test"
import { spellCore, assert, itemOf, List, Thing } from "$/core"

// Wrap `assert.failed` for each test
beforeEach(() => {
  assert.failed = vi.fn()
})

// Custom collection class simulating our custom api
class CustomCollection {
  length = 2
  itemCount = vi.fn(() => 2)
  getKeys = vi.fn(() => ["key1", "key2"])
  getValues = vi.fn(() => ["value1", "value2"])
  getItem = vi.fn(() => "value")
  setItem = vi.fn((item, value) => value)
  addAtPosition = vi.fn()
  removeItem = vi.fn()
  itemOf = vi.fn(() => "item")
  clear = vi.fn()
  iterator = vi.fn()
}

describe("spellCore.itemCountOf()", () => {
  test("assertion fails and returns 0 if not defined", () => {
    expect(spellCore.itemCountOf()).toBe(0)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `itemCount` function if defined", () => {
    const custom = new CustomCollection()
    expect(spellCore.itemCountOf(custom)).toBe(2)
    expect(custom.itemCount).toHaveBeenCalled()
  })
  test("returns correct number for an array", () => {
    expect(spellCore.itemCountOf([1, 2])).toBe(2)
  })
  test("returns correct number for arguments", function () {
    let args
    ;(function (..._args) {
      args = _args
    })()
    expect(spellCore.itemCountOf(args)).toBe(0)
  })
  test("returns correct number for empty object", function () {
    expect(spellCore.itemCountOf({})).toBe(0)
  })
  test("returns correct number for non-empty object", function () {
    expect(spellCore.itemCountOf({ a: 1, b: 2 })).toBe(2)
  })
})

describe("spellCore.isEmpty()", () => {
  test("assertion fails and returns true if not defined", () => {
    expect(spellCore.isEmpty()).toBe(true)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `itemCount` function if defined", () => {
    const custom = new CustomCollection()
    expect(spellCore.isEmpty(custom)).toBe(false)
    expect(custom.itemCount).toHaveBeenCalled()
  })
  test("returns true for an empty array", () => {
    expect(spellCore.isEmpty([])).toBe(true)
  })
  test("returns false number for a non-empty array", () => {
    expect(spellCore.isEmpty([1])).toBe(false)
  })
  test("returns true for an empty object", () => {
    expect(spellCore.isEmpty({})).toBe(true)
  })
  test("returns false number for a non-empty array", () => {
    expect(spellCore.isEmpty({ a: 1 })).toBe(false)
  })
})

describe("spellCore.keysOf()", () => {
  test("assertion fails and returns empty array if not defined", () => {
    expect(spellCore.keysOf()).toEqual([])
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `getKeys` function if defined", () => {
    const custom = new CustomCollection()
    expect(spellCore.keysOf(custom)).toEqual(["key1", "key2"])
    expect(custom.getKeys).toHaveBeenCalled()
  })
  test("returns empty array for an empty array", () => {
    expect(spellCore.keysOf([])).toEqual([])
  })
  test("returns array of numbers number for a non-empty array", () => {
    expect(spellCore.keysOf(["a", "b"])).toEqual([1, 2])
  })
  test("returns empty array for an empty object", () => {
    expect(spellCore.keysOf({})).toEqual([])
  })
  test("returns array of keys for a non-empty object", () => {
    expect(spellCore.keysOf({ a: 1, b: true })).toEqual(["a", "b"])
  })
})

describe("spellCore.valuesOf()", () => {
  test("assertion fails and returns empty array if not defined", () => {
    expect(spellCore.valuesOf()).toEqual([])
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `getValues` function if defined", () => {
    const custom = new CustomCollection()
    expect(spellCore.valuesOf(custom)).toEqual(["value1", "value2"])
    expect(custom.getValues).toHaveBeenCalled()
  })
  test("returns empty array for an empty array", () => {
    expect(spellCore.valuesOf([])).toEqual([])
  })
  test("returns array of numbers number for a non-empty array", () => {
    expect(spellCore.valuesOf(["a", "b"])).toEqual(["a", "b"])
  })
  test("returns true for an empty object", () => {
    expect(spellCore.valuesOf({})).toEqual([])
  })
  test("returns correct values for a non-empty object", () => {
    expect(spellCore.valuesOf({ a: 1, b: true })).toEqual([1, true])
  })
})

describe("itemOf(), imported by name", () => {
  test("does what `spellCore.itemOf()` does, counting from 1;  a list's or an array's is a number", () => {
    const deck = new List<string>().append("a", "b")
    expect([itemOf(deck, "b"), itemOf(["x", "y"], "x"), itemOf(deck, "zzz")]).toEqual([2, 1, undefined])
    expect(itemOf({ one: 1 }, 1)).toBe(spellCore.itemOf({ one: 1 }, 1))
    expectTypeOf(itemOf(deck, "b")).toEqualTypeOf<number | undefined>()
  })

  test("typed `number` for a value of an array's OWN item type:  an enumeration's value is always in it", () => {
    const RANKS = ["A", 2, 3] as const
    const rank: (typeof RANKS)[number] = 2
    expect(itemOf(RANKS, rank)).toBe(2)
    expectTypeOf(itemOf(RANKS, rank)).toEqualTypeOf<number>()
    expectTypeOf(spellCore.itemOf(RANKS, rank)).toEqualTypeOf<number>()
    expectTypeOf(itemOf(RANKS, "Q" as unknown)).toEqualTypeOf<number | undefined>()
  })
})

describe("spellCore.itemOf()", () => {
  test("assertion fails and returns undefined if not defined", () => {
    expect(spellCore.itemOf()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `itemOf` function if defined", () => {
    const custom = new CustomCollection()
    expect(spellCore.itemOf(custom)).toEqual("item")
    expect(custom.itemOf).toHaveBeenCalled()
  })
  test("returns undefined if not found in array", () => {
    expect(spellCore.itemOf([], 1)).toEqual(undefined)
  })
  test("returns position if found in array", () => {
    expect(spellCore.itemOf(["a", "b"], "a")).toEqual(1)
  })
  test("returns undefined if not found in object", () => {
    expect(spellCore.itemOf({}, 1)).toEqual(undefined)
  })
  test("returns correct value for a non-empty object", () => {
    expect(spellCore.itemOf({ a: 1, b: true }, 1)).toEqual("a")
  })
})

describe("spellCore.getItemOf()", () => {
  test("assertion fails and returns undefined if not defined", () => {
    expect(spellCore.getItemOf()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `getItem` function if defined", () => {
    const custom = new CustomCollection()
    expect(spellCore.getItemOf(custom)).toEqual("value")
    expect(custom.getItem).toHaveBeenCalled()
  })
  test("returns undefined for an empty array", () => {
    expect(spellCore.getItemOf([], 1)).toEqual(undefined)
  })
  test("returns correct value for a non-empty array", () => {
    expect(spellCore.getItemOf(["a", "b"], 1)).toEqual("a")
  })
  test("returns undefined for an empty object", () => {
    expect(spellCore.getItemOf({}, 1)).toEqual(undefined)
  })
  test("returns correct value for a non-empty object", () => {
    expect(spellCore.getItemOf({ a: 1, b: true }, "a")).toEqual(1)
  })
})

describe("spellCore.setItemOf()", () => {
  test("assertion fails if not defined", () => {
    spellCore.setItemOf()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `setItem` function if defined", () => {
    const custom = new CustomCollection()
    expect(spellCore.setItemOf(custom, 1, "foo")).toEqual("foo")
    expect(custom.setItem).toHaveBeenCalled()
  })
  test("updates array properly if not present", () => {
    const collection = ["a"]
    spellCore.setItemOf(collection, 2, "b")
    expect(collection).toEqual(["a", "b"])
  })
  test("updates array properly if present", () => {
    const collection = ["a", "b"]
    spellCore.setItemOf(collection, 2, "B")
    expect(collection).toEqual(["a", "B"])
  })
  test("updates object properly if not present", () => {
    const collection = { a: 1 }
    spellCore.setItemOf(collection, "b", true)
    expect(collection).toEqual({ a: 1, b: true })
  })
  test("updates object properly if present", () => {
    const collection = { a: 1, b: false }
    spellCore.setItemOf(collection, "b", true)
    expect(collection).toEqual({ a: 1, b: true })
  })
})

describe("spellCore.addAtPosition()", () => {
  test("assertion fails if not defined", () => {
    spellCore.addAtPosition()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails for object", () => {
    spellCore.addAtPosition({})
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `addAtPosition` function if defined", () => {
    const custom = new CustomCollection()
    spellCore.addAtPosition(custom, 1, "foo")
    expect(custom.addAtPosition).toHaveBeenCalled()
  })
  describe("with positive start", () => {
    test("adds correctly to empty list at position 1", () => {
      const collection: unknown[] = []
      spellCore.addAtPosition(collection, 1, "a")
      expect(collection).toEqual(["a"])
    })
    test("adds correctly to non-empty list at position 1", () => {
      const collection = ["a"]
      spellCore.addAtPosition(collection, 1, "b")
      expect(collection).toEqual(["b", "a"])
    })
    test("will not introduce gap if after end of list", () => {
      const collection = ["a"]
      spellCore.addAtPosition(collection, 3, "b")
      expect(collection).toEqual(["a", "b"])
    })
    test("adds multiple items if passed", () => {
      const collection = ["a"]
      spellCore.addAtPosition(collection, 3, "b", "c", "d")
      expect(collection).toEqual(["a", "b", "c", "d"])
    })
  })
  describe("with negative start", () => {
    test("adds correctly to empty list at position -1", () => {
      const collection: unknown[] = []
      spellCore.addAtPosition(collection, -1, "a")
      expect(collection).toEqual(["a"])
    })
    test("adds correctly to non-empty list at position -1", () => {
      const collection = ["a", "b"]
      spellCore.addAtPosition(collection, -1, "c")
      expect(collection).toEqual(["a", "c", "b"])
    })
    test("will not introduce gap if before start of list", () => {
      const collection = ["a"]
      spellCore.addAtPosition(collection, -3, "b")
      expect(collection).toEqual(["b", "a"])
    })
    test("adds multiple items if passed", () => {
      const collection = ["a"]
      spellCore.addAtPosition(collection, -1, "b", "c", "d")
      expect(collection).toEqual(["b", "c", "d", "a"])
    })
  })
})

describe("spellCore.removeItemOf()", () => {
  test("assertion fails if not defined", () => {
    spellCore.removeItemOf()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `removeItem` function if defined", () => {
    const custom = new CustomCollection()
    spellCore.removeItemOf(custom, 1)
    expect(custom.removeItem).toHaveBeenCalled()
  })
  test("updates array properly if not present", () => {
    const collection = ["a"]
    spellCore.removeItemOf(collection, 2)
    expect(collection).toEqual(["a"])
  })
  test("updates array properly if present", () => {
    const collection = ["a", "b", "c"]
    spellCore.removeItemOf(collection, 2)
    expect(collection).toEqual(["a", "c"])
  })
  test("updates object properly if not present", () => {
    const collection = { a: 1 }
    spellCore.removeItemOf(collection, "b")
    expect(collection).toEqual({ a: 1 })
  })
  test("updates object properly if present", () => {
    const collection = { a: 1, b: false }
    spellCore.removeItemOf(collection, "b")
    expect(collection).toEqual({ a: 1 })
  })
})

describe("spellCore.clear()", () => {
  test("assertion fails if not defined", () => {
    spellCore.clear()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `clear` function if defined", () => {
    const custom = new CustomCollection()
    spellCore.clear(custom)
    expect(custom.clear).toHaveBeenCalled()
  })
  test("updates array properly", () => {
    const collection = ["a", "b", "c"]
    spellCore.clear(collection)
    expect(collection).toEqual([])
    expect(collection.length).toEqual(0)
  })
  test("updates object properly if present", () => {
    const collection = { a: 1, b: false }
    spellCore.clear(collection)
    expect(collection).toEqual({})
  })
})

describe("spellCore.getIteratorFor()", () => {
  test("assertion fails and returns `done` iterator if not defined", () => {
    const iterator = spellCore.getIteratorFor()
    expect(iterator.next()).toEqual({ done: true })
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `getIteratorFor` function if defined", () => {
    const custom = new CustomCollection()
    spellCore.getIteratorFor(custom)
    expect(custom.iterator).toHaveBeenCalled()
  })
  test("returns expected values for empty array", () => {
    const collection: unknown[] = []
    const iterator = spellCore.getIteratorFor(collection)
    expect(iterator.next()).toEqual({ done: true })
  })
  test("returns expected values for empty array", () => {
    const collection = ["a", "b"]
    const iterator = spellCore.getIteratorFor(collection)
    expect(iterator.next()).toEqual({ done: false, value: ["a", 1, collection] })
    expect(iterator.next()).toEqual({ done: false, value: ["b", 2, collection] })
    expect(iterator.next()).toEqual({ done: true })
  })
  test("returns expected values for empty object", () => {
    const collection = {}
    const iterator = spellCore.getIteratorFor(collection)
    expect(iterator.next()).toEqual({ done: true })
  })
  test("returns expected values for non-empty object", () => {
    const collection = { a: 1, b: true }
    const iterator = spellCore.getIteratorFor(collection)
    expect(iterator.next()).toEqual({ done: false, value: [1, "a", collection] })
    expect(iterator.next()).toEqual({ done: false, value: [true, "b", collection] })
    expect(iterator.next()).toEqual({ done: true })
  })
})

////////////////
// ## Typed collections -- `CollectionOf`
////////////////

/** A card, for a deck to hold. */
class Card extends Thing {
  get name(): string {
    return "ace of spades"
  }
}

/** A list TypeScript knows holds cards. */
class Deck extends List<Card> {
  get top() {
    return spellCore.getItemOf(this, -1)
  }
  // `this` in a sub-class's `draw()`:  no circular inference (TS7023)
  draw() {
    return spellCore.drawThing(spellCore.getItemOf(this, -1))
  }
}

/** A list of who-knows-what, as compiled spell's `a pile is a list` is today. */
class Pile extends List {}

describe("typed collections:  a helper's result and callbacks follow its collection's items", () => {
  test("a `List<Card>`'s item is a `Card`, if it has one -- `this` in a sub-class too", () => {
    expectTypeOf(spellCore.getItemOf(new Deck(), 1)).toEqualTypeOf<Card | undefined>()
    expectTypeOf(new Deck().top).toEqualTypeOf<Card | undefined>()
    expectTypeOf(spellCore.getItemOf([new Card()], 1)).toEqualTypeOf<Card | undefined>()
    expectTypeOf(spellCore.randomItemOf(new Deck())).toEqualTypeOf<Card | undefined>()
  })

  test("a list with no item type, or a collection typed `unknown`, holds `unknown`", () => {
    expectTypeOf(spellCore.getItemOf(new Pile(), 1)).toEqualTypeOf<unknown>()
    expectTypeOf(spellCore.getItemOf({ a: 1 } as unknown, "a")).toEqualTypeOf<unknown>()
  })

  test("a callback is checked against the collection's items, and ONLY them", () => {
    spellCore.forEach(new Deck(), (card) => expectTypeOf(card).toEqualTypeOf<Card>())
    spellCore.forEach(new Pile(), (card: unknown) => card)
    // @ts-expect-error -- a deck holds cards
    spellCore.forEach(new Deck(), (count: number) => count)
    // @ts-expect-error -- TypeScript can't tell what a `Pile` holds
    spellCore.forEach(new Pile(), (card: Card) => card)
  })

  test("`itemOf()` a list or an array is a position;  of anything else, a key or a position", () => {
    expectTypeOf(spellCore.itemOf(new Pile(), 1)).toEqualTypeOf<number | undefined>()
    // an array's own item type:  typed as always there -- see `itemOf()`
    expectTypeOf(spellCore.itemOf(["a"], "a")).toEqualTypeOf<number>()
    expectTypeOf(spellCore.itemOf(["a"], 1 as unknown)).toEqualTypeOf<number | undefined>()
    expectTypeOf(spellCore.itemOf({ a: 1 }, 1)).toEqualTypeOf<string | number | undefined>()
  })

  test("a read-only `as const` list, as compiled TypeScript writes one, is a collection like any other", () => {
    const RANKS = ["ace", 2, "king"] as const
    expectTypeOf(spellCore.itemOf(RANKS, "king")).toEqualTypeOf<number>()
    expectTypeOf(spellCore.getItemOf(RANKS, 1)).toEqualTypeOf<"ace" | 2 | "king" | undefined>()
    expectTypeOf(spellCore.includes(RANKS, "ace")).toEqualTypeOf<boolean>()
    spellCore.forEach(RANKS, (rank) => expectTypeOf(rank).toEqualTypeOf<"ace" | 2 | "king">())
    expect(spellCore.itemOf(RANKS, "king")).toBe(3)
  })
})
