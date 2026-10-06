import { describe, expect, it } from "vite-plus/test"

import { type MenuOption, MenuOptions } from "$/ui/elements"

/** Small option list with accents, a disabled option and value / text differences. */
const OPTIONS: MenuOption[] = [
  { value: "cafe", text: "Café" },
  { value: "creme", text: "Crème brûlée" },
  { value: "us", text: "United States" },
  { value: "gb", text: "United Kingdom", disabled: true },
  { value: "red", text: "Red" },
  { value: "green", text: "Green" }
]

const menu = new MenuOptions({ options: OPTIONS })

////////////////
// ## Narrowing the list
////////////////

describe("MenuOptions.filter()", () => {
  it("passes everything through for an empty query", () => {
    expect(menu.filter("")).toBe(menu)
  })

  it("matches prefix and substring by default (fullTextSearch: exact), case-insensitive", () => {
    expect(values(menu.filter("uni"))).toEqual(["us", "gb"])
    expect(values(menu.filter("STATES"))).toEqual(["us"])
    expect(values(menu.filter("ee"))).toEqual(["green"])
  })

  it("matches values too by default (search: both)", () => {
    expect(values(menu.filter("gb"))).toEqual(["gb"])
    expect(values(menu.filter("gb", { search: "text" }))).toEqual([])
    expect(values(menu.filter("united", { search: "value" }))).toEqual([])
  })

  it("matches prefix only with fullTextSearch: false", () => {
    expect(values(menu.filter("states", { fullTextSearch: false }))).toEqual([])
    expect(values(menu.filter("united s", { fullTextSearch: false }))).toEqual(["us"])
  })

  it("matches in-order characters with fullTextSearch: true", () => {
    expect(values(menu.filter("usts", { fullTextSearch: true }))).toEqual(["us"])
    expect(values(menu.filter("grn", { fullTextSearch: true }))).toEqual(["green"])
    expect(values(menu.filter("nrg", { fullTextSearch: true }))).toEqual([])
  })

  it("ignores diacritics only when asked", () => {
    expect(values(menu.filter("creme brulee", { search: "text" }))).toEqual([])
    expect(values(menu.filter("creme brulee", { search: "text", ignoreDiacritics: true }))).toEqual(["creme"])
    expect(values(menu.filter("CAFÉ", { search: "text", ignoreDiacritics: true }))).toEqual(["cafe"])
  })

  it("can be case-sensitive", () => {
    expect(values(menu.filter("red", { search: "text", ignoreCase: false }))).toEqual([])
    expect(values(menu.filter("Red", { search: "text", ignoreCase: false }))).toEqual(["red"])
  })

  it("doesn't filter below minCharacters", () => {
    expect(menu.filter("r", { minCharacters: 2 })).toBe(menu)
    expect(values(menu.filter("re", { minCharacters: 2 }))).toEqual(["creme", "red", "green"])
  })

  it("takes a custom search function", () => {
    const filtered = menu.filter("x", { search: (options) => options.filter((option) => option.value.length === 2) })
    expect(values(filtered)).toEqual(["us", "gb"])
  })
})

describe("MenuOptions.excludeSelected()", () => {
  it("drops selected values", () => {
    expect(values(menu.excludeSelected(["red", "us"]))).toEqual(["cafe", "creme", "gb", "green"])
    expect(menu.excludeSelected([])).toBe(menu)
  })

  it("chains with filter", () => {
    expect(values(menu.excludeSelected(["red"]).filter("re"))).toEqual(["creme", "green"])
  })
})

describe("MenuOptions.withAdditions()", () => {
  it("adds the query at the top by default", () => {
    const added = menu.filter("blue").withAdditions("blue", { allowAdditions: true })
    expect(added.options).toEqual([{ value: "blue", text: "blue", addition: true, label: "Add " }])
    expect(added.addition).toBe(added.options[0])
    const top = menu.withAdditions("blue", { allowAdditions: true, additionLabel: "New: " })
    expect(top.options[0]).toMatchObject({ value: "blue", label: "New: " })
    expect(top.length).toBe(OPTIONS.length + 1)
  })

  it("adds at the bottom when asked", () => {
    const bottom = menu.withAdditions("blue", { allowAdditions: true, additionPosition: "bottom" })
    expect(bottom.options.at(-1)).toMatchObject({ value: "blue", addition: true })
  })

  it("keeps a hidden addition off the list", () => {
    const hidden = menu.withAdditions("blue", { allowAdditions: true, hideAdditions: true })
    expect(hidden.options).toBe(menu.options)
    expect(hidden.addition).toMatchObject({ value: "blue" })
  })

  it("doesn't add what already exists, by text or value, ignoring case", () => {
    expect(menu.withAdditions("RED", { allowAdditions: true })).toBe(menu)
    expect(menu.withAdditions("gb", { allowAdditions: true })).toBe(menu)
    expect(values(menu.withAdditions("RED", { allowAdditions: true, ignoreCase: false }))[0]).toBe("RED")
  })

  it("does nothing unless allowed, or for a blank query", () => {
    expect(menu.withAdditions("blue")).toBe(menu)
    expect(menu.withAdditions("  ", { allowAdditions: true })).toBe(menu)
  })
})

////////////////
// ## Moving through it
////////////////

