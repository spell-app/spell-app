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
  // composite accessors
  //----------

  // Does `collection` include ALL of the specified `values`?
  // If more than one value specified, all must be included.
  includes(collection, ...values) {
    if (!assert.isDefined(collection, "spellCore.includes(collection)")) return false
    if (!values.length) return false
    return spellCore.all(values, (value) => spellCore.itemOf(collection, value) !== undefined)
  },

  // Does `collection` include any of the specified `values`?
  // If more than one value specified, only one must be included.
  includesAny(collection, ...values) {
    if (!assert.isDefined(collection, "spellCore.includesAny(collection)")) return false
    return spellCore.any(values, (value) => spellCore.itemOf(collection, value) !== undefined)
  },

  //----------------------------
  // numeric iteration -- arrays only
  //----------

  // Is `thing` the first thing in `collection`?
  // Array only.
  startsWith(collection, thing) {
    if (!assert.isArrayLike(collection, "spellCore.startsWith(collection)")) return false
    if (thing == null) return false
    return spellCore.getItemOf(collection, 1) === thing
  },

  // Is `thing` the last thing in `collection`?
  // Array only.
  endsWith(collection, thing) {
    if (!assert.isArrayLike(collection, "spellCore.endsWith(collection)")) return false
    if (thing == null) return false
    return spellCore.getItemOf(collection, spellCore.itemCountOf(collection)) === thing
  },

  // Add `things` to front of `collection`, pushing everything else down.
  // Array only.
  prepend(collection, ...things) {
    spellCore.addAtPosition(collection, 1, ...things)
  },

  // Add `things` to end of `collection`.
  // Array only.
  append(collection, ...things) {
    spellCore.addAtPosition(collection, spellCore.itemCountOf(collection) + 1, ...things)
  },

  // Set values of item starting with `start` as 1-based position.
  // Replaces existing values.
  setItemsOf(collection, start, ...values) {
    if (!assert.isArrayLike(collection, "spellCore.setItemsOf(collection)")) return
    values.forEach((value, index) => {
      spellCore.setItemOf(collection, start + index, value)
    })
  },

  // Reverse list in-place.
  // Array only.
  reverse(collection) {
    if (!assert.isDefined(collection, "spellCore.reverse(collection)")) return
    const reversed = spellCore.valuesOf(collection).reverse()
    spellCore.setItemsOf(collection, 1, ...reversed)
  },

  // Given possible `start` and `end` 1-based position in collection,
  //  as well as `itemCount` items in the collection, return:
  //  `{ start, end }` for a valid range, or
  //  `undefined` if an invalid range was specfified.
  // If `start` is negative, we'll take from the end of the list, but in normal list order.
  _validateRangeBetween(start, end, itemCount) {
    if (itemCount === 0) return undefined
    if (!spellCore.isANumber(start) || start === 0) start = 1
    // TODO === 0 ???
    else if (Math.abs(start) > itemCount) return undefined
    else if (start < 0) start = Math.max(itemCount + start + 1, 1)
    if (!spellCore.isANumber(end) || end > itemCount) end = itemCount
    if (end < start) return undefined
    return { start, end }
  },

  // Return subset of list from `start` to `end` as 1-based positions, inclusive.
  // Note: this is positive numbers only, `rangeStartingAt()` deals with negatives. (???)
  // Array only.
  rangeBetween(collection, start, end) {
    if (!assert.isArrayLike(collection, "spellCore.rangeBetween(collection)")) return []
    const range = spellCore._validateRangeBetween(start, end, spellCore.itemCountOf(collection))
    if (!range) return []
    const results = spellCore.newThingLike(collection)
    for (let i = range.start; i <= range.end; i++) {
      spellCore.append(results, spellCore.getItemOf(collection, i))
    }
    return results
  },

  // Remove items from `collection` between 1-based positions `start` to `end`, inclusive.
  // Note: this is positive numbers only. (???)
  // Slides other items into the gaps.
  // Array only
  removeRangeBetween(collection, start, end) {
    if (!assert.isArrayLike(collection, "spellCore.rangeStartingAt(collection)")) return
    const range = spellCore._validateRangeBetween(start, end, spellCore.itemCountOf(collection))
    if (!range) return
    const count = range.end - range.start + 1
    Array.prototype.splice.call(collection, range.start - 1, count)
  },

  // Given possible `start` as 1-based position in collection,
  // `count` as number of items (inclusive) and `itemCount` in collection:
  //  `{ start, end }` for a valid range, or
  //  `undefined` if an invalid range was specfified.
  // If `start` is negative, we'll take from the end of the list, but in normal list order.
  _validateRangeStartingAt(start, count, itemCount) {
    if (Math.abs(start) > itemCount) return undefined
    if (!spellCore.isANumber(start) || start === 0) start = 1
    // TODO === 0 ???
    else if (start < 0) start = Math.max(itemCount + start + 1, 1)
    const end = spellCore.isANumber(count) ? start + count - 1 : itemCount
    return spellCore._validateRangeBetween(start, end, itemCount)
  },

  // Return `count` items from list starting with `start` as 1-based position.
  // Negative `start` takes from the end of the list (but returns in list order)
  // Array only.
  rangeStartingAt(collection, start, count) {
    if (!assert.isArrayLike(collection, "spellCore.rangeStartingAt(collection)")) return []
    const range = spellCore._validateRangeStartingAt(start, count, spellCore.itemCountOf(collection))
    if (!range) return []
    return spellCore.rangeBetween(collection, range.start, range.end)
  },

  //----------------------------
  // iteration
  //----------

  // Execute `method` for each item in `collection`, ignoring results.
  forEach(collection, method) {
    if (!assert.isDefined(collection, "spellCore.map(collection)")) return
    if (!method) return
    const iterator = spellCore.getIteratorFor(collection)
    let result = iterator.next()
    while (!result.done) {
      method(...result.value)
      result = iterator.next()
    }
  },

  /**
   * Execute `method` for each item of map, `await`ing methods completion.
   * The entire thing will finish when all waiting is done.
   * Results are ignored.
   */
  async forEachSequential(collection, method) {
    if (!assert.isDefined(collection, "spellCore.map(collection)")) return
    if (!method) return
    const iterator = spellCore.getIteratorFor(collection)
    let result = iterator.next()
    while (!result.done) {
      await method(...result.value)
      result = iterator.next()
    }
  },

  // Execute `method` for each item in `collection`, returning results in same type as `collection`
  // Pass `results` as thing to put results into, defaults to new thing like `collection`.
  // TODO: rename???
  map(collection, method) {
    if (!assert.isDefined(collection, "spellCore.map(collection)")) return undefined
    const results = spellCore.newThingLike(collection)
    if (!method) return results
    spellCore.forEach(collection, (value, item) => {
      spellCore.setItemOf(results, item, method(value, item, collection))
    })
    return results
  },

  // Return new `collection` of only things which match `condition` filter.
  // For array: returns a compacted collection of same type.
  // For object: returns new type of collection with just specified keys.
  filter(collection, condition) {
    if (!assert.isDefined(collection, "spellCore.all(collection)")) return undefined
    if (!condition) condition = (it) => it
    const results = spellCore.newThingLike(collection)
    let filter
    if (spellCore.isArrayLike(collection)) {
      filter = (value, item, _collection) => {
        if (condition(value, item, _collection)) spellCore.append(results, value)
      }
    } else {
      filter = (value, item, _collection) => {
        if (condition(value, item, _collection)) spellCore.setItemOf(results, item, value)
      }
    }
    spellCore.forEach(collection, filter)
    return results
  },

  // Return `true` if all items in collection match `condition`,
  // called as `condition(value, item, collection)`
  all(collection, condition) {
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

  // Return `true` if at least one item in collection matches `condition`
  // called as `condition(value, item, collection)`
  any(collection, condition) {
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

  // Remove `items` from `collection`.
  // For array: `items` are 1-based positions.
  // For object: `items` are string keys.
  removeItemsOf(collection, ...items) {
    if (!assert.isDefined(collection, "spellCore.removeItemsOf(collection)")) return
    // reverse numeric keys so we don't have to worry about renumbering as we go
    if (spellCore.isArrayLike(collection)) items = items.sort().reverse()
    items.forEach((item) => spellCore.removeItemOf(collection, item))
  },

  // Remove all occurance of `things` from collection, in-place.
  // For object: removes `values`
  remove(collection, ...things) {
    if (!assert.isDefined(collection, "spellCore.remove(collection)")) return
    things.forEach((thing) => {
      let item = spellCore.itemOf(collection, thing)
      while (item !== undefined) {
        spellCore.removeItemOf(collection, item)
        item = spellCore.itemOf(collection, thing)
      }
    })
  },

  // Remove items from `collection` which match `condition`.
  // called as `condition(value, item, collection)`
  removeWhere(collection, condition) {
    if (!assert.isDefined(collection, "spellCore.removeWhere(collection)")) return
    const itemsToRemove = spellCore.filter(collection, condition)
    if (spellCore.isArrayLike(collection)) spellCore.remove(collection, ...itemsToRemove)
    else spellCore.removeItemsOf(collection, Object.keys(itemsToRemove))
  },

  //----------------------------
  // Randomizing / random item selection
  //----------

  // Return a random key of `collection`
  _randomKeyOf(collection) {
    if (!assert.isDefined(collection, "spellCore._randomKeyOf(collection)")) return undefined
    if (spellCore.itemCountOf(collection) === 0) return undefined
    const item = spellCore.randomNumber(1, spellCore.itemCountOf(collection))
    if (spellCore.isArrayLike(collection)) return item
    return spellCore.keysOf(collection)[item - 1]
  },

  // Return a single item from `collection`, picked randomly.
  randomItemOf(collection) {
    if (!assert.isDefined(collection, "spellCore.randomItemOf(collection)")) return undefined
    const key = spellCore._randomKeyOf(collection)
    if (key === undefined) return undefined
    return spellCore.getItemOf(collection, key)
  },

  // Return list of up to `count` items from `collection`, picked randomly,
  // where each item can be returned only once.
  // Returns same type as was passed in.
  randomItemsOf(collection, count) {
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

  // Randomize `collection` in-place.
  // No-op for collection
  randomize(collection) {
    if (!assert.isDefined(collection, "spellCore.randomize(collection)")) return
    if (!spellCore.isArrayLike(collection)) return
    const randomized = spellCore.randomItemsOf(collection)
    spellCore.setItemsOf(collection, 1, ...randomized)
  },

  // Return smallest item of `collection` according to `<` comparison.
  smallestOf(collection) {
    if (!assert.isDefined(collection, "spellCore.smallestOf(collection)")) return undefined
    if (spellCore.itemCountOf(collection) === 0) return undefined
    const values = spellCore.valuesOf(collection)
    return values.reduce((smallest, next) => (next < smallest ? next : smallest), values[0])
  },

  // Return largest item of `collection` according to `>` comparison
  largestOf(collection) {
    if (!assert.isDefined(collection, "spellCore.largestOf(collection)")) return undefined
    if (spellCore.itemCountOf(collection) === 0) return undefined
    const values = spellCore.valuesOf(collection)
    return values.reduce((largest, next) => (next > largest ? next : largest), values[0])
  }
})
