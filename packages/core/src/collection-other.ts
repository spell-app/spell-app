/**
 * Composite / derived collection methods for `spell` -- built on top of the primitive
 * accessors in `collection-core.ts` (`itemCountOf`, `getItemOf`, `getIteratorFor`, etc).
 * - All array iteration is 1-based.
 * - Collection methods work with objects as well as arrays, unless specified.
 *   - For objects: use natural key order for position.
 * - TODO: collections for `words`, `lines`, etc?
 */
import _ from "lodash"
import { spellCore } from "./core"
import { assert } from "$/core"
import { defineSpellCoreModule } from "./spellCore.types"
import type { CollectionOf } from "./collection-core"

/** A valid `{ start, end }` 1-based range, as computed by the `_validateRange*` helpers. */
export type Range = {
  /** 1-based start position, inclusive. */
  start: number
  /** 1-based end position, inclusive. */
  end: number
}

/**
 * Iteration callback shared by `forEach`/`map`/`filter`/`all`/`any`/etc: `(value, item, collection) => ...`
 * - `value`:  an item of the collection, `T` -- see `CollectionOf`.
 * - Those helpers take it as `CollectionIterationCallback<NoInfer<T>>`:  ONLY the collection says what `T` is, so a
 *   callback taking a `Card` is checked against a `List<Card>`, and refused for a list of who-knows-what.
 */
export type CollectionIterationCallback<T = unknown> = (value: T, item: string | number, collection: unknown) => unknown

/** A list with guards, e.g. a `List` -- see `spellCore.move()`, `List.moveHere()`. */
type Guarded = {
  /** Move `thing` here, if allowed -- returns whether it moved. */
  moveHere(thing: unknown): boolean
  /** Would we take `thing`, moved here? */
  canTake(thing: unknown): unknown
  /** Would we give up `thing`, moved elsewhere? */
  canGiveUp(thing: unknown): unknown
}

