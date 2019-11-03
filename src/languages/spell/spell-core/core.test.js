import { spell, assert } from "."

// Wrap `assert.failed` for each test
beforeEach(() => {
  assert.failed = jest.fn()
})

describe("spell.define()", () => {
  beforeEach(() => {
    jest.spyOn(Object, "defineProperty")
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })
  test("calls Object.defineProperty", () => {
    const object = {}
    spell.define(object, "foo", { value: "bar" })
    expect(Object.defineProperty).toHaveBeenCalledWith(object, "foo", { value: "bar" })
  })
})

describe("spell.newThingLike()", () => {
  describe("when passed a non-defined thing", () => {
    test("fails its assertion", () => {
      spell.newThingLike(null)
      expect(assert.failed).toHaveBeenCalled()
    })
    test("returns undefined", () => {
      expect(spell.newThingLike(null)).toBe(undefined)
    })
  })
  test("returns an empty array when passed an array", () => {
    expect(spell.newThingLike([1, 2, 3])).toEqual([])
  })
  test("returns an empty object when passed an object", () => {
    expect(spell.newThingLike({ a: 1 })).toEqual({})
  })
  test("returns an empty array when passed arguments", function() {
    expect(spell.newThingLike(arguments)).toEqual([])
  })
  test("returns a new Date when passed a Date", function() {
    expect(spell.newThingLike(new Date())).toBeInstanceOf(Date)
  })
})

describe("spell.typeOf()", () => {
  test("returns 'unknown' when passed `null`", () => {
    expect(spell.typeOf(null)).toBe("unknown")
  })
  test("returns 'unknown' when passed `undefined`", () => {
    expect(spell.typeOf(undefined)).toBe("unknown")
  })
  test("returns 'number' when passed a number", () => {
    expect(spell.typeOf(0)).toBe("number")
  })
  test("returns 'number' when passed NaN", () => {
    expect(spell.typeOf(NaN)).toBe("number")
  })
  test("returns 'string' when passed a string", () => {
    expect(spell.typeOf("foo")).toBe("string") // TODO: 'text'?
  })
  test("returns 'boolean' when passed a boolean", () => {
    expect(spell.typeOf(false)).toBe("boolean") //TODO: 'choice'?
  })
  test("returns 'object' when passed an Object", () => {
    expect(spell.typeOf({})).toBe("object")
  })
  test("returns 'date' when passed a Date", () => {
    expect(spell.typeOf(new Date())).toBe("date")
  })
  test("returns 'array' when passed an Array", () => {
    expect(spell.typeOf([])).toBe("array") // TODO: `list`?
  })
  test("returns 'function' when passed a Function", () => {
    expect(spell.typeOf(() => {})).toBe("function") // TODO: ???
  })
  test("returns class name when passed a custom class", () => {
    class Foo {}
    expect(spell.typeOf(new Foo())).toBe("foo")
  })
})

describe("spell.isOfType()", () => {
  test("matches with single type name", () => {
    expect(spell.isOfType({}, "object")).toBe(true)
  })
  test("matches with multiple type names", () => {
    expect(spell.isOfType({}, "array", "object")).toBe(true)
  })
  test("matches 'unknown' for null", () => {
    expect(spell.isOfType(null, "unknown")).toBe(true)
  })
  test("doesn't match if type not specified", () => {
    expect(spell.isOfType({}, "date")).toBe(false)
  })
})

describe("spell.isANumber()", () => {
  test("returns true for a number", () => {
    expect(spell.isANumber(1)).toBe(true)
  })
  test("returns false for a numeric string", () => {
    expect(spell.isANumber("1")).toBe(false)
  })
  test("returns false for NaN", () => {
    expect(spell.isANumber(parseInt("foo"))).toBe(false)
  })
})

describe("spell.isArrayLike()", () => {
  test("returns true for an array", () => {
    expect(spell.isArrayLike([])).toBe(true)
  })
  test("returns true for function arguments", function() {
    expect(spell.isArrayLike(arguments)).toBe(true)
  })
  test("returns false for an object", () => {
    expect(spell.isArrayLike({})).toBe(false)
  })
})

describe("spell.isTruthy()", () => {
  test("returns false for `false`", () => {
    expect(spell.isTruthy(false)).toBe(false)
  })
  test("returns false for `undefined`", function() {
    expect(spell.isTruthy(undefined)).toBe(false)
  })
  test("returns false for `null`", function() {
    expect(spell.isTruthy(null)).toBe(false)
  })
  test("returns true for 0", () => {
    expect(spell.isTruthy(0)).toBe(true)
  })
  test("returns true for an object", () => {
    expect(spell.isTruthy({})).toBe(true)
  })
})

describe("spell.randomNumber()", () => {
  test("asserts and returns undefined if min is not a number", () => {
    expect(spell.randomNumber()).toBe(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("asserts and returns undefined if max is not a number", () => {
    expect(spell.randomNumber(1, "foo")).toBe(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("returns undefined if max < min", () => {
    expect(spell.randomNumber(1, 0)).toBe(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("returns min if min === max", () => {
    expect(spell.randomNumber(1, 1)).toBe(1)
  })
  test("defaults min to 1 if only one argument", () => {
    expect(spell.randomNumber(1)).toBe(1)
  })
  test("returns an integer with normal params", () => {
    const random = spell.randomNumber(1, 5)
    expect(Number.parseInt(random)).toBe(random)
  })
})

describe("spell.createElement()", () => {
  test("is not yet implemented", () => {
    expect(() => spell.createElement()).toThrow()
  })
})
