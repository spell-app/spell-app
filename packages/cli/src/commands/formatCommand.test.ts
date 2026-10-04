import { describe, test, expect } from "vite-plus/test"

import { applyEdits } from "./formatCommand"

/** An edit replacing `line`'s characters `from` to `to` with `newText`. */
function edit(line: number, from: number, to: number, newText: string) {
  return { range: { start: { line, character: from }, end: { line, character: to } }, newText }
}

describe("applyEdits()", () => {
  test("each edit against the ORIGINAL text, whatever their order", () => {
    const text = "if  x\n\tsay   hi\n"
    expect(applyEdits(text, [edit(0, 2, 4, " "), edit(1, 4, 7, " ")])).toBe("if x\n\tsay hi\n")
    expect(applyEdits(text, [edit(1, 4, 7, " "), edit(0, 2, 4, " ")])).toBe("if x\n\tsay hi\n")
  })

  test("removing a line, and adding at the very end", () => {
    const text = "a\n\n\n\nb"
    const removeBlank = { range: { start: { line: 2, character: 0 }, end: { line: 3, character: 0 } }, newText: "" }
    expect(applyEdits(text, [removeBlank, edit(4, 1, 1, "\n")])).toBe("a\n\n\nb\n")
  })
})
