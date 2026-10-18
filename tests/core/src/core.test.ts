import { describe, test, expect, beforeEach, vi } from "vite-plus/test"
import { core, assert } from "$/core"

// Wrap `assert.failed` for each test
beforeEach(() => {
  assert.failed = vi.fn()
})

describe("core.newThingLike()", () => {
  describe("when passed a non-defined thing", () => {
    test("fails its assertion", () => {
      core.newThingLike(null)
      expect(assert.failed).toHaveBeenCalled()
    })
    test("returns undefined", () => {
      expect(core.newThingLike(null)).toBe(undefined)
    })
  })
  test("returns an empty array when passed an array", () => {
    expect(core.newThingLike([1, 2, 3])).toEqual([])
  })
  test("returns an empty object when passed an object", () => {
    expect(core.newThingLike({ a: 1 })).toEqual({})
  })
  test("returns an empty array when passed arguments", function (...args) {
    expect(core.newThingLike(args)).toEqual([])
  })
  test("returns a new Date when passed a Date", function () {
    expect(core.newThingLike(new Date())).toBeInstanceOf(Date)
  })
})

describe("core.typeOf()", () => {
  test("returns 'unknown' when passed `null`", () => {
    expect(core.typeOf(null)).toBe("unknown")
  })
  test("returns 'unknown' when passed `undefined`", () => {
    expect(core.typeOf(undefined)).toBe("unknown")
  })
  test("returns 'unknown' when passed NaN", () => {
    expect(core.typeOf(NaN)).toBe("unknown")
  })
  test("returns 'number' when passed a number", () => {
    expect(core.typeOf(0)).toBe("number")
  })
  test("returns 'text' when passed a string", () => {
    expect(core.typeOf("foo")).toBe("text")
  })
  test("returns 'choice' when passed a boolean", () => {
    expect(core.typeOf(false)).toBe("choice")
  })
  test("returns 'object' when passed an Object", () => {
    expect(core.typeOf({})).toBe("object")
  })
  test("returns 'date' when passed a Date", () => {
    expect(core.typeOf(new Date())).toBe("date")
  })
  test("returns 'list' when passed an Array", () => {
    expect(core.typeOf([])).toBe("list")
  })
  test("returns 'function' when passed a Function", () => {
    expect(core.typeOf(() => {})).toBe("function") // TODO: ???
  })
  test("returns class name when passed a custom class", () => {
    class Foo {}
    expect(core.typeOf(new Foo())).toBe("foo")
  })
})

describe("core.isOfType()", () => {
  test("matches 'unknown' for null", () => {
    expect(core.isOfType(null, "unknown")).toBe(true)
  })
  test("doesn't match class if type is not correct", () => {
    expect(core.isOfType({}, "date")).toBe(false)
  })
  test("matches with class name", () => {
    expect(core.isOfType({}, "object")).toBe(true)
  })
  test("matches base type 'number' correctly", () => {
    expect(core.isOfType(1, "number")).toBe(true)
    expect(core.isOfType(1.1, "number")).toBe(true)
  })
  test("matches 'integer' correctly", () => {
    expect(core.isOfType(1, "integer")).toBe(true)
    expect(core.isOfType(1.1, "integer")).toBe(false)
  })
  test("matches 'text' correctly", () => {
    expect(core.isOfType("", "text")).toBe(true)
    expect(core.isOfType("a", "text")).toBe(true)
    expect(core.isOfType("bar", "text")).toBe(true)
  })
  test("matches 'character' and 'char' correctly", () => {
    expect(core.isOfType("a", "character")).toBe(true)
    expect(core.isOfType("a", "char")).toBe(true)
    expect(core.isOfType("", "char")).toBe(false)
    expect(core.isOfType("abc", "char")).toBe(false)
  })
  test("matches 'choice' correctly for boolean", () => {
    expect(core.isOfType(true, "choice")).toBe(true)
    expect(core.isOfType(false, "choice")).toBe(true)
    expect(core.isOfType(0, "choice")).toBe(false)
  })

  test("matches a super-type, e.g. a joker is a card -- but not a sub-type", () => {
    class Card {}
    class Joker extends Card {}
    expect(core.isOfType(new Joker(), "joker")).toBe(true)
    expect(core.isOfType(new Joker(), "Card")).toBe(true)
    expect(core.isOfType(new Card(), "joker")).toBe(false)
    expect(core.isOfType(new Joker(), "object")).toBe(false)
  })
})

