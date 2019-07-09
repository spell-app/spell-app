import _ from "lodash"
import { spell, assert } from "."

// Wrap `assert.failed` for each test
beforeEach(() => {
  jest.spyOn(assert, "failed").mockImplementation(Function.prototype)
})

// Clear ALL mocks after each test
afterEach(() => {
  jest.restoreAllMocks()
})


describe("spell.includes()", () => {
  test("assertion fails and returns false if not defined", () => {
    expect(spell.includes()).toBe(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns false if no thing specified", () => {
      expect(spell.includes([])).toBe(false)
    })
    test("returns true if one thing present", () => {
      expect(spell.includes([1], 1)).toBe(true)
    })
    test("returns true if two things present", () => {
      expect(spell.includes([1,2], 1, 2)).toBe(true)
    })
    test("returns false if one thing present, one not", () => {
      expect(spell.includes([1,2], 1, 3)).toBe(false)
    })
  })
  describe("for objects", () => {
    test("returns false if no thing specified", () => {
      expect(spell.includes({})).toBe(false)
    })
    test("returns true if one thing present", () => {
      expect(spell.includes({ a: 1 }, 1)).toBe(true)
    })
    test("returns true if two things present", () => {
      expect(spell.includes({ a: 1, b: 2 }, 1, 2)).toBe(true)
    })
    test("returns false if one thing present, one not", () => {
      expect(spell.includes({ a: 1, b: 3 }, 1, 3)).toBe(true)
    })
  })
})

describe("spell.includesAny()", () => {
  test("assertion fails and returns false if not defined", () => {
    expect(spell.includesAny()).toBe(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns false if no thing specified", () => {
      expect(spell.includesAny([])).toBe(false)
    })
    test("returns true if one thing present", () => {
      expect(spell.includesAny([1], 1)).toBe(true)
    })
    test("returns true if either thing present", () => {
      expect(spell.includesAny([1, 2], -1, 2)).toBe(true)
    })
    test("returns true if one thing present, one not", () => {
      expect(spell.includesAny([1, 2], 3, 2)).toBe(true)
    })
  })
  describe("for objects", () => {
    test("returns false if no thing specified", () => {
      expect(spell.includesAny({})).toBe(false)
    })
    test("returns true if one thing present", () => {
      expect(spell.includesAny({ a: 1 }, 1)).toBe(true)
    })
    test("returns true if two things present", () => {
      expect(spell.includesAny({ a: 1, b: 2 }, 1, 2)).toBe(true)
    })
    test("returns false if one thing present, one not", () => {
      expect(spell.includesAny({ a: 1, b: 2 }, 3, 1)).toBe(true)
    })
  })
})

