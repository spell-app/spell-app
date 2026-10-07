import { describe, expect, it } from "vite-plus/test"

import { MD } from "$/markdown"

/** `block`'s tree as nested `kind[...]` strings, leaf lines in quotes. */
function shape(block: MD.Block): unknown {
  if (block.children.length) return { [block.kind]: block.children.map(shape) }
  return block.lines.length ? `${block.kind} ${JSON.stringify(block.lines.join("|"))}` : block.kind
}

describe("BlockScanner", () => {
  it("containers nest:  a list in a quote, a paragraph lazily continued", () => {
    expect(shape(MD.BlockScanner.parse("> - one\n> - two\nlazy\n"))).toEqual({
      document: [{ blockquote: [{ list: [{ item: ['paragraph "one"'] }, { item: ['paragraph "two|lazy"'] }] }] }]
    })
  })

  it("a list is tight without blank lines between items, loose with one", () => {
    expect(MD.BlockScanner.parse("- a\n- b\n").children[0]!.tight).toBe(true)
    expect(MD.BlockScanner.parse("- a\n\n- b\n").children[0]!.tight).toBe(false)
  })

  it("setext:  a paragraph over === becomes a level-1 heading", () => {
    const [heading] = MD.BlockScanner.parse("Title\n===\n").children
    expect([heading!.kind, heading!.level, heading!.lines]).toEqual(["heading", 1, ["Title"]])
  })

  it("fenced code keeps its info string and lines, fence and all indents gone", () => {
    const [code] = MD.BlockScanner.parse("  ```ts\n  let x\n    y\n  ```\n").children
    expect([code!.info, code!.lines]).toEqual(["ts", ["let x", "  y"]])
  })

  it("a GFM table:  header from the paragraph's last line, alignment from the delimiter row", () => {
    const blocks = MD.BlockScanner.parse("intro\n| a | b |\n|:-|-:|\n| 1 | 2 |\n").children
    expect(blocks.map((block) => block.kind)).toEqual(["paragraph", "table"])
    expect(blocks[1]!.align).toEqual(["left", "right"])
    expect(blocks[1]!.lines).toEqual(["| a | b |", "|:-|-:|", "| 1 | 2 |"])
  })

  it("a line of = or - under a single-cell row without pipes stays a setext heading", () => {
    expect(MD.BlockScanner.parse("a\n---\n").children[0]!.kind).toBe("heading")
  })
})