describe("core.typesOf()", () => {
  test("its type, then each super-type's, most specific first -- plain objects and primitives just their own", () => {
    class Card {}
    class Joker extends Card {}
    expect(core.typesOf(new Joker())).toEqual(["joker", "card"])
    expect(core.typesOf({})).toEqual(["object"])
    expect(core.typesOf("a")).toEqual(["text"])
    expect(core.typesOf(null)).toEqual(["unknown"])
  })
})

describe("core.matchesType()", () => {
  test("the same type, or a sub-type -- NOT symmetrical", () => {
    class Card {}
    class Joker extends Card {}
    expect(core.matchesType(new Card(), new Card())).toBe(true)
    expect(core.matchesType(new Joker(), new Card())).toBe(true)
    expect(core.matchesType(new Card(), new Joker())).toBe(false)
    expect(core.matchesType(1, "a")).toBe(false)
  })
})

describe("core.isANumber()", () => {
  test("returns true for a number", () => {
    expect(core.isANumber(1)).toBe(true)
  })
  test("returns false for a numeric string", () => {
    expect(core.isANumber("1")).toBe(false)
  })
  test("returns false for NaN", () => {
    expect(core.isANumber(parseInt("foo", 10))).toBe(false)
  })
})

describe("core.isAnInteger()", () => {
  test("returns true for 0", () => {
    expect(core.isAnInteger(0)).toBe(true)
  })
  test("returns true for a whole number", () => {
    expect(core.isAnInteger(1)).toBe(true)
  })
  test("returns false for a decimal number", () => {
    expect(core.isAnInteger(1.1)).toBe(false)
  })
  test("returns false for a numeric string", () => {
    expect(core.isAnInteger("1")).toBe(false)
  })
  test("returns false for NaN", () => {
    expect(core.isAnInteger(parseInt("foo", 10))).toBe(false)
  })
})

describe("core.isArrayLike()", () => {
  test("returns true for an array", () => {
    expect(core.isArrayLike([])).toBe(true)
  })
  test("returns true for function arguments", function (...args) {
    expect(core.isArrayLike(args)).toBe(true)
  })
  test("returns false for an object", () => {
    expect(core.isArrayLike({})).toBe(false)
  })
})

describe("core.isTruthy()", () => {
  test("returns false for `false`", () => {
    expect(core.isTruthy(false)).toBe(false)
  })
  test("returns false for `undefined`", function () {
    expect(core.isTruthy(undefined)).toBe(false)
  })
  test("returns false for `null`", function () {
    expect(core.isTruthy(null)).toBe(false)
  })
  test("returns true for 0", () => {
    expect(core.isTruthy(0)).toBe(true)
  })
  test("returns true for an object", () => {
    expect(core.isTruthy({})).toBe(true)
  })
})

describe("core.absoluteValue()", () => {
  test("drops a number's sign", () => {
    expect(core.absoluteValue(-3)).toBe(3)
    expect(core.absoluteValue(2.5)).toBe(2.5)
    expect(core.absoluteValue(0)).toBe(0)
  })
  test("asserts and returns undefined if not a number", () => {
    expect(core.absoluteValue("three" as unknown as number)).toBe(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
})

describe("core.randomNumber()", () => {
  test("asserts and returns undefined if min is not a number", () => {
    expect(core.randomNumber()).toBe(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("asserts and returns undefined if max is not a number", () => {
    expect(core.randomNumber(1, "foo" as unknown as number)).toBe(undefined)
    expect(assert.failed).toHaveBeenCalled()
  })
  test("returns a number if max < min", () => {
    expect(typeof core.randomNumber(1, 0)).toBe("number")
  })
  test("returns min if min === max", () => {
    expect(core.randomNumber(1, 1)).toBe(1)
  })
  test("defaults min to 1 if only one argument", () => {
    expect(core.randomNumber(1)).toBe(1)
  })
  test("returns an integer with normal params", () => {
    const random = core.randomNumber(1, 5)
    expect(Number.parseInt(String(random), 10)).toBe(random)
  })
})

describe("core.getRange()", () => {
  test("works in positive direction", () => {
    expect(core.getRange(1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })
  test("works in negative direction", () => {
    expect(core.getRange(10, 1)).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
  })
  test("works for a ingle number", () => {
    expect(core.getRange(1, 1)).toEqual([1])
  })
})

describe("core.countTo()", () => {
  test("counts from 1 to `count`, once per time round a `repeat` loop", () => {
    expect(core.countTo(3)).toEqual([1, 2, 3])
    expect(core.countTo(1)).toEqual([1])
  })
  test("is empty for a `count` under 1 -- NOT counting down, as `getRange()` would", () => {
    expect(core.countTo(0)).toEqual([])
    expect(core.countTo(-2)).toEqual([])
  })
})
