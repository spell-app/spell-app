import { describe, test, expect, beforeEach, afterEach, vi } from "vite-plus/test"
import { core, assert, List } from "$/core"

/** `a pile is a list`. */
class Pile extends List {}

// Wrap `assert.failed` for each test
beforeEach(() => {
  vi.spyOn(assert, "failed").mockImplementation(() => {})
})

// Clear ALL mocks after each test
afterEach(() => {
  vi.restoreAllMocks()
})

describe("core.includes()", () => {
  test("assertion fails and returns false if not defined", () => {
    expect(core.includes()).toBe(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns false if no thing specified", () => {
      expect(core.includes([])).toBe(false)
    })
    test("returns true if one thing present", () => {
      expect(core.includes([1], 1)).toBe(true)
    })
    test("returns true if two things present", () => {
      expect(core.includes([1, 2], 1, 2)).toBe(true)
    })
    test("returns false if one thing present, one not", () => {
      expect(core.includes([1, 2], 1, 3)).toBe(false)
    })
  })
  describe("for objects", () => {
    test("returns false if no thing specified", () => {
      expect(core.includes({})).toBe(false)
    })
    test("returns true if one thing present", () => {
      expect(core.includes({ a: 1 }, 1)).toBe(true)
    })
    test("returns true if two things present", () => {
      expect(core.includes({ a: 1, b: 2 }, 1, 2)).toBe(true)
    })
    test("returns false if one thing present, one not", () => {
      expect(core.includes({ a: 1, b: 3 }, 1, 3)).toBe(true)
    })
  })
})

describe("core.includesAny()", () => {
  test("assertion fails and returns false if not defined", () => {
    expect(core.includesAny()).toBe(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns false if no thing specified", () => {
      expect(core.includesAny([])).toBe(false)
    })
    test("returns true if one thing present", () => {
      expect(core.includesAny([1], 1)).toBe(true)
    })
    test("returns true if either thing present", () => {
      expect(core.includesAny([1, 2], -1, 2)).toBe(true)
    })
    test("returns true if one thing present, one not", () => {
      expect(core.includesAny([1, 2], 3, 2)).toBe(true)
    })
  })
  describe("for objects", () => {
    test("returns false if no thing specified", () => {
      expect(core.includesAny({})).toBe(false)
    })
    test("returns true if one thing present", () => {
      expect(core.includesAny({ a: 1 }, 1)).toBe(true)
    })
    test("returns true if two things present", () => {
      expect(core.includesAny({ a: 1, b: 2 }, 1, 2)).toBe(true)
    })
    test("returns false if one thing present, one not", () => {
      expect(core.includesAny({ a: 1, b: 2 }, 3, 1)).toBe(true)
    })
  })
})

