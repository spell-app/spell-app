import type { PageCell } from "./NotebookPageCells"

/**
 * KEYS for a notebook page's cells:  what keeps each cell's place on the page, its result and its editor, across edits
 * (epic `elemental-spell` P16).
 * - The file holds no ids:  a cell is found by its place among the others.
 *   So after the text changes, each new cell takes the key of the old cell it's the same as.
 * - Matched by code, from both ends:  the cells before and after the change keep theirs.
 *   - In the middle:  a cell with the same code as one there keeps its key (a move);  then each edited cell keeps the
 *     key of the next one left over, in order, of its kind (edits, however many);  anything else is new (an insert),
 *     and what's left goes (a delete).
 * - Pure:  the notebook's controller keeps the keys, and its tests check this in node.
 */
export class NotebookKeys {
  /** A fresh key, never used before on this page. */
  static next(): string {
    return `cell-${++counter}`
  }

  /** Keys for `cells`, after `before` had `keys`:  see the class's docs. */
  static carried(before: readonly PageCell[], keys: readonly string[], cells: readonly PageCell[]): string[] {
    const result: Array<string | undefined> = cells.map(() => undefined)
    let head = 0
    while (head < before.length && head < cells.length && same(before[head]!, cells[head]!)) {
      result[head] = keys[head]
      head++
    }
    let tail = 0
    while (
      tail < before.length - head &&
      tail < cells.length - head &&
      same(before[before.length - 1 - tail]!, cells[cells.length - 1 - tail]!)
    ) {
      result[cells.length - 1 - tail] = keys[before.length - 1 - tail]
      tail++
    }
    // the middle:  the same code first, then one edited cell alone on both sides
    const oldMiddle = before.slice(head, before.length - tail).map((cell, index) => ({ cell, key: keys[head + index] }))
    const used = new Set<number>()
    for (let index = head; index < cells.length - tail; index++) {
      const match = oldMiddle.findIndex((old, at) => !used.has(at) && same(old.cell, cells[index]!))
      if (match >= 0) {
        used.add(match)
        result[index] = oldMiddle[match]!.key
      }
    }
    // edited cells:  each left over keeps the key of the next one left over before, in order, of its kind
    const unmatchedOld = oldMiddle.filter((_, at) => !used.has(at))
    let next = 0
    for (const [index, key] of result.entries()) {
      if (key !== undefined) continue
      const at = unmatchedOld.findIndex((old, place) => place >= next && old.cell.kind === cells[index]!.kind)
      if (at < 0) continue
      result[index] = unmatchedOld[at]!.key
      next = at + 1
    }
    return result.map((key) => key ?? NotebookKeys.next())
  }
}

/** How many keys have been made on this page. */
let counter = 0

/** Are `a` and `b` the same cell:  the same kind and code? */
function same(a: PageCell, b: PageCell): boolean {
  return a.kind === b.kind && a.code === b.code
}