describe("MenuOptions.nextEnabledIndex()", () => {
  // Index 3 (`gb`) is disabled.
  it("steps forward and back, skipping disabled options", () => {
    expect(menu.nextEnabledIndex(2, 1)).toBe(4)
    expect(menu.nextEnabledIndex(4, -1)).toBe(2)
  })

  it("starts from nothing active", () => {
    expect(menu.nextEnabledIndex(-1, 1)).toBe(0)
    expect(menu.nextEnabledIndex(-1, -1)).toBe(5)
  })

  it("stops at the ends without wrap", () => {
    expect(menu.nextEnabledIndex(5, 1)).toBe(5)
    expect(menu.nextEnabledIndex(0, -1)).toBe(0)
  })

  it("wraps when asked", () => {
    expect(menu.nextEnabledIndex(5, 1, { wrap: true })).toBe(0)
    expect(menu.nextEnabledIndex(0, -1, { wrap: true })).toBe(5)
  })

  it("jumps by pages, clamping to the last enabled option", () => {
    expect(menu.nextEnabledIndex(0, 10)).toBe(5)
    expect(menu.nextEnabledIndex(5, -10)).toBe(0)
    expect(menu.nextEnabledIndex(0, 3)).toBe(4)
  })

  it("stays put when the only options ahead are disabled", () => {
    const trailing = new MenuOptions({
      options: [
        { value: "a", text: "A" },
        { value: "b", text: "B", disabled: true }
      ]
    })
    expect(trailing.nextEnabledIndex(0, 1)).toBe(0)
    expect(trailing.nextEnabledIndex(0, 1, { wrap: true })).toBe(0)
  })

  it("returns -1 when nothing is enabled", () => {
    expect(new MenuOptions({ options: [{ value: "a", text: "A", disabled: true }] }).nextEnabledIndex(-1, 1)).toBe(-1)
    expect(new MenuOptions().nextEnabledIndex(-1, 1)).toBe(-1)
  })
})

describe("MenuOptions.selectionForKey()", () => {
  it("finds the next option starting with a character, wrapping", () => {
    expect(menu.selectionForKey("c")).toBe(0)
    expect(menu.selectionForKey("c", 0)).toBe(1)
    expect(menu.selectionForKey("c", 1)).toBe(0)
  })

  it("cycles on a repeated character", () => {
    expect(menu.selectionForKey("cc", 0)).toBe(1)
  })

  it("refines the current match with a longer buffer", () => {
    expect(menu.selectionForKey("un", 2)).toBe(2)
    expect(menu.selectionForKey("cr", 0)).toBe(1)
  })

  it("skips disabled options and ignores case and diacritics", () => {
    expect(menu.selectionForKey("united k")).toBe(-1)
    expect(menu.selectionForKey("CRÈ")).toBe(1)
  })

  it("returns -1 with no match", () => {
    expect(menu.selectionForKey("z")).toBe(-1)
  })
})

////////////////
// ## Highlights
////////////////

describe("MenuOptions.highlights()", () => {
  it("returns one range for a contiguous match", () => {
    expect(menu.highlights(OPTIONS[2], "states")).toEqual([[7, 13]])
  })

  it("returns merged ranges for a fuzzy match", () => {
    expect(menu.highlights(OPTIONS[5], "grn")).toEqual([
      [0, 2],
      [4, 5]
    ])
  })

  it("maps ranges back to the original text when ignoring diacritics", () => {
    // NFD form:  `e` + combining grave are 2 code units in the text.
    const decomposed: MenuOption = { value: "x", text: "Crème" }
    expect(menu.highlights(decomposed, "creme", { ignoreDiacritics: true })).toEqual([[0, 6]])
    expect(menu.highlights(OPTIONS[1], "brulee", { ignoreDiacritics: true })).toEqual([[6, 12]])
  })

  it("returns nothing without a match", () => {
    expect(menu.highlights(OPTIONS[0], "xyz")).toEqual([])
    expect(menu.highlights(OPTIONS[0], "")).toEqual([])
  })
})

////////////////
// ## Performance
////////////////

describe("MenuOptions.filter() performance", () => {
  it("filters 5000 options per keystroke in under 50 ms", () => {
    const big = new MenuOptions({ options: manyOptions(5000) })
    // Warm-up builds the lazy search keys, as the first keystroke would.
    big.filter("a", { ignoreDiacritics: true })
    const start = performance.now()
    for (const query of ["b", "br", "bra", "brav", "bravo", "bravo g"]) {
      big.filter(query, { ignoreDiacritics: true, fullTextSearch: true })
    }
    const perKeystroke = (performance.now() - start) / 6
    expect(perKeystroke).toBeLessThan(50)
  })

  it("filters 5000 cold options in under 50 ms", () => {
    const big = new MenuOptions({ options: manyOptions(5000) })
    const start = performance.now()
    const result = big.filter("delta", { ignoreDiacritics: true })
    expect(performance.now() - start).toBeLessThan(50)
    expect(result.length).toBeGreaterThan(0)
  })
})

////////////////
// ## Helpers
////////////////

/** Values of `list`, for compact assertions. */
function values(list: MenuOptions) {
  return list.options.map((option) => option.value)
}

/** `count` options with accented, varied text. */
function manyOptions(count: number): MenuOption[] {
  const words = ["alpha", "Brâvo", "charlie", "délta", "echo", "foxtrot", "golf", "hôtel"]
  return Array.from({ length: count }, (_, index) => ({
    value: `v${index}`,
    text: `${words[index % words.length]} ${words[(index * 7) % words.length]} ${index}`
  }))
}
