//----------------------------
// collections methods for spell
//  - all array iteration is 1-based
//  - collection methods work with objects as well as arrays unless specified
//    - for objects: use natural key order for position
//  - TODO: collections for `words`, `lines`, etc?
//--------
import _ from "lodash"
import { spellCore, assert } from "."

Object.assign(spellCore, {
  //----------------------------
  // primitive accessors/setters
  //----------

  // Number of items in collection.
  // For object: number of "own" keys.
  itemCountOf(collection) {
    if (!assert.isDefined(collection, "spellCore.itemCountOf(collection)")) return 0
    if (typeof collection.itemCount === "function") return collection.itemCount()
    if (spellCore.isArrayLike(collection)) return collection.length
    return spellCore.keysOf(collection).length
  },

  // Is collection empty?
  // TODO: `null` or `undefined`???
  isEmpty(collection) {
    if (!assert.isDefined(collection, "spellCore.isEmpty(collection)")) return true
    return spellCore.itemCountOf(collection) === 0
  },

  // Return proper `Array` of "keys" of `collection`
  // For array: returns array of 1-based positions.
  // For object: returns "own" keys in insertion order.
  // TODO: `itemsOf()` is not quite right either...
  keysOf(collection) {
    if (!assert.isDefined(collection, "spellCore.keysOf(collection)")) return []
    if (typeof collection.getKeys === "function") return collection.getKeys()
    if (spellCore.isArrayLike(collection)) {
      return _.range(1, spellCore.itemCountOf(collection) + 1)
    }
    return Object.keys(collection)
  },

  // Return proper `Array` of values of `collection`
  // For array: returns clone of the array.
  // For object: returns array of "own" values.
  valuesOf(collection) {
    if (!assert.isDefined(collection, "spellCore.valuesOf(collection)")) return []
    if (typeof collection.getValues === "function") return collection.getValues()
    if (spellCore.isArrayLike(collection)) return [...collection]
    return Object.values(collection)
  },

  // `item` key of first instance of `thing` in `collection`.
  // For array: returns 1-based position or `undefined`
  // For object: returns string key or `undefined`
  // TODO: `positionOf` ???
  itemOf(collection, thing) {
    if (!assert.isDefined(collection, "spellCore.itemOf(collection)")) return undefined
    if (typeof collection.itemOf === "function") return collection.itemOf(thing)
    const iterator = spellCore.getIteratorFor(collection)
    let result = iterator.next()
    while (!result.done) {
      const [value, item] = result.value
      if (value === thing) return item
      result = iterator.next()
    }
    return undefined
  },

  // Return `item` from collection.
  // For array: `item` is 1-based position.
  // For object: `item` is string key.
  getItemOf(collection, item) {
    if (!assert.isDefined(collection, "spellCore.getItemOf(collection)")) return undefined
    if (typeof collection.getItem === "function") return collection.getItem(item)
    if (spellCore.isArrayLike(collection)) return collection[item - 1]
    return collection[item]
  },

  // Set `item` of `collection` to `value`.
  // For array: `item` is 1-based position.
  // For object: `item` is string key.
  setItemOf(collection, item, value) {
    if (!assert.isDefined(collection, "spellCore.setItemOf(collection)")) return undefined
    if (typeof collection.setItem === "function") return collection.setItem(item, value)

    if (spellCore.isArrayLike(collection)) collection[item - 1] = value
    else collection[item] = value
    return value
  },

  // Add `things` in the middle of the `collection` starting with 1-based position `start`,
  // moving things after `start` down.
  // Array only.
  addAtPosition(collection, start, ...things) {
    if (!assert.isArrayLike(collection, "spellCore.addAtPosition(collection)")) return
    if (typeof collection.addAtPosition === "function") {
      collection.addAtPosition(start, ...things)
      return
    }
    if (start > 0) Array.prototype.splice.call(collection, start - 1, 0, ...things)
    else Array.prototype.splice.call(collection, start, 0, ...things)
  },

  // Remove `item` from `collection`.
  // For array: `item` is 1-based position, items after item removed are slid back into place.
  // For object: `item` is string key, which will be deleted
  removeItemOf(collection, item) {
    if (!assert.isDefined(collection, "spellCore.removeItemOf(collection)")) return
    if (collection.removeItem) {
      collection.removeItem(item)
      return
    }
    if (spellCore.isArrayLike(collection)) Array.prototype.splice.call(collection, item - 1, 1)
    else delete collection[item]
  },

  // Remove all things from the `collection`, in-place.
  clear(collection) {
    if (!assert.isDefined(collection, "spellCore.clear(collection)")) return
    if (typeof collection.clear === "function") {
      collection.clear()
      return
    }
    const keys = spellCore.keysOf(collection).reverse()
    keys.forEach((key) => spellCore.removeItemOf(collection, key))

    // For arrays, try to set the `length` to 0
    // Might fail on a read-only object.
    if (typeof collection.length === "number") {
      try {
        collection.length = 0
      } catch (e) {
        // TODO???
      }
    }
  },

  // Return an invoked iterator which yields `[value, item, collection]` for each item in the collection.
  // e.g.
  //    iterator = spellCore.getIteratorFor(collection)
  //    let result = iterator.next()
  //    while (!result.done) {
  //      const [ value, item, collection ] = result.value
  //      result = iterator.next()
  //    }
  getIteratorFor(collection) {
    if (!assert.isDefined(collection, "spellCore.getIteratorFor(collection)")) {
      return (function* emptyIterator() {
        // THIS SPACE INTENTIONALLY LEFT BLANK
      })()
    }
    if (typeof collection.iterator === "function") return collection.iterator()

    if (spellCore.isArrayLike(collection)) {
      return (function* numericIterator() {
        const count = spellCore.itemCountOf(collection)
        for (let position = 1; position <= spellCore.itemCountOf(collection); position++) {
          yield [spellCore.getItemOf(collection, position), position, collection]
        }
      })()
    }
    const keys = spellCore.keysOf(collection)
    return (function* keyedIterator() {
      for (let i = 0; i < keys.length; i++) {
        yield [spellCore.getItemOf(collection, keys[i]), keys[i], collection]
      }
    })()
  }
})
