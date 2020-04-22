/** Test decorators */

import { proto, readonly, writeOnce, nonEnumerable, overrideable, memoize, memoizeForProp } from "./decorators"

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
      expect(hasOwnProp(Thing.prototype, "string")).toBe(true)
      expect(Thing.prototype.string).toBe("proto value")
    })

    test("is available to instances, but not defined there", () => {
      const thing = new Thing()
      expect(hasOwnProp(thing, "string")).toBe(false)
      expect(thing.string).toBe("proto value")
    })

    test("can be overridden on instances", () => {
      const thing = new Thing()
      thing.string = "other string"
      expect(Thing.prototype.string).toBe("proto value")
      expect(hasOwnProp(thing, "string")).toBe(true)
      expect(thing.string).toBe("other string")
    })
  })

  describe("object property", () => {
    test("sets expected value on prototype", () => {
      expect(hasOwnProp(Thing.prototype, "object")).toBe(true)
      expect(Thing.prototype.object).toBe(originalObject)
    })

    test("is available to instances, but not defined there", () => {
      const thing = new Thing()
      expect(hasOwnProp(thing, "object")).toBe(false)
      expect(thing.object).toBe(originalObject)
    })

    test("can be overridden on instances", () => {
      const otherObject = {}
      const thing = new Thing()
      thing.object = otherObject
      expect(Thing.prototype.object).toBe(originalObject)
      expect(hasOwnProp(thing, "object")).toBe(true)
      expect(thing.object).toBe(otherObject)
    })

    test("updating instance value updates original object", () => {
      const thing = new Thing()
      thing.object.foo = "bar"
      expect(originalObject.foo).toBe("bar")
      expect(Thing.prototype.object.foo).toBe("bar")
      expect(thing.object.foo).toBe("bar")
    })
  })
})

describe("@readonly", () => {
  class Thing {
    @readonly prop = "original value"
  }
  test("sets expected value on new instance", () => {
    const thing = new Thing()
    expect(hasOwnProp(thing, "prop")).toBe(true)
    expect(thing.prop).toBe("original value")
  })

  test("is resistant to changes", () => {
    const thing = new Thing()
    expect(() => {
      thing.prop = "other value"
    }).toThrow()
  })

  test("delete throws", () => {
    const thing = new Thing()
    expect(() => {
      delete thing.prop
    }).toThrow()
  })
})

describe("@writeOnce", () => {
  class Thing {
    @writeOnce prop
    constructor(value) {
      if (arguments.length > 0) this.prop = value
    }
  }
  describe("during construction", () => {
    test("value can be set", () => {
      const thing = new Thing("original value")
      expect(hasOwnProp(thing, "prop")).toBe(true)
      expect(thing.prop).toBe("original value")
    })

    test("value is resistant to changes", () => {
      const thing = new Thing("original value")
      expect(() => {
        thing.prop = "other value"
      }).toThrow()
    })

    test("delete has no effect if never set", () => {
      const thing = new Thing()
      delete thing.prop
      expect(hasOwnProp(thing, "prop")).toBe(false)
      expect(thing.prop).toBe(undefined)
    })

    test("delete throws after set", () => {
      const thing = new Thing("original value")
      expect(() => {
        delete thing.prop
      }).toThrow()
    })
  })

  describe("after construction", () => {
    test("value can be set", () => {
      const thing = new Thing()
      thing.prop = "original value"
      expect(hasOwnProp(thing, "prop")).toBe(true)
      expect(thing.prop).toBe("original value")
    })

    test("value is resistant to changes", () => {
      const thing = new Thing()
      thing.prop = "original value"
      expect(() => {
        thing.prop = "other value"
      }).toThrow()
    })

    test("delete throws after set", () => {
      const thing = new Thing()
      thing.prop = "original value"
      expect(() => {
        delete thing.prop
      }).toThrow()
    })
  })
})

describe("@nonEnumerable", () => {
  class Thing {
    @nonEnumerable string = "original value"
  }
  test("can be accessed on instance", () => {
    const thing = new Thing()
    expect(thing.string).toBe("original value")
  })

  test("is not in Object.keys()", () => {
    const thing = new Thing()
    const keys = Object.keys(thing)
    expect(keys.length).toBe(0)
  })

  test("is not accessed in for..in", () => {
    const thing = new Thing()
    const keys = Object.keys(thing)
    expect(keys.length).toBe(0)
  })
})

