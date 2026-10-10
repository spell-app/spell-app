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
import { assert, type List } from "$/core"
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
  /** Custom collection's own getter, of the item at `position`. */
  getItem?(position: string | number): unknown
  /** Custom collection's own setter, of the item at `position`. */
  setItem?(position: string | number, value: unknown): unknown
  /** Custom collection's own insert-at-position. */
  addAtPosition?(start: number, ...things: unknown[]): void
  /** Custom collection's own remover, of the item at `position`. */
  removeItem?(position: string | number): void
  /** Custom collection's own "position of value" lookup. */
  positionOf?(thing: unknown): string | number | undefined
  /** Custom collection's own remove-everything. */
  clear?(): void
  /** Custom collection's own `[value, position, collection]` iterator factory. */
  iterator?(): Iterator<[unknown, string | number, unknown]>
}

/**
 * ANY collection argument -- its items `T`, when TypeScript can tell:  a `List<T>` or a `T[]`.
 * - Else `T` is `unknown`, e.g. for a `List` with no item type, a plain object, `unknown` or `any`.
 * - `NonNullable<unknown> | null | undefined` is `unknown`, spelled out so `T` is still INFERRED from a list or an
 *   array -- `this` in a `List<Card>` sub-class too, which a conditional type (`C extends List<infer T>`) leaves
 *   unresolved.
 * - A list as its `getItem()` only, NOT all of `List<T>`:  inferring from `this` in a sub-class's `draw()` would
 *   read `draw()` itself, a circular inference (TS7023).
 * - Taken by the helpers whose result or callback follows their collection, e.g. `getItemAt()`, `forEach()`.
 */
export type CollectionOf<T = unknown> =
  | Pick<List<T>, "getItem">
  | readonly T[]
  | NonNullable<unknown>
  | null
  | undefined

/**
 * Position type of collection `C`, as `positionOf()` returns it:  a 1-based position for a `List` or an array.
 * - Else a string key or a position, e.g. for a plain object.  `undefined` / `null` add nothing.
 * - NOTE:  unresolved for `this` in a `List` sub-class, unlike `CollectionOf`.
 */
