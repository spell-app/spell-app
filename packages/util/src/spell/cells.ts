/**
 * Spell cells:  the small SYNCHRONOUS reactive core under spell state -- `Observable`, `Thing`, the editor.
 * - Why not Solid signals:  Solid 2 stages writes (a read right after a write sees the OLD value until a flush), and
 *   spell is imperative -- `set x to 1` then `print x` must print 1.  Measured:  `packages/docs/solid/solid-2.html` §2.
 * - The truth is each object's record (a `Map`, see `extend.ts`), read and written synchronously.  Cells only say WHO
 *   read WHAT, and tell them when it changes.
 * - Push-pull with an equality cutoff:  a write marks direct readers CELL_DIRTY and everything further down CELL_CHECK;  a
 *   CELL_CHECK reader re-validates by pulling its derived sources, and only re-runs if one REALLY changed.
 * - Readers are `Reaction`s:  one per Solid computation (the host's bridge, see `bridgeSolid()`), per React view
 *   (`view()`), or per `observe()`.  Derived values (`Derived`) are both reader and source.
 *
 * ONE context per page, on `globalThis`:  every copy of this module shares it.
 * - A page holds several copies:  the app's own `$/util`, plus each `spell-runtime.js` (one per `<spell-app>`, see
 *   `packages/app/src/runner/spellRuntime.ts`).  A Solid computation reads cells of ALL of them, so they must share
 *   the "who's reading now" slot, the pending checks and the host's flush.
 * - Hence duck-typing across copies:  a source is `{ subs, version, refresh? }`, never checked with `instanceof`.
 * - NOTE: `CONTEXT_VERSION` guards the shape:  bump it when `CellsContext` changes, so two builds never share a
 *   context they read differently.
 */

////////////////
// ## The page's context
////////////////

/** Shape version of `CellsContext` -- see the header. */
const CONTEXT_VERSION = 1

/** Key of the page's `CellsContext` on `globalThis`. */
const CONTEXT_KEY = Symbol.for("@spell-app/cells")

/** The page's context, shared by every copy of this module -- see the header. */
export const cellsContext: CellsContext = sharedContext()

////////////////
// ## Tracking
////////////////

/**
 * Is a reader collecting right now?  Cheap test before linking, e.g. in `getProp()`.
 * - NOTE: `false` inside `untrackCells()`, and outside any reader.
 */
export function isTrackingCells(): boolean {
  return cellsContext.collector !== null
}

/** Subscribe the current reader to `source`, remembering the version it saw.  No reader:  nothing. */
export function linkCell(source: CellSource): void {
  const reader = cellsContext.collector
  if (!reader) return
  source.subs.add(reader)
  reader.srcs.set(source, source.version)
}

/** Forget everything `reader` read:  before it reads again, or when it's disposed. */
export function unlinkCells(reader: CellReader): void {
  for (const source of reader.srcs.keys()) source.subs.delete(reader)
  reader.srcs.clear()
}

/**
 * Run `fn` with `reader` collecting what it reads -- forgetting what it read last time first.
 * - Nests:  the outer reader collects again once `fn` returns, or throws.
 */
export function trackCells<T>(reader: CellReader, fn: () => T): T {
  unlinkCells(reader)
  const outer = cellsContext.collector
  cellsContext.collector = reader
  try {
    return fn()
  } finally {
    cellsContext.collector = outer
  }
}

/** Run `fn` with nobody collecting:  what it reads isn't a dependency of the reader running now. */
export function untrackCells<T>(fn: () => T): T {
  const outer = cellsContext.collector
  cellsContext.collector = null
  try {
    return fn()
  } finally {
    cellsContext.collector = outer
  }
}

/**
 * Did any source `reader` read change since?  Brings derived sources up to date first (the "pull").
 * - Stops at the first change:  `reader` re-runs anyway, and re-reads the rest.
 */
export function cellSourcesChanged(reader: CellReader): boolean {
  for (const [source, seen] of reader.srcs) {
    source.refresh?.()
    if (source.version !== seen) return true
  }
  return false
}

////////////////
// ## Checks and flushing
////////////////

/**
 * Check `reader` on a microtask:  only derived values it read MAY have changed -- see `Reaction.mark()`.
 * - ONE microtask for every check queued before it runs.
 */
export function scheduleCellCheck(reader: CheckableReader): void {
  const context = cellsContext
  context.pending.add(reader)
  if (context.checkScheduled) return
  context.checkScheduled = true
  queueMicrotask(runCellChecks)
}

