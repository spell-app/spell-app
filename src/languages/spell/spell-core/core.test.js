import { spellCore, assert } from "."

// Wrap `assert.failed` for each test
beforeEach(() => {
  assert.failed = jest.fn()
})

describe("spellCore.define()", () => {
  beforeEach(() => {
    jest.spyOn(Object, "defineProperty")
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })
  test("calls Object.defineProperty", () => {
    const object = {}
    spellCore.define(object, "foo", { value: "bar" })
    expect(Object.defineProperty).toHaveBeenCalledWith(object, "foo", { value: "bar" })
  })
})

describe("spellCore.newThingLike()", () => {
  describe("when passed a non-defined thing", () => {
    test("fails its assertion", () => {
      spellCore.newThingLike(null)
      expect(assert.failed).toHaveBeenCalled()
    })
    test("returns undefined", () => {
      expect(spellCore.newThingLike(null)).toBe(undefined)
    })
  })
  test("returns an empty array when passed an array", () => {
    expect(spellCore.newThingLike([1, 2, 3])).toEqual([])
  })
  test("returns an empty object when passed an object", () => {
    expect(spellCore.newThingLike({ a: 1 })).toEqual({})
  })
  test("returns an empty array when passed arguments", function(...args) {
    expect(spellCore.newThingLike(args)).toEqual([])
  })
  test("returns a new Date when passed a Date", function() {
    expect(spellCore.newThingLike(new Date())).toBeInstanceOf(Date)
  })
})

describe("spellCore.typeOf()", () => {
  test("returns 'unknown' when passed `null`", () => {
    expect(spellCore.typeOf(null)).toBe("unknown")
  })
  test("returns 'unknown' when passed `undefined`", () => {
    expect(spellCore.typeOf(undefined)).toBe("unknown")
  })
  test("returns 'number' when passed a number", () => {
    expect(spellCore.typeOf(0)).toBe("number")
  })
  test("returns 'number' when passed NaN", () => {
    expect(spellCore.typeOf(NaN)).toBe("number")
  })
  test("returns 'string' when passed a string", () => {
    expect(spellCore.typeOf("foo")).toBe("string") // TODO: 'text'?
  })
  test("returns 'boolean' when passed a boolean", () => {
    expect(spellCore.typeOf(false)).toBe("boolean") // TODO: 'choice'?
  })
  test("returns 'object' when passed an Object", () => {
    expect(spellCore.typeOf({})).toBe("object")
  })
  test("returns 'date' when passed a Date", () => {
    expect(spellCore.typeOf(new Date())).toBe("date")
  })
  test("returns 'array' when passed an Array", () => {
    expect(spellCore.typeOf([])).toBe("array") // TODO: `list`?
  })
  test("returns 'function' when passed a Function", () => {
    expect(spellCore.typeOf(() => {})).toBe("function") // TODO: ???
  })
  test("returns class name when passed a custom class", () => {
    class Foo {}
    expect(spellCore.typeOf(new Foo())).toBe("foo")
  })
})

describe("spellCore.isOfType()", () => {
  test("matches with single type name", () => {
    expect(spellCore.isOfType({}, "object")).toBe(true)
  })
  test("matches with multiple type names", () => {
    expect(spellCore.isOfType({}, "array", "object")).toBe(true)
  })
  test("matches 'unknown' for null", () => {
    expect(spellCore.isOfType(null, "unknown")).toBe(true)
  })
  test("doesn't match if type not specified", () => {
    expect(spellCore.isOfType({}, "date")).toBe(false)
  })
})

describe("spellCore.isANumber()", () => {
  test("returns true for a number", () => {
    expect(spellCore.isANumber(1)).toBe(true)
  })
  test("returns false for a numeric string", () => {
    expect(spellCore.isANumber("1")).toBe(false)
  })
  test("returns false for NaN", () => {
    expect(spellCore.isANumber(parseInt("foo", 10))).toBe(false)
  })
})

describe("spellCore.isArrayLike()", () => {
  test("returns true for an array", () => {
    expect(spellCore.isArrayLike([])).toBe(true)
  })
  test("returns true for function arguments", function(...args) {
    expect(spellCore.isArrayLike(args)).toBe(true)
  })
  test("returns false for an object", () => {
    expect(spellCore.isArrayLike({})).toBe(false)
  })
})

describe("spellCore.isTruthy()", () => {
  test("returns false for `false`", () => {
    expect(spellCore.isTruthy(false)).toBe(false)
  })
  test("returns false for `undefined`", function() {
    expect(spellCore.isTruthy(undefined)).toBe(false)
  })
  test("returns false for `null`", function() {
    expect(spellCore.isTruthy(null)).toBe(false)
  })
  test("returns true for 0", () => {
    expect(spellCore.isTruthy(0)).toBe(true)
  })
  test("returns true for an object", () => {
    expect(spellCore.isTruthy({})).toBe(true)
  })
})

describe("spellCore.randomNumber()", () => {
  test("asserts and returns undefined if min is not a number", () => {
    expect(spellCore.randomNumber()).toBe(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("asserts and returns undefined if max is not a number", () => {
    expect(spellCore.randomNumber(1, "foo")).toBe(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("returns undefined if max < min", () => {
    expect(spellCore.randomNumber(1, 0)).toBe(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("returns min if min === max", () => {
    expect(spellCore.randomNumber(1, 1)).toBe(1)
  })
  test("defaults min to 1 if only one argument", () => {
    expect(spellCore.randomNumber(1)).toBe(1)
  })
  test("returns an integer with normal params", () => {
    const random = spellCore.randomNumber(1, 5)
    expect(Number.parseInt(random, 10)).toBe(random)
  })
})

describe("spellCore.createElement()", () => {
  test("is not yet implemented", () => {
    expect(() => spellCore.createElement()).toThrow()
  })
})
