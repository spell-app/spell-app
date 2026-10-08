import { describe, expect, it } from "vite-plus/test"

import { camelCase, kebabCase, levenshtein, numberToWord, suggest } from "./string"

////////////////
// ## Names and words
////////////////

describe("kebabCase() / camelCase()", () => {
  it("converts property names to attribute names", () => {
    expect(kebabCase("activeIndex")).toBe("active-index")
    expect(kebabCase("allowAdditions")).toBe("allow-additions")
    expect(kebabCase("open")).toBe("open")
  })

  it("leaves digits alone", () => {
    expect(kebabCase("h1Size")).toBe("h1-size")
    expect(camelCase("h1-size")).toBe("h1Size")
  })

  it("converts attribute names to property names", () => {
    expect(camelCase("active-index")).toBe("activeIndex")
    expect(camelCase("allow-additions")).toBe("allowAdditions")
    expect(camelCase("open")).toBe("open")
  })

  it("round-trips", () => {
    for (const name of ["activeIndex", "value", "maxSelections", "position2"]) {
      expect(camelCase(kebabCase(name))).toBe(name)
    }
  })

  it("passes already-converted text through", () => {
    expect(kebabCase("active-index")).toBe("active-index")
    expect(camelCase("activeIndex")).toBe("activeIndex")
  })
})

describe("numberToWord()", () => {
  it("maps 1..16 to Fomantic's words", () => {
    expect(numberToWord(1)).toBe("one")
    expect(numberToWord(4)).toBe("four")
    expect(numberToWord("16")).toBe("sixteen")
    expect(numberToWord(" 8 ")).toBe("eight")
  })

  it("returns undefined out of range", () => {
    expect(numberToWord(0)).toBeUndefined()
    expect(numberToWord(17)).toBeUndefined()
    expect(numberToWord(2.5)).toBeUndefined()
    expect(numberToWord("1/4")).toBeUndefined()
    expect(numberToWord("four")).toBeUndefined()
  })
})

////////////////
// ## Near misses
////////////////

describe("levenshtein()", () => {
  it("counts edits", () => {
    expect(levenshtein("", "")).toBe(0)
    expect(levenshtein("red", "red")).toBe(0)
    expect(levenshtein("", "red")).toBe(3)
    expect(levenshtein("red", "")).toBe(3)
    expect(levenshtein("kitten", "sitting")).toBe(3)
    expect(levenshtein("grey", "gray")).toBe(1)
    expect(levenshtein("left", "felt")).toBe(2)
  })

  it("is symmetric", () => {
    expect(levenshtein("primary", "primray")).toBe(levenshtein("primray", "primary"))
  })
})

describe("suggest()", () => {
  const COLORS = ["primary", "secondary", "red", "orange", "yellow", "grey", "green"]

  it("finds the closest candidate", () => {
    expect(suggest("primray", COLORS)).toBe("primary")
    expect(suggest("gray", COLORS)).toBe("grey")
    expect(suggest("RED", COLORS)).toBe("red")
  })

  it("returns undefined when nothing is close enough", () => {
    expect(suggest("magenta", COLORS)).toBeUndefined()
    expect(suggest("xyz", [])).toBeUndefined()
  })

  it("honours maxDistance", () => {
    expect(suggest("yelow", COLORS, 0)).toBeUndefined()
    expect(suggest("yelow", COLORS, 1)).toBe("yellow")
  })

  it("prefers the earlier candidate on a tie", () => {
    expect(suggest("gren", ["grey", "green"])).toBe("grey")
  })
})
