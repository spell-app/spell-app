import { describe, expect, it } from "vite-plus/test"

import { lineRules } from "./lineRules"

/** Does rule `name` take ALL of `line`? */
function is(name: string, line: string) {
  return !!lineRules.matchWhole(lineRules.tokenizeLine(line), name)
}

describe("line rules", () => {
  it("thematic_break:  3+ of one of - * _, spaced or not", () => {
    expect(
      ["---", "***", "___", "- - -", "**  * ** * ** * **", "-----"].map((line) => is("thematic_break", line))
    ).toEqual([true, true, true, true, true, true])
    expect(["--", "-*-", "_ _ _ _ a", "+++"].map((line) => is("thematic_break", line))).toEqual([
      false,
      false,
      false,
      false
    ])
  })

  it("atx_heading:  1-6 #, then nothing or a space", () => {
    expect(["#", "# foo", "###### foo", "## foo ##"].map((line) => is("atx_heading", line))).toEqual([
      true,
      true,
      true,
      true
    ])
    expect(["####### foo", "#5 bolt", "#hashtag"].map((line) => is("atx_heading", line))).toEqual([false, false, false])
  })

  it("fence_open:  3+ backticks or tildes, an info string after", () => {
    expect(
      ["```", "~~~~", "``` ruby", "```ruby startline=3", "~~~ aa ``` ~~~"].map((line) => is("fence_open", line))
    ).toEqual([true, true, true, true, true])
    expect(["``", "` ``", "~~"].map((line) => is("fence_open", line))).toEqual([false, false, false])
  })

  it("setext_underline:  a touching run of = or -", () => {
    expect(["===", "-", "---------"].map((line) => is("setext_underline", line))).toEqual([true, true, true])
    expect(["= =", "--- -", "==-"].map((line) => is("setext_underline", line))).toEqual([false, false, false])
  })

  it("list markers", () => {
    expect(is("bullet_marker", "-")).toBe(true)
    expect(is("ordered_marker", "1.")).toBe(true)
    expect(is("ordered_marker", "123)")).toBe(true)
    expect(is("ordered_marker", "1234567890.")).toBe(false)
    expect(is("ordered_marker", "1 .")).toBe(false)
  })

  it("table_delimiter_row", () => {
    expect(
      ["| --- | --- |", "--- | ---", ":-: | -----------:", "|---|"].map((line) => is("table_delimiter_row", line))
    ).toEqual([true, true, true, true])
    expect(["| a | b |", "--- | x", "- - | ---"].map((line) => is("table_delimiter_row", line))).toEqual([
      false,
      false,
      false
    ])
  })
})