export type KeyOf<C> = C extends null | undefined
  ? never
  : C extends List | readonly unknown[]
    ? number
    : string | number

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
   * - Compiles from `thing is empty` / `thing is not empty` -- see `rules/expressions/IsEmpty.ts`.
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
   * Position of the first `thing` in `collection` -- see `positionOf()`, below, which it is.
   * - Compiles from `position of thing in my-list` -- see `rules/lists/ListPosition.ts`.
   */
  positionOf,

  /**
   * The item at `position` of `collection`.
   * - For array: `position` counts from 1.
   * - For object: `position` is its string key.
   * - Compiles from `item 1 of my-list` / `the first item of my-list` -- see `rules/lists/`.
   * - Typed by `collection`:  a `List<Card>`'s is a `Card`, if it has one -- see `CollectionOf`.
   */
  getItemAt<T = unknown>(collection?: CollectionOf<T>, position?: string | number): T | undefined {
    if (!assert.isDefined(collection, "spellCore.getItemAt(collection)")) return undefined
    const coll = asCollection(collection)
    if (typeof coll.getItem === "function") return coll.getItem(position as string | number) as T | undefined
    if (spellCore.isArrayLike(collection)) return coll[(position as number) - 1] as T | undefined
    return coll[position as string] as T | undefined
  },

  /**
   * Set the item at `position` of `collection` to `value`.
   * - For array: `position` counts from 1.
   * - For object: `position` is its string key.
   */
  setItemAt(collection?: unknown, position?: string | number, value?: unknown): unknown {
    if (!assert.isDefined(collection, "spellCore.setItemAt(collection)")) return undefined
    const coll = asCollection(collection)
    if (typeof coll.setItem === "function") return coll.setItem(position as string | number, value)

    if (spellCore.isArrayLike(collection)) coll[(position as number) - 1] = value
    else coll[position as string] = value
    return value
  },

  /**
   * Add `things` in the middle of the `collection` starting with 1-based position `start`,
   * moving things after `start` down.  Array only.
   * - Compiles from `add thing to my-list at position of other-thing (+ 1)` -- see `rules/lists/`.
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
   * Remove the item at `position` of `collection`.
   * - For array: `position` counts from 1;  the items after it slide back into place.
   * - For object: `position` is its string key, which is deleted.
   * - Compiles from `remove last card of deck` / `remove item 4 of my-list` -- see `rules/lists/`.
   */
  removeItemAt(collection?: unknown, position?: string | number): void {
    if (!assert.isDefined(collection, "spellCore.removeItemAt(collection)")) return
    const coll = asCollection(collection)
    if (coll.removeItem) {
      coll.removeItem(position as string | number)
      return
    }
    if (spellCore.isArrayLike(collection)) Array.prototype.splice.call(collection, (position as number) - 1, 1)
    else delete coll[position as string]
  },

  /**
   * Remove all things from the `collection`, in-place.
   * - Compiles from `empty my-list` / `clear the cards of the deck` -- see `rules/lists/ListEmpty.ts`.
   */
  clear(collection?: unknown): void {
    if (!assert.isDefined(collection, "spellCore.clear(collection)")) return
    const coll = asCollection(collection)
    if (typeof coll.clear === "function") {
      coll.clear()
      return
    }
    const keys = spellCore.keysOf(collection).reverse()
    keys.forEach((key) => spellCore.removeItemAt(collection, key))

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
   * Return an invoked iterator which yields `[value, position, collection]` for each item in the collection.
   * - Backs nearly every other iteration method here and in `collection-other.ts` (`forEach`, `map`, `all`, ...).
   * - Typed by `collection`, so their callbacks are too -- see `CollectionOf`.
   * - e.g.
   *   ```
   *   iterator = spellCore.getIteratorFor(collection)
   *   let result = iterator.next()
   *   while (!result.done) {
   *     const [ value, position, collection ] = result.value
   *     result = iterator.next()
   *   }
   *   ```
   */
  getIteratorFor<T = unknown>(collection?: CollectionOf<T>): Iterator<[T, string | number, unknown]> {
    if (!assert.isDefined(collection, "spellCore.getIteratorFor(collection)")) {
      return (function* emptyIterator() {
        // THIS SPACE INTENTIONALLY LEFT BLANK
      })()
    }
    const coll = asCollection(collection)
    if (typeof coll.iterator === "function") return coll.iterator() as Iterator<[T, string | number, unknown]>

    if (spellCore.isArrayLike(collection)) {
      return (function* numericIterator() {
        const count = spellCore.itemCountOf(collection)
        for (let position = 1; position <= count; position++) {
          yield [spellCore.getItemAt(collection, position), position, collection] as [T, number, unknown]
        }
      })()
    }
    const keys = spellCore.keysOf(collection)
    return (function* keyedIterator() {
      for (let i = 0; i < keys.length; i++) {
        yield [spellCore.getItemAt(collection, keys[i]), keys[i], collection] as [T, string | number, unknown]
      }
    })()
  }
})
Object.assign(spellCore, collectionCoreMethods)

/**
 * Position of `thing` in `collection`, from 1 -- `undefined` if it isn't there.  A plain object's:  its key.
 * - Hand-written TypeScript imports it by name:  `import { positionOf } from "@spell/core"`, then
 *   `positionOf(Card.Ranks, this.rank)`.  Compiled JavaScript calls it as `spellCore.positionOf(...)`:  the SAME
 *   function.
 * - Typed `number` when `thing` is of an array's own item type, e.g. a `Rank` in `Card.Ranks` (`as const`):  a value
 *   of an enumeration's type is always in it.  TYPES ONLY:  it's the same call.
 *   - Else typed by `collection`, see `KeyOf`:  a `List`'s is `number | undefined` either way.
 * - Was `itemOf()` before epic `output-targets` P16, and still answers to it:  see `deprecated.ts`.
 */
export function positionOf<T>(collection: readonly T[], thing: NoInfer<T>): number
export function positionOf<C>(collection?: C, thing?: unknown): KeyOf<C> | undefined
export function positionOf<C>(collection?: C, thing?: unknown): KeyOf<C> | undefined {
  if (!assert.isDefined(collection, "spellCore.positionOf(collection)")) return undefined
  const coll = asCollection(collection)
  if (typeof coll.positionOf === "function") return coll.positionOf(thing) as KeyOf<C> | undefined
  const iterator = spellCore.getIteratorFor(collection)
  let result = iterator.next()
  while (!result.done) {
    const [value, position] = result.value
    if (value === thing) return position as KeyOf<C>
    result = iterator.next()
  }
  return undefined
}
