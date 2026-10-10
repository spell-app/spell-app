import {
  CELL_CHECK,
  CELL_CLEAN,
  CELL_DIRTY,
  linkCell,
  cellSourcesChanged,
  trackCells,
  type CellReader,
  type CellSource,
  type CellState
} from "./cells"

/**
 * A memoized derived value -- `this.derive(name, fn)`, `@derived get x()`:  re-computed only when what it read
 * changed, and its readers re-run only when its VALUE changed (the equality cutoff, `===`).
 * - Both a source (its readers link to it) and a reader (it links to what `fn` reads).
 * - Lazy:  computed on read, never ahead.  A write only marks it, see `mark()`.
 * - Only for pure, worth-it getters (loops, list aggregates):  memoizing a cheap getter is ~2x SLOWER
 *   (`guides/solid/solid-2.md`).
 */
export class Derived<T = unknown> implements CellSource, CellReader {
  /** Readers that read it since they last re-ran. */
  subs = new Set<CellReader>()
  /** Each source `fn` read last run, with the version it saw. */
  srcs = new Map<CellSource, number>()
  /** Bumped when its value REALLY changes -- not on every re-compute. */
  version = 0
  /** Up to date, maybe stale, or stale -- see `mark()`. */
  state: CellState = CELL_DIRTY
  /** Its value as of the last compute. */
  value!: T

  /**
   * - `fn` computes it, called with `this` ~== `self`.
   * - `self` is the object it's a property of.
   * - `equals(old, next)` true keeps the OLD value:  `version` stays, so readers don't re-run.  Default `===`.
   */
  constructor(
    private fn: (this: any) => T,
    private self: unknown,
    private equals: (old: T, next: T) => boolean = isIdentical
  ) {}

  /**
   * A source changed (`CELL_DIRTY`), or a derived source MAY have (`CELL_CHECK`).
   * - Passes CELL_CHECK on to its own readers, once:  they re-validate by pulling, see `refresh()`.
   */
  mark(state: CellState): void {
    if (this.state >= state) return
    const wasClean = this.state === CELL_CLEAN
    this.state = state
    if (wasClean && this.subs.size) for (const reader of [...this.subs]) reader.mark(CELL_CHECK)
  }

  /** Bring `value` up to date;  bump `version` only if the new value differs. */
  refresh(): void {
    if (this.state === CELL_CHECK) this.state = cellSourcesChanged(this) ? CELL_DIRTY : CELL_CLEAN
    if (this.state !== CELL_DIRTY) return
    const next = trackCells(this, () => this.fn.call(this.self))
    this.state = CELL_CLEAN
    if (this.version === 0 || !this.equals(this.value, next)) {
      this.value = next
      this.version++
    }
  }

  /** Its value, up to date -- and the reader collecting now, if any, depends on it. */
  get(): T {
    this.refresh()
    linkCell(this)
    return this.value
  }
}

/** `Derived`'s default equality:  `===`. */
function isIdentical(old: unknown, next: unknown): boolean {
  return old === next
}
