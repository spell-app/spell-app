//////////
// collections methods for spell
//  - all array iteration is 1-based
//  - collection methods work with objects as well as arrays unless specified
//    - for objects: use natural key order for position
//  - TODO: collections for `words`, `lines`, etc?
//--------
import _ from "lodash"
import { spell, assert } from "."

Object.assign(spell, {

  ////////////
  // primitive accessors/setters
  //----------

  // Number of items in collection.
  // For object: number of "own" keys.
  itemCountOf(collection) {
    if (!assert.isDefined(collection, "spell.itemCountOf(collection)")) return 0
    if (typeof collection.itemCount === "function") return collection.itemCount()
    if (spell.isArrayLike(collection)) return collection.length
    return spell.itemsOf(collection).length
  },

  // Is collection empty?
  // TODO: `null` or `undefined`???
  isEmpty(collection) {
    if (!assert.isDefined(collection, "spell.isEmpty(collection)")) return true
    return spell.itemCountOf(collection) === 0
  },


  // Return proper `Array` of "items" of `collection`
  // For array: returns array of 1-based positions.
  // For object: returns "own" keys in insertion order.
  itemsOf(collection) {
    if (!assert.isDefined(collection, "spell.itemsOf(collection)")) return undefined
    if (typeof collection.getItems === "function") return collection.getItems()
    if (spell.isArrayLike(collection)) return _.range(1, spell.itemCountOf(collection))
    return Object.keys(collection)
  },

  // Return proper `Array` of values of `collection`
  // For array: returns clone of the array.
  // For object: returns array of "own" values.
  valuesOf(collection) {
    if (!assert.isDefined(collection, "spell.valuesOf(collection)")) return undefined
    if (typeof collection.getValues === "function") return collection.getValues()
    if (spell.isArrayLike(collection)) return [...collection]
    return Object.values(collection)
  },

  // Return `item` from collection.
  // For array: `item` is 1-based position.
  // For object: `item` is string key.
  getItemOf(collection, item) {
    if (!assert.isDefined(collection, "spell.getItemOf(collection)")) return undefined
    if (typeof collection.getItem === "function") return collection.getItem(item)
    if (spell.isArrayLike(collection)) return collection[item-1]
    return collection[item]
  },

  // `item` key of first instance of `thing` in `collection`.
  // For array: returns 1-based position or `undefined`
  // For object: returns string key or `undefined`
  itemOf(collection, thing) {
    if (!assert.isDefined(collection, "spell.itemOf(collection)")) return undefined
    if (typeof collection.itemOf === "function") return collection.itemOf(thing)
    if (typeof collection.indexOf === "function") {
      const index = collection.indexOf(thing)
      if (index !== -1) return index + 1
    }
    else {
      const index = Object.values(collection).indexOf(thing)
      if (index !== -1) return Object.keys(collection)[index]
    }
    return undefined
  },

  // Set `item` of `collection` to `value`.
  // For array: `item` is 1-based position.
  // For object: `item` is string key.
  setItemOf(collection, item, value) {
    if (!assert.isDefined(collection, "spell.setItemOf(collection)")) return
    if (typeof collection.setItem === "function") return collection.setItem(item, value)
    if (spell.isArrayLike(collection))
      collection[item-1] = value
    else
      collection[item] = value
  },

  // Remove all occurances of `item` from `collection`.
  // For array: `item` is 1-based position, items after item removed are slid back into place.
  // For object: `item` is string key, which
  removeItemOf(collection, item) {
    if (!assert.isDefined(collection, "spell.removeItemOf(collection)")) return
    if (collection.removeItem) return collection.removeItem(item)
    if (spell.isArrayLike(collection))
      Array.prototype.splice.apply(collection, item-1, 1)
    else
      delete collection[item]
  },

  // Remove all things from the `collection`, in-place.
  clear(collection) {
    if (!assert.isDefined(collection, "spell.clear(collection)")) return
    if (typeof collection.clear === "function") return collection.clear()
    const keys = spell.itemsOf(collection)
    keys.forEach(key => spell.clearItemOf(collection, key))

    // For arrays, try to set the `length` to 0
    // Might fail on a read-only object.
    if (typeof collection.length === "number") {
      try {
        collection.length = 0
      }
      catch (e) {}
    }
  },


  // Return an iterator which yields `[value, item, collection]` for each item in the collection.
  getIteratorFor(collection) {
    if (!assert.isDefined(collection, "spell.itemCountOf(collection)")) {
      return function() { return { done: true } }
    }

    if (typeof collection.getIteratorFor === "function") return collection.getIteratorFor()

    if (spell.isArrayLike(collection)) {
      return function* numericIterator() {
        const count = spell.itemCountOf(collection)
        for (var position = 1; position <= count; position++) {
          yield [ spell.getItemOf(collection, position), position, collection ]
        }
      }
    }
    const keys = spell.itemsOf(collection)
    return function* keyedIterator() {
      for (var i = 0; i < keys.length; i++) {
        yield [ spell.getItemOf(collection, keys[i]), keys[i], collection ]
      }
    }
  },

})
