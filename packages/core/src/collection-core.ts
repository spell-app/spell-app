/**
 * Primitive collection methods for `spell` -- the accessors/setters every other collection method
 * (here and in `collection-other.ts`) is built from.
 * - All array iteration is 1-based.
 * - Collection methods work with objects as well as arrays, unless specified.
 *   - For objects: use natural key order for position.
 * - TODO: collections for `words`, `lines`, etc?
 */
import _ from "lodash"
import { spellCore } from "./core"
import { assert } from "$/core"
import { defineSpellCoreModule } from "./spellCore.types"

/**
 * Loose shape for the duck-typed "collection" concept used throughout `spellCore`:
 * either an array/array-like thing, a plain object (used as a keyed collection),
 * or a custom collection class (e.g. `List`) implementing some/all of these methods.
 */
export type CollectionLike = {
  /** Dynamic index signature -- lets us read/write arbitrary object keys through this type. */
  [key: string]: unknown
  /** Array-like item count, e.g. `Array.length`. */
  length?: number
  /** Custom collection's own item count, preferred over `length`/`keysOf()` when present. */
  itemCount?(): number
  /** Custom collection's own keys, in iteration order. */
  getKeys?(): Array<string | number>
  /** Custom collection's own values, in iteration order. */
  getValues?(): unknown[]
  /** Custom collection's own single-item getter. */
  getItem?(item: string | number): unknown
  /** Custom collection's own single-item setter. */
  setItem?(item: string | number, value: unknown): unknown
  /** Custom collection's own insert-at-position. */
  addAtPosition?(start: number, ...things: unknown[]): void
  /** Custom collection's own single-item remover. */
  removeItem?(item: string | number): void
  /** Custom collection's own "key of value" lookup. */
  itemOf?(thing: unknown): string | number | undefined
  /** Custom collection's own remove-everything. */
  clear?(): void
  /** Custom collection's own `[value, item, collection]` iterator factory. */
  iterator?(): Iterator<[unknown, string | number, unknown]>
}

/** Cast a genuinely-dynamic `collection` argument to its duck-typed shape. */
function asCollection(collection: unknown): CollectionLike {
  return collection as CollectionLike
}