describe("@overrideable", () => {
  class Thing {
    @overrideable get getter() {
      return "original getter"
    }
    @overrideable get getset() {
      return "original getset"
    }
  }
  test("is set up correctly", () => {
    const descriptor = Object.getOwnPropertyDescriptor(Thing.prototype, "getter")
    expect(descriptor.set).toBeInstanceOf(Function)
    expect(descriptor.get).toBeInstanceOf(Function)
  })
  test("returns original value on instance", () => {
    const thing = new Thing()
    expect(thing.getter).toBe("original getter")
  })
  test("sets new value on instance", () => {
    const thing = new Thing()
    thing.getter = "new getter"
    expect(hasOwnProp(thing, "getter")).toBe(true)
    expect(thing.getter).toBe("new getter")
  })
  test("delete instance prop has no effect before set", () => {
    const thing = new Thing()
    delete thing.getter
    expect(hasOwnProp(thing, "getter")).toBe(false)
    expect(thing.getter).toBe("original getter")
  })
  test("delete instance prop works after set", () => {
    const thing = new Thing()
    thing.getter = "new getter"
    delete thing.getter
    expect(hasOwnProp(thing, "getter")).toBe(false)
    expect(thing.getter).toBe("original getter")
  })
  test("set instance prop to undefined does not restore getter", () => {
    const thing = new Thing()
    thing.getter = "new getter"
    thing.getter = undefined
    expect(hasOwnProp(thing, "getter")).toBe(true)
    expect(thing.getter).toBe(undefined)
  })
})

describe("@memoize", () => {
  class Thing {
    value = 0
    // normal getter w/o setter, to verify set/delete behavior
    get normal() {
      return {}
    }

    // getter only
    @memoize get getter() {
      return {}
    }

    // getter with setter
    @memoize get getset() {
      return {}
    }
    set getset(spy) {
      spy()
    }
  }

  // Make sure we understand the behavior of a getter w/o a setter
  describe("non-memoized getter only", () => {
    test("returns a different value when called multiple times", () => {
      const thing = new Thing()
      expect(thing.normal).not.toBe(thing.normal)
    })
    test("throws on set", () => {
      const thing = new Thing()
      expect(() => {
        thing.normal = "new value"
      }).toThrow()
    })
    test("delete has no effect", () => {
      const thing = new Thing()
      delete thing.normal
      expect(thing.normal).toBeInstanceOf(Object)
    })
  })

  describe("memoized getter only", () => {
    test("is set up correctly on prototype", () => {
      const descriptor = Object.getOwnPropertyDescriptor(Thing.prototype, "getter")
      expect(descriptor.get).toBeInstanceOf(Function)
      expect(descriptor.set).toBe(undefined)
    })
    test("instance does not have override property before get", () => {
      const thing = new Thing()
      expect(hasOwnProp(thing, "getter")).toBe(false)
    })
    test("assigns unique instance value when called the first time", () => {
      const thing = new Thing()
      const value = thing.getter
      expect(value).toBeInstanceOf(Object)
      expect(hasOwnProp(thing, "getter")).toBe(true)
    })
    test("returns consistent value when called multiple times", () => {
      const thing = new Thing()
      expect(thing.getter).toBe(thing.getter)
    })
    test("returns different values for different instances", () => {
      const value1 = new Thing().getter
      const value2 = new Thing().getter
      expect(value1).not.toBe(value2)
    })
    test("throws on set", () => {
      const thing = new Thing()
      expect(() => {
        thing.getter = "no way jose"
      }).toThrow()
    })
    test("delete has no effect before initial get", () => {
      const thing = new Thing()
      delete thing.getter
      expect(hasOwnProp(thing, "getter")).toBe(false)
      expect(thing.getter).toBeInstanceOf(Object)
    })
    test("delete clears memoized value and returns new value on next access", () => {
      const thing = new Thing()
      const value1 = thing.getter
      delete thing.getter
      expect(hasOwnProp(thing, "getter")).toBe(false)
      expect(value1).not.toBe(thing.getter)
    })
  })

  describe("getter and setter", () => {
    test("is set up correctly on prototype", () => {
      const descriptor = Object.getOwnPropertyDescriptor(Thing.prototype, "getset")
      expect(descriptor.get).toBeInstanceOf(Function)
      expect(descriptor.set).toBeInstanceOf(Function)
    })
    test("instance does not have override property before get", () => {
      const thing = new Thing()
      expect(hasOwnProp(thing, "getset")).toBe(false)
    })
    test("assigns unique instance value when called the first time", () => {
      const thing = new Thing()
      const value = thing.getset
      expect(value).toBeInstanceOf(Object)
      expect(hasOwnProp(thing, "getset")).toBe(true)
    })
    test("returns consistent value when called multiple times", () => {
      const thing = new Thing()
      expect(thing.getset).toBe(thing.getset)
    })
    test("returns different values for different instances", () => {
      const value1 = new Thing().getset
      const value2 = new Thing().getset
      expect(value1).not.toBe(value2)
    })
    test("set is called before initial access", () => {
      const spy = jest.fn()
      const thing = new Thing()
      thing.getset = spy
      expect(spy).toHaveBeenCalled()
      expect(hasOwnProp(thing, "getset")).toBe(false)
    })
    test("set is called and clears memoized value when called after initial access", () => {
      const spy = jest.fn()
      const thing = new Thing()
      const value1 = thing.getset
      expect(hasOwnProp(thing, "getset")).toBe(true)
      thing.getset = spy
      expect(spy).toHaveBeenCalled()
      expect(hasOwnProp(thing, "getset")).toBe(false)
      expect(thing.getset).not.toBe(value1)
    })
    test("delete has no effect before initial get", () => {
      const thing = new Thing()
      delete thing.getset
      expect(hasOwnProp(thing, "getset")).toBe(false)
      expect(thing.getset).toBeInstanceOf(Object)
    })
    test("delete clears memoized value and returns new value on next access", () => {
      const thing = new Thing()
      const value1 = thing.getset
      delete thing.getset
      expect(hasOwnProp(thing, "getset")).toBe(false)
      expect(value1).not.toBe(thing.getset)
    })
    test("delete then set works properly", () => {
      const spy = jest.fn()
      const thing = new Thing()
      delete thing.getset
      thing.getset = spy
      expect(spy).toHaveBeenCalled()
      expect(hasOwnProp(thing, "getset")).toBe(false)
    })
    test("access then delete then set works properly", () => {
      const spy = jest.fn()
      const thing = new Thing()
      const value1 = thing.getset
      delete thing.getset
      thing.getset = spy
      expect(spy).toHaveBeenCalled()
      expect(hasOwnProp(thing, "getset")).toBe(false)
      expect(value1).not.toBe(thing.getset)
    })
  })
})

