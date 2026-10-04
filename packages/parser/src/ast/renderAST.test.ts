import { describe, expect, test } from "vite-plus/test"

import { P } from "$/parser"

/**
 * `P.render`:  AST drawing as `P.Markup`, plain data -- so it's testable here, under node, with no DOM.
 * - `P.render.toDOM()` needs a browser:  the app's `ASTViewer.browser.test.tsx` draws real ASTs with it.
 */
const { render, stringify } = P

describe("markup", () => {
  test("`span()` and `h()` build plain elements;  `Fragment()` is an array", () => {
    expect(render.span("keyword let", "let ")).toEqual({
      tag: "span",
      attrs: { class: "keyword let" },
      children: ["let "]
    })
    expect(render.h("b", { title: "x", "data-line": 2 }, "a", 1)).toEqual({
      tag: "b",
      attrs: { title: "x", "data-line": 2 },
      children: ["a", 1]
    })
    expect(render.Fragment(render.SPACE, "x")).toEqual([render.SPACE, "x"])
  })

  test("`toText()` reads text, nested any depth;  `null`, `undefined` and booleans draw nothing, as in JSX", () => {
    const markup = render.span("outer", "a", [render.span("inner", "b", 2), [null, undefined, false, true, "c"]])
    expect(render.toText(markup)).toBe("ab2c")
    expect(render.toText(null)).toBe("")
  })

  test("delimiters and brackets read as their `stringify` twins", () => {
    const twins = [
      "SPACE",
      "NEWLINE",
      "COMMA",
      "SPACED_COMMA",
      "LEFT_PAREN",
      "RIGHT_PAREN",
      "EMPTY_PARENS",
      "DOUBLE_QUOTE",
      "SINGLE_QUOTE",
      "BACK_TICK",
      "LEFT_CURLY",
      "RIGHT_CURLY",
      "EMPTY_BLOCK",
      "LEFT_SQUARE_BRACKET",
      "RIGHT_SQUARE_BRACKET"
    ] as const
    for (const name of twins) expect([name, render.toText(render[name])]).toEqual([name, stringify[name]])
  })

  test("wrappers draw as `stringify`'s on one line", () => {
    expect(render.toText(render.InParens({ children: "x" }))).toBe(stringify.InParens({ children: "x" }))
    expect(render.toText(render.InParens({}))).toBe("()")
    expect(render.toText(render.InSingleQuotes({ children: "x" }))).toBe("'x'")
    expect(render.toText(render.InTripleBackTicks({ children: "x" }))).toBe("```x```")
    expect(render.toText(render.Block({ children: "x" }))).toBe("{ x }")
    expect(render.toText(render.Block({}))).toBe("{}")
    expect(render.toText(render.Args({ args: [] }))).toBe("()")
    expect(render.toText(render.Array({ items: [] }))).toBe("[]")
  })

  test("`List()` draws each item by `DrawItem`, between delimiters;  nothing for no items", () => {
    const items = [null, null, null]
    const drawn = render.List({ items, DrawItem: ({ index }) => String(index) })
    expect(render.toText(drawn)).toBe("0, 1, 2")
    expect(render.List({ items: [] })).toBeNull()
  })
})
