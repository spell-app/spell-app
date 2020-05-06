import { assert } from "./assert"

beforeEach(() => {
  assert.failed = jest.fn()
})

describe("assert()", () => {
  describe("when condition is true", () => {
    test("returns true", () => {
      const result = assert(true)
      expect(result).toBe(true)
    })
    test("does not call assert.failed", () => {
      assert(true)
      expect(assert.failed).not.toHaveBeenCalled()
    })
  })

  describe("when condition is false", () => {
    test("returns false", () => {
      const result = assert(false)
      expect(result).toBe(false)
    })
    test("calls assert.failed with arguments", () => {
      assert(false, "foo", "bar", "baz")
      expect(assert.failed).toHaveBeenCalledTimes(1)
      expect(assert.failed).toHaveBeenCalledWith(["foo", "bar", "baz"])
    })
  })
})

describe("assert.equals()", () => {
  describe("returns true for", () => {
    test("matching strings", () => {
      const result = assert.equals("a", "a")
      expect(result).toBe(true)
    })
    test("matching numbers", () => {
      const result = assert.equals(1, 1)
      expect(result).toBe(true)
    })
    test("empty objects", () => {
      const result = assert.equals({}, {})
      expect(result).toBe(true)
    })
    test("nested objects", () => {
      const result = assert.equals({ a: 1, b: { c: true } }, { a: 1, b: { c: true } })
      expect(result).toBe(true)
    })
    test("empty arrays", () => {
      const result = assert.equals([], [])
      expect(result).toBe(true)
    })
    test("non-empty arrays", () => {
      const result = assert.equals([1, 2, 3], [1, 2, 3])
      expect(result).toBe(true)
    })
  })

  describe("returns false for", () => {
    test("mismatched strings", () => {
      const result = assert.equals("a", "b")
      expect(result).toBe(false)
    })
    test("mismatched numbers", () => {
      const result = assert.equals(1, 2)
      expect(result).toBe(false)
    })
    test("mismatched objects", () => {
      const result = assert.equals({ a: 1, b: { c: true } }, { a: 1, b: { c: false } })
      expect(result).toBe(false)
    })
    test("mismatched arrays", () => {
      const result = assert.equals([1, 2, 3], [1, 2, 4])
      expect(result).toBe(false)
    })
  })
})

describe("assert.isDefined()", () => {
  describe("returns false for", () => {
    test("undefined", () => {
      expect(assert.isDefined(undefined)).toBe(false)
    })
    test("null", () => {
      expect(assert.isDefined(null)).toBe(false)
    })
    test("NaN", () => {
      expect(assert.isDefined(parseInt("foo", 10))).toBe(false)
    })
  })
  describe("returns true for", () => {
    test("false", () => {
      expect(assert.isDefined(false)).toBe(true)
    })
    test("true", () => {
      expect(assert.isDefined(true)).toBe(true)
    })
    test("0", () => {
      expect(assert.isDefined(0)).toBe(true)
    })
    test("another number", () => {
      expect(assert.isDefined(1)).toBe(true)
    })
    test("a string", () => {
      expect(assert.isDefined("foo")).toBe(true)
    })
    test("en empty object", () => {
      expect(assert.isDefined({})).toBe(true)
    })
    test("an empty array", () => {
      expect(assert.isDefined([])).toBe(true)
    })
  })
  describe("sends message to assert.failed() correctly", () => {
    test("when method and message are empty", () => {
      assert.isDefined(null)
      expect(assert.failed).toHaveBeenCalledWith(["", "expected defined thing, got: ", null])
    })
    test("when method is specified and message is empty", () => {
      assert.isDefined(null, "method")
      expect(assert.failed).toHaveBeenCalledWith(["method", "expected defined thing, got: ", null])
    })
    test("when method and message are specified", () => {
      assert.isDefined(null, "method", "foo")
      expect(assert.failed).toHaveBeenCalledWith(["method", "foo"])
    })
  })
})

describe("assert.isArrayLike()", () => {
  describe("returns true for", () => {
    test("an empty array", () => {
      expect(assert.isArrayLike([])).toBe(true)
    })
    test("a non-empty array", () => {
      expect(assert.isArrayLike([1, 2, 3])).toBe(true)
    })
    test("function arguments", function(...args) {
      expect(assert.isArrayLike(args)).toBe(true)
    })
    test("an object with a numeric `length` property", () => {
      expect(assert.isArrayLike({ length: 1 })).toBe(true)
    })
  })
  describe("returns false for", () => {
    test("null", () => {
      expect(assert.isArrayLike(null)).toBe(false)
    })
    test("undefined", () => {
      expect(assert.isArrayLike(undefined)).toBe(false)
    })
    test("an empty object", () => {
      expect(assert.isArrayLike({})).toBe(false)
    })
    test("a non-empty object", () => {
      expect(assert.isArrayLike({ a: 1 })).toBe(false)
    })
  })
  describe("sends message to assert.failed() correctly", () => {
    test("when method and message are empty", () => {
      assert.isArrayLike(null)
      expect(assert.failed).toHaveBeenCalledWith(["", "expected an array-like thing, got: ", null])
    })
    test("when method is defined and message is empty", () => {
      assert.isArrayLike(null, "method")
      expect(assert.failed).toHaveBeenCalledWith(["method", "expected an array-like thing, got: ", null])
    })
    test("when method and message are specified", () => {
      assert.isArrayLike(null, "method", "foo")
      expect(assert.failed).toHaveBeenCalledWith(["method", "foo"])
    })
  })
})
