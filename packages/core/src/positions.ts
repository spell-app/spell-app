/**
 * Positions, counted from where a project's lists start (epic `python-target` P2).
 * - spell counts from 1 inside;  a project may count from 0 (`project.json`'s `"listsStartAt": 0`).
 * - No imports:  `List` and the collection helpers both use it.
 */

/**
 * Where a project's lists start counting:  `1`, spell's own, or `0`, `project.json`'s `"listsStartAt": 0`.
 * - Only numbers count from it:  ordinal words don't change, "the first card" is the first either way.
 * - Negative positions count from the end either way:  `-1` is the last item.
 */
export type StartAt = 0 | 1

/**
 * `position`, counted from `startAt`, as spell's own position, from 1:  `fromStartAt(0, 0)` is `1`.
 * - Negative positions, keys (text) and nothing are returned as they are.
 */
export function fromStartAt<P>(position: P, startAt: StartAt = 1): P {
  return (startAt === 0 && typeof position === "number" && position >= 0 ? position + 1 : position) as P
}

/**
 * spell's own `position`, from 1, counted from `startAt` instead:  `toStartAt(1, 0)` is `0`.
 * - Nothing stays nothing:  a missing item is never `-1`.
 */
export function toStartAt<P>(position: P, startAt: StartAt = 1): P {
  return (startAt === 0 && typeof position === "number" && position > 0 ? position - 1 : position) as P
}

/**
 * The array index of spell's `position` (from 1) in an array of `count` items:  `undefined` for none.
 * - Negative positions count from the end:  `-1` is the last item.
 * - `0` is no item:  spell counts from 1.
 * - Past the end is the index past the end:  a setter may grow the array there.
 */
export function zeroIndexOf(position: number, count: number): number | undefined {
  if (position > 0) return position - 1
  if (position < 0 && -position <= count) return count + position
  return undefined
}
