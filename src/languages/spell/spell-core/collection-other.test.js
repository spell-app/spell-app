import { spell, assert } from "."

// Wrap `assert.failed` for each test
beforeEach(() => {
  assert.failed = jest.fn()
})

// Custom collection class simulating our custom api
class CustomCollection {
  itemCount = jest.fn( () => 2 )
  getKeys = jest.fn( () => ["key1", "key2"] )
  getValues = jest.fn( () => ["value1", "value2"] )
  getItem = jest.fn( () => "value" )
  setItem = jest.fn( (item, value) => value )
  removeItem = jest.fn()
  itemOf = jest.fn( () => "item" )
  clear = jest.fn()
  getIterator = jest.fn()
}

describe("spell.includes()", () => {
  test("fails assertion and returns false if not defined", () => {
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
  test("fails assertion and returns false if not defined", () => {
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
  test("fails assertion and returns false if not defined", () => {
    expect(spell.startsWith()).toBe(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("fails assertion and returns false for object", () => {
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
  test("fails assertion and returns false if not defined", () => {
    expect(spell.endsWith()).toBe(false)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("fails assertion and returns false for object", () => {
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

describe("spell.addAtPosition()", () => {
  test("fails assertion if not defined", () => {
    spell.addAtPosition()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("fails assertion for object", () => {
    spell.addAtPosition({})
    expect(assert.failed).toHaveBeenCalled()
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

describe("spell.prepend()", () => {
  test("fails assertion if not defined", () => {
    spell.prepend()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("fails assertion for object", () => {
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
  test("fails assertion if not defined", () => {
    spell.append()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("fails assertion for object", () => {
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
  test("fails assertion if not defined", () => {
    spell.setItemsOf()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("fails assertion for object", () => {
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
  test("fails assertion if not defined", () => {
    spell.reverse()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("fails assertion for object", () => {
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
  test("fails assertion and returns empty array if not defined", () => {
    expect(spell.rangeBetween()).toEqual([])
    expect(assert.failed).toHaveBeenCalled()
  })
  test("fails assertion and returns empty array if passed an object", () => {
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
  test("fails assertion if not defined", () => {
    spell.removeRangeBetween()
    expect(assert.failed).toHaveBeenCalled()
  })
  test("fails assertion for object", () => {
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
  test("fails assertion and returns empty array if not defined", () => {
    expect(spell.rangeStartingAt()).toEqual([])
    expect(assert.failed).toHaveBeenCalled()
  })
  test("fails assertion and returns empty array if passed an object", () => {
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

