/**
 * Positions:  the core counts from 0, as javascript does,
 * and knows nothing of where a spell project counts from.
 * - Why, in Owen's words (epic `python-target` P23, Q28):
 *   "listsStartAt is a *spell language* thing, emitted code is canonical for platform"
 * - An index counts from 0;  a negative one from the end, `-1` the last item.
 * - spell code counting from 1 (the default) is turned into indexes as it COMPILES:
 *   - a number written out is folded:  "item 4 of the deck" is `deck.getItem(3)`
 *   - one known only when it runs goes through `position()`:  `deck.getItem(position(column))`
 *   - a position coming out, e.g. "the position of the ace in the deck", through `spellPosition()`
 *   - a range's end, which spell includes and `slice()` doesn't, through `endPosition()`
 *   - a loop handing its function the position, through `withSpellPositions()`
 * - No imports:  `List` and the collection helpers both use it.
 */

/**
 * spell's position `n`, counted from 1, as an index, counted from 0:  `position(2)` is `1`.
 * - Negative counts from the end either way, as it is:  `position(-1)` is `-1`.
 * - `0` is no position at all:  `NaN`, which reads nothing, as "item 0" reads nothing counting from 1.
 * - Anything but a number, as it is:  a key, nothing.
 */
export function position<P>(n: P): P {
  if (typeof n !== "number") return n
  return (n > 0 ? n - 1 : n === 0 ? Number.NaN : n) as P
}

/**
 * `index`, counted from 0, as spell's position, counted from 1:  `spellPosition(0)` is `1`.
 * - Nothing stays nothing:  a missing item's position is never `0`.
 * - Negative counts from the end either way, as it is.
 */
export function spellPosition<P>(index: P): P {
  return (typeof index === "number" && index >= 0 ? index + 1 : index) as P
}

/**
 * spell's END position `n` as the end of a `slice()`:  `endPosition(4)` is `4`, so "items 2 to 4" is `slice(1, 4)`.
 * - spell's end counts from 1, and its range includes it ("items 2 to 4");  a `slice()` stops before its end.
 * - `-1`, the last item:  `undefined`, to the end.
 * - Other negatives:  one more, `-2` is `-1`.
 * - `0`:  `0`, an empty range.
 * - Anything but a number:  `undefined`.
 */
export function endPosition(n: unknown): number | undefined {
  if (typeof n !== "number") return undefined
  return n === -1 ? undefined : n < -1 ? n + 1 : n
}

/**
 * `callback`, handed spell's positions, from 1, where a loop hands it indexes:
 * `deck.forEach(withSpellPositions((card, position) => ...))`.
 * - For a loop in code counting from 1 whose function takes the position.
 */
export function withSpellPositions<T, A extends unknown[], R>(
  callback: (item: T, position: number, ...rest: A) => R
): (item: T, index: number, ...rest: A) => R {
  return (item, index, ...rest) => callback(item, spellPosition(index), ...rest)
}

/**
 * The index `index` reaches in a collection of `count` items, counted from 0:  `undefined` if it reaches none.
 * - From 0 on:  as it is, even past the end, where setting one grows an array (`map()` builds its result so).
 * - Negative counts from the end:  `-1` is the last;  further back than the first, none.
 * - Not a whole number (`NaN`, `1.5`):  none.
 */
export function zeroIndexOf(index: number, count: number): number | undefined {
  if (!Number.isInteger(index)) return undefined
  if (index >= 0) return index
  return -index <= count ? count + index : undefined
}