describe("spell.startsWith()", () => {
  test("assertion fails and returns false if not defined", () => {
    expect(spell.startsWith()).toBe(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails and returns false for object", () => {
    expect(spell.startsWith({})).toBe(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("returns false if nothing specified", () => {
    expect(spell.startsWith([])).toBe(false)
  })
  test("returns true if item is first thing", () => {
    expect(spell.startsWith(["a"], "a")).toBe(true)
  })
  test("returns false if item is not first thing", () => {
    expect(spell.startsWith(["a"], "b")).toBe(false)
  })
})

describe("spell.endsWith()", () => {
  test("assertion fails and returns false if not defined", () => {
    expect(spell.endsWith()).toBe(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails and returns false for object", () => {
    expect(spell.endsWith({})).toBe(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("returns false if nothing specified", () => {
    expect(spell.endsWith([])).toBe(false)
  })
  test("returns true if item is only thing", () => {
    expect(spell.endsWith(["a"], "a")).toBe(true)
  })
  test("returns true if item is last thing", () => {
    expect(spell.endsWith(["a", "b"], "b")).toBe(true)
  })
  test("returns false if item is not last thing", () => {
    expect(spell.endsWith(["a", "b"], "a")).toBe(false)
  })
})


describe("spell.prepend()", () => {
  test("assertion fails if not defined", () => {
    spell.prepend()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails for object", () => {
    spell.prepend({})
    expect(assert.failed).toHaveBeenCalled()
  })
  test("doesn't add anything if no things", () => {
    const collection = []
    spell.prepend(collection)
    expect(collection).toEqual([])
  })
  test("adds single item correctly to empty list", () => {
    const collection = []
    spell.prepend(collection, "a")
    expect(collection).toEqual(["a"])
  })
  test("adds multiple items correctly to non-empty list", () => {
    const collection = ["a"]
    spell.prepend(collection, "b", "c", "d")
    expect(collection).toEqual(["b", "c", "d", "a"])
  })
})

describe("spell.append()", () => {
  test("assertion fails if not defined", () => {
    spell.append()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails for object", () => {
    spell.append({})
    expect(assert.failed).toHaveBeenCalled()
  })
  test("doesn't add anything if no things", () => {
    const collection = []
    spell.append(collection)
    expect(collection).toEqual([])
  })
  test("adds single item correctly to empty list", () => {
    const collection = []
    spell.append(collection, "a")
    expect(collection).toEqual(["a"])
  })
  test("adds multiple items correctly to non-empty list", () => {
    const collection = ["a"]
    spell.append(collection, "b", "c", "d")
    expect(collection).toEqual(["a", "b", "c", "d"])
  })
})

describe("spell.setItemsOf()", () => {
  test("assertion fails if not defined", () => {
    spell.setItemsOf()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails for object", () => {
    spell.setItemsOf({})
    expect(assert.failed).toHaveBeenCalled()
  })
  test("doesn't add anything if no things", () => {
    const collection = []
    spell.setItemsOf(collection, 1)
    expect(collection).toEqual([])
  })
  test("adds single item correctly to empty list", () => {
    const collection = []
    spell.setItemsOf(collection, 1, "a")
    expect(collection).toEqual(["a"])
  })
  test("overwrites single item correctly in non-empty list", () => {
    const collection = ["a"]
    spell.setItemsOf(collection, 1, "A")
    expect(collection).toEqual(["A"])
  })
  test("overwrites multiple items correctly", () => {
    const collection = ["a", "b"]
    spell.setItemsOf(collection, 2, "B", "C", "D")
    expect(collection).toEqual(["a", "B", "C", "D"])
  })
})

describe("spell.reverse()", () => {
  test("assertion fails if not defined", () => {
    spell.reverse()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails for object", () => {
    spell.reverse({})
    expect(assert.failed).toHaveBeenCalled()
  })
  test("works for empty list", () => {
    const collection = []
    spell.reverse(collection)
    expect(collection).toEqual([])
  })
  test("works for non-empty list", () => {
    const collection = [1, 2, 3]
    spell.reverse(collection)
    expect(collection).toEqual([3, 2, 1])
  })
})

describe("spell._validateRangeBetween()", () => {
  describe("when start is missing", () => {
    test("returns 1...end if start not provided", () => {
      expect(spell._validateRangeBetween(null, 3, 5)).toEqual({ start: 1, end: 3 })
    })
    test("returns start...count if start and end not provided", () => {
      expect(spell._validateRangeBetween(null,null,5)).toEqual({ start: 1, end: 5 })
    })
  })
  test("returns undefined if itemCount is 0", () => {
    expect(spell._validateRangeBetween(1, 1, 0)).toEqual(undefined)
  })
  describe("for positive starts", () => {
    test("returns start...count if end not provided", () => {
      expect(spell._validateRangeBetween(2, null, 5)).toEqual({ start: 2, end: 5 })
    })
    test("returns undefined if end < start", () => {
      expect(spell._validateRangeBetween(5,1,5)).toEqual(undefined)
    })
    test("returns undefined if start > count", () => {
      expect(spell._validateRangeBetween(10,1,5)).toEqual(undefined)
    })
    test("returns proper range for valid start", () => {
      expect(spell._validateRangeBetween(2,3,5)).toEqual({ start: 2, end: 3 })
    })
  })
  describe("for negative starts", () => {
    test("returns (count+start)...count if end not provided", () => {
      expect(spell._validateRangeBetween(-2, null, 5)).toEqual({ start: 4, end: 5 })
    })
    test("returns undefined if end < -start", () => {
      expect(spell._validateRangeBetween(-2,1,5)).toEqual(undefined)
    })
    test("returns undefined if -start > count", () => {
      expect(spell._validateRangeBetween(-10,1,5)).toEqual(undefined)
    })
    test("returns proper range for valid start", () => {
      expect(spell._validateRangeBetween(-2,5,5)).toEqual({ start: 4, end: 5 })
    })
    test("returns proper range for valid start and end too large", () => {
      expect(spell._validateRangeBetween(-2,10,5)).toEqual({ start: 4, end: 5 })
    })
  })
})

describe("spell.rangeBetween()", () => {
  test("assertion fails and returns empty array if not defined", () => {
    expect(spell.rangeBetween()).toEqual([])
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails and returns empty array if passed an object", () => {
    expect(spell.rangeBetween({})).toEqual([])
    expect(assert.failed).toHaveBeenCalled()
  })
  test("returns empty array if start > count", () => {
    expect(spell.rangeBetween([1,2,3], 5)).toEqual([])
  })
  test("returns empty array if end < start", () => {
    expect(spell.rangeBetween([1,2,3], 2, 1)).toEqual([])
  })
  test("defaults end to collection length if not specified", () => {
    expect(spell.rangeBetween([1,2,3], 1)).toEqual([1,2,3])
  })
  test("defaults end to collection length if > collection length", () => {
    expect(spell.rangeBetween([1,2,3], 1, 5)).toEqual([1,2,3])
  })
  test("defaults start to 1 if not specified", () => {
    expect(spell.rangeBetween([1,2,3])).toEqual([1,2,3])
  })
  test("subsets properly with internal range", () => {
    expect(spell.rangeBetween([1,2,3,4,5], 2, 4)).toEqual([2,3,4])
  })
})

describe("spell.removeRangeBetween()", () => {
  test("assertion fails if not defined", () => {
    spell.removeRangeBetween()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails for object", () => {
    spell.removeRangeBetween({})
    expect(assert.failed).toHaveBeenCalled()
  })
  test("returns same values if start > count", () => {
    const collection = [1,2]
    spell.removeRangeBetween(collection, 3)
    expect(collection).toEqual([1,2])
  })
  test("returns same values if end < start", () => {
    const collection = [1,2]
    spell.removeRangeBetween(collection, 2, 1)
    expect(collection).toEqual([1,2])
  })
  test("defaults end to collection length if not specified", () => {
    const collection = [1,2,3]
    spell.removeRangeBetween(collection, 2)
    expect(collection).toEqual([1])
  })
  test("defaults end to collection length if > collection length", () => {
    const collection = [1,2,3]
    spell.removeRangeBetween(collection, 2, 5)
    expect(collection).toEqual([1])
  })
  test("defaults start to 1 if not specified", () => {
    const collection = [1,2,3]
    spell.removeRangeBetween(collection)
    expect(collection).toEqual([])
  })
  test("subsets properly with internal range", () => {
    const collection = [1,2,3]
    spell.removeRangeBetween(collection, 2, 2)
    expect(collection).toEqual([1,3])
  })
})

describe("spell._validateRangeStartingAt()", () => {
  describe("when start is missing", () => {
    test("returns start...itemCount if start and count not provided", () => {
      expect(spell._validateRangeStartingAt(null,null,5)).toEqual({ start: 1, end: 5 })
    })
    test("returns 1...count if start not provided", () => {
      expect(spell._validateRangeStartingAt(null, 3, 5)).toEqual({ start: 1, end: 3 })
    })
  })
  describe("for positive starts", () => {
    test("returns undefined if count is 0", () => {
      expect(spell._validateRangeStartingAt(2, 0, 5)).toEqual(undefined)
    })
    test("returns start...itemCount if count not provided", () => {
      expect(spell._validateRangeStartingAt(2, null, 5)).toEqual({ start: 2, end: 5 })
    })
    test("returns undefined if count < start", () => {
      expect(spell._validateRangeStartingAt(5,1,5)).toEqual({ start: 5, end: 5 })
    })
    test("returns undefined if start > itemCount", () => {
      expect(spell._validateRangeStartingAt(10,1,5)).toEqual(undefined)
    })
    test("returns proper range for valid start", () => {
      expect(spell._validateRangeStartingAt(2,3,5)).toEqual({ start: 2, end: 4 })
    })
  })
  describe("for negative starts", () => {
    test("returns undefined if count is 0", () => {
      expect(spell._validateRangeStartingAt(2, 0, 5)).toEqual(undefined)
    })
    test("returns (itemCount+start)...itemCount if count not provided", () => {
      expect(spell._validateRangeStartingAt(-2, null, 5)).toEqual({ start: 4, end: 5 })
    })
    test("returns undefined if -start > itemCount", () => {
      expect(spell._validateRangeStartingAt(-10,1,5)).toEqual(undefined)
    })
    test("returns proper range for valid start", () => {
      expect(spell._validateRangeStartingAt(-2,5,5)).toEqual({ start: 4, end: 5 })
    })
    test("returns proper range for valid start and count too large", () => {
      expect(spell._validateRangeStartingAt(-2,10,5)).toEqual({ start: 4, end: 5 })
    })
  })
})

describe("spell.rangeStartingAt()", () => {
  test("assertion fails and returns empty array if not defined", () => {
    expect(spell.rangeStartingAt()).toEqual([])
    expect(assert.failed).toHaveBeenCalled()
  })
  test("assertion fails and returns empty array if passed an object", () => {
    expect(spell.rangeStartingAt({})).toEqual([])
    expect(assert.failed).toHaveBeenCalled()
  })
  test("returns empty array if start > itemCount", () => {
    expect(spell.rangeStartingAt([1,2,3], 5, 1)).toEqual([])
  })
  test("returns empty array if -start > itemCount", () => {
    expect(spell.rangeStartingAt([1,2,3], -5, 1)).toEqual([])
  })
  test("returns empty array if count 0", () => {
    expect(spell.rangeStartingAt([1,2,3], 2, 0)).toEqual([])
  })
  test("returns empty array if count < 0", () => {
    expect(spell.rangeStartingAt([1,2,3], 2, -1)).toEqual([])
  })
  test("subsets properly for normal positive range", () => {
    expect(spell.rangeStartingAt([1,2,3], 2, 2)).toEqual([2,3])
  })
  test("subsets properly for positive start with count > itemCount", () => {
    expect(spell.rangeStartingAt([1,2,3], 2, 10)).toEqual([2,3])
  })
  test("subsets properly for normal negative range", () => {
    expect(spell.rangeStartingAt([1,2,3], -2, 2)).toEqual([2,3])
  })
  test("subsets properly for negative start with count > itemCount", () => {
    expect(spell.rangeStartingAt([1,2,3], -2, 10)).toEqual([2,3])
  })
})

describe("spell.forEach()", () => {
  test("assertion fails if not defined", () => {
    spell.forEach()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("no-op if method undefined", () => {
    expect(() => spell.forEach([])).not.toThrow()
  })
  describe("for arrays", () => {
    test("doesn't call method for empty array", () => {
      const method = jest.fn()
      spell.forEach([], method)
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty array", () => {
      const method = jest.fn()
      const collection = ["a", "b"]
      spell.forEach(collection, method)
      expect(method.mock.calls.length).toBe(2)
      expect(method.mock.calls[0]).toEqual(["a", 1, collection])
      expect(method.mock.calls[1]).toEqual(["b", 2, collection])
    })
  })
  describe("for objects", () => {
    test("doesn't call method for empty object", () => {
      const method = jest.fn()
      spell.forEach({}, method)
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty object", () => {
      const method = jest.fn()
      const collection = { a: 1, b: 2 }
      spell.forEach(collection, method)
      expect(method.mock.calls.length).toBe(2)
      expect(method.mock.calls[0]).toEqual([1, "a", collection])
      expect(method.mock.calls[1]).toEqual([2, "b", collection])
    })
  })
})

describe("spell.map()", () => {
  test("assertion fails if not defined", () => {
    expect(spell.map()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns empty array if method undefined", () => {
      expect(spell.map([])).toEqual([])
    })
    test("doesn't call method for empty array", () => {
      const method = jest.fn()
      expect(spell.map([], method)).toEqual([])
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty array", () => {
      const method = jest.fn(str => str.toUpperCase())
      const collection = ["a", "b"]
      expect(spell.map(collection, method)).toEqual(["A","B"])
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual(["a", 1, collection])
      expect(method.mock.calls[1]).toEqual(["b", 2, collection])
    })
  })
  describe("for objects", () => {
    test("returns empty object if method undefined", () => {
      expect(spell.map({})).toEqual({})
    })
    test("doesn't call method for empty object", () => {
      const method = jest.fn()
      expect(spell.map({}, method)).toEqual({})
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty object", () => {
      const method = jest.fn(num => num + 1)
      const collection = { a: 1, b: 2 }
      expect(spell.map(collection, method)).toEqual({ a: 2, b: 3})
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual([1, "a", collection])
      expect(method.mock.calls[1]).toEqual([2, "b", collection])
    })
  })
})

describe("spell.filter()", () => {
  test("assertion fails if not defined", () => {
    expect(spell.filter()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns truthy values if method undefined", () => {
      expect(spell.filter(["a", false, 0])).toEqual(["a"])
    })
    test("doesn't call method for empty array", () => {
      const method = jest.fn()
      expect(spell.filter([], method)).toEqual([])
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty array", () => {
      const method = jest.fn(str => str > "a")
      const collection = ["a", "b"]
      expect(spell.filter(collection, method)).toEqual(["b"])
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual(["a", 1, collection])
      expect(method.mock.calls[1]).toEqual(["b", 2, collection])
    })
  })
  describe("for objects", () => {
    test("returns truthy values if method undefined", () => {
      expect(spell.filter({ a: "a", b: false, c: 0 })).toEqual({ a: "a" })
    })
    test("doesn't call method for empty object", () => {
      const method = jest.fn()
      expect(spell.filter({}, method)).toEqual({})
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty object", () => {
      const method = jest.fn(num => num > 1)
      const collection = { a: 1, b: 2 }
      expect(spell.filter(collection, method)).toEqual({ b: 2 })
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual([1, "a", collection])
      expect(method.mock.calls[1]).toEqual([2, "b", collection])
    })
  })
})

describe("spell.all()", () => {
  test("assertion fails if not defined", () => {
    expect(spell.all()).toEqual(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("uses identity function if method undefined", () => {
      expect(spell.all(["a", false, 0])).toEqual(false)
    })
    test("doesn't call method for empty array", () => {
      const method = jest.fn()
      expect(spell.all([], method)).toBe(false)
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty array", () => {
      const method = jest.fn(str => str > "a")
      const collection = ["a", "b"]
      expect(spell.all(collection, method)).toEqual(false)
      expect(method.mock.calls.length).toEqual(1)
      expect(method.mock.calls[0]).toEqual(["a", 1, collection])
    })
  })
  describe("for objects", () => {
    test("uses identity function if method undefined", () => {
      expect(spell.all({ a: "a", b: false, c: 0 })).toEqual(false)
    })
    test("doesn't call method for empty object", () => {
      const method = jest.fn()
      spell.all({}, method)
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty object", () => {
      const method = jest.fn(num => num > 1)
      const collection = { a: 1, b: 2 }
      expect(spell.all(collection, method)).toEqual(false)
      expect(method.mock.calls.length).toEqual(1)
      expect(method.mock.calls[0]).toEqual([1, "a", collection])
    })
  })
})

describe("spell.any()", () => {
  test("assertion fails if not defined", () => {
    expect(spell.any()).toEqual(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("uses identity function if method undefined", () => {
      expect(spell.any(["a", false, 0])).toEqual(true)
    })
    test("doesn't call method for empty array", () => {
      const method = jest.fn()
      expect(spell.any([], method)).toBe(false)
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty array", () => {
      const method = jest.fn(str => str > "a")
      const collection = ["a", "b"]
      expect(spell.any(collection, method)).toEqual(true)
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual(["a", 1, collection])
      expect(method.mock.calls[1]).toEqual(["b", 2, collection])
    })
    test("falls through to false if nothing matches", () => {
      const method = jest.fn(str => str > "b")
      const collection = ["a", "b"]
      expect(spell.any(collection, method)).toEqual(false)
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual(["a", 1, collection])
      expect(method.mock.calls[1]).toEqual(["b", 2, collection])
    })
  })
  describe("for objects", () => {
    test("uses identity function if method undefined", () => {
      expect(spell.any({ a: "a", b: false, c: 0 })).toEqual(true)
    })
    test("doesn't call method for empty object", () => {
      const method = jest.fn()
      spell.any({}, method)
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty object", () => {
      const method = jest.fn(num => num > 1)
      const collection = { a: 1, b: 2 }
      expect(spell.any(collection, method)).toEqual(true)
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual([1, "a", collection])
      expect(method.mock.calls[1]).toEqual([2, "b", collection])
    })
  })
})

describe("spell.removeItemsOf()", () => {
  test("assertion fails if not defined", () => {
    spell.removeItemsOf()
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("no change for empty array", () => {
      const collection = []
      spell.removeItemsOf(collection, 1)
      expect(collection).toEqual([])
    })
    test("removes properly for non-empty array, regardless of order", () => {
      const collection = ["a","b","c","d","e"]
      spell.removeItemsOf(collection, 1, 3, 5)
      expect(collection).toEqual(["b","d"])
    })
  })
  describe("for objects", () => {
    test("no change for empty array", () => {
      const collection = {}
      spell.removeItemsOf(collection, "a")
      expect(collection).toEqual({})
    })
    test("removes properly for non-empty array, regardless of order", () => {
      const collection = {a: 1, b: 2, c: 3, d: 4, e: 5}
      spell.removeItemsOf(collection, "a", "c", "e")
      expect(collection).toEqual({b: 2, d: 4})
    })
  })
})

describe("spell.remove()", () => {
  test("assertion fails if not defined", () => {
    spell.remove()
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("no change for empty array", () => {
      const collection = []
      spell.remove(collection, 1)
      expect(collection).toEqual([])
    })
    test("removes properly for non-empty array, regardless of order or recurrance", () => {
      const collection = ["a","b","c","d","e","a"]
      spell.remove(collection, "a", "c", "e")
      expect(collection).toEqual(["b","d"])
    })
  })
  describe("for objects", () => {
    test("no change for empty array", () => {
      const collection = {}
      spell.remove(collection, "a")
      expect(collection).toEqual({})
    })
    test("removes properly for non-empty array, regardless of order", () => {
      const collection = {a: 1, b: 2, c: 3, d: 4, e: 5, f: 1 }
      spell.remove(collection, 1, 3, 5)
      expect(collection).toEqual({b: 2, d: 4})
    })
  })
})

describe("spell.removeWhere()", () => {
  test("assertion fails if not defined", () => {
    expect(spell.removeWhere()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("removes truthy values if method undefined", () => {
      const collection = ["a", false, 0]
      spell.removeWhere(collection)
      expect(collection).toEqual([false, 0])
    })
    test("doesn't call method for empty array", () => {
      const collection = []
      const method = jest.fn()
      spell.removeWhere(collection, method)
      expect(collection).toEqual([])
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty array", () => {
      const method = jest.fn(str => str > "a")
      const collection = ["a", "b"]
      spell.removeWhere(collection, method)
      expect(collection).toEqual(["a"])
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual(["a", 1, collection])
      expect(method.mock.calls[1]).toEqual(["b", 2, collection])
    })
  })
  describe("for objects", () => {
    test("removes truthy values if method undefined", () => {
      const collection = { a: "a", b: false, c: 0 }
      spell.removeWhere(collection)
      expect(collection).toEqual({ b: false, c: 0 })
    })
    test("doesn't call method for empty object", () => {
      const method = jest.fn()
      const collection = {}
      spell.removeWhere({}, method)
      expect(collection).toEqual({})
      expect(method).not.toHaveBeenCalled()
    })
    test("calls method properly for non-empty object", () => {
      const method = jest.fn(num => num > 1)
      const collection = { a: 1, b: 2 }
      spell.removeWhere(collection, method)
      expect(collection).toEqual({ a: 1 })
      expect(method.mock.calls.length).toEqual(2)
      expect(method.mock.calls[0]).toEqual([1, "a", collection])
      expect(method.mock.calls[1]).toEqual([2, "b", collection])
    })
  })
})

describe("spell._randomKeyOf()", () => {
  test("assertion fails if not defined", () => {
    expect(spell._randomKeyOf()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns undefined for empty array", () => {
      expect(spell._randomKeyOf([])).toBe(undefined)
    })
    test("returns key for single-value array", () => {
      expect(spell._randomKeyOf(["a"])).toBe(1)
    })
    test("returns value in range for multi-item array", () => {
      jest.spyOn(spell, "randomNumber").mockImplementation(() => 2)
      expect(spell._randomKeyOf(["a", "b", "c"])).toBe(2)
    })
  })
  describe("for objects", () => {
    test("returns undefined for empty object", () => {
      expect(spell._randomKeyOf({})).toBe(undefined)
    })
    test("returns key for single-key object", () => {
      expect(spell._randomKeyOf({ a: 1 })).toBe("a")
    })
    test("returns key in range for multi-item object", () => {
      jest.spyOn(spell, "randomNumber").mockImplementation(() => 2)
      expect(spell._randomKeyOf({ a: 1, b: 2, c: 3 })).toBe("b")
    })
  })
})

describe("spell.randomItemOf()", () => {
  test("assertion fails if not defined", () => {
    expect(spell.randomItemOf()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns undefined for empty array", () => {
      expect(spell.randomItemOf([])).toBe(undefined)
    })
    test("returns only value for single-value array", () => {
      expect(spell.randomItemOf(["a"])).toBe("a")
    })
    test("returns value in range for multi-item array", () => {
      jest.spyOn(spell, "randomNumber").mockImplementation(() => 2)
      expect(spell.randomItemOf(["a", "b", "c"])).toBe("b")
    })
  })
  describe("for objects", () => {
    test("returns undefined for empty object", () => {
      expect(spell.randomItemOf({})).toBe(undefined)
    })
    test("returns key for single-key object", () => {
      expect(spell.randomItemOf({ a: 1 })).toBe(1)
    })
    test("returns key in range for multi-item object", () => {
      jest.spyOn(spell, "randomNumber").mockImplementation(() => 2)
      expect(spell.randomItemOf({ a: 1, b: 2, c: 3 })).toBe(2)
    })
  })
})


describe("spell.randomItemsOf()", () => {
  test("assertion fails if not defined", () => {
    expect(spell.randomItemsOf()).toEqual(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns empty array if count === 0", () => {
      expect(spell.randomItemsOf(["a"], 0)).toEqual([])
    })
    test("returns empty array for empty array", () => {
      expect(spell.randomItemsOf([],1)).toEqual([])
    })
    test("returns only value for single-value array", () => {
      expect(spell.randomItemsOf(["a"])).toEqual(["a"])
    })
    test("returns all values if count not specified", () => {
      jest.spyOn(_, "shuffle").mockImplementation(() => [2,3,1])
      expect(spell.randomItemsOf(["a", "b", "c"])).toEqual(["b", "c", "a"])
    })
    test("returns value in range for multi-item array", () => {
      jest.spyOn(_, "shuffle").mockImplementation(() => [2,3,1])
      expect(spell.randomItemsOf(["a", "b", "c"], 2)).toEqual(["b", "c"])
    })
  })
  describe("for objects", () => {
    test("returns empty object if count === 0", () => {
      expect(spell.randomItemsOf({ a: 1 }, 0)).toEqual({})
    })
    test("returns empty object for empty object", () => {
      expect(spell.randomItemsOf({},1)).toEqual({})
    })
    test("returns key for single-key object", () => {
      expect(spell.randomItemsOf({ a: 1 })).toEqual({ a: 1 })
    })
    test("returns all keys if count not specified", () => {
      jest.spyOn(_, "shuffle").mockImplementation(() => ["b", "c", "a"])
      expect(spell.randomItemsOf({ a: 1, b: 2, c: 3 })).toEqual({ b: 2, c: 3, a: 1 })
    })
    test("returns key in range for multi-item object", () => {
      jest.spyOn(_, "shuffle").mockImplementation(() => ["b", "c", "a"])
      expect(spell.randomItemsOf({ a: 1, b: 2, c: 3 }, 2)).toEqual({ b: 2, c: 3 })
    })
  })
})

describe("spell.randomize()", () => {
  test("assertion fails if not defined", () => {
    spell.randomize()
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns empty array for empty array", () => {
      const collection = []
      spell.randomize(collection)
      expect(collection).toEqual([])
    })
    test("returns all values for multi-item array", () => {
      jest.spyOn(_, "shuffle").mockImplementation(() => [2,3,1])
      const collection = ["a", "b", "c"]
      spell.randomize(collection)
      expect(collection).toEqual(["b", "c", "a"])
    })
  })
  describe("for objects", () => {
    test("no effect for object", () => {
      const collection = { a: 1, b: 2 }
      const clone = {...collection}
      spell.randomize(collection)
      expect(collection).toEqual(clone)
    })
  })
})

describe("spell.smallestOf()", () => {
  test("assertion fails if not defined", () => {
    expect(spell.smallestOf()).toBe(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns undefined for empty array", () => {
      expect(spell.smallestOf([])).toBe(undefined)
    })
    test("returns smallest value for multi-item array", () => {
      expect(spell.smallestOf([1,2,3])).toBe(1)
    })
  })
  describe("for objects", () => {
    test("returns undefined for empty object", () => {
      expect(spell.smallestOf({})).toBe(undefined)
    })
    test("returns smallest value for multi-item object", () => {
      expect(spell.smallestOf({ a: 1, b: 2, c: 3 })).toBe(1)
    })
  })
})

describe("spell.largestOf()", () => {
  test("assertion fails if not defined", () => {
    expect(spell.largestOf()).toBe(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  describe("for arrays", () => {
    test("returns undefined for empty array", () => {
      expect(spell.largestOf([])).toBe(undefined)
    })
    test("returns smallest value for multi-item array", () => {
      expect(spell.largestOf([1,2,3])).toBe(3)
    })
  })
  describe("for objects", () => {
    test("returns undefined for empty object", () => {
      expect(spell.largestOf({})).toBe(undefined)
    })
    test("returns smallest value for multi-item object", () => {
      expect(spell.largestOf({ a: 1, b: 2, c: 3 })).toBe(3)
    })
  })
})