export const collectionCoreMethods = defineSpellCoreModule({
  ////////////////
  // ## primitive accessors/setters
  ////////////////

  /**
   * Number of items in `collection`.
   * - For object: number of "own" keys.
   */
  itemCountOf(collection?: unknown): number {
    if (!assert.isDefined(collection, "spellCore.itemCountOf(collection)")) return 0
    const coll = asCollection(collection)
    if (typeof coll.itemCount === "function") return coll.itemCount()
    if (spellCore.isArrayLike(collection)) return coll.length ?? 0
    return spellCore.keysOf(collection).length
  },

  /**
   * Is `collection` empty?
   * - Compiles from `thing is empty` / `thing is not empty` -- see `expressions.ts`.
   * TODO: `null` or `undefined`???
   */
  isEmpty(collection?: unknown): boolean {
    if (!assert.isDefined(collection, "spellCore.isEmpty(collection)")) return true
    if (typeof collection === "number") return isNaN(collection)
    return spellCore.itemCountOf(collection) === 0
  },

  /**
   * Return proper `Array` of "keys" of `collection`.
   * - For array: returns array of 1-based positions.
   * - For object: returns "own" keys in insertion order.
   * TODO: `itemsOf()` is not quite right either...
   */
  keysOf(collection?: unknown): Array<string | number> {
    if (!assert.isDefined(collection, "spellCore.keysOf(collection)")) return []
    const coll = asCollection(collection)
    if (typeof coll.getKeys === "function") return coll.getKeys()
    if (spellCore.isArrayLike(collection)) {
      return _.range(1, spellCore.itemCountOf(collection) + 1)
    }
    return Object.keys(coll)
  },

  /**
   * Return proper `Array` of values of `collection`.
   * - For array: returns clone of the array.
   * - For object: returns array of "own" values.
   */
  valuesOf(collection?: unknown): unknown[] {
    if (!assert.isDefined(collection, "spellCore.valuesOf(collection)")) return []
    const coll = asCollection(collection)
    if (typeof coll.getValues === "function") return coll.getValues()
    if (spellCore.isArrayLike(collection)) return Array.from(collection as ArrayLike<unknown>)
    return Object.values(coll)
  },

  /**
   * `item` key of first instance of `thing` in `collection`.
   * - For array: returns 1-based position or `undefined`.
   * - For object: returns string key or `undefined`.
   * - Compiles from `position of thing in my-list` -- see `lists.ts`.
   * TODO: `positionOf` ???
   */
  itemOf(collection?: unknown, thing?: unknown): string | number | undefined {
    if (!assert.isDefined(collection, "spellCore.itemOf(collection)")) return undefined
    const coll = asCollection(collection)
    if (typeof coll.itemOf === "function") return coll.itemOf(thing)
    const iterator = spellCore.getIteratorFor(collection)
    let result = iterator.next()
    while (!result.done) {
      const [value, item] = result.value
      if (value === thing) return item
      result = iterator.next()
    }
    return undefined
  },

  /**
   * Return `item` from collection.
   * - For array: `item` is 1-based position.
   * - For object: `item` is string key.
   * - Compiles from `item 1 of my-list` / `the first item of my-list` -- see `lists.ts`.
   */
  getItemOf(collection?: unknown, item?: string | number): unknown {
    if (!assert.isDefined(collection, "spellCore.getItemOf(collection)")) return undefined
    const coll = asCollection(collection)
    if (typeof coll.getItem === "function") return coll.getItem(item as string | number)
    if (spellCore.isArrayLike(collection)) return coll[(item as number) - 1]
    return coll[item as string]
  },

  /**
   * Set `item` of `collection` to `value`.
   * - For array: `item` is 1-based position.
   * - For object: `item` is string key.
   */
  setItemOf(collection?: unknown, item?: string | number, value?: unknown): unknown {
    if (!assert.isDefined(collection, "spellCore.setItemOf(collection)")) return undefined
    const coll = asCollection(collection)
    if (typeof coll.setItem === "function") return coll.setItem(item as string | number, value)

    if (spellCore.isArrayLike(collection)) coll[(item as number) - 1] = value
    else coll[item as string] = value
    return value
  },

  /**
   * Add `things` in the middle of the `collection` starting with 1-based position `start`,
   * moving things after `start` down.  Array only.
   * - Compiles from `add thing to my-list at position of other-thing (+ 1)` -- see `lists.ts`.
   */
  addAtPosition(collection?: unknown, start?: number, ...things: unknown[]): void {
    if (!assert.isArrayLike(collection, "spellCore.addAtPosition(collection)")) return
    const coll = asCollection(collection)
    const at = start ?? 0
    if (typeof coll.addAtPosition === "function") {
      coll.addAtPosition(at, ...things)
      return
    }
    if (at > 0) Array.prototype.splice.call(collection, at - 1, 0, ...things)
    else Array.prototype.splice.call(collection, at, 0, ...things)
  },

  /**
   * Remove `item` from `collection`.
   * - For array: `item` is 1-based position, items after item removed are slid back into place.
   * - For object: `item` is string key, which will be deleted.
   * - Compiles from `remove last card of deck` / `remove item 4 of my-list` -- see `lists.ts`.
   */
  removeItemOf(collection?: unknown, item?: string | number): void {
    if (!assert.isDefined(collection, "spellCore.removeItemOf(collection)")) return
    const coll = asCollection(collection)
    if (coll.removeItem) {
      coll.removeItem(item as string | number)
      return
    }
    if (spellCore.isArrayLike(collection)) Array.prototype.splice.call(collection, (item as number) - 1, 1)
    else delete coll[item as string]
  },

  /**
   * Remove all things from the `collection`, in-place.
   * - Compiles from `empty my-list` / `clear the cards of the deck` -- see `lists.ts`.
   */
  clear(collection?: unknown): void {
    if (!assert.isDefined(collection, "spellCore.clear(collection)")) return
    const coll = asCollection(collection)
    if (typeof coll.clear === "function") {
      coll.clear()
      return
    }
    const keys = spellCore.keysOf(collection).reverse()
    keys.forEach((key) => spellCore.removeItemOf(collection, key))

    // For arrays, try to set the `length` to 0
    // Might fail on a read-only object.
    if (typeof coll.length === "number") {
      try {
        coll.length = 0
      } catch (e) {
        // TODO???
      }
    }
  },

  /**
   * Return an invoked iterator which yields `[value, item, collection]` for each item in the collection.
   * - Backs nearly every other iteration method here and in `collection-other.ts` (`forEach`, `map`, `all`, ...).
   * - e.g.
   *   ```
   *   iterator = spellCore.getIteratorFor(collection)
   *   let result = iterator.next()
   *   while (!result.done) {
   *     const [ value, item, collection ] = result.value
   *     result = iterator.next()
   *   }
   *   ```
   */
  getIteratorFor(collection?: unknown): Iterator<[unknown, string | number, unknown]> {
    if (!assert.isDefined(collection, "spellCore.getIteratorFor(collection)")) {
      return (function* emptyIterator() {
        // THIS SPACE INTENTIONALLY LEFT BLANK
      })()
    }
    const coll = asCollection(collection)
    if (typeof coll.iterator === "function") return coll.iterator()

    if (spellCore.isArrayLike(collection)) {
      return (function* numericIterator() {
        const count = spellCore.itemCountOf(collection)
        for (let position = 1; position <= count; position++) {
          yield [spellCore.getItemOf(collection, position), position, collection] as [unknown, number, unknown]
        }
      })()
    }
    const keys = spellCore.keysOf(collection)
    return (function* keyedIterator() {
      for (let i = 0; i < keys.length; i++) {
        yield [spellCore.getItemOf(collection, keys[i]), keys[i], collection] as [unknown, string | number, unknown]
      }
    })()
  }
})
Object.assign(spellCore, collectionCoreMethods)
