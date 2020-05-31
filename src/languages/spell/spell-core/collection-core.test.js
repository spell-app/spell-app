/* eslint-disable lines-between-class-members */
import { spellCore, assert } from "."

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
  iterator = jest.fn()
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
  test("returns correct number for arguments", function(...args) {
    expect(spellCore.itemCountOf(args)).toBe(0)
  })
  test("returns correct number for empty object", function() {
    expect(spellCore.itemCountOf({})).toBe(0)
  })
  test("returns correct number for non-empty object", function() {
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
      const collection = []
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
      const collection = []
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
    spellCore.clear(custom, 1)
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
    const collection = []
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
