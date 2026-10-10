import { describe, expect, it } from "vite-plus/test"

import { forget, lazy, once, proto, protoMerged } from "./decorators"

/**
 * Proves standard decorators are lowered (`vite.decorators.ts`) and `@proto` / `@protoMerged` / `@lazy` / `@once`
 * work in the browser.
 * - If lowering breaks, this FILE fails to load with a bare `SyntaxError`, rather than a test failing.
 */

/** Base class declaring the fields `@proto static` may set. */
class Base {
  declare size: string
  declare parts: readonly string[]

  static defined: Array<[string | symbol, unknown]> = []
  static protoDefined(name: string | symbol, value: unknown) {
    Base.defined.push([name, value])
  }
}

class Sized extends Base {
  @proto static size = "medium"
  @proto static parts = ["header", "content"] as const
}

class Big extends Sized {
  @proto static size = "big"
}

describe("@proto static", () => {
  it("puts the value on the prototype", () => {
    expect(new Sized().size).toBe("medium")
    expect(Object.hasOwn(Sized.prototype, "size")).toBe(true)
  })

  it("keeps it off instances", () => {
    const sized = new Sized()
    expect(Object.hasOwn(sized, "size")).toBe(false)
    expect(Object.keys(sized)).toEqual([])
  })

  it("is non-enumerable on the prototype", () => {
    expect(Object.keys(Sized.prototype)).toEqual([])
  })

  it("shares one value across instances", () => {
    expect(new Sized().parts).toBe(new Sized().parts)
  })

  it("is inherited and overridable by subclasses", () => {
    expect(new Big().size).toBe("big")
    expect(new Big().parts).toEqual(["header", "content"])
    expect(new Sized().size).toBe("medium")
  })

  it("lets instances shadow the default", () => {
    const sized = new Sized()
    sized.size = "small"
    expect(sized.size).toBe("small")
    expect(new Sized().size).toBe("medium")
  })

  it("calls `protoDefined()` as each class is defined", () => {
    expect(Base.defined).toEqual([
      ["size", "medium"],
      ["parts", ["header", "content"]],
      ["size", "big"]
    ])
  })

  it("keeps class names (esbuild `keepNames`)", () => {
    expect(Sized.name).toBe("Sized")
    expect(Big.name).toBe("Big")
  })

  it("throws on a non-static field", () => {
    expect(() => {
      class Wrong extends Base {
        // @ts-expect-error -- `@proto` is typed for static fields only
        @proto size = "tiny"
      }
      return new Wrong()
    }).toThrow(/only works on 'static' fields/)
  })
})

/** Settings for `@protoMerged`:  keys that add up down the class chain. */
type Setup = { color: string; shape: string; parts: Record<string, string> }

/** Base class declaring the merged field. */
class Setting {
  declare setup: Setup
  @protoMerged static setup: Partial<Setup> = { color: "red", shape: "round", parts: { a: "A" } }
}

class Blue extends Setting {
  @protoMerged static setup: Partial<Setup> = { color: "blue" }
}

class Plain extends Blue {}

class BlueSquare extends Plain {
  @protoMerged static setup = { shape: "square", parts: { b: "B" } } satisfies Partial<Setup>
}

/** `setup`'s keys read by name, as code reads them:  through the prototype chain. */
function keysOf({ color, shape, parts }: Setup) {
  return { color, shape, parts }
}

