import { describe, expect, test } from "vite-plus/test"

import { CellRunner, ChunkTreeAdapter } from "spell-app/app/solid/notebook/NotebookPatch"
import type { PageCell } from "spell-app/app/solid/notebook/NotebookPageCells"

/** Cells of `codes`:  `kind:code`, e.g. `prose:# A counter`. */
function cells(...codes: string[]): PageCell[] {
  return codes.map((each) => {
    const [kind, code] = each.split(":") as [PageCell["kind"], string]
    return { kind, code, indent: "", span: { start: 0, end: 0 } }
  })
}

/**
 * A change from outside a notebook's page, planned by epic-engine's page patch (`PagePatch`, P40) over its chunk tree
 * and read as what each cell does (epic `elemental-spell` P16, Step 4).
 */
describe("CellRunner", () => {
  const keys = ["a", "b", "c"]
  const before = new ChunkTreeAdapter(cells("prose:# A", "template:<spell-view>", "drawing:<example>"), keys)

  test("a cell's code changed draws again;  the rest stay", () => {
    const after = new ChunkTreeAdapter(cells("prose:# B", "template:<spell-view>", "drawing:<example>"), keys)
    expect(CellRunner.run(CellRunner.plan(before, after), new Set())).toEqual({
      changed: ["a"],
      added: [],
      removed: [],
      moved: [],
      held: []
    })
  })

  test("the cell being typed in is held back;  a move, an insert and a delete are the page's list's", () => {
    const after = new ChunkTreeAdapter(cells("template:<spell-view>!", "prose:# A", "prose:new"), ["b", "a", "d"])
    const run = CellRunner.run(CellRunner.plan(before, after), new Set(["b"]))
    expect(run.held).toEqual(["b"])
    expect(run.changed).toEqual([])
    expect(run.added).toEqual(["d"])
    expect(run.removed).toEqual(["c"])
  })
})