/** Forget a check `scheduleCellCheck()` queued, e.g. as its reader is disposed. */
export function cancelCellCheck(reader: CheckableReader): void {
  cellsContext.pending.delete(reader)
}

/** Run every check queued so far -- see `scheduleCellCheck()`. */
export function runCellChecks(): void {
  const context = cellsContext
  context.checkScheduled = false
  if (!context.pending.size) return
  const readers = [...context.pending]
  context.pending.clear()
  for (const reader of readers) reader.check()
}

/**
 * Settle spell state's readers NOW:  run pending derived checks, THEN each host's own flush, e.g. Solid's
 * `flush()`.
 * - `spellCore.flush()`.  Tests and imperative code call this, NEVER Solid's `flush()` directly:  a Solid
 *   computation reading only a derived value hears of a change on a microtask -- see `scheduleCellCheck()`.
 * - NEVER inside a Solid `action`, effect apply or `onSettled`:  Solid's own rule for its `flush()`.
 */
export function flushCells(): void {
  runCellChecks()
  for (const hostFlush of cellsContext.hostFlushes) hostFlush()
}

/**
 * Have `flushCells()` call `hostFlush` too, e.g. Solid's `flush()` -- see `bridgeSolid()`.
 * - Once per function:  it's a `Set`.
 */
export function addCellsHostFlush(hostFlush: () => void): void {
  cellsContext.hostFlushes.add(hostFlush)
}

////////////////
// ## Shared types
////////////////

/** Anything a reader can read:  a `Cell`, or a `Derived` value.  `version` bumps on every REAL change. */
export type CellSource = {
  /** Readers that read it since they last re-ran. */
  subs: Set<CellReader>
  /** Bumped on every real change -- readers compare it with what they saw. */
  version: number
  /** Bring the value up to date, if it's derived -- see `cellSourcesChanged()`. */
  refresh?(): void
}

/** Anything that reads sources:  a `Derived` value, or a `Reaction`. */
export type CellReader = {
  /** Each source it read since it last ran, with the version it saw. */
  srcs: Map<CellSource, number>
  /** A source changed (`CELL_DIRTY`), or a derived source MAY have (`CELL_CHECK`). */
  mark(state: CellState): void
}

/** A reader `scheduleCellCheck()` can queue:  it re-validates itself. */
export type CheckableReader = CellReader & {
  /** Re-validate:  re-run if a source really changed -- see `cellSourcesChanged()`. */
  check(): void
}

/** A reader's state:  up to date, maybe stale (a derived source may have changed), or stale. */
export type CellState = typeof CELL_CLEAN | typeof CELL_CHECK | typeof CELL_DIRTY

/** Up to date. */
export const CELL_CLEAN = 0
/** A derived value it read MAY have changed:  check before re-running. */
export const CELL_CHECK = 1
/** A cell it read changed:  re-run. */
export const CELL_DIRTY = 2

/** What every copy of this module on a page shares -- see the header. */
export type CellsContext = {
  /** Shape version -- see `CONTEXT_VERSION`. */
  version: number
  /** The reader collecting right now, if any -- see `trackCells()`. */
  collector: CellReader | null
  /** Readers waiting for their check -- see `scheduleCellCheck()`. */
  pending: Set<CheckableReader>
  /** Is a `runCellChecks()` microtask queued? */
  checkScheduled: boolean
  /** Each host's own flush, e.g. Solid's -- see `flushCells()`. */
  hostFlushes: Set<() => void>
  /** Each Solid's `enableExternalSource` we've bridged, so we bridge each once -- see `bridgeSolid()`. */
  bridged: WeakSet<Function>
}

////////////////
// ## Helpers
////////////////

/**
 * The page's `CellsContext`:  made by the first copy of this module to load, shared by the rest.
 * - NEVER share one of another shape:  throws, rather than mis-tracking silently.
 */
function sharedContext(): CellsContext {
  const holder = globalThis as unknown as Record<symbol, CellsContext | undefined>
  const existing = holder[CONTEXT_KEY]
  if (existing) {
    if (existing.version !== CONTEXT_VERSION) {
      throw new Error(
        `spell cells:  this page already runs cells context v${existing.version}, this copy needs v${CONTEXT_VERSION} -- ` +
          `two incompatible builds of @spell-app/util on one page.`
      )
    }
    return existing
  }
  const context: CellsContext = {
    version: CONTEXT_VERSION,
    collector: null,
    pending: new Set(),
    checkScheduled: false,
    hostFlushes: new Set(),
    bridged: new WeakSet()
  }
  Object.defineProperty(holder, CONTEXT_KEY, { value: context })
  return context
}
