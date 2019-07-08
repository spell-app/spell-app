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

