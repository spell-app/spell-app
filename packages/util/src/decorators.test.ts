import { describe, expect, it } from "vite-plus/test"

import { proto, protoMerged } from "./decorators"

/**
 * Proves standard decorators are lowered (`vite.decorators.ts`) and `@proto` / `@protoMerged` work in the browser.
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

describe("@protoMerged static", () => {
  it("puts the parent's value merged with this class's on the prototype", () => {
    expect(new Blue().setup).toEqual({ color: "blue", shape: "round", parts: { a: "A" } })
    expect(Object.hasOwn(Blue.prototype, "setup")).toBe(true)
  })

  it("inherits the parent's merged value when a class states none", () => {
    expect(new Plain().setup).toBe(new Blue().setup)
  })

  it("merges shallowly:  a stated key replaces the parent's whole", () => {
    expect(new BlueSquare().setup).toEqual({ color: "blue", shape: "square", parts: { b: "B" } })
  })

  it("leaves the parent's value alone", () => {
    expect(new Setting().setup).toEqual({ color: "red", shape: "round", parts: { a: "A" } })
  })

  it("keeps only what the class stated on the static", () => {
    expect(Blue.setup).toEqual({ color: "blue" })
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
