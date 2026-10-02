import { observe, unobserve } from "@nx-js/observer-util"
import { createSignal, getOwner, onCleanup, runWithOwner, type Accessor, type Signal } from "solid-js"

/**
 * A Solid accessor over `easy-state` reads:  `read()` re-runs when an `easy-state` value it read changes, and Solid
 * code reading the accessor re-runs after.
 * - The bridge while spell state is `easy-state` (spell Things, the editor store):  Solid UI SEES it change, and
 *   React keeps rendering compiled spell from the same state.  P11 (spell cells) replaces what's under it.
 * - On `observer-util` directly, NOT `easy-state`'s `autoEffect()`:  that calls its scheduler before its reaction
 *   exists, so a `read()` that writes what it just read (a Solitaire computed property filling a new pile) threw
 *   "Cannot access 'observer' before initialization" (plan doc I3).
 * - When it re-reads:
 *   - default:  at once, on the `easy-state` write
 *   - never for a change `read()` makes itself while it runs (see `schedule()`)
 *   - `deferred`:  always on a microtask, once for any number of writes before it.  For reads that run a
 *     PROGRAM's code (a Thing's computed property):  never in the middle of the program's own writes, and 10
 *     writes cost one read.  A change shows after the microtask, then Solid's `flush()`.
 * - `equals: false`:  `easy-state` mutates objects in place, so a changed list is often the SAME array -- every
 *   re-read notifies.  Read narrowly (`() => editor.project?.title`, not `() => editor`).
 * - Writes are Solid's, so STAGED:  a read right after an `easy-state` write sees the old value until the
 *   microtask or `flush()`.
 * - SIDE EFFECT:  an `observer-util` reaction, stopped when the calling owner (component, root) is disposed.  With
 *   no owner it lives until `dispose()`:  call it.
 */
export function tracked<T>(read: () => T, { deferred = false }: TrackedOptions = {}): TrackedAccessor<T> {
  let running = false
  let queued = false
  let stopped = false
  let signal: Signal<Box<T>> | undefined
  const reaction = observe(
    () => {
      running = true
      try {
        const value = read()
        // first run (synchronous, right here):  make the signal.  Boxed:  `createSignal(fn)` would treat a function
        // VALUE as a computation.
        if (!signal) signal = createSignal<Box<T>>({ value }, { equals: false })
        // later runs:  a Solid write, made OUTSIDE any owner -- `easy-state` writes happen in whatever scope wrote,
        // and Solid 2 forbids writes in an owned scope (`REACTIVE_WRITE_IN_OWNED_SCOPE`)
        else runWithOwner(null, () => signal![1]({ value }))
      } finally {
        running = false
      }
    },
    { scheduler: schedule }
  )
  const [box] = signal!
  const dispose = () => {
    stopped = true
    unobserve(reaction)
  }
  if (getOwner()) onCleanup(dispose)
  return Object.assign(() => box().value, { dispose })

  /**
   * Called by `observer-util` when something `read()` read changed:  read again now, or on a microtask.
   * - NEVER for a change `read()` made itself, while running:  a computed property that builds a new pile on every
   *   read would re-read forever.
   */
  function schedule() {
    if (stopped || running) return
    if (!deferred) {
      reaction()
      return
    }
    if (queued) return
    queued = true
    queueMicrotask(() => {
      queued = false
      if (!stopped) reaction()
    })
  }
}

/** Options for `tracked()`. */
export type TrackedOptions = {
  /** Re-read on a microtask, once per batch of writes, never mid-write:  for reads that run a program's code. */
  deferred?: boolean
}

/** What `tracked()` returns:  the accessor, plus `dispose()` to stop tracking early (or with no owner). */
export type TrackedAccessor<T> = Accessor<T> & {
  /** Stop re-reading;  the accessor keeps its last value. */
  dispose(): void
}

/** A value in a box, so it can be any type, functions included. */
type Box<T> = { value: T }
