import { spell, assert } from "."

// Wrap `assert.failed` for each test
beforeEach(() => {
  assert.failed = jest.fn()
})

// Custom collection class simulating our custom api
class CustomCollection {
  length = 2
  itemCount = jest.fn(() => 2)
  getKeys = jest.fn(() => ["key1", "key2"])
  getValues = jest.fn(() => ["value1", "value2"])
  getItem = jest.fn(() => "value")
  setItem = jest.fn((item, value) => value)
  addAtPosition = jest.fn()
  removeItem = jest.fn()
  itemOf = jest.fn(() => "item")
  clear = jest.fn()
  getIterator = jest.fn()
}

describe("spell.itemCountOf()", () => {
  test("assertion fails and returns 0 if not defined", () => {
    expect(spell.itemCountOf()).toBe(0)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `itemCount` function if defined", () => {
    const custom = new CustomCollection()
    expect(spell.itemCountOf(custom)).toBe(2)
    expect(custom.itemCount).toHaveBeenCalled()
  })
  test("returns correct number for an array", () => {
    expect(spell.itemCountOf([1, 2])).toBe(2)
  })
  test("returns correct number for arguments", function() {
    expect(spell.itemCountOf(arguments)).toBe(0)
  })
  test("returns correct number for empty object", function() {
    expect(spell.itemCountOf({})).toBe(0)
  })
  test("returns correct number for non-empty object", function() {
    expect(spell.itemCountOf({ a: 1, b: 2 })).toBe(2)
  })
})

describe("spell.isEmpty()", () => {
  test("assertion fails and returns true if not defined", () => {
    expect(spell.isEmpty()).toBe(true)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `itemCount` function if defined", () => {
    const custom = new CustomCollection()
    expect(spell.isEmpty(custom)).toBe(false)
    expect(custom.itemCount).toHaveBeenCalled()
  })
  test("returns true for an empty array", () => {
    expect(spell.isEmpty([])).toBe(true)
  })
  test("returns false number for a non-empty array", () => {
    expect(spell.isEmpty([1])).toBe(false)
  })
  test("returns true for an empty object", () => {
    expect(spell.isEmpty({})).toBe(true)
  })
  test("returns false number for a non-empty array", () => {
    expect(spell.isEmpty({ a: 1 })).toBe(false)
  })
})

describe("spell.keysOf()", () => {
  test("assertion fails and returns empty array if not defined", () => {
    expect(spell.keysOf()).toEqual([])
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `getKeys` function if defined", () => {
    const custom = new CustomCollection()
    expect(spell.keysOf(custom)).toEqual(["key1", "key2"])
    expect(custom.getKeys).toHaveBeenCalled()
  })
  test("returns empty array for an empty array", () => {
    expect(spell.keysOf([])).toEqual([])
  })
  test("returns array of numbers number for a non-empty array", () => {
    expect(spell.keysOf(["a", "b"])).toEqual([1, 2])
  })
  test("returns empty array for an empty object", () => {
    expect(spell.keysOf({})).toEqual([])
  })
  test("returns array of keys for a non-empty object", () => {
    expect(spell.keysOf({ a: 1, b: true })).toEqual(["a", "b"])
  })
})

describe("spell.valuesOf()", () => {
  test("assertion fails and returns empty array if not defined", () => {
    expect(spell.valuesOf()).toEqual([])
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `getValues` function if defined", () => {
    const custom = new CustomCollection()
    expect(spell.valuesOf(custom)).toEqual(["value1", "value2"])
    expect(custom.getValues).toHaveBeenCalled()
  })
  test("returns empty array for an empty array", () => {
    expect(spell.valuesOf([])).toEqual([])
  })
  test("returns array of numbers number for a non-empty array", () => {
    expect(spell.valuesOf(["a", "b"])).toEqual(["a", "b"])
  })
  test("returns true for an empty object", () => {
    expect(spell.valuesOf({})).toEqual([])
  })
  test("returns correct values for a non-empty object", () => {
    expect(spell.valuesOf({ a: 1, b: true })).toEqual([1, true])
  })
})

