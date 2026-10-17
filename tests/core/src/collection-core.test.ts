import { describe, test, expect, expectTypeOf, beforeEach, vi } from "vite-plus/test"
import { core, assert, positionOf, List, Thing } from "$/core"

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
  setItem = vi.fn((position, value) => value)
  addAtPosition = vi.fn()
  removeItem = vi.fn()
  positionOf = vi.fn(() => "key1")
  clear = vi.fn()
  iterator = vi.fn()
}

describe("core.itemCountOf()", () => {
  test("assertion fails and returns 0 if not defined", () => {
    expect(core.itemCountOf()).toBe(0)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `itemCount` function if defined", () => {
    const custom = new CustomCollection()
    expect(core.itemCountOf(custom)).toBe(2)
    expect(custom.itemCount).toHaveBeenCalled()
  })
  test("returns correct number for an array", () => {
    expect(core.itemCountOf([1, 2])).toBe(2)
  })
  test("returns correct number for arguments", function () {
    let args
    ;(function (..._args) {
      args = _args
    })()
    expect(core.itemCountOf(args)).toBe(0)
  })
  test("returns correct number for empty object", function () {
    expect(core.itemCountOf({})).toBe(0)
  })
  test("returns correct number for non-empty object", function () {
    expect(core.itemCountOf({ a: 1, b: 2 })).toBe(2)
  })
})

describe("core.isEmpty()", () => {
  test("assertion fails and returns true if not defined", () => {
    expect(core.isEmpty()).toBe(true)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `itemCount` function if defined", () => {
    const custom = new CustomCollection()
    expect(core.isEmpty(custom)).toBe(false)
    expect(custom.itemCount).toHaveBeenCalled()
  })
  test("returns true for an empty array", () => {
    expect(core.isEmpty([])).toBe(true)
  })
  test("returns false number for a non-empty array", () => {
    expect(core.isEmpty([1])).toBe(false)
  })
  test("returns true for an empty object", () => {
    expect(core.isEmpty({})).toBe(true)
  })
  test("returns false number for a non-empty array", () => {
    expect(core.isEmpty({ a: 1 })).toBe(false)
  })
})

describe("core.keysOf()", () => {
  test("assertion fails and returns empty array if not defined", () => {
    expect(core.keysOf()).toEqual([])
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `getKeys` function if defined", () => {
    const custom = new CustomCollection()
    expect(core.keysOf(custom)).toEqual(["key1", "key2"])
    expect(custom.getKeys).toHaveBeenCalled()
  })
  test("returns empty array for an empty array", () => {
    expect(core.keysOf([])).toEqual([])
  })
  test("returns its indexes, from 0, for a non-empty array", () => {
    expect(core.keysOf(["a", "b"])).toEqual([0, 1])
  })
  test("returns empty array for an empty object", () => {
    expect(core.keysOf({})).toEqual([])
  })
  test("returns array of keys for a non-empty object", () => {
    expect(core.keysOf({ a: 1, b: true })).toEqual(["a", "b"])
  })
})

describe("core.valuesOf()", () => {
  test("assertion fails and returns empty array if not defined", () => {
    expect(core.valuesOf()).toEqual([])
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `getValues` function if defined", () => {
    const custom = new CustomCollection()
    expect(core.valuesOf(custom)).toEqual(["value1", "value2"])
    expect(custom.getValues).toHaveBeenCalled()
  })
  test("returns empty array for an empty array", () => {
    expect(core.valuesOf([])).toEqual([])
  })
  test("returns array of numbers number for a non-empty array", () => {
    expect(core.valuesOf(["a", "b"])).toEqual(["a", "b"])
  })
  test("returns true for an empty object", () => {
    expect(core.valuesOf({})).toEqual([])
  })
  test("returns correct values for a non-empty object", () => {
    expect(core.valuesOf({ a: 1, b: true })).toEqual([1, true])
  })
})

