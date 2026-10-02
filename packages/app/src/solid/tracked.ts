import { createMemo, createRoot, getOwner, type Accessor } from "solid-js"

import "./cellsBridge"

/**
 * A Solid accessor over a read of spell state -- `read()` re-runs when a spell cell it read changes, and Solid code
 * reading the accessor re-runs after.
 * - Spell state is spell cells (`$/util`'s `cells.ts`):  spell Things, `SP.*`, the editor.  The bridge
 *   (`./cellsBridge`) makes EVERY Solid computation follow the cells it reads, so a plain read in JSX
 *   (`{editor.notice}`) is reactive too.  `tracked()` adds a memo:  `read()` runs once per change, however many
 *   places read the accessor, and Solid code can hold the accessor.
 * - Re-reads on Solid's schedule (a microtask, or `flush()`):  NEVER in the middle of a program's own writes, and ten
 *   writes cost one read.  So it's safe for reads that run a PROGRAM's code, e.g. a Thing's computed property
 *   (what `{ deferred: true }` used to ask for).
 * - NEVER re-reads for a change `read()` makes itself:  a computed property that builds a new pile on every read
 *   would re-read forever.  See `Reaction` in `$/util`.
 * - Every re-read notifies (`equals: false`):  the value may be the same object with something else changed.  Read
 *   narrowly (`() => editor.project?.title`, not `() => editor`).
 * - The value is Solid's, so STAGED:  right after a write, the accessor still has the old value until the
 *   microtask or `flush()` (`spellCore.flush()`).  A plain `editor.x` read is never stale.
 * - Boxed, so `read()` may return a function or a Promise as a VALUE:  Solid would call / await them.
 * - Owned by the calling owner (component, root), and disposed with it.  With no owner it lives until `dispose()`:
 *   call it.
 */
export function tracked<T>(read: () => T): TrackedAccessor<T> {
  if (getOwner()) return Object.assign(memoOf(read), { dispose: () => {} })
  return createRoot((dispose) => Object.assign(memoOf(read), { dispose }))
}

/** What `tracked()` returns:  the accessor, plus `dispose()` to stop tracking early (or with no owner). */
export type TrackedAccessor<T> = Accessor<T> & {
  /** Stop re-reading;  the accessor keeps its last value.  A no-op for one an owner disposes. */
  dispose(): void
}

/** A memo of `read()`, boxed -- see `tracked()`. */
function memoOf<T>(read: () => T): Accessor<T> {
  const box = createMemo(() => ({ value: read() }), { equals: false })
  return () => box().value
}
