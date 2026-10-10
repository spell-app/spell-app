import {
  CELL_DIRTY,
  cancelCellCheck,
  scheduleCellCheck,
  cellSourcesChanged,
  trackCells,
  unlinkCells,
  type CellSource,
  type CellState,
  type CheckableReader
} from "./cells"

/**
 * A reader OUTSIDE spell state that re-runs when what it read changes:  a Solid computation (the host's bridge,
 * `bridgeSolid()`), an `observe()`.
 * - `run(fn)` runs `fn` collecting what it reads;  `trigger()` is how its owner re-runs it.
 * - A cell it read changed:  `trigger()` at once.  Only a derived value it read MAY have:  checked on a microtask
 *   first (`scheduleCellCheck()`), triggered only if it really changed -- the equality cutoff.
 * - NEVER triggers for a change made while it's running:  a read that writes what it just read, e.g. a computed
 *   property that fills a new pile every time it's read, would re-run forever.  `observer-util` did the same.
 */
export class Reaction implements CheckableReader {
  /** Each source it read last run, with the version it saw. */
  srcs = new Map<CellSource, number>()
  /** Is `run()` running? */
  private running = false

  /** - `trigger` is how its owner re-runs it, e.g. Solid's, or `observe()`'s re-run. */
  constructor(private trigger: () => void) {}

  /** Run `fn`, collecting what it reads -- forgetting what it read last time first. */
  run<T>(fn: () => T): T {
    this.running = true
    try {
      return trackCells(this, fn)
    } finally {
      this.running = false
    }
  }

  /** A source changed (`CELL_DIRTY`):  trigger.  A derived source MAY have (`CELL_CHECK`):  check first. */
  mark(state: CellState): void {
    if (this.running) return
    if (state === CELL_DIRTY) this.trigger()
    else scheduleCellCheck(this)
  }

  /** Trigger if a derived source REALLY changed -- see `scheduleCellCheck()`. */
  check(): void {
    if (!this.running && cellSourcesChanged(this)) this.trigger()
  }

  /** Stop:  forget what it read, and any check queued.  A later `run()` starts again. */
  dispose(): void {
    unlinkCells(this)
    cancelCellCheck(this)
  }
}
