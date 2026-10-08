import { describe, expect, test } from "vite-plus/test"

import { CodeLines } from "./CodeLines"

////////////////
// ## CodeLines.split()
////////////////

describe("CodeLines.split()", () => {
  test("splits highlighted HTML at newlines, reopening open spans", () => {
    expect(CodeLines.split('a <span class="c">x\ny</span> b\nc')).toEqual([
      'a <span class="c">x</span>',
      '<span class="c">y</span> b',
      "c"
    ])
  })

  test("makes no empty last line for a final newline", () => {
    expect(CodeLines.split("a\nb\n")).toEqual(["a", "b"])
    expect(CodeLines.split("")).toEqual([""])
  })
})

////////////////
// ## CodeLines.fromSpans()
////////////////

describe("CodeLines.fromSpans()", () => {
  test("turns spans into highlight.js HTML, escaped", () => {
    expect(
      CodeLines.fromSpans("if a<b", [
        { start: 0, end: 2, kind: "keyword" },
        { start: 3, end: 6, kind: "title.function" }
      ])
    ).toBe('<span class="hljs-keyword">if</span> <span class="hljs-title function_">a&lt;b</span>')
  })
})

////////////////
// ## CodeLines.escape()
////////////////

describe("CodeLines.escape()", () => {
  test("escapes every HTML-special character", () => {
    expect(CodeLines.escape(`<a href="x">Tom & Jerry's</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;"
    )
  })
})

////////////////
// ## CodeLines.classNameFor()
////////////////

describe("CodeLines.classNameFor()", () => {
  test("names a scope as highlight.js does:  one more `_` per sub-scope", () => {
    expect(["keyword", "title.function", "title.class.inherited"].map((kind) => CodeLines.classNameFor(kind))).toEqual([
      "hljs-keyword",
      "hljs-title function_",
      "hljs-title class_ inherited__"
    ])
  })
})