describe("spell.itemOf()", () => {
  test("assertion fails and returns undefined if not defined", () => {
    expect(spell.itemOf()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `itemOf` function if defined", () => {
    const custom = new CustomCollection()
    expect(spell.itemOf(custom)).toEqual("item")
    expect(custom.itemOf).toHaveBeenCalled()
  })
  test("returns undefined if not found in array", () => {
    expect(spell.itemOf([], 1)).toEqual(undefined)
  })
  test("returns position if found in array", () => {
    expect(spell.itemOf(["a", "b"], "a")).toEqual(1)
  })
  test("returns undefined if not found in object", () => {
    expect(spell.itemOf({}, 1)).toEqual(undefined)
  })
  test("returns correct value for a non-empty object", () => {
    expect(spell.itemOf({ a: 1, b: true }, 1)).toEqual("a")
  })
})

describe("spell.getItemOf()", () => {
  test("assertion fails and returns undefined if not defined", () => {
    expect(spell.getItemOf()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `getItem` function if defined", () => {
    const custom = new CustomCollection()
    expect(spell.getItemOf(custom)).toEqual("value")
    expect(custom.getItem).toHaveBeenCalled()
  })
  test("returns undefined for an empty array", () => {
    expect(spell.getItemOf([], 1)).toEqual(undefined)
  })
  test("returns correct value for a non-empty array", () => {
    expect(spell.getItemOf(["a", "b"], 1)).toEqual("a")
  })
  test("returns undefined for an empty object", () => {
    expect(spell.getItemOf({}, 1)).toEqual(undefined)
  })
  test("returns correct value for a non-empty object", () => {
    expect(spell.getItemOf({ a: 1, b: true }, "a")).toEqual(1)
  })
})

describe("spell.setItemOf()", () => {
  test("assertion fails if not defined", () => {
    spell.setItemOf()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `setItem` function if defined", () => {
    const custom = new CustomCollection()
    expect(spell.setItemOf(custom, 1, "foo")).toEqual("foo")
    expect(custom.setItem).toHaveBeenCalled()
  })
  test("updates array properly if not present", () => {
    const collection = ["a"]
    spell.setItemOf(collection, 2, "b")
    expect(collection).toEqual(["a", "b"])
  })
  test("updates array properly if present", () => {
    const collection = ["a", "b"]
    spell.setItemOf(collection, 2, "B")
    expect(collection).toEqual(["a", "B"])
  })
  test("updates object properly if not present", () => {
    const collection = { a: 1 }
    spell.setItemOf(collection, "b", true)
    expect(collection).toEqual({ a: 1, b: true })
  })
  test("updates object properly if present", () => {
    const collection = { a: 1, b: false }
    spell.setItemOf(collection, "b", true)
    expect(collection).toEqual({ a: 1, b: true })
  })
})

describe("spell.addAtPosition()", () => {
  test("assertion fails if not defined", () => {
    spell.addAtPosition()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails for object", () => {
    spell.addAtPosition({})
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `addAtPosition` function if defined", () => {
    const custom = new CustomCollection()
    spell.addAtPosition(custom, 1, "foo")
    expect(custom.addAtPosition).toHaveBeenCalled()
  })
  describe("with positive start", () => {
    test("adds correctly to empty list at position 1", () => {
      const collection = []
      spell.addAtPosition(collection, 1, "a")
      expect(collection).toEqual(["a"])
    })
    test("adds correctly to non-empty list at position 1", () => {
      const collection = ["a"]
      spell.addAtPosition(collection, 1, "b")
      expect(collection).toEqual(["b", "a"])
    })
    test("will not introduce gap if after end of list", () => {
      const collection = ["a"]
      spell.addAtPosition(collection, 3, "b")
      expect(collection).toEqual(["a", "b"])
    })
    test("adds multiple items if passed", () => {
      const collection = ["a"]
      spell.addAtPosition(collection, 3, "b", "c", "d")
      expect(collection).toEqual(["a", "b", "c", "d"])
    })
  })
  describe("with negative start", () => {
    test("adds correctly to empty list at position -1", () => {
      const collection = []
      spell.addAtPosition(collection, -1, "a")
      expect(collection).toEqual(["a"])
    })
    test("adds correctly to non-empty list at position -1", () => {
      const collection = ["a", "b"]
      spell.addAtPosition(collection, -1, "c")
      expect(collection).toEqual(["a", "c", "b"])
    })
    test("will not introduce gap if before start of list", () => {
      const collection = ["a"]
      spell.addAtPosition(collection, -3, "b")
      expect(collection).toEqual(["b", "a"])
    })
    test("adds multiple items if passed", () => {
      const collection = ["a"]
      spell.addAtPosition(collection, -1, "b", "c", "d")
      expect(collection).toEqual(["b", "c", "d", "a"])
    })
  })
})

describe("spell.removeItemOf()", () => {
  test("assertion fails if not defined", () => {
    spell.removeItemOf()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `removeItem` function if defined", () => {
    const custom = new CustomCollection()
    spell.removeItemOf(custom, 1)
    expect(custom.removeItem).toHaveBeenCalled()
  })
  test("updates array properly if not present", () => {
    const collection = ["a"]
    spell.removeItemOf(collection, 2)
    expect(collection).toEqual(["a"])
  })
  test("updates array properly if present", () => {
    const collection = ["a", "b", "c"]
    spell.removeItemOf(collection, 2)
    expect(collection).toEqual(["a", "c"])
  })
  test("updates object properly if not present", () => {
    const collection = { a: 1 }
    spell.removeItemOf(collection, "b")
    expect(collection).toEqual({ a: 1 })
  })
  test("updates object properly if present", () => {
    const collection = { a: 1, b: false }
    spell.removeItemOf(collection, "b")
    expect(collection).toEqual({ a: 1 })
  })
})

describe("spell.clear()", () => {
  test("assertion fails if not defined", () => {
    spell.clear()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `clear` function if defined", () => {
    const custom = new CustomCollection()
    spell.clear(custom, 1)
    expect(custom.clear).toHaveBeenCalled()
  })
  test("updates array properly", () => {
    const collection = ["a", "b", "c"]
    spell.clear(collection)
    expect(collection).toEqual([])
    expect(collection.length).toEqual(0)
  })
  test("updates object properly if present", () => {
    const collection = { a: 1, b: false }
    spell.clear(collection)
    expect(collection).toEqual({})
  })
})

describe("spell.getIteratorFor()", () => {
  test("assertion fails and returns `done` iterator if not defined", () => {
    const iterator = spell.getIteratorFor()
    expect(iterator.next()).toEqual({ done: true })
    expect(assert.failed).toHaveBeenCalled()
  })
  test("calls `getIteratorFor` function if defined", () => {
    const custom = new CustomCollection()
    const iterator = spell.getIteratorFor(custom)
    expect(custom.getIterator).toHaveBeenCalled()
  })
  test("returns expected values for empty array", () => {
    const collection = []
    const iterator = spell.getIteratorFor(collection)
    expect(iterator.next()).toEqual({ done: true })
  })
  test("returns expected values for empty array", () => {
    const collection = ["a", "b"]
    const iterator = spell.getIteratorFor(collection)
    expect(iterator.next()).toEqual({ done: false, value: ["a", 1, collection] })
    expect(iterator.next()).toEqual({ done: false, value: ["b", 2, collection] })
    expect(iterator.next()).toEqual({ done: true })
  })
  test("returns expected values for empty object", () => {
    const collection = {}
    const iterator = spell.getIteratorFor(collection)
    expect(iterator.next()).toEqual({ done: true })
  })
  test("returns expected values for non-empty object", () => {
    const collection = { a: 1, b: true }
    const iterator = spell.getIteratorFor(collection)
    expect(iterator.next()).toEqual({ done: false, value: [1, "a", collection] })
    expect(iterator.next()).toEqual({ done: false, value: [true, "b", collection] })
    expect(iterator.next()).toEqual({ done: true })
  })
})
