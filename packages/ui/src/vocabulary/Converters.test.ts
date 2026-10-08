import { afterEach, describe, expect, it, vi } from "vite-plus/test"

import { Converters } from "$/ui/vocabulary"

afterEach(() => {
  vi.restoreAllMocks()
})

////////////////
// ## Booleans and variations
////////////////

describe("Converters.boolean()", () => {
  it.each([
    [null, false],
    [undefined, false],
    ["", true],
    ["true", true],
    ["TRUE", true],
    ["yes", true],
    ["Yes", true],
    ["disabled", true],
    ["on", true],
    ["false", false],
    ["FALSE", false],
    ["no", false],
    ["0", false],
    [" false ", false],
    [true, true],
    [false, false]
  ])("%j => %j", (value, expected) => {
    expect(Converters.boolean(value, "disabled")).toBe(expected)
  })

  it("treats Vue's stringified false as false", () => {
    // Vue sets `open="false"` when it can't find an `open` property on the element.
    expect(Converters.boolean("false", "open")).toBe(false)
  })
})

describe("Converters.booleanToAttribute()", () => {
  it("reflects true as empty and false as removal", () => {
    expect(Converters.booleanToAttribute(true)).toBe("")
    expect(Converters.booleanToAttribute(false)).toBeNull()
    expect(Converters.booleanToAttribute(undefined)).toBeNull()
  })
})

describe("Converters.keyOrValue()", () => {
  it("is true when bare, false when absent or false, else the value", () => {
    expect(Converters.keyOrValue("", "floats", { attribute: "pointing" })).toBe(true)
    expect(Converters.keyOrValue("pointing", "floats", { attribute: "pointing" })).toBe(true)
    expect(Converters.keyOrValue(null, "floats")).toBe(false)
    expect(Converters.keyOrValue("no", "floats")).toBe(false)
    expect(Converters.keyOrValue("Left", "floats")).toBe("left")
    expect(Converters.keyOrValue(true, "floats")).toBe(true)
  })

  it("falls back to the bare variation for an unknown value", () => {
    const warn = spyWarn()
    expect(Converters.keyOrValue("lfet", "floats", { attribute: "pointing" })).toBe(true)
    expect(warn).toHaveBeenCalledOnce()
  })
})

describe("Converters.icon()", () => {
  it.each([
    // [value, fallback, expected]
    ["star", undefined, "star"],
    [" star ", undefined, "star"],
    ["", undefined, ""],
    ["true", undefined, ""],
    ["Yes", undefined, ""],
    [true, undefined, ""],
    ["", "circle-play", "circle-play"],
    ["true", "circle-play", "circle-play"],
    ["false", "circle-play", undefined],
    ["no", undefined, undefined],
    [false, "circle-play", undefined],
    [null, undefined, undefined],
    // a Font Awesome glyph, not a false word
    ["0", undefined, "0"]
  ] as const)("%j (default %j) => %j", (value, fallback, expected) => {
    expect(Converters.icon(value, fallback)).toBe(expected)
  })
})

////////////////
// ## Enums
////////////////

describe("Converters.enumValue()", () => {
  it("returns canonical values, normalized", () => {
    expect(Converters.enumValue("red", "hues")).toBe("red")
    expect(Converters.enumValue(" RED ", "hues")).toBe("red")
    expect(Converters.enumValue("top   left", "positions")).toBe("top left")
    expect(Converters.enumValue("fade", ["fade", "vertical"])).toBe("fade")
    expect(Converters.enumValue(null, "hues")).toBeUndefined()
  })

  it("warns with a suggestion for a near miss", () => {
    const warn = spyWarn()
    expect(Converters.enumValue("gray", "hues", { tag: "ui-button", attribute: "color" })).toBeUndefined()
    expect(warn).toHaveBeenCalledWith('[@spell-app/ui] <ui-button color>:  unknown value "gray";  did you mean "grey"?')
  })

  it("warns without a suggestion when nothing is close", () => {
    const warn = spyWarn()
    expect(Converters.enumValue("magenta", "hues", { attribute: "color" })).toBeUndefined()
    expect(warn).toHaveBeenCalledWith('[@spell-app/ui] color:  unknown value "magenta"')
  })

  it("accepts every width form", () => {
    for (const width of ["4", "four", "1/4", "25%", "16", "100%"]) {
      expect(Converters.enumValue(width, "widths")).toBe(width.toLowerCase())
    }
  })

  it("rejects out-of-range widths", () => {
    const warn = spyWarn()
    expect(Converters.enumValue("17", "widths")).toBeUndefined()
    expect(Converters.enumValue("0", "widths")).toBeUndefined()
    expect(warn).toHaveBeenCalledTimes(2)
  })
})

////////////////
// ## Numbers, JSON and lists
////////////////

describe("Converters.number()", () => {
  it("parses numbers", () => {
    expect(Converters.number("4")).toBe(4)
    expect(Converters.number("-1.5")).toBe(-1.5)
    expect(Converters.number(7)).toBe(7)
    expect(Converters.number("")).toBeUndefined()
    expect(Converters.number("abc")).toBeUndefined()
    expect(Converters.number(null)).toBeUndefined()
  })
})

describe("Converters.json()", () => {
  it("parses JSON strings and passes objects through", () => {
    const options = [{ value: "a", text: "A" }]
    expect(Converters.json(options)).toBe(options)
    expect(Converters.json('[{"value":"a"}]')).toEqual([{ value: "a" }])
    expect(Converters.json("")).toBeUndefined()
  })

  it("warns on invalid JSON", () => {
    const warn = spyWarn()
    expect(Converters.json("[oops")).toBeUndefined()
    expect(Converters.json("{oops}")).toBeUndefined()
    expect(warn).toHaveBeenCalledTimes(2)
  })

  it("keeps text that isn't JSON-shaped as a string (`rules` shorthand), without warning", () => {
    const warn = spyWarn()
    expect(Converters.json("email")).toBe("email")
    expect(Converters.json("minLength[6]")).toBe("minLength[6]")
    expect(Converters.json('"email"')).toBe("email")
    expect(Converters.json("  ")).toBeUndefined()
    expect(warn).not.toHaveBeenCalled()
  })
})

describe("Converters.list()", () => {
  it("splits lists on spaces and commas", () => {
    expect(Converters.list("a, b  c,d")).toEqual(["a", "b", "c", "d"])
    expect(Converters.list(["x"])).toEqual(["x"])
    expect(Converters.list(null)).toEqual([])
    expect(Converters.list("")).toEqual([])
  })
})

////////////////
// ## Helpers
////////////////

/** Spy on dev warnings, silencing them. */
function spyWarn() {
  return vi.spyOn(console, "warn").mockImplementation(() => {})
}
