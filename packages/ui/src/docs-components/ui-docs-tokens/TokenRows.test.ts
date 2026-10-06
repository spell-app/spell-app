import { describe, expect, test } from "vite-plus/test"

import type { SiteDataFile, SiteToken } from "$/ui/docs-components/docs-components.types"

import { TokenRows } from "./TokenRows"

/** `--x-a`:  a length with a description. */
const ROW: SiteToken = { name: "--x-a", default: "1em", description: "Space around", type: "length" }

/** `x-button` has three tokens, `x-plain` none;  two foundation groups. */
const DATA = {
  components: [{ tag: "x-or", folder: "x-button" }],
  docs: [],
  families: {
    "x-button": {
      folder: "x-button",
      mainTag: "x-button",
      tokens: [
        { name: "--x-button-radius", default: "0.5em", type: "length" },
        { name: "--x-button-padding-block", default: "1em", type: "length" },
        { name: "--x-button-padding-inline", default: "2em", description: "Sides.", type: "length" }
      ]
    },
    "x-plain": { folder: "x-plain", mainTag: "x-plain", tokens: [] }
  },
  foundation: [
    { id: "typography", title: "Typography", tokens: [{ name: "--ui-font-size", default: "16px", type: "length" }] },
    { id: "palette", title: "Palette", tokens: [{ name: "--ui-red", default: "red", type: "color" }] }
  ]
} as unknown as SiteDataFile

describe("TokenRows.patternsFor()", () => {
  test("reads `tokens` as names and prefixes", () => {
    expect(TokenRows.patternsFor("--a --b-* ")).toEqual([{ name: "--a" }, { prefix: "--b-" }])
    expect(TokenRows.patternsFor(undefined)).toEqual([])
  })
})

describe("TokenRows.matches()", () => {
  test("keeps a row named exactly or by prefix;  EVERY row with no patterns", () => {
    expect(TokenRows.matches(ROW, [{ prefix: "--x-" }])).toBe(true)
    expect(TokenRows.matches(ROW, [{ name: "--x-a" }])).toBe(true)
    expect(TokenRows.matches(ROW, [{ name: "--x" }])).toBe(false)
    expect(TokenRows.matches(ROW, [])).toBe(true)
  })
})

describe("TokenRows.found()", () => {
  test("searches name, default and description, ignoring case", () => {
    expect(TokenRows.found(ROW, "around")).toBe(true)
    expect(TokenRows.found(ROW, "1em")).toBe(true)
    expect(TokenRows.found(ROW, "nope")).toBe(false)
  })
})

describe("TokenRows.cssValueFor()", () => {
  test("falls back to a family token's default;  a foundation token is always declared", () => {
    expect(TokenRows.cssValueFor(ROW, { isGlobal: false })).toBe("var(--x-a, 1em)")
    expect(TokenRows.cssValueFor(ROW, { isGlobal: true })).toBe("var(--x-a)")
  })
})

describe("TokenRows.viewFor()", () => {
  test("narrows a family's table by `tokens` and the query;  `total` counts rows before the query", () => {
    const view = TokenRows.viewFor(DATA, { tag: "x-or", tokens: "--x-button-padding-*", query: " SIDES " }, keyText)
    expect(view).toEqual({
      kind: "tables",
      tables: [{ id: "x-button", rows: [DATA.families["x-button"]!.tokens[2]] }],
      total: 2
    })
  })

  test("draws `groups` of the foundation, one table each", () => {
    const view = TokenRows.viewFor(DATA, { isGlobal: true, groups: "palette" }, keyText)
    expect(view).toMatchObject({ kind: "tables", tables: [{ id: "palette", title: "Palette" }], total: 1 })
  })

  test.each([
    [{}, "missing", true],
    [{ family: "x-nope" }, "unknownFamily", true],
    [{ family: "x-plain" }, "noTokens", false]
  ])("says why there's no table for %j", (params, text, isError) => {
    expect(TokenRows.viewFor(DATA, params, keyText)).toEqual({ kind: "message", text, isError })
  })
})

/** A `text()` that answers with the key itself. */
function keyText(key: string) {
  return key
}