export const collectionOtherMethods = defineSpellCoreModule({
  ////////////////
  // ## composite accessors
  ////////////////

  /**
   * Does `collection` include ALL of the specified `values`?
   * - If more than one value specified, all must be included.
   * - Compiles from `theList includes thing` / `thing is in theList` / `thing is either red or green`
   *   -- see `expressions.ts`.
   */
  includes(collection?: unknown, ...values: unknown[]): boolean {
    if (!assert.isDefined(collection, "spellCore.includes(collection)")) return false
    if (!values.length) return false
    return spellCore.all(values, (value) => spellCore.itemOf(collection, value) !== undefined)
  },

  /**
   * Does `collection` include any of the specified `values`?
   * - If more than one value specified, only one must be included.
   */
  includesAny(collection?: unknown, ...values: unknown[]): boolean {
    if (!assert.isDefined(collection, "spellCore.includesAny(collection)")) return false
    return spellCore.any(values, (value) => spellCore.itemOf(collection, value) !== undefined)
  },

  ////////////////
  // ## numeric iteration -- arrays only
  ////////////////

  /**
   * Return a duplicate of the collection.
   * - Compiles from `a copy of the piles` / `a duplicate of list the piles as a list` -- see `lists.ts`.
   */
  duplicateCollection(collection?: unknown, constructor?: new () => unknown): unknown {
    if (!assert.isArrayLike(collection, "spellCore.duplicateCollection(collection)")) return false
    // a copy owns nothing -- see `spellCore.newScratch()`
    const result = constructor ? spellCore.newScratch(constructor) : spellCore.newThingLike(collection)
    return spellCore.mergeCollectionsInto(result, collection)
  },

  /** Merge all `source` collection(s) into `destination`, in place. */
  mergeCollectionsInto(destination?: unknown, ...sources: unknown[]): unknown {
    if (!assert.isArrayLike(destination, "spellCore.mergeCollectionsInto(collection)")) return false
    sources.forEach((source) => {
      if (source) spellCore.forEach(source, (item) => spellCore.append(destination, item))
    })
    return destination
  },

  /**
   * Given a collection of collections, merge into a new one of the same type as the first in the list.
   * - Compiles from `merge the piles` / `merge the piles as a list` -- see `lists.ts`.
   */
  mergeCollections(collections?: unknown, constructor?: new () => unknown): unknown {
    if (!assert.isArrayLike(collections, "spellCore.mergeCollections(collection)")) return undefined
    let merged: unknown
    // a merge owns nothing -- see `spellCore.newScratch()`
    if (constructor) {
      merged = spellCore.newScratch(constructor)
    } else {
      const first = spellCore.getItemOf(collections, 1)
      if (!assert.isArrayLike(first, "spellCore.mergeCollections(collection)")) return undefined
      merged = spellCore.newThingLike(first)
    }
    spellCore.forEach(collections, (next) => spellCore.mergeCollectionsInto(merged, next))
    return merged
  },

  ////////////////
  // ## numeric iteration -- arrays only
  ////////////////

  /**
   * Is `thing` the first thing in `collection`?  Array only.
   * - Compiles from `my-list starts with thing` -- see `lists.ts`.
   */
  startsWith(collection?: unknown, thing?: unknown): boolean {
    if (!assert.isArrayLike(collection, "spellCore.startsWith(collection)")) return false
    if (thing == null) return false
    return spellCore.getItemOf(collection, 1) === thing
  },

  /**
   * Is `thing` the last thing in `collection`?  Array only.
   * - Compiles from `my-list ends with thing` -- see `lists.ts`.
   */
  endsWith(collection?: unknown, thing?: unknown): boolean {
    if (!assert.isArrayLike(collection, "spellCore.endsWith(collection)")) return false
    if (thing == null) return false
    return spellCore.getItemOf(collection, spellCore.itemCountOf(collection)) === thing
  },

  /** Add `things` to front of `collection`, pushing everything else down.  Array only. */
  prepend(collection?: unknown, ...things: unknown[]): void {
    spellCore.addAtPosition(collection, 1, ...things)
  },

  /** Add `things` to end of `collection`.  Array only. */
  append(collection?: unknown, ...things: unknown[]): void {
    spellCore.addAtPosition(collection, spellCore.itemCountOf(collection) + 1, ...things)
  },

  /**
   * Set values of item starting with `start` as 1-based position.
   * - Replaces existing values.
   */
  setItemsOf(collection?: unknown, start?: number, ...values: unknown[]): void {
    if (!assert.isArrayLike(collection, "spellCore.setItemsOf(collection)")) return
    values.forEach((value, index) => {
      spellCore.setItemOf(collection, (start ?? 0) + index, value)
    })
  },

  /** Reverse list in-place.  Array only. */
  reverse(collection?: unknown): void {
    if (!assert.isArrayLike(collection, "spellCore.reverse(collection)")) return
    const reversed = spellCore.valuesOf(collection).reverse()
    spellCore.setItemsOf(collection, 1, ...reversed)
  },

  /**
   * Given possible `start` and `end` 1-based position in collection, as well as `itemCount` items
   * in the collection, return `{ start, end }` for a valid range, or `undefined` if an invalid
   * range was specified.
   * - If `start` is negative, we'll take from the end of the list, but in normal list order.
   */
  _validateRangeBetween(
    start: number | null | undefined,
    end: number | null | undefined,
    itemCount: number
  ): Range | undefined {
    if (itemCount === 0) return undefined
    if (!spellCore.isANumber(start) || start === 0) start = 1
    // TODO === 0 ???
    else if (Math.abs(start) > itemCount) return undefined
    else if (start < 0) start = Math.max(itemCount + start + 1, 1)
    if (!spellCore.isANumber(end) || end > itemCount) end = itemCount
    if (end < start) return undefined
    return { start, end }
  },

  /**
   * Return subset of list from `start` to `end` as 1-based positions, inclusive.  Array only.
   * NOTE: this is positive numbers only, `rangeStartingAt()` deals with negatives. (???)
   * - Compiles from `item 1 to 2 of my-list` -- see `lists.ts`.
   */
  rangeBetween(collection?: unknown, start?: number | null, end?: number | null): unknown {
    if (!assert.isArrayLike(collection, "spellCore.rangeBetween(collection)")) return []
    const range = spellCore._validateRangeBetween(start, end, spellCore.itemCountOf(collection))
    if (!range) return []
    const results = spellCore.newThingLike(collection)
    for (let i = range.start; i <= range.end; i++) {
      spellCore.append(results, spellCore.getItemOf(collection, i))
    }
    return results
  },

  /**
   * Remove items from `collection` between 1-based positions `start` to `end`, inclusive.  Array only.
   * NOTE: this is positive numbers only. (???)
   * - Slides other items into the gaps.
   * - Compiles from `remove items 2 to 4 of my-list` -- see `lists.ts`.
   */
  removeRangeBetween(collection?: unknown, start?: number | null, end?: number | null): void {
    if (!assert.isArrayLike(collection, "spellCore.removeRangeBetween(collection)")) return
    const range = spellCore._validateRangeBetween(start, end, spellCore.itemCountOf(collection))
    if (!range) return
    const count = range.end - range.start + 1
    Array.prototype.splice.call(collection, range.start - 1, count)
  },

  /**
   * Given possible `start` as 1-based position in collection, `count` as number of items
   * (inclusive) and `itemCount` in collection: return `{ start, end }` for a valid range, or
   * `undefined` if an invalid range was specified.
   * - If `start` is negative, we'll take from the end of the list, but in normal list order.
   */
  _validateRangeStartingAt(
    start: number | null | undefined,
    count: number | null | undefined,
    itemCount: number
  ): Range | undefined {
    if (Math.abs(Number(start)) > itemCount) return undefined
    if (!spellCore.isANumber(start) || start === 0) start = 1
    // TODO === 0 ???
    else if (start < 0) start = Math.max(itemCount + start + 1, 1)
    const end = spellCore.isANumber(count) ? start + count - 1 : itemCount
    return spellCore._validateRangeBetween(start, end, itemCount)
  },

  /**
   * Return `count` items from list starting with `start` as 1-based position.  Array only.
   * - Negative `start` takes from the end of the list (but returns in list order).
   * - Compiles from `top 2 items of my-list` / `first 2 words in "..."` / `last two cards from deck`
   *   -- see `lists.ts`.
   */
  rangeStartingAt(collection?: unknown, start?: number | null, count?: number | null): unknown {
    if (!assert.isArrayLike(collection, "spellCore.rangeStartingAt(collection)")) return []
    const range = spellCore._validateRangeStartingAt(start, count, spellCore.itemCountOf(collection))
    if (!range) return []
    return spellCore.rangeBetween(collection, range.start, range.end)
  },

  ////////////////
  // ## iteration
  ////////////////

  /** Execute `method` for each item in `collection`, ignoring results. */
  forEach<T = unknown>(collection?: CollectionOf<T>, method?: CollectionIterationCallback<NoInfer<T>>): void {
    if (!assert.isDefined(collection, "spellCore.forEach(collection)")) return
    if (!method) return
    const iterator = spellCore.getIteratorFor(collection)
    let result = iterator.next()
    while (!result.done) {
      method(...result.value)
      result = iterator.next()
    }
  },

  /**
   * Execute `method` for each item of map, `await`ing method's completion.
   * - The entire thing will finish when all waiting is done.
   * - Results are ignored.
   */
  async forEachSequential<T = unknown>(
    collection?: CollectionOf<T>,
    method?: CollectionIterationCallback<NoInfer<T>>
  ): Promise<void> {
    if (!assert.isDefined(collection, "spellCore.forEachSequential(collection)")) return
    if (!method) return
    const iterator = spellCore.getIteratorFor(collection)
    let result = iterator.next()
    while (!result.done) {
      await method(...result.value)
      result = iterator.next()
    }
  },

  /**
   * Execute `method` for each item in `collection`, returning results in same type as `collection`.
   * - Compiles from `for each number from 1 to 10: ...` / `repeat 3 times: ...` as
   *   `spellCore.map(spellCore.getRange(...), (number) => { ... })` -- see `lists.ts`.
   * TODO: rename???
   */
  map<T = unknown>(collection?: CollectionOf<T>, method?: CollectionIterationCallback<NoInfer<T>>): unknown {
    if (!assert.isDefined(collection, "spellCore.map(collection)")) return undefined
    const results = spellCore.newThingLike(collection)
    if (!method) return results
    spellCore.forEach(collection, (value, item, coll) => {
      spellCore.setItemOf(results, item, method(value, item, coll))
    })
    return results
  },

  /**
   * Return new `collection` of only things which match `condition` filter.
   * - For array: returns a compacted collection of same type.
   * - For object: returns new type of collection with just specified keys.
   * - Compiles from `words in "a word list" where ...` -- see `lists.ts`.
   */
  filter<T = unknown>(collection?: CollectionOf<T>, condition?: CollectionIterationCallback<NoInfer<T>>): unknown {
    if (!assert.isDefined(collection, "spellCore.filter(collection)")) return undefined
    if (!condition) condition = (it) => it
    const results = spellCore.newThingLike(collection)
    let filter: CollectionIterationCallback<T>
    if (spellCore.isArrayLike(collection)) {
      filter = (value, item, _collection) => {
        if (condition!(value, item, _collection)) spellCore.append(results, value)
      }
    } else {
      filter = (value, item, _collection) => {
        if (condition!(value, item, _collection)) spellCore.setItemOf(results, item, value)
      }
    }
    spellCore.forEach(collection, filter)
    return results
  },

  /**
   * Return `true` if all items in collection match `condition`, called as
   * `condition(value, item, collection)`.
   */
  all<T = unknown>(collection?: CollectionOf<T>, condition?: CollectionIterationCallback<NoInfer<T>>): boolean {
    if (!assert.isDefined(collection, "spellCore.all(collection)")) return false
    if (!condition) condition = (it) => it
    const iterator = spellCore.getIteratorFor(collection)
    let result = iterator.next()
    if (result.done) return false
    while (!result.done) {
      if (!condition(...result.value)) return false
      result = iterator.next()
    }
    return true
  },

  /**
   * Return `true` if at least one item in collection matches `condition`, called as
   * `condition(value, item, collection)`.
   * - Compiles from `my-list has items where ...` -- see `lists.ts`.
   */
  any<T = unknown>(collection?: CollectionOf<T>, condition?: CollectionIterationCallback<NoInfer<T>>): boolean {
    if (!assert.isDefined(collection, "spellCore.any(collection)")) return false
    if (!condition) condition = (it) => it
    const iterator = spellCore.getIteratorFor(collection)
    let result = iterator.next()
    if (result.done) return false
    while (!result.done) {
      if (condition(...result.value)) return true
      result = iterator.next()
    }
    return false
  },

  /**
   * Remove `items` from `collection`.
   * - For array: `items` are 1-based positions.
   * - For object: `items` are string keys.
   */
  removeItemsOf(collection?: unknown, ...items: Array<string | number>): void {
    if (!assert.isDefined(collection, "spellCore.removeItemsOf(collection)")) return
    // Sort numeric keys DESCENDING so we don't have to worry about renumbering as we go.
    // NOTE: MUST pass a comparator -- bare `.sort()` is lexicographic, so positions 2 and 10
    // came back in the wrong order and removal renumbered the wrong items.
    if (spellCore.isArrayLike(collection)) items = items.sort((a, b) => Number(b) - Number(a))
    items.forEach((item) => spellCore.removeItemOf(collection, item))
  },

  /**
   * Remove all occurance of `things` from collection, in-place.
   * - For object: removes `values`.
   * - Compiles from `remove thing from my-list` -- see `lists.ts`.
   */
  remove(collection?: unknown, ...things: unknown[]): void {
    if (!assert.isDefined(collection, "spellCore.remove(collection)")) return
    things.forEach((thing) => {
      let item = spellCore.itemOf(collection, thing)
      while (item !== undefined) {
        spellCore.removeItemOf(collection, item)
        item = spellCore.itemOf(collection, thing)
      }
    })
  },

  /**
   * Remove items from `collection` which match `condition`, called as `condition(value, item, collection)`.
   * - Compiles from `remove items from my-list where ...` -- see `lists.ts`.
   */
  removeWhere<T = unknown>(collection?: CollectionOf<T>, condition?: CollectionIterationCallback<NoInfer<T>>): void {
    if (!assert.isDefined(collection, "spellCore.removeWhere(collection)")) return
    const itemsToRemove = spellCore.filter(collection, condition)
    if (spellCore.isArrayLike(collection)) spellCore.remove(collection, ...(itemsToRemove as unknown[]))
    else spellCore.removeItemsOf(collection, ...Object.keys(itemsToRemove as object))
  },

  ////////////////
  // ## Moving -- a list's guards
  ////////////////

  /**
   * Move `thing` to `collection` -- `move the card to the tableau`:  if the list holding it lets it go,
   * and `collection` takes it.
   * - Returns whether it moved.  Refused:  nothing changes.  See `List.moveHere()`.
   * - A plain list has no guards:  `thing` is just added.
   * - Compiles from `move thing to my-list`, a statement or a yes / no -- see `lists.ts`.
   */
  move(thing?: unknown, collection?: unknown): boolean {
    if (!assert.isArrayLike(collection, "spellCore.move(thing, collection)")) return false
    const guarded = collection as Partial<Guarded>
    if (typeof guarded.moveHere === "function") return guarded.moveHere(thing)
    spellCore.append(collection, thing)
    return true
  },

  /**
   * Would `collection` take `thing`, moved there?  See `List.canTake()`.  A plain list takes anything.
   * - Compiles from `the tableau can take the card` -- see `lists.ts`.
   */
  canTake(collection?: unknown, thing?: unknown): boolean {
    if (!assert.isArrayLike(collection, "spellCore.canTake(collection)")) return false
    const guarded = collection as Partial<Guarded>
    return typeof guarded.canTake === "function" ? !!guarded.canTake(thing) : true
  },

  /**
   * Would `collection` give up `thing`, moved elsewhere?  See `List.canGiveUp()`.  A plain list gives up anything.
   * - Compiles from `the pile can give up the card` -- see `lists.ts`.
   */
  canGiveUp(collection?: unknown, thing?: unknown): boolean {
    if (!assert.isArrayLike(collection, "spellCore.canGiveUp(collection)")) return false
    const guarded = collection as Partial<Guarded>
    return typeof guarded.canGiveUp === "function" ? !!guarded.canGiveUp(thing) : true
  },

  ////////////////
  // ## Randomizing / random item selection
  ////////////////

  /** Return a random key of `collection`. */
  _randomKeyOf(collection?: unknown): string | number | undefined {
    if (!assert.isDefined(collection, "spellCore._randomKeyOf(collection)")) return undefined
    if (spellCore.itemCountOf(collection) === 0) return undefined
    const item = spellCore.randomNumber(1, spellCore.itemCountOf(collection))
    if (spellCore.isArrayLike(collection)) return item
    return spellCore.keysOf(collection)[(item as number) - 1]
  },

  /**
   * Return a single item from `collection`, picked randomly.
   * - Compiles from `a random item of my-list` / `a random card from the deck` -- see `lists.ts`.
   * - Typed by `collection`, as `getItemOf()`.
   */
  randomItemOf<T = unknown>(collection?: CollectionOf<T>): T | undefined {
    if (!assert.isDefined(collection, "spellCore.randomItemOf(collection)")) return undefined
    const key = spellCore._randomKeyOf(collection)
    if (key === undefined) return undefined
    return spellCore.getItemOf(collection, key)
  },

  /**
   * Return list of up to `count` items from `collection`, picked randomly, where each item can be
   * returned only once.  Returns same type as was passed in.
   * - Compiles from `2 random items of my-list` / `3 random cards from deck` -- see `lists.ts`.
   */
  randomItemsOf(collection?: unknown, count?: number): unknown {
    if (!assert.isDefined(collection, "spellCore.randomItemsOf(collection)")) return undefined
    if (!spellCore.isANumber(count)) count = spellCore.itemCountOf(collection)
    const results = spellCore.newThingLike(collection)
    if (count === 0) return results
    const keys = spellCore.keysOf(collection)
    const shuffledKeys = _.shuffle(keys).slice(0, count)
    if (spellCore.isArrayLike(collection)) {
      shuffledKeys.forEach((key) => {
        spellCore.append(results, spellCore.getItemOf(collection, key))
      })
    } else {
      shuffledKeys.forEach((key) => {
        spellCore.setItemOf(results, key, spellCore.getItemOf(collection, key))
      })
    }
    return results
  },

  /**
   * Randomize `collection` in-place.
   * - No-op for a plain-object collection -- only array-like collections are reordered.
   * - Compiles from `shuffle my-list` / `randomize my-list` -- see `lists.ts`.
   */
  randomize(collection?: unknown): void {
    if (!assert.isDefined(collection, "spellCore.randomize(collection)")) return
    if (!spellCore.isArrayLike(collection)) return
    const randomized = spellCore.randomItemsOf(collection)
    spellCore.setItemsOf(collection, 1, ...(randomized as unknown[]))
  },

  /**
   * Return smallest item of `collection` according to `<` comparison.
   * - Compiles from `smallest of prices` / `smallest value in prices` -- see `math.ts`.
   */
  smallestOf(collection?: unknown): unknown {
    if (!assert.isDefined(collection, "spellCore.smallestOf(collection)")) return undefined
    if (spellCore.itemCountOf(collection) === 0) return undefined
    const values = spellCore.valuesOf(collection) as Array<number | string>
    return values.reduce((smallest, next) => (next < smallest ? next : smallest), values[0])
  },

  /**
   * Return largest item of `collection` according to `>` comparison.
   * - Compiles from `largest of the prices` / `biggest in prices` -- see `math.ts`.
   */
  largestOf(collection?: unknown): unknown {
    if (!assert.isDefined(collection, "spellCore.largestOf(collection)")) return undefined
    if (spellCore.itemCountOf(collection) === 0) return undefined
    const values = spellCore.valuesOf(collection) as Array<number | string>
    return values.reduce((largest, next) => (next > largest ? next : largest), values[0])
  }
})
Object.assign(spellCore, collectionOtherMethods)
