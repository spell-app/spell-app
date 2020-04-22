/** Test decorators */

import { proto, readonly, nonEnumerable } from "./decorators"

/** Safe "hasOwnProperty" you can apply to a random `thing`. */
function hasOwnProp(thing, key) {
  return Object.prototype.hasOwnProperty.call(thing, key)
}

describe("@proto", () => {
  const originalObject = {}
  class Thing {
    @proto string = "proto value"
    @proto object = originalObject
  }
  describe("string property", () => {
    test("sets expected value on prototype", () => {
      expect(hasOwnProp(Thing.prototype, "string"))
      expect(Thing.prototype.string).toBe("proto value")
    })

    test("is available to instances, but not defined there", () => {
      const it = new Thing()
      expect(hasOwnProp(it, "string")).toBe(false)
      expect(it.string).toBe("proto value")
    })

    test("can be overridden on instances", () => {
      const it = new Thing()
      it.string = "other string"
      expect(Thing.prototype.string).toBe("proto value")
      expect(hasOwnProp(it, "string")).toBe(true)
      expect(it.string).toBe("other string")
    })
  })

  describe("object property", () => {
    test("sets expected value on prototype", () => {
      expect(hasOwnProp(Thing.prototype, "object"))
      expect(Thing.prototype.object).toBe(originalObject)
    })

    test("is available to instances, but not defined there", () => {
      const it = new Thing()
      expect(hasOwnProp(it, "object")).toBe(false)
      expect(it.object).toBe(originalObject)
    })

    test("can be overridden on instances", () => {
      const otherObject = {}
      const it = new Thing()
      it.object = otherObject
      expect(Thing.prototype.object).toBe(originalObject)
      expect(hasOwnProp(it, "object")).toBe(true)
      expect(it.object).toBe(otherObject)
    })

    test("updating instance value updates original object", () => {
      const it = new Thing()
      it.object.foo = "bar"
      expect(originalObject.foo).toBe("bar")
      expect(Thing.prototype.object.foo).toBe("bar")
      expect(it.object.foo).toBe("bar")
    })
  })
})

describe("@readonly", () => {
  class Thing {
    @readonly string = "original value"
  }
  test("sets expected value on new instance", () => {
    const it = new Thing()
    expect(hasOwnProp(it, "string"))
    expect(it.string).toBe("original value")
  })

  test("is resistant to changes", () => {
    const it = new Thing()
    expect(() => {
      it.string = "other value"
    }).toThrow()
  })
})

describe("@nonEnumerable", () => {
  class Thing {
    @nonEnumerable string = "original value"
  }
  test("can be accessed on instance", () => {
    const it = new Thing()
    expect(it.string).toBe("original value")
  })

  test("is not in Object.keys()", () => {
    const it = new Thing()
    const keys = Object.keys(it)
    expect(keys.length).toBe(0)
  })
})
