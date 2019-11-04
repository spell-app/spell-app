import _ from "lodash"
import { spellCore, assert } from "."

// Wrap `assert.failed` for each test
beforeEach(() => {
  jest.spyOn(assert, "failed").mockImplementation(Function.prototype)
})

// Clear ALL mocks after each test
afterEach(() => {
  jest.restoreAllMocks()
})

describe("spellCore.includes()", () => {
  test("assertion fails and returns false if not defined", () => {
    expect(spellCore.includes()).toBe(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns false if no thing specified", () => {
      expect(spellCore.includes([])).toBe(false)
    })
    test("returns true if one thing present", () => {
      expect(spellCore.includes([1], 1)).toBe(true)
    })
    test("returns true if two things present", () => {
      expect(spellCore.includes([1, 2], 1, 2)).toBe(true)
    })
    test("returns false if one thing present, one not", () => {
      expect(spellCore.includes([1, 2], 1, 3)).toBe(false)
    })
  })
  describe("for objects", () => {
    test("returns false if no thing specified", () => {
      expect(spellCore.includes({})).toBe(false)
    })
    test("returns true if one thing present", () => {
      expect(spellCore.includes({ a: 1 }, 1)).toBe(true)
    })
    test("returns true if two things present", () => {
      expect(spellCore.includes({ a: 1, b: 2 }, 1, 2)).toBe(true)
    })
    test("returns false if one thing present, one not", () => {
      expect(spellCore.includes({ a: 1, b: 3 }, 1, 3)).toBe(true)
    })
  })
})

describe("spellCore.includesAny()", () => {
  test("assertion fails and returns false if not defined", () => {
    expect(spellCore.includesAny()).toBe(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns false if no thing specified", () => {
      expect(spellCore.includesAny([])).toBe(false)
    })
    test("returns true if one thing present", () => {
      expect(spellCore.includesAny([1], 1)).toBe(true)
    })
    test("returns true if either thing present", () => {
      expect(spellCore.includesAny([1, 2], -1, 2)).toBe(true)
    })
    test("returns true if one thing present, one not", () => {
      expect(spellCore.includesAny([1, 2], 3, 2)).toBe(true)
    })
  })
  describe("for objects", () => {
    test("returns false if no thing specified", () => {
      expect(spellCore.includesAny({})).toBe(false)
    })
    test("returns true if one thing present", () => {
      expect(spellCore.includesAny({ a: 1 }, 1)).toBe(true)
    })
    test("returns true if two things present", () => {
      expect(spellCore.includesAny({ a: 1, b: 2 }, 1, 2)).toBe(true)
    })
    test("returns false if one thing present, one not", () => {
      expect(spellCore.includesAny({ a: 1, b: 2 }, 3, 1)).toBe(true)
    })
  })
})

