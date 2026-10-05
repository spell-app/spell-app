import { describe, expect, it } from "vite-plus/test"

import { MD, type InlineNode } from "$/markdown"

/** `text`'s inline nodes as `kind[start,end)`, nested ones after `>`. */
function spans(text: string) {
  const out: string[] = []
  visit(MD.InlineParser.parse(text), "")
  return out

  /** Record `node`'s children. */
  function visit(node: InlineNode, prefix: string) {
    for (const child of node.children()) {
      out.push(`${prefix}${child.kind}[${child.start},${child.end})`)
      visit(child, `${prefix}${child.kind}>`)
    }
  }
}

describe("InlineParser positions", () => {
  it("spans cover the source, delimiters and brackets included", () => {
    //            0123456789012345678
    expect(spans("a **b** `c` [d](e)")).toEqual([
      "text[0,2)",
      "strong[2,7)",
      "strong>text[4,5)",
      "text[7,8)",
      "code[8,11)",
      "text[11,12)",
      "link[12,18)",
      "link>text[13,14)"
    ])
  })

  it("leftover delimiters keep their own span;  leading spaces of the input count", () => {
    expect(spans("  ***x**")).toEqual(["text[2,3)", "strong[3,8)", "strong>text[5,6)"])
  })
})
