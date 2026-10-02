import { createSignal, getOwner, onCleanup, runWithOwner, type Accessor, type Signal } from "solid-js"

import { autoEffect, clearEffect } from "$/util"

/**
 * A Solid accessor over `easy-state` reads:  `read()` re-runs when an `easy-state` value it read changes, and Solid
 * code reading the accessor re-runs after.
 * - The bridge while spell state is `easy-state` (spell Things, the editor store):  Solid UI SEES it change, and
 *   React keeps rendering compiled spell from the same state.  P11 (spell cells) replaces what's under it.
 * - `equals: false`:  `easy-state` mutates objects in place, so a changed list is often the SAME array -- every
 *   re-run notifies.  Read narrowly (`() => editor.project?.title`, not `() => editor`).
 * - Writes are Solid's, so STAGED:  a read right after an `easy-state` write sees the old value until the
 *   microtask or `flush()`.
 * - SIDE EFFECT:  an `easy-state` reaction, cleared when the calling owner (component, root) is disposed.  With no
 *   owner it lives until `dispose()`:  call it.
 * - NEVER write `easy-state` from inside `read()`:  it runs inside an `easy-state` reaction.
 */
export function tracked<T>(read: () => T): TrackedAccessor<T> {
  let signal: Signal<Box<T>> | undefined
  const reaction = autoEffect(() => {
    const value = read()
    // first run (synchronous, right here):  make the signal.  Boxed:  `createSignal(fn)` would treat a function
    // VALUE as a computation.
    if (!signal) signal = createSignal<Box<T>>({ value }, { equals: false })
    // later runs:  a Solid write, made OUTSIDE any owner -- `easy-state` reactions run synchronously in whatever
    // scope wrote, and Solid 2 forbids writes in an owned scope (`REACTIVE_WRITE_IN_OWNED_SCOPE`)
    else runWithOwner(null, () => signal![1]({ value }))
  })
  const [box] = signal!
  const dispose = () => clearEffect(reaction)
  if (getOwner()) onCleanup(dispose)
  return Object.assign(() => box().value, { dispose })
}

/** A value in a box, so it can be any type, functions included. */
type Box<T> = { value: T }

/** What `tracked()` returns:  the accessor, plus `dispose()` to stop tracking early (or with no owner). */
export type TrackedAccessor<T> = Accessor<T> & {
  /** Clear the `easy-state` reaction;  the accessor keeps its last value. */
  dispose(): void
}