describe("core.startsWith()", () => {
  test("assertion fails and returns false if not defined", () => {
    expect(core.startsWith()).toBe(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails and returns false for object", () => {
    expect(core.startsWith({})).toBe(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("returns false if nothing specified", () => {
    expect(core.startsWith([])).toBe(false)
  })
  test("returns true if item is first thing", () => {
    expect(core.startsWith(["a"], "a")).toBe(true)
  })
  test("returns false if item is not first thing", () => {
    expect(core.startsWith(["a"], "b")).toBe(false)
  })
})

describe("core.endsWith()", () => {
  test("assertion fails and returns false if not defined", () => {
    expect(core.endsWith()).toBe(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails and returns false for object", () => {
    expect(core.endsWith({})).toBe(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("returns false if nothing specified", () => {
    expect(core.endsWith([])).toBe(false)
  })
  test("returns true if item is only thing", () => {
    expect(core.endsWith(["a"], "a")).toBe(true)
  })
  test("returns true if item is last thing", () => {
    expect(core.endsWith(["a", "b"], "b")).toBe(true)
  })
  test("returns false if item is not last thing", () => {
    expect(core.endsWith(["a", "b"], "a")).toBe(false)
  })
})

describe("core.prepend()", () => {
  test("assertion fails if not defined", () => {
    core.prepend()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails for object", () => {
    core.prepend({})
    expect(assert.failed).toHaveBeenCalled()
  })
  test("doesn't add anything if no things", () => {
    const collection: unknown[] = []
    core.prepend(collection)
    expect(collection).toEqual([])
  })
  test("adds single item correctly to empty list", () => {
    const collection: unknown[] = []
    core.prepend(collection, "a")
    expect(collection).toEqual(["a"])
  })
  test("adds multiple items correctly to non-empty list", () => {
    const collection = ["a"]
    core.prepend(collection, "b", "c", "d")
    expect(collection).toEqual(["b", "c", "d", "a"])
  })
})

describe("core.append()", () => {
  test("assertion fails if not defined", () => {
    core.append()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails for object", () => {
    core.append({})
    expect(assert.failed).toHaveBeenCalled()
  })
  test("doesn't add anything if no things", () => {
    const collection: unknown[] = []
    core.append(collection)
    expect(collection).toEqual([])
  })
  test("adds single item correctly to empty list", () => {
    const collection: unknown[] = []
    core.append(collection, "a")
    expect(collection).toEqual(["a"])
  })
  test("adds multiple items correctly to non-empty list", () => {
    const collection = ["a"]
    core.append(collection, "b", "c", "d")
    expect(collection).toEqual(["a", "b", "c", "d"])
  })
})

describe("core.addBefore()", () => {
  test("assertion fails for object", () => {
    core.addBefore({}, "a", "b")
    expect(assert.failed).toHaveBeenCalled()
  })
  test("adds things just before the item, pushing it down", () => {
    const collection = ["a", "b", "c"]
    core.addBefore(collection, "b", "x", "y")
    expect(collection).toEqual(["a", "x", "y", "b", "c"])
  })
  test("item not there:  adds at the START", () => {
    const collection = ["a", "b"]
    core.addBefore(collection, "zzz", "x")
    expect(collection).toEqual(["x", "a", "b"])
  })
})

describe("core.addAfter()", () => {
  test("assertion fails for object", () => {
    core.addAfter({}, "a", "b")
    expect(assert.failed).toHaveBeenCalled()
  })
  test("adds things just after the item", () => {
    const collection = ["a", "b", "c"]
    core.addAfter(collection, "b", "x", "y")
    expect(collection).toEqual(["a", "b", "x", "y", "c"])
  })
  test("after the last item:  at the end", () => {
    const collection = ["a", "b"]
    core.addAfter(collection, "b", "x")
    expect(collection).toEqual(["a", "b", "x"])
  })
  test("item not there:  adds at the END", () => {
    const collection = ["a", "b"]
    core.addAfter(collection, "zzz", "x")
    expect(collection).toEqual(["a", "b", "x"])
  })
})

describe("core.setItemsOf()", () => {
  test("assertion fails if not defined", () => {
    core.setItemsOf()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails for object", () => {
    core.setItemsOf({})
    expect(assert.failed).toHaveBeenCalled()
  })
  test("doesn't add anything if no things", () => {
    const collection: unknown[] = []
    core.setItemsOf(collection, 0)
    expect(collection).toEqual([])
  })
  test("adds single item correctly to empty list", () => {
    const collection: unknown[] = []
    core.setItemsOf(collection, 0, "a")
    expect(collection).toEqual(["a"])
  })
  test("overwrites single item correctly in non-empty list", () => {
    const collection = ["a"]
    core.setItemsOf(collection, 0, "A")
    expect(collection).toEqual(["A"])
  })
  test("overwrites multiple items correctly", () => {
    const collection = ["a", "b"]
    core.setItemsOf(collection, 1, "B", "C", "D")
    expect(collection).toEqual(["a", "B", "C", "D"])
  })
})

describe("core.reverse()", () => {
  test("assertion fails if not defined", () => {
    core.reverse()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails for object", () => {
    core.reverse({})
    expect(assert.failed).toHaveBeenCalled()
  })
  test("works for empty list", () => {
    const collection: unknown[] = []
    core.reverse(collection)
    expect(collection).toEqual([])
  })
  test("works for non-empty list", () => {
    const collection = [1, 2, 3]
    core.reverse(collection)
    expect(collection).toEqual([3, 2, 1])
  })
})

describe("core._validateRangeBetween()", () => {
  describe("when start is missing", () => {
    test("returns 0...end if start not provided", () => {
      expect(core._validateRangeBetween(null, 3, 5)).toEqual({ start: 0, end: 3 })
    })
    test("returns start...count if start and end not provided", () => {
      expect(core._validateRangeBetween(null, null, 5)).toEqual({ start: 0, end: 5 })
    })
  })
  test("returns undefined if itemCount is 0", () => {
    expect(core._validateRangeBetween(0, 1, 0)).toEqual(undefined)
  })
  describe("for positive starts", () => {
    test("returns start...count if end not provided", () => {
      expect(core._validateRangeBetween(1, null, 5)).toEqual({ start: 1, end: 5 })
    })
    test("returns undefined if end < start", () => {
      expect(core._validateRangeBetween(4, 1, 5)).toEqual(undefined)
    })
    test("returns undefined if start > count", () => {
      expect(core._validateRangeBetween(9, 1, 5)).toEqual(undefined)
    })
    test("returns proper range for valid start", () => {
      expect(core._validateRangeBetween(1, 3, 5)).toEqual({ start: 1, end: 3 })
    })
  })
  describe("for negative starts", () => {
    test("returns (count+start)...count if end not provided", () => {
      expect(core._validateRangeBetween(-2, null, 5)).toEqual({ start: 3, end: 5 })
    })
    test("returns undefined if end < -start", () => {
      expect(core._validateRangeBetween(-2, 1, 5)).toEqual(undefined)
    })
    test("returns undefined if -start > count", () => {
      expect(core._validateRangeBetween(-10, 1, 5)).toEqual(undefined)
    })
    test("returns proper range for valid start", () => {
      expect(core._validateRangeBetween(-2, 5, 5)).toEqual({ start: 3, end: 5 })
    })
    test("returns proper range for valid start and end too large", () => {
      expect(core._validateRangeBetween(-2, 10, 5)).toEqual({ start: 3, end: 5 })
    })
  })
})

describe("core.rangeBetween()", () => {
  test("assertion fails and returns empty array if not defined", () => {
    expect(core.rangeBetween()).toEqual([])
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails and returns empty array if passed an object", () => {
    expect(core.rangeBetween({})).toEqual([])
    expect(assert.failed).toHaveBeenCalled()
  })
  test("returns empty array if start > count", () => {
    expect(core.rangeBetween([1, 2, 3], 4)).toEqual([])
  })
  test("returns empty array if end < start", () => {
    expect(core.rangeBetween([1, 2, 3], 2, 1)).toEqual([])
  })
  test("defaults end to collection length if not specified", () => {
    expect(core.rangeBetween([1, 2, 3], 0)).toEqual([1, 2, 3])
  })
  test("defaults end to collection length if > collection length", () => {
    expect(core.rangeBetween([1, 2, 3], 0, 5)).toEqual([1, 2, 3])
  })
  test("defaults start to 0 if not specified", () => {
    expect(core.rangeBetween([1, 2, 3])).toEqual([1, 2, 3])
  })
  test("subsets properly with internal range", () => {
    expect(core.rangeBetween([1, 2, 3, 4, 5], 1, 4)).toEqual([2, 3, 4])
  })
  test("a `List` out of range:  an EMPTY list of its class, not `[]`", () => {
    const list = new Pile()
    list.add(1, 2)
    for (const range of [core.rangeBetween(list, 5), core.rangeStartingAt(list, 5)]) {
      expect(range).toBeInstanceOf(Pile)
      expect((range as Pile).getValues()).toEqual([])
    }
  })
})

describe("core.removeRangeBetween()", () => {
  test("assertion fails if not defined", () => {
    core.removeRangeBetween()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails for object", () => {
    core.removeRangeBetween({})
    expect(assert.failed).toHaveBeenCalled()
  })
  test("returns same values if start > count", () => {
    const collection = [1, 2]
    core.removeRangeBetween(collection, 2)
    expect(collection).toEqual([1, 2])
  })
  test("returns same values if end < start", () => {
    const collection = [1, 2]
    core.removeRangeBetween(collection, 2, 1)
    expect(collection).toEqual([1, 2])
  })
  test("defaults end to collection length if not specified", () => {
    const collection = [1, 2, 3]
    core.removeRangeBetween(collection, 1)
    expect(collection).toEqual([1])
  })
  test("defaults end to collection length if > collection length", () => {
    const collection = [1, 2, 3]
    core.removeRangeBetween(collection, 1, 5)
    expect(collection).toEqual([1])
  })
  test("defaults start to 0 if not specified", () => {
    const collection = [1, 2, 3]
    core.removeRangeBetween(collection)
    expect(collection).toEqual([])
  })
  test("subsets properly with internal range", () => {
    const collection = [1, 2, 3]
    core.removeRangeBetween(collection, 1, 2)
    expect(collection).toEqual([1, 3])
  })
  test("a `List` too:  through its own `removeItem()` (it used to throw)", () => {
    const list = new Pile()
    list.add(1, 2, 3, 4)
    core.removeRangeBetween(list, 1, 3)
    expect(list.getValues()).toEqual([1, 4])
  })
})

describe("core._validateRangeStartingAt()", () => {
  describe("when start is missing", () => {
    test("returns start...itemCount if start and count not provided", () => {
      expect(core._validateRangeStartingAt(null, null, 5)).toEqual({ start: 0, end: 5 })
    })
    test("returns 0...count if start not provided", () => {
      expect(core._validateRangeStartingAt(null, 3, 5)).toEqual({ start: 0, end: 3 })
    })
  })
  describe("for positive starts", () => {
    test("returns undefined if count is 0", () => {
      expect(core._validateRangeStartingAt(1, 0, 5)).toEqual(undefined)
    })
    test("returns start...itemCount if count not provided", () => {
      expect(core._validateRangeStartingAt(1, null, 5)).toEqual({ start: 1, end: 5 })
    })
    test("returns undefined if count < start", () => {
      expect(core._validateRangeStartingAt(4, 1, 5)).toEqual({ start: 4, end: 5 })
    })
    test("returns undefined if start > itemCount", () => {
      expect(core._validateRangeStartingAt(9, 1, 5)).toEqual(undefined)
    })
    test("returns proper range for valid start", () => {
      expect(core._validateRangeStartingAt(1, 3, 5)).toEqual({ start: 1, end: 4 })
    })
  })
  describe("for negative starts", () => {
    test("returns undefined if count is 0", () => {
      expect(core._validateRangeStartingAt(1, 0, 5)).toEqual(undefined)
    })
    test("returns (itemCount+start)...itemCount if count not provided", () => {
      expect(core._validateRangeStartingAt(-2, null, 5)).toEqual({ start: 3, end: 5 })
    })
    test("returns undefined if -start > itemCount", () => {
      expect(core._validateRangeStartingAt(-10, 1, 5)).toEqual(undefined)
    })
    test("returns proper range for valid start", () => {
      expect(core._validateRangeStartingAt(-2, 5, 5)).toEqual({ start: 3, end: 5 })
    })
    test("returns proper range for valid start and count too large", () => {
      expect(core._validateRangeStartingAt(-2, 10, 5)).toEqual({ start: 3, end: 5 })
    })
  })
})

describe("core.rangeStartingAt()", () => {
  test("assertion fails and returns empty array if not defined", () => {
    expect(core.rangeStartingAt()).toEqual([])
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails and returns empty array if passed an object", () => {
    expect(core.rangeStartingAt({})).toEqual([])
    expect(assert.failed).toHaveBeenCalled()
  })
  test("returns empty array if start > itemCount", () => {
    expect(core.rangeStartingAt([1, 2, 3], 4, 1)).toEqual([])
  })
  test("returns empty array if -start > itemCount", () => {
    expect(core.rangeStartingAt([1, 2, 3], -5, 1)).toEqual([])
  })
  test("returns empty array if count 0", () => {
    expect(core.rangeStartingAt([1, 2, 3], 1, 0)).toEqual([])
  })
  test("returns empty array if count < 0", () => {
    expect(core.rangeStartingAt([1, 2, 3], 1, -1)).toEqual([])
  })
  test("subsets properly for normal positive range", () => {
    expect(core.rangeStartingAt([1, 2, 3], 1, 2)).toEqual([2, 3])
  })
  test("subsets properly for positive start with count > itemCount", () => {
    expect(core.rangeStartingAt([1, 2, 3], 1, 10)).toEqual([2, 3])
  })
  test("subsets properly for normal negative range", () => {
    expect(core.rangeStartingAt([1, 2, 3], -2, 2)).toEqual([2, 3])
  })
  test("subsets properly for negative start with count > itemCount", () => {
    expect(core.rangeStartingAt([1, 2, 3], -2, 10)).toEqual([2, 3])
  })
})

describe("core.forEach()", () => {
  test("assertion fails if not defined", () => {
    core.forEach()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("no-op if method undefined", () => {
    expect(() => core.forEach([])).not.toThrow()
  })
  describe("for arrays", () => {
    test("doesn't call method for empty array", () => {
      const method = vi.fn()
      core.forEach([], method)
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty array", () => {
      const method = vi.fn()
      const collection = ["a", "b"]
      core.forEach(collection, method)
      expect(method.mock.calls.length).toBe(2)
      expect(method.mock.calls[0]).toEqual(["a", 0, collection])
      expect(method.mock.calls[1]).toEqual(["b", 1, collection])
    })
  })
  describe("for objects", () => {
    test("doesn't call method for empty object", () => {
      const method = vi.fn()
      core.forEach({}, method)
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty object", () => {
      const method = vi.fn()
      const collection = { a: 1, b: 2 }
      core.forEach(collection, method)
      expect(method.mock.calls.length).toBe(2)
      expect(method.mock.calls[0]).toEqual([1, "a", collection])
      expect(method.mock.calls[1]).toEqual([2, "b", collection])
    })
  })
})

describe("core.map()", () => {
  test("assertion fails if not defined", () => {
    expect(core.map()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns empty array if method undefined", () => {
      expect(core.map([])).toEqual([])
    })
    test("doesn't call method for empty array", () => {
      const method = vi.fn()
      expect(core.map([], method)).toEqual([])
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty array", () => {
      const method = vi.fn((str) => str.toUpperCase())
      const collection = ["a", "b"]
      expect(core.map(collection, method)).toEqual(["A", "B"])
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual(["a", 0, collection])
      expect(method.mock.calls[1]).toEqual(["b", 1, collection])
    })
  })
  describe("for objects", () => {
    test("returns empty object if method undefined", () => {
      expect(core.map({})).toEqual({})
    })
    test("doesn't call method for empty object", () => {
      const method = vi.fn()
      expect(core.map({}, method)).toEqual({})
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty object", () => {
      const method = vi.fn((num) => num + 1)
      const collection = { a: 1, b: 2 }
      expect(core.map(collection, method)).toEqual({ a: 2, b: 3 })
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual([1, "a", collection])
      expect(method.mock.calls[1]).toEqual([2, "b", collection])
    })
  })
})

describe("core.filter()", () => {
  test("assertion fails if not defined", () => {
    expect(core.filter()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns truthy values if method undefined", () => {
      expect(core.filter(["a", false, 0])).toEqual(["a"])
    })
    test("doesn't call method for empty array", () => {
      const method = vi.fn()
      expect(core.filter([], method)).toEqual([])
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty array", () => {
      const method = vi.fn((str) => str > "a")
      const collection = ["a", "b"]
      expect(core.filter(collection, method)).toEqual(["b"])
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual(["a", 0, collection])
      expect(method.mock.calls[1]).toEqual(["b", 1, collection])
    })
  })
  describe("for objects", () => {
    test("returns truthy values if method undefined", () => {
      expect(core.filter({ a: "a", b: false, c: 0 })).toEqual({ a: "a" })
    })
    test("doesn't call method for empty object", () => {
      const method = vi.fn()
      expect(core.filter({}, method)).toEqual({})
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty object", () => {
      const method = vi.fn((num) => num > 1)
      const collection = { a: 1, b: 2 }
      expect(core.filter(collection, method)).toEqual({ b: 2 })
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual([1, "a", collection])
      expect(method.mock.calls[1]).toEqual([2, "b", collection])
    })
  })
})

describe("core.all()", () => {
  test("assertion fails if not defined", () => {
    expect(core.all()).toEqual(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("uses identity function if method undefined", () => {
      expect(core.all(["a", false, 0])).toEqual(false)
    })
    test("doesn't call method for empty array", () => {
      const method = vi.fn()
      expect(core.all([], method)).toBe(false)
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty array", () => {
      const method = vi.fn((str) => str > "a")
      const collection = ["a", "b"]
      expect(core.all(collection, method)).toEqual(false)
      expect(method.mock.calls.length).toEqual(1)
      expect(method.mock.calls[0]).toEqual(["a", 0, collection])
    })
  })
  describe("for objects", () => {
    test("uses identity function if method undefined", () => {
      expect(core.all({ a: "a", b: false, c: 0 })).toEqual(false)
    })
    test("doesn't call method for empty object", () => {
      const method = vi.fn()
      core.all({}, method)
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty object", () => {
      const method = vi.fn((num) => num > 1)
      const collection = { a: 1, b: 2 }
      expect(core.all(collection, method)).toEqual(false)
      expect(method.mock.calls.length).toEqual(1)
      expect(method.mock.calls[0]).toEqual([1, "a", collection])
    })
  })
})

describe("core.any()", () => {
  test("assertion fails if not defined", () => {
    expect(core.any()).toEqual(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("uses identity function if method undefined", () => {
      expect(core.any(["a", false, 0])).toEqual(true)
    })
    test("doesn't call method for empty array", () => {
      const method = vi.fn()
      expect(core.any([], method)).toBe(false)
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty array", () => {
      const method = vi.fn((str) => str > "a")
      const collection = ["a", "b"]
      expect(core.any(collection, method)).toEqual(true)
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual(["a", 0, collection])
      expect(method.mock.calls[1]).toEqual(["b", 1, collection])
    })
    test("falls through to false if nothing matches", () => {
      const method = vi.fn((str) => str > "b")
      const collection = ["a", "b"]
      expect(core.any(collection, method)).toEqual(false)
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual(["a", 0, collection])
      expect(method.mock.calls[1]).toEqual(["b", 1, collection])
    })
  })
  describe("for objects", () => {
    test("uses identity function if method undefined", () => {
      expect(core.any({ a: "a", b: false, c: 0 })).toEqual(true)
    })
    test("doesn't call method for empty object", () => {
      const method = vi.fn()
      core.any({}, method)
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty object", () => {
      const method = vi.fn((num) => num > 1)
      const collection = { a: 1, b: 2 }
      expect(core.any(collection, method)).toEqual(true)
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual([1, "a", collection])
      expect(method.mock.calls[1]).toEqual([2, "b", collection])
    })
  })
})

describe("core.removeItemsAt()", () => {
  test("assertion fails if not defined", () => {
    core.removeItemsAt()
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("no change for empty array", () => {
      const collection: unknown[] = []
      core.removeItemsAt(collection, 0)
      expect(collection).toEqual([])
    })
    test("removes properly for non-empty array, regardless of order", () => {
      const collection = ["a", "b", "c", "d", "e"]
      core.removeItemsAt(collection, 0, 2, 4)
      expect(collection).toEqual(["b", "d"])
    })
  })
  describe("for objects", () => {
    test("no change for empty array", () => {
      const collection = {}
      core.removeItemsAt(collection, "a")
      expect(collection).toEqual({})
    })
    test("removes properly for non-empty array, regardless of order", () => {
      const collection = { a: 1, b: 2, c: 3, d: 4, e: 5 }
      core.removeItemsAt(collection, "a", "c", "e")
      expect(collection).toEqual({ b: 2, d: 4 })
    })
  })
})

describe("core.remove()", () => {
  test("assertion fails if not defined", () => {
    core.remove()
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("no change for empty array", () => {
      const collection: unknown[] = []
      core.remove(collection, 1)
      expect(collection).toEqual([])
    })
    test("removes properly for non-empty array, regardless of order or recurrance", () => {
      const collection = ["a", "b", "c", "d", "e", "a"]
      core.remove(collection, "a", "c", "e")
      expect(collection).toEqual(["b", "d"])
    })
  })
  describe("for objects", () => {
    test("no change for empty array", () => {
      const collection = {}
      core.remove(collection, "a")
      expect(collection).toEqual({})
    })
    test("removes properly for non-empty array, regardless of order", () => {
      const collection = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 1 }
      core.remove(collection, 1, 3, 5)
      expect(collection).toEqual({ b: 2, d: 4 })
    })
  })
})

describe("core.removeWhere()", () => {
  test("assertion fails if not defined", () => {
    expect(core.removeWhere()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("removes truthy values if method undefined", () => {
      const collection = ["a", false, 0]
      core.removeWhere(collection)
      expect(collection).toEqual([false, 0])
    })
    test("doesn't call method for empty array", () => {
      const collection: unknown[] = []
      const method = vi.fn()
      core.removeWhere(collection, method)
      expect(collection).toEqual([])
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty array", () => {
      const method = vi.fn((str) => str > "a")
      const collection = ["a", "b"]
      core.removeWhere(collection, method)
      expect(collection).toEqual(["a"])
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual(["a", 0, collection])
      expect(method.mock.calls[1]).toEqual(["b", 1, collection])
    })
  })
  describe("for objects", () => {
    test("removes truthy values if method undefined", () => {
      const collection = { a: "a", b: false, c: 0 }
      core.removeWhere(collection)
      expect(collection).toEqual({ b: false, c: 0 })
    })
    test("doesn't call method for empty object", () => {
      const method = vi.fn()
      const collection = {}
      core.removeWhere({}, method)
      expect(collection).toEqual({})
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty object", () => {
      const method = vi.fn((num) => num > 1)
      const collection = { a: 1, b: 2 }
      core.removeWhere(collection, method)
      expect(collection).toEqual({ a: 1 })
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual([1, "a", collection])
      expect(method.mock.calls[1]).toEqual([2, "b", collection])
    })
  })
})

describe("core._randomKeyOf()", () => {
  test("assertion fails if not defined", () => {
    expect(core._randomKeyOf()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns undefined for empty array", () => {
      expect(core._randomKeyOf([])).toBe(undefined)
    })
    test("returns key for single-value array", () => {
      expect(core._randomKeyOf(["a"])).toBe(0)
    })
    test("returns value in range for multi-item array", () => {
      vi.spyOn(core, "randomNumber").mockImplementation(() => 2)
      expect(core._randomKeyOf(["a", "b", "c"])).toBe(1)
    })
  })
  describe("for objects", () => {
    test("returns undefined for empty object", () => {
      expect(core._randomKeyOf({})).toBe(undefined)
    })
    test("returns key for single-key object", () => {
      expect(core._randomKeyOf({ a: 1 })).toBe("a")
    })
    test("returns key in range for multi-item object", () => {
      vi.spyOn(core, "randomNumber").mockImplementation(() => 2)
      expect(core._randomKeyOf({ a: 1, b: 2, c: 3 })).toBe("b")
    })
  })
})

describe("core.randomItemOf()", () => {
  test("assertion fails if not defined", () => {
    expect(core.randomItemOf()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns undefined for empty array", () => {
      expect(core.randomItemOf([])).toBe(undefined)
    })
    test("returns only value for single-value array", () => {
      expect(core.randomItemOf(["a"])).toBe("a")
    })
    test("returns value in range for multi-item array", () => {
      vi.spyOn(core, "randomNumber").mockImplementation(() => 2)
      expect(core.randomItemOf(["a", "b", "c"])).toBe("b")
    })
  })
  describe("for objects", () => {
    test("returns undefined for empty object", () => {
      expect(core.randomItemOf({})).toBe(undefined)
    })
    test("returns key for single-key object", () => {
      expect(core.randomItemOf({ a: 1 })).toBe(1)
    })
    test("returns key in range for multi-item object", () => {
      vi.spyOn(core, "randomNumber").mockImplementation(() => 2)
      expect(core.randomItemOf({ a: 1, b: 2, c: 3 })).toBe(2)
    })
  })
})

describe("core.randomItemsOf()", () => {
  test("assertion fails if not defined", () => {
    expect(core.randomItemsOf()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns empty array if count === 0", () => {
      expect(core.randomItemsOf(["a"], 0)).toEqual([])
    })
    test("returns empty array for empty array", () => {
      expect(core.randomItemsOf([], 1)).toEqual([])
    })
    test("returns only value for single-value array", () => {
      expect(core.randomItemsOf(["a"])).toEqual(["a"])
    })
    test("returns all values if count not specified", () => {
      vi.spyOn(core, "shuffled").mockImplementation(() => [1, 2, 0])
      expect(core.randomItemsOf(["a", "b", "c"])).toEqual(["b", "c", "a"])
    })
    test("returns value in range for multi-item array", () => {
      vi.spyOn(core, "shuffled").mockImplementation(() => [1, 2, 0])
      expect(core.randomItemsOf(["a", "b", "c"], 2)).toEqual(["b", "c"])
    })
  })
  describe("for objects", () => {
    test("returns empty object if count === 0", () => {
      expect(core.randomItemsOf({ a: 1 }, 0)).toEqual({})
    })
    test("returns empty object for empty object", () => {
      expect(core.randomItemsOf({}, 1)).toEqual({})
    })
    test("returns key for single-key object", () => {
      expect(core.randomItemsOf({ a: 1 })).toEqual({ a: 1 })
    })
    test("returns all keys if count not specified", () => {
      vi.spyOn(core, "shuffled").mockImplementation(() => ["b", "c", "a"])
      expect(core.randomItemsOf({ a: 1, b: 2, c: 3 })).toEqual({ b: 2, c: 3, a: 1 })
    })
    test("returns key in range for multi-item object", () => {
      vi.spyOn(core, "shuffled").mockImplementation(() => ["b", "c", "a"])
      expect(core.randomItemsOf({ a: 1, b: 2, c: 3 }, 2)).toEqual({ b: 2, c: 3 })
    })
  })
})

describe("core.randomize()", () => {
  test("assertion fails if not defined", () => {
    core.randomize()
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns empty array for empty array", () => {
      const collection: unknown[] = []
      core.randomize(collection)
      expect(collection).toEqual([])
    })
    test("returns all values for multi-item array", () => {
      vi.spyOn(core, "shuffled").mockImplementation(() => [1, 2, 0])
      const collection = ["a", "b", "c"]
      core.randomize(collection)
      expect(collection).toEqual(["b", "c", "a"])
    })
  })
  describe("for objects", () => {
    test("no effect for object", () => {
      const collection = { a: 1, b: 2 }
      const clone = { ...collection }
      core.randomize(collection)
      expect(collection).toEqual(clone)
    })
  })
})

describe("core.smallestOf()", () => {
  test("assertion fails if not defined", () => {
    expect(core.smallestOf()).toBe(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns undefined for empty array", () => {
      expect(core.smallestOf([])).toBe(undefined)
    })
    test("returns smallest value for multi-item array", () => {
      expect(core.smallestOf([1, 2, 3])).toBe(1)
    })
  })
  describe("for objects", () => {
    test("returns undefined for empty object", () => {
      expect(core.smallestOf({})).toBe(undefined)
    })
    test("returns smallest value for multi-item object", () => {
      expect(core.smallestOf({ a: 1, b: 2, c: 3 })).toBe(1)
    })
  })
})

describe("core.largestOf()", () => {
  test("assertion fails if not defined", () => {
    expect(core.largestOf()).toBe(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns undefined for empty array", () => {
      expect(core.largestOf([])).toBe(undefined)
    })
    test("returns smallest value for multi-item array", () => {
      expect(core.largestOf([1, 2, 3])).toBe(3)
    })
  })
  describe("for objects", () => {
    test("returns undefined for empty object", () => {
      expect(core.largestOf({})).toBe(undefined)
    })
    test("returns smallest value for multi-item object", () => {
      expect(core.largestOf({ a: 1, b: 2, c: 3 })).toBe(3)
    })
  })
})
