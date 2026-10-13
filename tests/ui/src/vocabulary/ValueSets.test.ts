import { describe, expect, test } from "vite-plus/test"

import { ValueSets } from "$/ui/vocabulary"

////////////////
// ## The sets
////////////////

describe("ValueSets.hues / sizes ...", () => {
  test("has shared sets on the prototype and the class", () => {
    expect(ValueSets.hues).toContain("red")
    expect(new ValueSets().sizes).toBe(ValueSets.sizes)
    expect(Object.hasOwn(ValueSets.prototype, "hues")).toBe(true)
  })
})

describe("ValueSets.setFor()", () => {
  test("picks the value set for an attribute's kind", () => {
    expect(ValueSets.setFor({ name: "color", kind: "color", description: "" })).toBe("hues")
    expect(ValueSets.setFor({ name: "x", kind: "enum", values: ["a"], description: "" })).toEqual(["a"])
    expect(ValueSets.setFor({ name: "x", kind: "string", description: "" })).toBeUndefined()
  })
})

describe("ValueSets.add()", () => {
  test("adds values to a shared set", () => {
    const before = ValueSets.get("floats")
    try {
      ValueSets.add("floats", "center", "left")
      expect(ValueSets.get("floats")).toEqual(["left", "right", "center"])
      expect(ValueSets.has("floats", "center")).toBe(true)
      expect(ValueSets.floats).toEqual(["left", "right", "center"])
    } finally {
      Object.defineProperty(ValueSets.prototype, "floats", { value: before, writable: true, configurable: true })
      ;(ValueSets as unknown as Record<string, unknown>).floats = before
    }
  })
})

////////////////
// ## Lookups
////////////////

describe("ValueSets.has()", () => {
  test("checks membership", () => {
    expect(ValueSets.has("sizes", "medium")).toBe(true)
    expect(ValueSets.has("sizes", "Medium")).toBe(false)
    expect(ValueSets.has("devices", "large screen")).toBe(true)
    expect(ValueSets.has(["a", "b"], "b")).toBe(true)
  })
})

describe("ValueSets.suggest()", () => {
  test("suggests the nearest value", () => {
    expect(ValueSets.suggest("sizes", "smal")).toBe("small")
    expect(ValueSets.suggest("positions", "top lft")).toBe("top left")
  })
})

describe("ValueSets.columns()", () => {
  test("parses widths into columns", () => {
    expect(ValueSets.columns(4)).toBe(4)
    expect(ValueSets.columns("4")).toBe(4)
    expect(ValueSets.columns("four")).toBe(4)
    expect(ValueSets.columns("1/4")).toBe(4)
    expect(ValueSets.columns("3/4")).toBe(12)
    expect(ValueSets.columns("25%")).toBe(4)
    expect(ValueSets.columns("1/3")).toBeCloseTo(5.333, 3)
    expect(ValueSets.columns("0")).toBeUndefined()
    expect(ValueSets.columns("2/1")).toBeUndefined()
    expect(ValueSets.columns("wide")).toBeUndefined()
  })
})