describe("@memoizeForProp", () => {
  class Thing {
    // pre-existing prop
    preexisting = 1
    @memoizeForProp("preexisting") get preGetter() {
      return {}
    }

    // expando prop
    @memoizeForProp("expando") get expandoGetter() {
      return {}
    }
  }

  describe("setup", () => {
    test("is set up correctly on prototype", () => {
      const descriptor = Object.getOwnPropertyDescriptor(Thing.prototype, "preGetter")
      expect(descriptor.get).toBeInstanceOf(Function)
      expect(descriptor.set).toBe(undefined)
    })
    test("throws on set", () => {
      const thing = new Thing()
      expect(() => {
        thing.preGetter = "no way jose"
      }).toThrow()
    })
    test("delete has no effect before initial get", () => {
      const thing = new Thing()
      delete thing.preGetter
      expect(hasOwnProp(thing, "preGetter")).toBe(false)
      expect(thing.preGetter).toBeInstanceOf(Object)
    })
    test("delete has no effect after access", () => {
      const thing = new Thing()
      const value1 = thing.preGetter
      delete thing.preGetter
      expect(hasOwnProp(thing, "preGetter")).toBe(false)
      expect(value1).toBe(thing.preGetter)
    })
  })
  describe("for preexisting prop", () => {
    describe("without changing source prop", () => {
      test("assigns unique instance value when called the first time", () => {
        const thing = new Thing()
        const value = thing.preGetter
        expect(value).toBeInstanceOf(Object)
        expect(hasOwnProp(thing, "preGetter")).toBe(false)
      })
      test("returns consistent value when called multiple times", () => {
        const thing = new Thing()
        expect(thing.preGetter).toBe(thing.preGetter)
      })
      test("returns different values for different instances", () => {
        const value1 = new Thing().preGetter
        const value2 = new Thing().preGetter
        expect(value1).not.toBe(value2)
      })
    })
    describe("when changing source prop", () => {
      test("returns new value when source prop changed", () => {
        const thing = new Thing()
        const value1 = thing.preGetter
        thing.preexisting = 2
        const value2 = thing.preGetter
        expect(value1).not.toBe(value2)
      })
      test("returns consistent value again after source prop change", () => {
        const thing = new Thing()
        thing.preexisting = 2
        expect(thing.preGetter).toBe(thing.preGetter)
      })
      test("returns new value when source prop deleted", () => {
        const thing = new Thing()
        const value1 = thing.preGetter
        delete thing.preexisting
        const value2 = thing.preGetter
        expect(value1).not.toBe(value2)
      })
    })
  })
  describe("for expando prop", () => {
    describe("without changing source prop", () => {
      test("assigns unique instance value when called the first time", () => {
        const thing = new Thing()
        const value = thing.expandoGetter
        expect(value).toBeInstanceOf(Object)
        expect(hasOwnProp(thing, "expandoGetter")).toBe(false)
      })
      test("returns consistent value when called multiple times", () => {
        const thing = new Thing()
        expect(thing.expandoGetter).toBe(thing.expandoGetter)
      })
      test("returns different values for different instances", () => {
        const value1 = new Thing().expandoGetter
        const value2 = new Thing().expandoGetter
        expect(value1).not.toBe(value2)
      })
    })
    describe("when changing source prop", () => {
      test("returns new value when source prop changed", () => {
        const thing = new Thing()
        const value1 = thing.expandoGetter
        thing.expando = 2
        const value2 = thing.expandoGetter
        expect(value1).not.toBe(value2)
      })
      test("returns consistent value again after source prop change", () => {
        const thing = new Thing()
        thing.expando = 2
        expect(thing.expandoGetter).toBe(thing.expandoGetter)
      })
      test("returns new value when source prop deleted", () => {
        const thing = new Thing()
        const value1 = thing.expandoGetter
        expect(value1).toBeInstanceOf(Object)
        thing.expando = 1
        const value2 = thing.expandoGetter
        expect(value2).toBeInstanceOf(Object)
        expect(value1).not.toBe(value2)
        delete thing.expando
        const value3 = thing.expandoGetter
        expect(value3).toBeInstanceOf(Object)
        expect(value2).not.toBe(value1)
        expect(value2).not.toBe(value3)
      })
    })
  })
})
