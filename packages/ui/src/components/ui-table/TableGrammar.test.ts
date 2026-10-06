import { describe, expect, test } from "vite-plus/test"

import { TableGrammar } from "./TableGrammar"

describe("TableGrammar.scroller()", () => {
  test("phrases the scroller-shaped attributes in the table's grammar, noun `scroller`, no `ui`", () => {
    const values: Record<string, unknown> = { resizable: true, attached: "top", scrolling: "short", celled: true }
    expect(TableGrammar.scroller((name) => values[name])).toBe("resizable top attached short scrolling scroller")
  })

  test("is the bare noun without any", () => {
    expect(TableGrammar.scroller(() => undefined)).toBe("scroller")
  })
})

describe("TableGrammar.scrolls()", () => {
  test("is true with `scrolling` or `overflowing`, in any height", () => {
    const scrolls = (values: Record<string, unknown>) => TableGrammar.scrolls((name) => values[name])
    expect([
      scrolls({ scrolling: "very short" }),
      scrolls({ overflowing: true }),
      scrolls({ attached: "top" })
    ]).toEqual([true, true, false])
  })
})

describe("TableGrammar.cell()", () => {
  test("writes a column's alignment and width as Fomantic's cell classes", () => {
    expect(TableGrammar.cell({ key: "a", textAlign: "right", width: 4 })).toBe("right aligned four wide")
    expect(TableGrammar.cell({ key: "a", width: "1/4" })).toBe("four wide")
  })

  test('drops an unusable or `null` width silently;  `""` for nothing', () => {
    expect(TableGrammar.cell({ key: "a", width: "junk" })).toBe("")
    expect(TableGrammar.cell({ key: "a", width: null as never })).toBe("")
    expect(TableGrammar.cell({ key: "a" })).toBe("")
  })
})