describe("spellCore.startsWith()", () => {
  test("assertion fails and returns false if not defined", () => {
    expect(spellCore.startsWith()).toBe(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails and returns false for object", () => {
    expect(spellCore.startsWith({})).toBe(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("returns false if nothing specified", () => {
    expect(spellCore.startsWith([])).toBe(false)
  })
  test("returns true if item is first thing", () => {
    expect(spellCore.startsWith(["a"], "a")).toBe(true)
  })
  test("returns false if item is not first thing", () => {
    expect(spellCore.startsWith(["a"], "b")).toBe(false)
  })
})

describe("spellCore.endsWith()", () => {
  test("assertion fails and returns false if not defined", () => {
    expect(spellCore.endsWith()).toBe(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails and returns false for object", () => {
    expect(spellCore.endsWith({})).toBe(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("returns false if nothing specified", () => {
    expect(spellCore.endsWith([])).toBe(false)
  })
  test("returns true if item is only thing", () => {
    expect(spellCore.endsWith(["a"], "a")).toBe(true)
  })
  test("returns true if item is last thing", () => {
    expect(spellCore.endsWith(["a", "b"], "b")).toBe(true)
  })
  test("returns false if item is not last thing", () => {
    expect(spellCore.endsWith(["a", "b"], "a")).toBe(false)
  })
})

describe("spellCore.prepend()", () => {
  test("assertion fails if not defined", () => {
    spellCore.prepend()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails for object", () => {
    spellCore.prepend({})
    expect(assert.failed).toHaveBeenCalled()
  })
  test("doesn't add anything if no things", () => {
    const collection = []
    spellCore.prepend(collection)
    expect(collection).toEqual([])
  })
  test("adds single item correctly to empty list", () => {
    const collection = []
    spellCore.prepend(collection, "a")
    expect(collection).toEqual(["a"])
  })
  test("adds multiple items correctly to non-empty list", () => {
    const collection = ["a"]
    spellCore.prepend(collection, "b", "c", "d")
    expect(collection).toEqual(["b", "c", "d", "a"])
  })
})

describe("spellCore.append()", () => {
  test("assertion fails if not defined", () => {
    spellCore.append()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails for object", () => {
    spellCore.append({})
    expect(assert.failed).toHaveBeenCalled()
  })
  test("doesn't add anything if no things", () => {
    const collection = []
    spellCore.append(collection)
    expect(collection).toEqual([])
  })
  test("adds single item correctly to empty list", () => {
    const collection = []
    spellCore.append(collection, "a")
    expect(collection).toEqual(["a"])
  })
  test("adds multiple items correctly to non-empty list", () => {
    const collection = ["a"]
    spellCore.append(collection, "b", "c", "d")
    expect(collection).toEqual(["a", "b", "c", "d"])
  })
})

describe("spellCore.setItemsOf()", () => {
  test("assertion fails if not defined", () => {
    spellCore.setItemsOf()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails for object", () => {
    spellCore.setItemsOf({})
    expect(assert.failed).toHaveBeenCalled()
  })
  test("doesn't add anything if no things", () => {
    const collection = []
    spellCore.setItemsOf(collection, 1)
    expect(collection).toEqual([])
  })
  test("adds single item correctly to empty list", () => {
    const collection = []
    spellCore.setItemsOf(collection, 1, "a")
    expect(collection).toEqual(["a"])
  })
  test("overwrites single item correctly in non-empty list", () => {
    const collection = ["a"]
    spellCore.setItemsOf(collection, 1, "A")
    expect(collection).toEqual(["A"])
  })
  test("overwrites multiple items correctly", () => {
    const collection = ["a", "b"]
    spellCore.setItemsOf(collection, 2, "B", "C", "D")
    expect(collection).toEqual(["a", "B", "C", "D"])
  })
})

describe("spellCore.reverse()", () => {
  test("assertion fails if not defined", () => {
    spellCore.reverse()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails for object", () => {
    spellCore.reverse({})
    expect(assert.failed).toHaveBeenCalled()
  })
  test("works for empty list", () => {
    const collection = []
    spellCore.reverse(collection)
    expect(collection).toEqual([])
  })
  test("works for non-empty list", () => {
    const collection = [1, 2, 3]
    spellCore.reverse(collection)
    expect(collection).toEqual([3, 2, 1])
  })
})

describe("spellCore._validateRangeBetween()", () => {
  describe("when start is missing", () => {
    test("returns 1...end if start not provided", () => {
      expect(spellCore._validateRangeBetween(null, 3, 5)).toEqual({ start: 1, end: 3 })
    })
    test("returns start...count if start and end not provided", () => {
      expect(spellCore._validateRangeBetween(null, null, 5)).toEqual({ start: 1, end: 5 })
    })
  })
  test("returns undefined if itemCount is 0", () => {
    expect(spellCore._validateRangeBetween(1, 1, 0)).toEqual(undefined)
  })
  describe("for positive starts", () => {
    test("returns start...count if end not provided", () => {
      expect(spellCore._validateRangeBetween(2, null, 5)).toEqual({ start: 2, end: 5 })
    })
    test("returns undefined if end < start", () => {
      expect(spellCore._validateRangeBetween(5, 1, 5)).toEqual(undefined)
    })
    test("returns undefined if start > count", () => {
      expect(spellCore._validateRangeBetween(10, 1, 5)).toEqual(undefined)
    })
    test("returns proper range for valid start", () => {
      expect(spellCore._validateRangeBetween(2, 3, 5)).toEqual({ start: 2, end: 3 })
    })
  })
  describe("for negative starts", () => {
    test("returns (count+start)...count if end not provided", () => {
      expect(spellCore._validateRangeBetween(-2, null, 5)).toEqual({ start: 4, end: 5 })
    })
    test("returns undefined if end < -start", () => {
      expect(spellCore._validateRangeBetween(-2, 1, 5)).toEqual(undefined)
    })
    test("returns undefined if -start > count", () => {
      expect(spellCore._validateRangeBetween(-10, 1, 5)).toEqual(undefined)
    })
    test("returns proper range for valid start", () => {
      expect(spellCore._validateRangeBetween(-2, 5, 5)).toEqual({ start: 4, end: 5 })
    })
    test("returns proper range for valid start and end too large", () => {
      expect(spellCore._validateRangeBetween(-2, 10, 5)).toEqual({ start: 4, end: 5 })
    })
  })
})

describe("spellCore.rangeBetween()", () => {
  test("assertion fails and returns empty array if not defined", () => {
    expect(spellCore.rangeBetween()).toEqual([])
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails and returns empty array if passed an object", () => {
    expect(spellCore.rangeBetween({})).toEqual([])
    expect(assert.failed).toHaveBeenCalled()
  })
  test("returns empty array if start > count", () => {
    expect(spellCore.rangeBetween([1, 2, 3], 5)).toEqual([])
  })
  test("returns empty array if end < start", () => {
    expect(spellCore.rangeBetween([1, 2, 3], 2, 1)).toEqual([])
  })
  test("defaults end to collection length if not specified", () => {
    expect(spellCore.rangeBetween([1, 2, 3], 1)).toEqual([1, 2, 3])
  })
  test("defaults end to collection length if > collection length", () => {
    expect(spellCore.rangeBetween([1, 2, 3], 1, 5)).toEqual([1, 2, 3])
  })
  test("defaults start to 1 if not specified", () => {
    expect(spellCore.rangeBetween([1, 2, 3])).toEqual([1, 2, 3])
  })
  test("subsets properly with internal range", () => {
    expect(spellCore.rangeBetween([1, 2, 3, 4, 5], 2, 4)).toEqual([2, 3, 4])
  })
})

describe("spellCore.removeRangeBetween()", () => {
  test("assertion fails if not defined", () => {
    spellCore.removeRangeBetween()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails for object", () => {
    spellCore.removeRangeBetween({})
    expect(assert.failed).toHaveBeenCalled()
  })
  test("returns same values if start > count", () => {
    const collection = [1, 2]
    spellCore.removeRangeBetween(collection, 3)
    expect(collection).toEqual([1, 2])
  })
  test("returns same values if end < start", () => {
    const collection = [1, 2]
    spellCore.removeRangeBetween(collection, 2, 1)
    expect(collection).toEqual([1, 2])
  })
  test("defaults end to collection length if not specified", () => {
    const collection = [1, 2, 3]
    spellCore.removeRangeBetween(collection, 2)
    expect(collection).toEqual([1])
  })
  test("defaults end to collection length if > collection length", () => {
    const collection = [1, 2, 3]
    spellCore.removeRangeBetween(collection, 2, 5)
    expect(collection).toEqual([1])
  })
  test("defaults start to 1 if not specified", () => {
    const collection = [1, 2, 3]
    spellCore.removeRangeBetween(collection)
    expect(collection).toEqual([])
  })
  test("subsets properly with internal range", () => {
    const collection = [1, 2, 3]
    spellCore.removeRangeBetween(collection, 2, 2)
    expect(collection).toEqual([1, 3])
  })
})

describe("spellCore._validateRangeStartingAt()", () => {
  describe("when start is missing", () => {
    test("returns start...itemCount if start and count not provided", () => {
      expect(spellCore._validateRangeStartingAt(null, null, 5)).toEqual({ start: 1, end: 5 })
    })
    test("returns 1...count if start not provided", () => {
      expect(spellCore._validateRangeStartingAt(null, 3, 5)).toEqual({ start: 1, end: 3 })
    })
  })
  describe("for positive starts", () => {
    test("returns undefined if count is 0", () => {
      expect(spellCore._validateRangeStartingAt(2, 0, 5)).toEqual(undefined)
    })
    test("returns start...itemCount if count not provided", () => {
      expect(spellCore._validateRangeStartingAt(2, null, 5)).toEqual({ start: 2, end: 5 })
    })
    test("returns undefined if count < start", () => {
      expect(spellCore._validateRangeStartingAt(5, 1, 5)).toEqual({ start: 5, end: 5 })
    })
    test("returns undefined if start > itemCount", () => {
      expect(spellCore._validateRangeStartingAt(10, 1, 5)).toEqual(undefined)
    })
    test("returns proper range for valid start", () => {
      expect(spellCore._validateRangeStartingAt(2, 3, 5)).toEqual({ start: 2, end: 4 })
    })
  })
  describe("for negative starts", () => {
    test("returns undefined if count is 0", () => {
      expect(spellCore._validateRangeStartingAt(2, 0, 5)).toEqual(undefined)
    })
    test("returns (itemCount+start)...itemCount if count not provided", () => {
      expect(spellCore._validateRangeStartingAt(-2, null, 5)).toEqual({ start: 4, end: 5 })
    })
    test("returns undefined if -start > itemCount", () => {
      expect(spellCore._validateRangeStartingAt(-10, 1, 5)).toEqual(undefined)
    })
    test("returns proper range for valid start", () => {
      expect(spellCore._validateRangeStartingAt(-2, 5, 5)).toEqual({ start: 4, end: 5 })
    })
    test("returns proper range for valid start and count too large", () => {
      expect(spellCore._validateRangeStartingAt(-2, 10, 5)).toEqual({ start: 4, end: 5 })
    })
  })
})

describe("spellCore.rangeStartingAt()", () => {
  test("assertion fails and returns empty array if not defined", () => {
    expect(spellCore.rangeStartingAt()).toEqual([])
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails and returns empty array if passed an object", () => {
    expect(spellCore.rangeStartingAt({})).toEqual([])
    expect(assert.failed).toHaveBeenCalled()
  })
  test("returns empty array if start > itemCount", () => {
    expect(spellCore.rangeStartingAt([1, 2, 3], 5, 1)).toEqual([])
  })
  test("returns empty array if -start > itemCount", () => {
    expect(spellCore.rangeStartingAt([1, 2, 3], -5, 1)).toEqual([])
  })
  test("returns empty array if count 0", () => {
    expect(spellCore.rangeStartingAt([1, 2, 3], 2, 0)).toEqual([])
  })
  test("returns empty array if count < 0", () => {
    expect(spellCore.rangeStartingAt([1, 2, 3], 2, -1)).toEqual([])
  })
  test("subsets properly for normal positive range", () => {
    expect(spellCore.rangeStartingAt([1, 2, 3], 2, 2)).toEqual([2, 3])
  })
  test("subsets properly for positive start with count > itemCount", () => {
    expect(spellCore.rangeStartingAt([1, 2, 3], 2, 10)).toEqual([2, 3])
  })
  test("subsets properly for normal negative range", () => {
    expect(spellCore.rangeStartingAt([1, 2, 3], -2, 2)).toEqual([2, 3])
  })
  test("subsets properly for negative start with count > itemCount", () => {
    expect(spellCore.rangeStartingAt([1, 2, 3], -2, 10)).toEqual([2, 3])
  })
})

describe("spellCore.forEach()", () => {
  test("assertion fails if not defined", () => {
    spellCore.forEach()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("no-op if method undefined", () => {
    expect(() => spellCore.forEach([])).not.toThrow()
  })
  describe("for arrays", () => {
    test("doesn't call method for empty array", () => {
      const method = jest.fn()
      spellCore.forEach([], method)
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty array", () => {
      const method = jest.fn()
      const collection = ["a", "b"]
      spellCore.forEach(collection, method)
      expect(method.mock.calls.length).toBe(2)
      expect(method.mock.calls[0]).toEqual(["a", 1, collection])
      expect(method.mock.calls[1]).toEqual(["b", 2, collection])
    })
  })
  describe("for objects", () => {
    test("doesn't call method for empty object", () => {
      const method = jest.fn()
      spellCore.forEach({}, method)
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty object", () => {
      const method = jest.fn()
      const collection = { a: 1, b: 2 }
      spellCore.forEach(collection, method)
      expect(method.mock.calls.length).toBe(2)
      expect(method.mock.calls[0]).toEqual([1, "a", collection])
      expect(method.mock.calls[1]).toEqual([2, "b", collection])
    })
  })
})

describe("spellCore.map()", () => {
  test("assertion fails if not defined", () => {
    expect(spellCore.map()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns empty array if method undefined", () => {
      expect(spellCore.map([])).toEqual([])
    })
    test("doesn't call method for empty array", () => {
      const method = jest.fn()
      expect(spellCore.map([], method)).toEqual([])
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty array", () => {
      const method = jest.fn(str => str.toUpperCase())
      const collection = ["a", "b"]
      expect(spellCore.map(collection, method)).toEqual(["A", "B"])
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual(["a", 1, collection])
      expect(method.mock.calls[1]).toEqual(["b", 2, collection])
    })
  })
  describe("for objects", () => {
    test("returns empty object if method undefined", () => {
      expect(spellCore.map({})).toEqual({})
    })
    test("doesn't call method for empty object", () => {
      const method = jest.fn()
      expect(spellCore.map({}, method)).toEqual({})
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty object", () => {
      const method = jest.fn(num => num + 1)
      const collection = { a: 1, b: 2 }
      expect(spellCore.map(collection, method)).toEqual({ a: 2, b: 3 })
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual([1, "a", collection])
      expect(method.mock.calls[1]).toEqual([2, "b", collection])
    })
  })
})

describe("spellCore.filter()", () => {
  test("assertion fails if not defined", () => {
    expect(spellCore.filter()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns truthy values if method undefined", () => {
      expect(spellCore.filter(["a", false, 0])).toEqual(["a"])
    })
    test("doesn't call method for empty array", () => {
      const method = jest.fn()
      expect(spellCore.filter([], method)).toEqual([])
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty array", () => {
      const method = jest.fn(str => str > "a")
      const collection = ["a", "b"]
      expect(spellCore.filter(collection, method)).toEqual(["b"])
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual(["a", 1, collection])
      expect(method.mock.calls[1]).toEqual(["b", 2, collection])
    })
  })
  describe("for objects", () => {
    test("returns truthy values if method undefined", () => {
      expect(spellCore.filter({ a: "a", b: false, c: 0 })).toEqual({ a: "a" })
    })
    test("doesn't call method for empty object", () => {
      const method = jest.fn()
      expect(spellCore.filter({}, method)).toEqual({})
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty object", () => {
      const method = jest.fn(num => num > 1)
      const collection = { a: 1, b: 2 }
      expect(spellCore.filter(collection, method)).toEqual({ b: 2 })
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual([1, "a", collection])
      expect(method.mock.calls[1]).toEqual([2, "b", collection])
    })
  })
})

describe("spellCore.all()", () => {
  test("assertion fails if not defined", () => {
    expect(spellCore.all()).toEqual(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("uses identity function if method undefined", () => {
      expect(spellCore.all(["a", false, 0])).toEqual(false)
    })
    test("doesn't call method for empty array", () => {
      const method = jest.fn()
      expect(spellCore.all([], method)).toBe(false)
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty array", () => {
      const method = jest.fn(str => str > "a")
      const collection = ["a", "b"]
      expect(spellCore.all(collection, method)).toEqual(false)
      expect(method.mock.calls.length).toEqual(1)
      expect(method.mock.calls[0]).toEqual(["a", 1, collection])
    })
  })
  describe("for objects", () => {
    test("uses identity function if method undefined", () => {
      expect(spellCore.all({ a: "a", b: false, c: 0 })).toEqual(false)
    })
    test("doesn't call method for empty object", () => {
      const method = jest.fn()
      spellCore.all({}, method)
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty object", () => {
      const method = jest.fn(num => num > 1)
      const collection = { a: 1, b: 2 }
      expect(spellCore.all(collection, method)).toEqual(false)
      expect(method.mock.calls.length).toEqual(1)
      expect(method.mock.calls[0]).toEqual([1, "a", collection])
    })
  })
})

describe("spellCore.any()", () => {
  test("assertion fails if not defined", () => {
    expect(spellCore.any()).toEqual(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("uses identity function if method undefined", () => {
      expect(spellCore.any(["a", false, 0])).toEqual(true)
    })
    test("doesn't call method for empty array", () => {
      const method = jest.fn()
      expect(spellCore.any([], method)).toBe(false)
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty array", () => {
      const method = jest.fn(str => str > "a")
      const collection = ["a", "b"]
      expect(spellCore.any(collection, method)).toEqual(true)
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual(["a", 1, collection])
      expect(method.mock.calls[1]).toEqual(["b", 2, collection])
    })
    test("falls through to false if nothing matches", () => {
      const method = jest.fn(str => str > "b")
      const collection = ["a", "b"]
      expect(spellCore.any(collection, method)).toEqual(false)
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual(["a", 1, collection])
      expect(method.mock.calls[1]).toEqual(["b", 2, collection])
    })
  })
  describe("for objects", () => {
    test("uses identity function if method undefined", () => {
      expect(spellCore.any({ a: "a", b: false, c: 0 })).toEqual(true)
    })
    test("doesn't call method for empty object", () => {
      const method = jest.fn()
      spellCore.any({}, method)
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty object", () => {
      const method = jest.fn(num => num > 1)
      const collection = { a: 1, b: 2 }
      expect(spellCore.any(collection, method)).toEqual(true)
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual([1, "a", collection])
      expect(method.mock.calls[1]).toEqual([2, "b", collection])
    })
  })
})

describe("spellCore.removeItemsOf()", () => {
  test("assertion fails if not defined", () => {
    spellCore.removeItemsOf()
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("no change for empty array", () => {
      const collection = []
      spellCore.removeItemsOf(collection, 1)
      expect(collection).toEqual([])
    })
    test("removes properly for non-empty array, regardless of order", () => {
      const collection = ["a", "b", "c", "d", "e"]
      spellCore.removeItemsOf(collection, 1, 3, 5)
      expect(collection).toEqual(["b", "d"])
    })
  })
  describe("for objects", () => {
    test("no change for empty array", () => {
      const collection = {}
      spellCore.removeItemsOf(collection, "a")
      expect(collection).toEqual({})
    })
    test("removes properly for non-empty array, regardless of order", () => {
      const collection = { a: 1, b: 2, c: 3, d: 4, e: 5 }
      spellCore.removeItemsOf(collection, "a", "c", "e")
      expect(collection).toEqual({ b: 2, d: 4 })
    })
  })
})

describe("spellCore.remove()", () => {
  test("assertion fails if not defined", () => {
    spellCore.remove()
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("no change for empty array", () => {
      const collection = []
      spellCore.remove(collection, 1)
      expect(collection).toEqual([])
    })
    test("removes properly for non-empty array, regardless of order or recurrance", () => {
      const collection = ["a", "b", "c", "d", "e", "a"]
      spellCore.remove(collection, "a", "c", "e")
      expect(collection).toEqual(["b", "d"])
    })
  })
  describe("for objects", () => {
    test("no change for empty array", () => {
      const collection = {}
      spellCore.remove(collection, "a")
      expect(collection).toEqual({})
    })
    test("removes properly for non-empty array, regardless of order", () => {
      const collection = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 1 }
      spellCore.remove(collection, 1, 3, 5)
      expect(collection).toEqual({ b: 2, d: 4 })
    })
  })
})

describe("spellCore.removeWhere()", () => {
  test("assertion fails if not defined", () => {
    expect(spellCore.removeWhere()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("removes truthy values if method undefined", () => {
      const collection = ["a", false, 0]
      spellCore.removeWhere(collection)
      expect(collection).toEqual([false, 0])
    })
    test("doesn't call method for empty array", () => {
      const collection = []
      const method = jest.fn()
      spellCore.removeWhere(collection, method)
      expect(collection).toEqual([])
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty array", () => {
      const method = jest.fn(str => str > "a")
      const collection = ["a", "b"]
      spellCore.removeWhere(collection, method)
      expect(collection).toEqual(["a"])
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual(["a", 1, collection])
      expect(method.mock.calls[1]).toEqual(["b", 2, collection])
    })
  })
  describe("for objects", () => {
    test("removes truthy values if method undefined", () => {
      const collection = { a: "a", b: false, c: 0 }
      spellCore.removeWhere(collection)
      expect(collection).toEqual({ b: false, c: 0 })
    })
    test("doesn't call method for empty object", () => {
      const method = jest.fn()
      const collection = {}
      spellCore.removeWhere({}, method)
      expect(collection).toEqual({})
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty object", () => {
      const method = jest.fn(num => num > 1)
      const collection = { a: 1, b: 2 }
      spellCore.removeWhere(collection, method)
      expect(collection).toEqual({ a: 1 })
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual([1, "a", collection])
      expect(method.mock.calls[1]).toEqual([2, "b", collection])
    })
  })
})

describe("spellCore._randomKeyOf()", () => {
  test("assertion fails if not defined", () => {
    expect(spellCore._randomKeyOf()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns undefined for empty array", () => {
      expect(spellCore._randomKeyOf([])).toBe(undefined)
    })
    test("returns key for single-value array", () => {
      expect(spellCore._randomKeyOf(["a"])).toBe(1)
    })
    test("returns value in range for multi-item array", () => {
      jest.spyOn(spellCore, "randomNumber").mockImplementation(() => 2)
      expect(spellCore._randomKeyOf(["a", "b", "c"])).toBe(2)
    })
  })
  describe("for objects", () => {
    test("returns undefined for empty object", () => {
      expect(spellCore._randomKeyOf({})).toBe(undefined)
    })
    test("returns key for single-key object", () => {
      expect(spellCore._randomKeyOf({ a: 1 })).toBe("a")
    })
    test("returns key in range for multi-item object", () => {
      jest.spyOn(spellCore, "randomNumber").mockImplementation(() => 2)
      expect(spellCore._randomKeyOf({ a: 1, b: 2, c: 3 })).toBe("b")
    })
  })
})

describe("spellCore.randomItemOf()", () => {
  test("assertion fails if not defined", () => {
    expect(spellCore.randomItemOf()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns undefined for empty array", () => {
      expect(spellCore.randomItemOf([])).toBe(undefined)
    })
    test("returns only value for single-value array", () => {
      expect(spellCore.randomItemOf(["a"])).toBe("a")
    })
    test("returns value in range for multi-item array", () => {
      jest.spyOn(spellCore, "randomNumber").mockImplementation(() => 2)
      expect(spellCore.randomItemOf(["a", "b", "c"])).toBe("b")
    })
  })
  describe("for objects", () => {
    test("returns undefined for empty object", () => {
      expect(spellCore.randomItemOf({})).toBe(undefined)
    })
    test("returns key for single-key object", () => {
      expect(spellCore.randomItemOf({ a: 1 })).toBe(1)
    })
    test("returns key in range for multi-item object", () => {
      jest.spyOn(spellCore, "randomNumber").mockImplementation(() => 2)
      expect(spellCore.randomItemOf({ a: 1, b: 2, c: 3 })).toBe(2)
    })
  })
})

describe("spellCore.randomItemsOf()", () => {
  test("assertion fails if not defined", () => {
    expect(spellCore.randomItemsOf()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns empty array if count === 0", () => {
      expect(spellCore.randomItemsOf(["a"], 0)).toEqual([])
    })
    test("returns empty array for empty array", () => {
      expect(spellCore.randomItemsOf([], 1)).toEqual([])
    })
    test("returns only value for single-value array", () => {
      expect(spellCore.randomItemsOf(["a"])).toEqual(["a"])
    })
    test("returns all values if count not specified", () => {
      jest.spyOn(_, "shuffle").mockImplementation(() => [2, 3, 1])
      expect(spellCore.randomItemsOf(["a", "b", "c"])).toEqual(["b", "c", "a"])
    })
    test("returns value in range for multi-item array", () => {
      jest.spyOn(_, "shuffle").mockImplementation(() => [2, 3, 1])
      expect(spellCore.randomItemsOf(["a", "b", "c"], 2)).toEqual(["b", "c"])
    })
  })
  describe("for objects", () => {
    test("returns empty object if count === 0", () => {
      expect(spellCore.randomItemsOf({ a: 1 }, 0)).toEqual({})
    })
    test("returns empty object for empty object", () => {
      expect(spellCore.randomItemsOf({}, 1)).toEqual({})
    })
    test("returns key for single-key object", () => {
      expect(spellCore.randomItemsOf({ a: 1 })).toEqual({ a: 1 })
    })
    test("returns all keys if count not specified", () => {
      jest.spyOn(_, "shuffle").mockImplementation(() => ["b", "c", "a"])
      expect(spellCore.randomItemsOf({ a: 1, b: 2, c: 3 })).toEqual({ b: 2, c: 3, a: 1 })
    })
    test("returns key in range for multi-item object", () => {
      jest.spyOn(_, "shuffle").mockImplementation(() => ["b", "c", "a"])
      expect(spellCore.randomItemsOf({ a: 1, b: 2, c: 3 }, 2)).toEqual({ b: 2, c: 3 })
    })
  })
})

describe("spellCore.randomize()", () => {
  test("assertion fails if not defined", () => {
    spellCore.randomize()
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns empty array for empty array", () => {
      const collection = []
      spellCore.randomize(collection)
      expect(collection).toEqual([])
    })
    test("returns all values for multi-item array", () => {
      jest.spyOn(_, "shuffle").mockImplementation(() => [2, 3, 1])
      const collection = ["a", "b", "c"]
      spellCore.randomize(collection)
      expect(collection).toEqual(["b", "c", "a"])
    })
  })
  describe("for objects", () => {
    test("no effect for object", () => {
      const collection = { a: 1, b: 2 }
      const clone = { ...collection }
      spellCore.randomize(collection)
      expect(collection).toEqual(clone)
    })
  })
})

describe("spellCore.smallestOf()", () => {
  test("assertion fails if not defined", () => {
    expect(spellCore.smallestOf()).toBe(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns undefined for empty array", () => {
      expect(spellCore.smallestOf([])).toBe(undefined)
    })
    test("returns smallest value for multi-item array", () => {
      expect(spellCore.smallestOf([1, 2, 3])).toBe(1)
    })
  })
  describe("for objects", () => {
    test("returns undefined for empty object", () => {
      expect(spellCore.smallestOf({})).toBe(undefined)
    })
    test("returns smallest value for multi-item object", () => {
      expect(spellCore.smallestOf({ a: 1, b: 2, c: 3 })).toBe(1)
    })
  })
})

describe("spellCore.largestOf()", () => {
  test("assertion fails if not defined", () => {
    expect(spellCore.largestOf()).toBe(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns undefined for empty array", () => {
      expect(spellCore.largestOf([])).toBe(undefined)
    })
    test("returns smallest value for multi-item array", () => {
      expect(spellCore.largestOf([1, 2, 3])).toBe(3)
    })
  })
  describe("for objects", () => {
    test("returns undefined for empty object", () => {
      expect(spellCore.largestOf({})).toBe(undefined)
    })
    test("returns smallest value for multi-item object", () => {
      expect(spellCore.largestOf({ a: 1, b: 2, c: 3 })).toBe(3)
    })
  })
})
