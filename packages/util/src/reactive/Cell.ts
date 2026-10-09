import { CELL_DIRTY, linkCell, type CellReader, type CellSource } from "./cells"

/**
 * A cell:  ONE reactive slot, e.g. a property of one object, or the key set of its record.
 * - Holds no value:  the value lives in its object's record (see `extend.ts`).  A cell only knows who read it.
 * - `read()` where the value is read, `changed()` after a REAL change -- callers skip `===` writes first.
 */
export class Cell implements CellSource {
  /** Readers that read it since they last re-ran. */
  subs = new Set<CellReader>()
  /** Bumped by each `changed()`. */
  version = 0

  /** Its value's being read:  the reader collecting now, if any, depends on it. */
  read(): void {
    linkCell(this)
  }

  /**
   * Its value REALLY changed:  every reader that read it is `CELL_DIRTY`.
   * - Call ONLY for a real change -- `setProp()` already skips `===` writes.
   * - SIDE EFFECT:  readers react synchronously -- a Solid computation is scheduled, a derived value goes stale.
   */
  changed(): void {
    this.version++
    if (!this.subs.size) return
    for (const reader of [...this.subs]) reader.mark(CELL_DIRTY)
  }
}