describe("positionOf(), imported by name", () => {
  test("does what `core.positionOf()` does, an index from 0;  a list's or an array's is a number", () => {
    const deck = new List<string>().append("a", "b")
    expect([positionOf(deck, "b"), positionOf(["x", "y"], "x"), positionOf(deck, "zzz")]).toEqual([1, 0, undefined])
    expect(positionOf({ one: 1 }, 1)).toBe(core.positionOf({ one: 1 }, 1))
    expectTypeOf(positionOf(deck, "b")).toEqualTypeOf<number | undefined>()
  })

  test("typed `number` for a value of an array's OWN item type:  an enumeration's value is always in it", () => {
    const RANKS = ["A", 2, 3] as const
    const rank: (typeof RANKS)[number] = 2
    expect(positionOf(RANKS, rank)).toBe(1)
    expectTypeOf(positionOf(RANKS, rank)).toEqualTypeOf<number>()
    expectTypeOf(core.positionOf(RANKS, rank)).toEqualTypeOf<number>()
    expectTypeOf(positionOf(RANKS, "Q" as unknown)).toEqualTypeOf<number | undefined>()
  })
})

describe("core.positionOf()", () => {
  test("assertion fails and returns undefined if not defined", () => {
    expect(core.positionOf()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `positionOf` function if defined", () => {
    const custom = new CustomCollection()
    expect(core.positionOf(custom)).toEqual("key1")
    expect(custom.positionOf).toHaveBeenCalled()
  })
  test("returns undefined if not found in array", () => {
    expect(core.positionOf([], 1)).toEqual(undefined)
  })
  test("returns its index if found in array", () => {
    expect(core.positionOf(["a", "b"], "a")).toEqual(0)
  })
  test("returns undefined if not found in object", () => {
    expect(core.positionOf({}, 1)).toEqual(undefined)
  })
  test("returns correct value for a non-empty object", () => {
    expect(core.positionOf({ a: 1, b: true }, 1)).toEqual("a")
  })
})

describe("core.getItemAt()", () => {
  test("assertion fails and returns undefined if not defined", () => {
    expect(core.getItemAt()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `getItem` function if defined", () => {
    const custom = new CustomCollection()
    expect(core.getItemAt(custom)).toEqual("value")
    expect(custom.getItem).toHaveBeenCalled()
  })
  test("returns undefined for an empty array", () => {
    expect(core.getItemAt([], 0)).toEqual(undefined)
  })
  test("returns correct value for a non-empty array", () => {
    expect(core.getItemAt(["a", "b"], 0)).toEqual("a")
  })
  test("returns undefined for an empty object", () => {
    expect(core.getItemAt({}, 1)).toEqual(undefined)
  })
  test("returns correct value for a non-empty object", () => {
    expect(core.getItemAt({ a: 1, b: true }, "a")).toEqual(1)
  })
})

describe("core.setItemAt()", () => {
  test("assertion fails if not defined", () => {
    core.setItemAt()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `setItem` function if defined", () => {
    const custom = new CustomCollection()
    expect(core.setItemAt(custom, 1, "foo")).toEqual("foo")
    expect(custom.setItem).toHaveBeenCalled()
  })
  test("updates array properly if not present", () => {
    const collection = ["a"]
    core.setItemAt(collection, 1, "b")
    expect(collection).toEqual(["a", "b"])
  })
  test("updates array properly if present", () => {
    const collection = ["a", "b"]
    core.setItemAt(collection, 1, "B")
    expect(collection).toEqual(["a", "B"])
  })
  test("updates object properly if not present", () => {
    const collection = { a: 1 }
    core.setItemAt(collection, "b", true)
    expect(collection).toEqual({ a: 1, b: true })
  })
  test("updates object properly if present", () => {
    const collection = { a: 1, b: false }
    core.setItemAt(collection, "b", true)
    expect(collection).toEqual({ a: 1, b: true })
  })
})

describe("core.addAtPosition()", () => {
  test("assertion fails if not defined", () => {
    core.addAtPosition()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails for object", () => {
    core.addAtPosition({})
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `addAtPosition` function if defined", () => {
    const custom = new CustomCollection()
    core.addAtPosition(custom, 1, "foo")
    expect(custom.addAtPosition).toHaveBeenCalled()
  })
  describe("with positive start", () => {
    test("adds correctly to empty list at index 0", () => {
      const collection: unknown[] = []
      core.addAtPosition(collection, 0, "a")
      expect(collection).toEqual(["a"])
    })
    test("adds correctly to non-empty list at index 0", () => {
      const collection = ["a"]
      core.addAtPosition(collection, 0, "b")
      expect(collection).toEqual(["b", "a"])
    })
    test("will not introduce gap if after end of list", () => {
      const collection = ["a"]
      core.addAtPosition(collection, 2, "b")
      expect(collection).toEqual(["a", "b"])
    })
    test("adds multiple items if passed", () => {
      const collection = ["a"]
      core.addAtPosition(collection, 2, "b", "c", "d")
      expect(collection).toEqual(["a", "b", "c", "d"])
    })
  })
  describe("with negative start", () => {
    test("adds correctly to empty list at position -1", () => {
      const collection: unknown[] = []
      core.addAtPosition(collection, -1, "a")
      expect(collection).toEqual(["a"])
    })
    test("adds correctly to non-empty list at position -1", () => {
      const collection = ["a", "b"]
      core.addAtPosition(collection, -1, "c")
      expect(collection).toEqual(["a", "c", "b"])
    })
    test("will not introduce gap if before start of list", () => {
      const collection = ["a"]
      core.addAtPosition(collection, -3, "b")
      expect(collection).toEqual(["b", "a"])
    })
    test("adds multiple items if passed", () => {
      const collection = ["a"]
      core.addAtPosition(collection, -1, "b", "c", "d")
      expect(collection).toEqual(["b", "c", "d", "a"])
    })
  })
})

describe("core.removeItemAt()", () => {
  test("assertion fails if not defined", () => {
    core.removeItemAt()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `removeItem` function if defined", () => {
    const custom = new CustomCollection()
    core.removeItemAt(custom, 1)
    expect(custom.removeItem).toHaveBeenCalled()
  })
  test("updates array properly if not present", () => {
    const collection = ["a"]
    core.removeItemAt(collection, 1)
    expect(collection).toEqual(["a"])
  })
  test("updates array properly if present", () => {
    const collection = ["a", "b", "c"]
    core.removeItemAt(collection, 1)
    expect(collection).toEqual(["a", "c"])
  })
  test("updates object properly if not present", () => {
    const collection = { a: 1 }
    core.removeItemAt(collection, "b")
    expect(collection).toEqual({ a: 1 })
  })
  test("updates object properly if present", () => {
    const collection = { a: 1, b: false }
    core.removeItemAt(collection, "b")
    expect(collection).toEqual({ a: 1 })
  })
})

describe("core.clear()", () => {
  test("assertion fails if not defined", () => {
    core.clear()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `clear` function if defined", () => {
    const custom = new CustomCollection()
    core.clear(custom)
    expect(custom.clear).toHaveBeenCalled()
  })
  test("updates array properly", () => {
    const collection = ["a", "b", "c"]
    core.clear(collection)
    expect(collection).toEqual([])
    expect(collection.length).toEqual(0)
  })
  test("updates object properly if present", () => {
    const collection = { a: 1, b: false }
    core.clear(collection)
    expect(collection).toEqual({})
  })
})

describe("core.getIteratorFor()", () => {
  test("assertion fails and returns `done` iterator if not defined", () => {
    const iterator = core.getIteratorFor()
    expect(iterator.next()).toEqual({ done: true })
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `getIteratorFor` function if defined", () => {
    const custom = new CustomCollection()
    core.getIteratorFor(custom)
    expect(custom.iterator).toHaveBeenCalled()
  })
  test("returns expected values for empty array", () => {
    const collection: unknown[] = []
    const iterator = core.getIteratorFor(collection)
    expect(iterator.next()).toEqual({ done: true })
  })
  test("returns expected values for empty array", () => {
    const collection = ["a", "b"]
    const iterator = core.getIteratorFor(collection)
    expect(iterator.next()).toEqual({ done: false, value: ["a", 0, collection] })
    expect(iterator.next()).toEqual({ done: false, value: ["b", 1, collection] })
    expect(iterator.next()).toEqual({ done: true })
  })
  test("returns expected values for empty object", () => {
    const collection = {}
    const iterator = core.getIteratorFor(collection)
    expect(iterator.next()).toEqual({ done: true })
  })
  test("returns expected values for non-empty object", () => {
    const collection = { a: 1, b: true }
    const iterator = core.getIteratorFor(collection)
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
    return core.getItemAt(this, -1)
  }
  // `this` in a sub-class's `draw()`:  no circular inference (TS7023)
  draw() {
    return core.drawThing(core.getItemAt(this, -1))
  }
}

/** A list of who-knows-what, as compiled spell's `a pile is a list` is today. */
class Pile extends List {}

describe("typed collections:  a helper's result and callbacks follow its collection's items", () => {
  test("a `List<Card>`'s item is a `Card`, if it has one -- `this` in a sub-class too", () => {
    expectTypeOf(core.getItemAt(new Deck(), 1)).toEqualTypeOf<Card | undefined>()
    expectTypeOf(new Deck().top).toEqualTypeOf<Card | undefined>()
    expectTypeOf(core.getItemAt([new Card()], 1)).toEqualTypeOf<Card | undefined>()
    expectTypeOf(core.randomItemOf(new Deck())).toEqualTypeOf<Card | undefined>()
  })

  test("a list with no item type, or a collection typed `unknown`, holds `unknown`", () => {
    expectTypeOf(core.getItemAt(new Pile(), 1)).toEqualTypeOf<unknown>()
    expectTypeOf(core.getItemAt({ a: 1 } as unknown, "a")).toEqualTypeOf<unknown>()
  })

  test("a callback is checked against the collection's items, and ONLY them", () => {
    core.forEach(new Deck(), (card) => expectTypeOf(card).toEqualTypeOf<Card>())
    core.forEach(new Pile(), (card: unknown) => card)
    // @ts-expect-error -- a deck holds cards
    core.forEach(new Deck(), (count: number) => count)
    // @ts-expect-error -- TypeScript can't tell what a `Pile` holds
    core.forEach(new Pile(), (card: Card) => card)
  })

  test("`positionOf()` a list or an array is a position;  of anything else, a key or a position", () => {
    expectTypeOf(core.positionOf(new Pile(), 1)).toEqualTypeOf<number | undefined>()
    // an array's own item type:  typed as always there -- see `positionOf()`
    expectTypeOf(core.positionOf(["a"], "a")).toEqualTypeOf<number>()
    expectTypeOf(core.positionOf(["a"], 1 as unknown)).toEqualTypeOf<number | undefined>()
    expectTypeOf(core.positionOf({ a: 1 }, 1)).toEqualTypeOf<string | number | undefined>()
  })

  test("a read-only `as const` list, as compiled TypeScript writes one, is a collection like any other", () => {
    const RANKS = ["ace", 2, "king"] as const
    expectTypeOf(core.positionOf(RANKS, "king")).toEqualTypeOf<number>()
    expectTypeOf(core.getItemAt(RANKS, 1)).toEqualTypeOf<"ace" | 2 | "king" | undefined>()
    expectTypeOf(core.includes(RANKS, "ace")).toEqualTypeOf<boolean>()
    core.forEach(RANKS, (rank) => expectTypeOf(rank).toEqualTypeOf<"ace" | 2 | "king">())
    expect(core.positionOf(RANKS, "king")).toBe(2)
  })
})
