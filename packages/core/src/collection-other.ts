/**
 * Composite / derived collection methods for `spell` -- built on top of the primitive
 * accessors in `collection-core.ts` (`itemCountOf`, `getItemAt`, `getIteratorFor`, etc).
 * - All array iteration is 1-based.
 * - Collection methods work with objects as well as arrays, unless specified.
 *   - For objects: use natural key order for position.
 * - TODO: collections for `words`, `lines`, etc?
 */
import _ from "lodash"
import { spellCore } from "./core"
import { assert, List } from "$/core"
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
 * Iteration callback shared by `forEach`/`map`/`filter`/`all`/`any`/etc: `(value, position, collection) => ...`
 * - `value`:  an item of the collection, `T` -- see `CollectionOf`.
 * - `position`:  where it is, from 1 -- a plain object's:  its key.
 * - Those helpers take it as `CollectionIterationCallback<NoInfer<T>>`:  ONLY the collection says what `T` is, so a
 *   callback taking a `Card` is checked against a `List<Card>`, and refused for a list of who-knows-what.
 */
export type CollectionIterationCallback<T = unknown> = (
  value: T,
  position: string | number,
  collection: unknown
) => unknown

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
   *   -- see `rules/expressions/`.
   */
  includes(collection?: unknown, ...values: unknown[]): boolean {
    if (!assert.isDefined(collection, "spellCore.includes(collection)")) return false
    if (!values.length) return false
    return spellCore.all(values, (value) => spellCore.positionOf(collection, value) !== undefined)
  },

  /**
   * Does `collection` include any of the specified `values`?
   * - If more than one value specified, only one must be included.
   */
  includesAny(collection?: unknown, ...values: unknown[]): boolean {
    if (!assert.isDefined(collection, "spellCore.includesAny(collection)")) return false
    return spellCore.any(values, (value) => spellCore.positionOf(collection, value) !== undefined)
  },

  ////////////////
  // ## numeric iteration -- arrays only
  ////////////////

  /**
   * Return a duplicate of the list.
   * - Compiles from `a copy of the piles` / `a duplicate of list the piles as a list` -- see `rules/lists/CopyList.ts`.
   * - Typed as what it makes:  a `Pile` copied is a `Pile`;  copied `as` a class, that class.
   */
  duplicateList<C, K = C>(collection?: C, constructor?: new () => K): K {
    if (!assert.isArrayLike(collection, "spellCore.duplicateList(collection)")) return false as K
    // a copy owns nothing -- see `spellCore.newScratch()`
    const result = constructor ? spellCore.newScratch(constructor) : spellCore.newThingLike(collection)
    return spellCore.mergeListsInto(result, collection) as K
  },

  /** Merge all `source` list(s) into `destination`, in place. */
  mergeListsInto(destination?: unknown, ...sources: unknown[]): unknown {
    if (!assert.isArrayLike(destination, "spellCore.mergeListsInto(collection)")) return false
    sources.forEach((source) => {
      if (source) spellCore.forEach(source, (item) => spellCore.append(destination, item))
    })
    return destination
  },

  /**
   * Given a list of lists, merge into a new one of the same type as the first in the list.
   * - Compiles from `merge the piles` / `merge the piles as a list` -- see `rules/lists/MergeLists.ts`.
   * - Typed as what it makes:  piles merged are a `Pile`;  merged `as` a class, that class.
   */
  mergeLists<T = unknown, K = T>(collections?: CollectionOf<T>, constructor?: new () => K): K | undefined {
    if (!assert.isArrayLike(collections, "spellCore.mergeLists(collection)")) return undefined
    let merged: unknown
    // a merge owns nothing -- see `spellCore.newScratch()`
    if (constructor) {
      merged = spellCore.newScratch(constructor)
    } else {
      const first = spellCore.getItemAt(collections, 1)
      if (!assert.isArrayLike(first, "spellCore.mergeLists(collection)")) return undefined
      merged = spellCore.newThingLike(first)
    }
    spellCore.forEach(collections, (next) => spellCore.mergeListsInto(merged, next))
    return merged as K
  },

  ////////////////
  // ## numeric iteration -- arrays only
  ////////////////

  /**
   * Is `thing` the first thing in `collection`?  Array only.
   * - Compiles from `my-list starts with thing` -- see `rules/lists/StartsWith.ts`.
   */
  startsWith(collection?: unknown, thing?: unknown): boolean {
    if (!assert.isArrayLike(collection, "spellCore.startsWith(collection)")) return false
    if (thing == null) return false
    return spellCore.getItemAt(collection, 1) === thing
  },

  /**
   * Is `thing` the last thing in `collection`?  Array only.
   * - Compiles from `my-list ends with thing` -- see `rules/lists/EndsWith.ts`.
   */
  endsWith(collection?: unknown, thing?: unknown): boolean {
    if (!assert.isArrayLike(collection, "spellCore.endsWith(collection)")) return false
    if (thing == null) return false
    return spellCore.getItemAt(collection, spellCore.itemCountOf(collection)) === thing
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
   * Add `things` just before `item` in `collection`, pushing `item` and what follows down.  Array only.
   * - `item` isn't in `collection`:  added at the START.
   * - Compiles from `add thing to my-list before other-thing` -- see `rules/lists/ListAddRelative.ts`.
   *   `List.addBefore()` calls it.
   */
  addBefore(collection?: unknown, item?: unknown, ...things: unknown[]): void {
    if (!assert.isArrayLike(collection, "spellCore.addBefore(collection)")) return
    const position = spellCore.positionOf(collection, item) as number | undefined
    spellCore.addAtPosition(collection, position ?? 1, ...things)
  },

  /**
   * Add `things` just after `item` in `collection`, pushing what follows it down.  Array only.
   * - `item` isn't in `collection`:  added at the END.
   * - Compiles from `add thing to my-list after other-thing` -- see `rules/lists/ListAddRelative.ts`.
   *   `List.addAfter()` calls it.
   */
  addAfter(collection?: unknown, item?: unknown, ...things: unknown[]): void {
    if (!assert.isArrayLike(collection, "spellCore.addAfter(collection)")) return
    const position = spellCore.positionOf(collection, item) as number | undefined
    if (position === undefined) spellCore.append(collection, ...things)
    else spellCore.addAtPosition(collection, position + 1, ...things)
  },

  /**
   * Set the items from position `start` on to `values`, in turn.
   * - Replaces existing values.
   */
  setItemsOf(collection?: unknown, start?: number, ...values: unknown[]): void {
    if (!assert.isArrayLike(collection, "spellCore.setItemsOf(collection)")) return
    values.forEach((value, index) => {
      spellCore.setItemAt(collection, (start ?? 0) + index, value)
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
   * - Nothing in range:  an empty one of its kind -- see `emptyRangeOf()`.
   * - Compiles from `item 1 to 2 of my-list` -- see `rules/lists/RangeBetweenExpression.ts`.
   */
  rangeBetween(collection?: unknown, start?: number | null, end?: number | null): unknown {
    if (!assert.isArrayLike(collection, "spellCore.rangeBetween(collection)")) return []
    const range = spellCore._validateRangeBetween(start, end, spellCore.itemCountOf(collection))
    if (!range) return emptyRangeOf(collection)
    const results = spellCore.newThingLike(collection)
    for (let i = range.start; i <= range.end; i++) {
      spellCore.append(results, spellCore.getItemAt(collection, i))
    }
    return results
  },

  /**
   * Remove items from `collection` between 1-based positions `start` to `end`, inclusive.  Array only.
   * NOTE: this is positive numbers only. (???)
   * - Slides other items into the gaps.
   * - A `List` removes each through its own `removeItem()`, last first, so it keeps its owners -- see `List`.
   * - Compiles from `remove items 2 to 4 of my-list` -- see `rules/lists/ListRemoveRange.ts`.
   */
  removeRangeBetween(collection?: unknown, start?: number | null, end?: number | null): void {
    if (!assert.isArrayLike(collection, "spellCore.removeRangeBetween(collection)")) return
    const range = spellCore._validateRangeBetween(start, end, spellCore.itemCountOf(collection))
    if (!range) return
    if (typeof (collection as { removeItem?: unknown }).removeItem === "function") {
      for (let position = range.end; position >= range.start; position--) spellCore.removeItemAt(collection, position)
      return
    }
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
   *   -- see `rules/lists/RangeCountExpression.ts`.
   * - Typed as its collection:  a range of a `Pile` is a `Pile`.
   */
  rangeStartingAt<C>(collection?: C, start?: number | null, count?: number | null): C {
    if (!assert.isArrayLike(collection, "spellCore.rangeStartingAt(collection)")) return [] as C
    const range = spellCore._validateRangeStartingAt(start, count, spellCore.itemCountOf(collection))
    if (!range) return emptyRangeOf(collection) as C
    return spellCore.rangeBetween(collection, range.start, range.end) as C
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
   *   `spellCore.map(spellCore.getRange(...), (number) => { ... })` -- see `rules/lists/`.
   * TODO: rename???
   */
  map<T = unknown>(collection?: CollectionOf<T>, method?: CollectionIterationCallback<NoInfer<T>>): unknown {
    if (!assert.isDefined(collection, "spellCore.map(collection)")) return undefined
    const results = spellCore.newThingLike(collection)
    if (!method) return results
    spellCore.forEach(collection, (value, position, coll) => {
      spellCore.setItemAt(results, position, method(value, position, coll))
    })
    return results
  },

  /**
   * Return new `collection` of only things which match `condition` filter.
   * - For array: returns a compacted collection of same type.
   * - For object: returns new type of collection with just specified keys.
   * - Compiles from `words in "a word list" where ...` -- see `rules/lists/ListFilter.ts`.
   * - Typed as its collection:  the piles filtered are a `List<Pile>`, a `Pile` filtered is a `Pile`.
   */
  filter<T = unknown, C extends CollectionOf<T> = CollectionOf<T>>(
    collection?: C & CollectionOf<T>,
    condition?: CollectionIterationCallback<NoInfer<T>>
  ): C {
    if (!assert.isDefined(collection, "spellCore.filter(collection)")) return undefined as C
    if (!condition) condition = (it) => it
    const results = spellCore.newThingLike(collection)
    let filter: CollectionIterationCallback<T>
    if (spellCore.isArrayLike(collection)) {
      filter = (value, position, _collection) => {
        if (condition!(value, position, _collection)) spellCore.append(results, value)
      }
    } else {
      filter = (value, position, _collection) => {
        if (condition!(value, position, _collection)) spellCore.setItemAt(results, position, value)
      }
    }
    spellCore.forEach(collection, filter)
    return results as C
  },

  /**
   * Return `true` if all items in collection match `condition`, called as
   * `condition(value, position, collection)`.
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
   * `condition(value, position, collection)`.
   * - Compiles from `my-list has items where ...` -- see `rules/lists/ListMembershipTest.ts`.
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
   * Remove the items at `positions` of `collection`.
   * - For array: `positions` count from 1.
   * - For object: `positions` are string keys.
   */
  removeItemsAt(collection?: unknown, ...positions: Array<string | number>): void {
    if (!assert.isDefined(collection, "spellCore.removeItemsAt(collection)")) return
    // Sort numeric positions DESCENDING so we don't have to worry about renumbering as we go.
    // NOTE: MUST pass a comparator -- bare `.sort()` is lexicographic, so positions 2 and 10
    // came back in the wrong order and removal renumbered the wrong items.
    if (spellCore.isArrayLike(collection)) positions = positions.sort((a, b) => Number(b) - Number(a))
    positions.forEach((position) => spellCore.removeItemAt(collection, position))
  },

  /**
   * Remove all occurance of `things` from collection, in-place.
   * - For object: removes `values`.
   * - Compiles from `remove thing from my-list` -- see `rules/lists/ListRemove.ts`.
   */
  remove(collection?: unknown, ...things: unknown[]): void {
    if (!assert.isDefined(collection, "spellCore.remove(collection)")) return
    things.forEach((thing) => {
      let position = spellCore.positionOf(collection, thing)
      while (position !== undefined) {
        spellCore.removeItemAt(collection, position)
        position = spellCore.positionOf(collection, thing)
      }
    })
  },

  /**
   * Remove items from `collection` which match `condition`, called as `condition(value, position, collection)`.
   * - Compiles from `remove items from my-list where ...` -- see `rules/lists/ListRemoveWhere.ts`.
   */
  removeWhere<T = unknown>(collection?: CollectionOf<T>, condition?: CollectionIterationCallback<NoInfer<T>>): void {
    if (!assert.isDefined(collection, "spellCore.removeWhere(collection)")) return
    const itemsToRemove = spellCore.filter(collection, condition)
    if (spellCore.isArrayLike(collection)) spellCore.remove(collection, ...(itemsToRemove as unknown[]))
    else spellCore.removeItemsAt(collection, ...Object.keys(itemsToRemove as object))
  },

  ////////////////
  // ## Moving -- a list's guards
  ////////////////

  /**
   * Move `thing` to `collection` -- `move the card to the tableau`:  if the list holding it lets it go,
   * and `collection` takes it.
   * - Returns whether it moved.  Refused:  nothing changes.  See `List.moveHere()`.
   * - A plain list has no guards:  `thing` is just added.
   * - Compiles from `move thing to my-list`, a statement or a yes / no -- see `rules/lists/ListMove.ts`.
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
   * - Compiles from `the tableau can take the card` -- see `rules/lists/CanTake.ts`.
   */
  canTake(collection?: unknown, thing?: unknown): boolean {
    if (!assert.isArrayLike(collection, "spellCore.canTake(collection)")) return false
    const guarded = collection as Partial<Guarded>
    return typeof guarded.canTake === "function" ? !!guarded.canTake(thing) : true
  },

  /**
   * Would `collection` give up `thing`, moved elsewhere?  See `List.canGiveUp()`.  A plain list gives up anything.
   * - Compiles from `the pile can give up the card` -- see `rules/lists/CanGiveUp.ts`.
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
    const position = spellCore.randomNumber(1, spellCore.itemCountOf(collection))
    if (spellCore.isArrayLike(collection)) return position
    return spellCore.keysOf(collection)[(position as number) - 1]
  },

  /**
   * Return a single item from `collection`, picked randomly.
   * - Compiles from `a random item of my-list` / `a random card from the deck`
   *   -- see `rules/lists/RandomItemExpression.ts`.
   * - Typed by `collection`, as `getItemAt()`.
   */
  randomItemOf<T = unknown>(collection?: CollectionOf<T>): T | undefined {
    if (!assert.isDefined(collection, "spellCore.randomItemOf(collection)")) return undefined
    const key = spellCore._randomKeyOf(collection)
    if (key === undefined) return undefined
    return spellCore.getItemAt(collection, key)
  },

  /**
   * Return list of up to `count` items from `collection`, picked randomly, where each item can be
   * returned only once.  Returns same type as was passed in.
   * - Compiles from `2 random items of my-list` / `3 random cards from deck`
   *   -- see `rules/lists/RandomItemsExpression.ts`.
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
        spellCore.append(results, spellCore.getItemAt(collection, key))
      })
    } else {
      shuffledKeys.forEach((key) => {
        spellCore.setItemAt(results, key, spellCore.getItemAt(collection, key))
      })
    }
    return results
  },

  /**
   * Randomize `collection` in-place.
   * - No-op for a plain-object collection -- only array-like collections are reordered.
   * - Compiles from `shuffle my-list` / `randomize my-list` -- see `rules/lists/ListShuffle.ts`.
   */
  randomize(collection?: unknown): void {
    if (!assert.isDefined(collection, "spellCore.randomize(collection)")) return
    if (!spellCore.isArrayLike(collection)) return
    const randomized = spellCore.randomItemsOf(collection)
    spellCore.setItemsOf(collection, 1, ...(randomized as unknown[]))
  },

  /**
   * Return smallest item of `collection` according to `<` comparison.
   * - Compiles from `smallest of prices` / `smallest value in prices` -- see `rules/math/Min.ts`.
   */
  smallestOf(collection?: unknown): unknown {
    if (!assert.isDefined(collection, "spellCore.smallestOf(collection)")) return undefined
    if (spellCore.itemCountOf(collection) === 0) return undefined
    const values = spellCore.valuesOf(collection) as Array<number | string>
    return values.reduce((smallest, next) => (next < smallest ? next : smallest), values[0])
  },

  /**
   * Return largest item of `collection` according to `>` comparison.
   * - Compiles from `largest of the prices` / `biggest in prices` -- see `rules/math/Max.ts`.
   */
  largestOf(collection?: unknown): unknown {
    if (!assert.isDefined(collection, "spellCore.largestOf(collection)")) return undefined
    if (spellCore.itemCountOf(collection) === 0) return undefined
    const values = spellCore.valuesOf(collection) as Array<number | string>
    return values.reduce((largest, next) => (next > largest ? next : largest), values[0])
  }
})
Object.assign(spellCore, collectionOtherMethods)

/**
 * What a range of `collection` that holds nothing is:  an empty SCRATCH list of its class for a `List`, e.g. an
 * empty `Pile`, so `List.between()` is always one of its own -- else `[]`, as before lists had methods.
 */
function emptyRangeOf(collection: unknown): unknown {
  return collection instanceof List ? spellCore.newThingLike(collection) : []
}
