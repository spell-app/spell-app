/**
 * Array helpers lodash has no shape for.
 * - Here, not beside the generic helpers:  only the spell family uses them, so `ui` mustn't bundle them.
 */

////////////////
// ## Picking items
////////////////

/**
 * Every item of `items` whose `scoreOf()` is the highest, in `items` order (earliest first).
 * - e.g. `itemsWithHighest(["a", "bb", "cc"], (it) => it.length)` => `["bb", "cc"]`
 * - Why not lodash `maxBy()`:  it keeps only ONE of the tied items, and callers break ties themselves.
 * - Empty `items` => `[]`.
 */
export function itemsWithHighest<T>(items: readonly T[], scoreOf: (item: T) => number): T[] {
  let highest: T[] = []
  let max = -Infinity
  for (const item of items) {
    const score = scoreOf(item)
    if (score > max) {
      max = score
      highest = [item]
    } else if (score === max) {
      highest.push(item)
    }
  }
  return highest
}