describe("@protoMerged static", () => {
  it("puts this class's object on the prototype, the parent's object chained under it", () => {
    expect(keysOf(new Blue().setup)).toEqual({ color: "blue", shape: "round", parts: { a: "A" } })
    expect(Object.hasOwn(Blue.prototype, "setup")).toBe(true)
    expect(Object.getPrototypeOf(Blue.prototype.setup)).toBe(Setting.prototype.setup)
  })

  it("copies nothing:  the static and the prototype's are ONE object, holding only what the class stated", () => {
    expect(Blue.prototype.setup).toBe(Blue.setup)
    expect(Blue.setup).toEqual({ color: "blue" })
  })

  it("inherits the parent's object when a class states none", () => {
    expect(new Plain().setup).toBe(new Blue().setup)
  })

  it("a stated key replaces the parent's whole", () => {
    expect(keysOf(new BlueSquare().setup)).toEqual({ color: "blue", shape: "square", parts: { b: "B" } })
  })

  it("leaves the parent's value alone", () => {
    expect(keysOf(new Setting().setup)).toEqual({ color: "red", shape: "round", parts: { a: "A" } })
  })

  it("is non-enumerable on the prototype", () => {
    expect(Object.keys(Blue.prototype)).toEqual([])
  })

  it("throws on a non-static field", () => {
    expect(() => {
      class Wrong extends Setting {
        // @ts-expect-error -- `@protoMerged` is typed for static fields only
        @protoMerged setup = { color: "green" }
      }
      return new Wrong()
    }).toThrow(/@protoMerged setup: only works on 'static' fields/)
  })
})

/** Counts how often each `@lazy` / `@once` member really runs. */
class Counted {
  made = 0
  ran = 0
  static loads = 0

  @lazy get parts() {
    this.made++
    return ["header", "content"]
  }

  @lazy get nothing() {
    this.made++
    return undefined
  }

  @once start() {
    this.ran++
    return { started: this.ran }
  }

  @once static load() {
    Counted.loads++
    return Promise.resolve(Counted.loads)
  }
}

describe("@lazy get", () => {
  it("makes the value on first read, then keeps it", () => {
    const counted = new Counted()
    expect(counted.made).toBe(0)
    const parts = counted.parts
    expect(counted.parts).toBe(parts)
    expect(counted.made).toBe(1)
  })

  it("keeps one value PER INSTANCE", () => {
    expect(new Counted().parts).not.toBe(new Counted().parts)
  })

  it("keeps `undefined` too", () => {
    const counted = new Counted()
    expect(counted.nothing).toBeUndefined()
    expect(counted.nothing).toBeUndefined()
    expect(counted.made).toBe(1)
  })

  it("keeps nothing when the getter throws:  the next read tries again", () => {
    let fails = true
    class Flaky {
      @lazy get value() {
        if (fails) throw new Error("not yet")
        return "made"
      }
    }
    const flaky = new Flaky()
    expect(() => flaky.value).toThrow("not yet")
    fails = false
    expect(flaky.value).toBe("made")
  })

  it("makes it anew after `forget()`", () => {
    const counted = new Counted()
    const parts = counted.parts
    forget(counted, "parts")
    expect(counted.parts).not.toBe(parts)
    expect(counted.made).toBe(2)
  })

  it("throws on a method", () => {
    expect(() => {
      class Wrong {
        // @ts-expect-error -- `@lazy` is typed for getters only
        @lazy value() {
          return 1
        }
      }
      return new Wrong()
    }).toThrow(/@lazy value: only works on getters/)
  })
})

describe("@once", () => {
  it("runs the method once and returns the same result after", () => {
    const counted = new Counted()
    const first = counted.start()
    expect(counted.start()).toBe(first)
    expect(counted.ran).toBe(1)
  })

  it("runs once PER INSTANCE", () => {
    const one = new Counted()
    const two = new Counted()
    one.start()
    two.start()
    expect([one.ran, two.ran]).toEqual([1, 1])
  })

  it("on a static, keeps ONE result for the class:  e.g. a loader's promise", async () => {
    const loading = Counted.load()
    expect(Counted.load()).toBe(loading)
    expect(await loading).toBe(1)
    expect(Counted.loads).toBe(1)
  })

  it("runs again after `forget()`", async () => {
    const loading = Counted.load()
    forget(Counted, "load")
    const again = Counted.load()
    expect(again).not.toBe(loading)
    expect(await again).toBe(2)
  })

  it("throws on a getter", () => {
    expect(() => {
      class Wrong {
        // @ts-expect-error -- `@once` is typed for methods only
        @once get value() {
          return 1
        }
      }
      return new Wrong()
    }).toThrow(/@once value: only works on methods/)
  })
})
