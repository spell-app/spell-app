import { describe, test, expect, beforeEach, vi } from "vite-plus/test"
import { spellCore, assert } from "$/core"

// Wrap `assert.failed` for each test
beforeEach(() => {
  assert.failed = vi.fn()
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
  test("returns an empty array when passed arguments", function (...args) {
    expect(spellCore.newThingLike(args)).toEqual([])
  })
  test("returns a new Date when passed a Date", function () {
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
  test("returns 'unknown' when passed NaN", () => {
    expect(spellCore.typeOf(NaN)).toBe("unknown")
  })
  test("returns 'number' when passed a number", () => {
    expect(spellCore.typeOf(0)).toBe("number")
  })
  test("returns 'text' when passed a string", () => {
    expect(spellCore.typeOf("foo")).toBe("text")
  })
  test("returns 'choice' when passed a boolean", () => {
    expect(spellCore.typeOf(false)).toBe("choice")
  })
  test("returns 'object' when passed an Object", () => {
    expect(spellCore.typeOf({})).toBe("object")
  })
  test("returns 'date' when passed a Date", () => {
    expect(spellCore.typeOf(new Date())).toBe("date")
  })
  test("returns 'list' when passed an Array", () => {
    expect(spellCore.typeOf([])).toBe("list")
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
  test("matches 'unknown' for null", () => {
    expect(spellCore.isOfType(null, "unknown")).toBe(true)
  })
  test("doesn't match class if type is not correct", () => {
    expect(spellCore.isOfType({}, "date")).toBe(false)
  })
  test("matches with class name", () => {
    expect(spellCore.isOfType({}, "object")).toBe(true)
  })
  test("matches base type 'number' correctly", () => {
    expect(spellCore.isOfType(1, "number")).toBe(true)
    expect(spellCore.isOfType(1.1, "number")).toBe(true)
  })
  test("matches 'integer' correctly", () => {
    expect(spellCore.isOfType(1, "integer")).toBe(true)
    expect(spellCore.isOfType(1.1, "integer")).toBe(false)
  })
  test("matches 'text' correctly", () => {
    expect(spellCore.isOfType("", "text")).toBe(true)
    expect(spellCore.isOfType("a", "text")).toBe(true)
    expect(spellCore.isOfType("bar", "text")).toBe(true)
  })
  test("matches 'character' and 'char' correctly", () => {
    expect(spellCore.isOfType("a", "character")).toBe(true)
    expect(spellCore.isOfType("a", "char")).toBe(true)
    expect(spellCore.isOfType("", "char")).toBe(false)
    expect(spellCore.isOfType("abc", "char")).toBe(false)
  })
  test("matches 'choice' correctly for boolean", () => {
    expect(spellCore.isOfType(true, "choice")).toBe(true)
    expect(spellCore.isOfType(false, "choice")).toBe(true)
    expect(spellCore.isOfType(0, "choice")).toBe(false)
  })

  test("matches a super-type, e.g. a joker is a card -- but not a sub-type", () => {
    class Card {}
    class Joker extends Card {}
    expect(spellCore.isOfType(new Joker(), "joker")).toBe(true)
    expect(spellCore.isOfType(new Joker(), "Card")).toBe(true)
    expect(spellCore.isOfType(new Card(), "joker")).toBe(false)
    expect(spellCore.isOfType(new Joker(), "object")).toBe(false)
  })
})

describe("spellCore.typesOf()", () => {
  test("its type, then each super-type's, most specific first -- plain objects and primitives just their own", () => {
    class Card {}
    class Joker extends Card {}
    expect(spellCore.typesOf(new Joker())).toEqual(["joker", "card"])
    expect(spellCore.typesOf({})).toEqual(["object"])
    expect(spellCore.typesOf("a")).toEqual(["text"])
    expect(spellCore.typesOf(null)).toEqual(["unknown"])
  })
})

describe("spellCore.matchesType()", () => {
  test("the same type, or a sub-type -- NOT symmetrical", () => {
    class Card {}
    class Joker extends Card {}
    expect(spellCore.matchesType(new Card(), new Card())).toBe(true)
    expect(spellCore.matchesType(new Joker(), new Card())).toBe(true)
    expect(spellCore.matchesType(new Card(), new Joker())).toBe(false)
    expect(spellCore.matchesType(1, "a")).toBe(false)
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

describe("spellCore.isAnInteger()", () => {
  test("returns true for 0", () => {
    expect(spellCore.isAnInteger(0)).toBe(true)
  })
  test("returns true for a whole number", () => {
    expect(spellCore.isAnInteger(1)).toBe(true)
  })
  test("returns false for a decimal number", () => {
    expect(spellCore.isAnInteger(1.1)).toBe(false)
  })
  test("returns false for a numeric string", () => {
    expect(spellCore.isAnInteger("1")).toBe(false)
  })
  test("returns false for NaN", () => {
    expect(spellCore.isAnInteger(parseInt("foo", 10))).toBe(false)
  })
})

describe("spellCore.isArrayLike()", () => {
  test("returns true for an array", () => {
    expect(spellCore.isArrayLike([])).toBe(true)
  })
  test("returns true for function arguments", function (...args) {
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
  test("returns false for `undefined`", function () {
    expect(spellCore.isTruthy(undefined)).toBe(false)
  })
  test("returns false for `null`", function () {
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
    expect(spellCore.randomNumber(1, "foo" as unknown as number)).toBe(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("returns a number if max < min", () => {
    expect(typeof spellCore.randomNumber(1, 0)).toBe("number")
  })
  test("returns min if min === max", () => {
    expect(spellCore.randomNumber(1, 1)).toBe(1)
  })
  test("defaults min to 1 if only one argument", () => {
    expect(spellCore.randomNumber(1)).toBe(1)
  })
  test("returns an integer with normal params", () => {
    const random = spellCore.randomNumber(1, 5)
    expect(Number.parseInt(String(random), 10)).toBe(random)
  })
})

describe("spellCore.getRange()", () => {
  test("works in positive direction", () => {
    expect(spellCore.getRange(1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })
  test("works in negative direction", () => {
    expect(spellCore.getRange(10, 1)).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
  })
  test("works for a ingle number", () => {
    expect(spellCore.getRange(1, 1)).toEqual([1])
  })
})

describe("spellCore.countTo()", () => {
  test("counts from 1 to `count`, once per time round a `repeat` loop", () => {
    expect(spellCore.countTo(3)).toEqual([1, 2, 3])
    expect(spellCore.countTo(1)).toEqual([1])
  })
  test("is empty for a `count` under 1 -- NOT counting down, as `getRange()` would", () => {
    expect(spellCore.countTo(0)).toEqual([])
    expect(spellCore.countTo(-2)).toEqual([])
  })
})
