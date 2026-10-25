import { describe, expect, test } from "vite-plus/test"

import { NotebookKeys } from "spell-app/app/solid/notebook/NotebookKeys"
import type { PageCell } from "spell-app/app/solid/notebook/NotebookPageCells"

/** Cells of `codes`, each a prose cell:  the keys follow code alone. */
function cells(...codes: string[]): PageCell[] {
  return codes.map((code) => ({ kind: "prose", code, indent: "", span: { start: 0, end: 0 } }))
}

/** A cell keeps its key across an edit of the text, so its place, drawing and editor stay (epic `elemental-spell` P16). */
describe("NotebookKeys.carried()", () => {
  const keys = ["a", "b", "c", "d"]
  const before = cells("A", "B", "C", "D")

  test("an edit:  the edited cell keeps its key", () => {
    expect(NotebookKeys.carried(before, keys, cells("A", "B!", "C", "D"))).toEqual(keys)
  })

  test("several edits at once:  each edited cell keeps its key", () => {
    expect(NotebookKeys.carried(before, keys, cells("A!", "B!", "C", "D!"))).toEqual(keys)
  })

  test("a move:  each cell's key goes with it", () => {
    expect(NotebookKeys.carried(before, keys, cells("A", "C", "B", "D"))).toEqual(["a", "c", "b", "d"])
  })

  test("a delete and an insert:  the rest keep theirs, a new cell a new key", () => {
    expect(NotebookKeys.carried(before, keys, cells("A", "C", "D"))).toEqual(["a", "c", "d"])
    const inserted = NotebookKeys.carried(before, keys, cells("A", "B", "new", "C", "D"))
    expect(inserted).toEqual(["a", "b", expect.stringMatching(/^cell-\d+$/), "c", "d"])
  })
})
