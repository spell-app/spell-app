import { describe, expect, test } from "vite-plus/test"

import { InlineCode } from "./InlineCode"

describe("InlineCode.parse()", () => {
  test.each([
    ["plain", [{ text: "plain", isCode: false }]],
    [
      "a `b` c",
      [
        { text: "a ", isCode: false },
        { text: "b", isCode: true },
        { text: " c", isCode: false }
      ]
    ],
    [
      "`` `x` `` becomes code",
      [
        { text: "`x`", isCode: true },
        { text: " becomes code", isCode: false }
      ]
    ],
    ["an `unclosed span", [{ text: "an `unclosed span", isCode: false }]],
    [
      "`a` and `<b>`",
      [
        { text: "a", isCode: true },
        { text: " and ", isCode: false },
        { text: "<b>", isCode: true }
      ]
    ]
  ])("parses %j", (text, pieces) => {
    expect(InlineCode.parse(text)).toEqual(pieces)
  })
})

describe("InlineCode.wrap()", () => {
  test.each(["x", "`x`", "a `` b", "{ a: 1 }"])("wraps %j so it parses back as one code piece", (code) => {
    expect(InlineCode.parse(InlineCode.wrap(code))).toEqual([{ text: code, isCode: true }])
  })
})
