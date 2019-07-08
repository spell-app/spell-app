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
  // composite accessors
  //----------

  // Does `collection` include ALL of the specified `values`?
  // If more than one value specified, all must be included.
  includes(collection, ...values) {
    if (!assert.isDefined(collection, "spell.includes(collection)")) return false
    if (!values.length) return false
    return spell.all(values, (value) => spell.itemOf(collection, value) !== undefined)
  },

  // Does `collection` include any of the specified `values`?
  // If more than one value specified, only one must be included.
  includesAny(collection, ...values) {
    if (!assert.isDefined(collection, "spell.includesAny(collection)")) return false
    return spell.any(values, (value) => spell.itemOf(collection, value) !== undefined)
  },

  ////////////
  // numeric iteration -- arrays only
  //----------

  // Is `thing` the first thing in `collection`?
  // Array only.
  startsWith(collection, thing) {
    if (!assert.isArrayLike(collection, "spell.startsWith(collection)")) return false
    if (thing == null) return false
    return spell.getItemOf(collection, 1) === thing
  },

  // Is `thing` the last thing in `collection`?
  // Array only.
  endsWith(collection, thing) {
    if (!assert.isArrayLike(collection, "spell.endsWith(collection)")) return false
    if (thing == null) return false
    return spell.getItemOf(collection, spell.itemCountOf(collection)) === thing
  },

  // Add `things` in the middle of the `collection` starting with 1-based position `start`,
  // moving things after `start` down.
  // Array only.
  addAtPosition(collection, start, ...things) {
    if (!assert.isArrayLike(collection, "spell.addAtPosition(collection)")) return
    if (typeof collection.prepend === "function") return collection.append(...things)
    if (start > 0)
      Array.prototype.splice.call(collection, start - 1, 0, ...things)
    else
      Array.prototype.splice.call(collection, start, 0, ...things)
  },

  // Add `things` to front of `collection`, pushing everything else down.
  // Array only.
  prepend(collection, ...things) {
    spell.addAtPosition(collection, 1, ...things)
  },

  // Add `things` to end of `collection`.
  // Array only.
  append(collection, ...things) {
    spell.addAtPosition(collection, spell.itemCountOf(collection) + 1, ...things)
  },

  // Set values of item starting with `start` as 1-based position.
  // Replaces existing values.
  setItemsOf(collection, start, ...values) {
    if (!assert.isArrayLike(collection, "spell.setItemsOf(collection)")) return
    values.forEach( (value, index) => {
      spell.setItemOf(collection, start + index, value)
    })
  },

  // Reverse list in-place.
  // Array only.
  reverse(collection) {
    if (!assert.isDefined(collection, "spell.reverse(collection)")) return
    const reversed = spell.valuesOf(collection).reverse();
    spell.setItemsOf(collection, 1, ...reversed)
  },

  // Given possible `start` and `end` 1-based position in collection,
  //  as well as `itemCount` items in the collection, return:
  //  `{ start, end }` for a valid range, or
  //  `undefined` if an invalid range was specfified.
  // If `start` is negative, we'll take from the end of the list, but in normal list order.
  _validateRangeBetween(start, end, itemCount) {
    if (itemCount === 0) return undefined
    if (!spell.isANumber(start) || start === 0) start = 1   // TODO === 0 ???
    else if (Math.abs(start) > itemCount) return undefined
    else if (start < 0) start = Math.max(itemCount + start + 1, 1)
    if (!spell.isANumber(end) || end > itemCount) end = itemCount
    if (end < start) return undefined
    return { start, end }
  },

  // Return subset of list from `start` to `end` as 1-based positions, inclusive.
  // Note: this is positive numbers only, `rangeStartingAt()` deals with negatives. (???)
  // Array only.
  rangeBetween(collection, start, end) {
    if (!assert.isArrayLike(collection, "spell.rangeBetween(collection)")) return []
    const range = spell._validateRangeBetween(start, end, spell.itemCountOf(collection))
    if (!range) return []
    const results = spell.newThingLike(collection)
    for (let i = range.start; i <= range.end; i++) {
      spell.append(results, spell.getItemOf(collection, i))
    }
    return results
  },

  // Remove items from `collection` between 1-based positions `start` to `end`, inclusive.
  // Note: this is positive numbers only. (???)
  // Slides other items into the gaps.
  // Array only
  removeRangeBetween(collection, start, end) {
    if (!assert.isArrayLike(collection, "spell.rangeStartingAt(collection)")) return
    const range = spell._validateRangeBetween(start, end, spell.itemCountOf(collection))
    if (!range) return
    const count = (range.end - range.start) + 1
    Array.prototype.splice.call(collection, range.start - 1, count)
  },

  // Given possible `start` as 1-based position in collection,
  // `count` as number of items (inclusive) and `itemCount` in collection:
  //  `{ start, end }` for a valid range, or
  //  `undefined` if an invalid range was specfified.
  // If `start` is negative, we'll take from the end of the list, but in normal list order.
  _validateRangeStartingAt(start, count, itemCount) {
    if (Math.abs(start) > itemCount) return undefined
    if (!spell.isANumber(start) || start === 0) start = 1   // TODO === 0 ???
    else if (start < 0) start = Math.max(itemCount + start + 1, 1)
    const end = spell.isANumber(count) ? start + count - 1 : itemCount
    return spell._validateRangeBetween(start, end, itemCount)
  },


  // Return `count` items from list starting with `start` as 1-based position.
  // Negative `start` takes from the end of the list (but returns in list order)
  // Array only.
  rangeStartingAt(collection, start, count) {
    if (!assert.isArrayLike(collection, "spell.rangeStartingAt(collection)")) return []
    const range = spell._validateRangeStartingAt(start, count, spell.itemCountOf(collection))
    if (!range) return []
    return spell.rangeBetween(collection, range.start, range.end)
  },


  ////////////
  // iteration
  //----------

  // Execute `method` for each item in `collection`, ignoring results.
  forEach(collection, method) {
    if (!assert.isDefined(collection, "spell.map(collection)")) return
    if (method) return
    const iterator = spell.getIteratorFor(collection)
    let result = iterator.next()
    while (!result.done) {
      method(...result.value)
      result = result.next()
    }
  },

  // Execute `method` for each item in `collection`, returning results in same type as `collection`
  // Pass `results` as thing to put results into, defults to new thing like `collection`.
  // TODO: rename???
  map(collection, method) {
    if (!assert.isDefined(collection, "spell.map(collection)")) return undefined
    const results = spell.newThingLike(collection)
    spell.forEach(collection, (value, item) => {
      spell.setItem(results, item, method(value, item, collection))
    })
    return results
  },

  // Return new `collection` of only things which match `condition` filter.
  // For array: returns a compacted collection of same type.
  // For object: returns new type of collection with just specified keys.
  filter(collection, condition) {
    if (!assert.isDefined(collection, "spell.all(collection)")) return undefined
    const results = spell.newThingLike(collection)
    let filter
    if (spell.isArrayLike(collection)) {
      filter = (value, item, collection) => {
        if (condition(value, item, collection)) spell.append(results, value)
      }
    }
    else {
      filter = (value, item, collection) => {
        if (condition(value, item, collection)) spell.setItem(results, item, value)
      }
    }
    spell.forEach(collection, filter)
    return results
  },

  // Return `true` if all items in collection match `condition`,
  // called as `condition(value, item, collection)`
  all(collection, condition) {
    if (!assert.isDefined(collection, "spell.all(collection)")) false
    const iterator = spell.getIteratorFor(collection)
    let result = iterator.next()
    while (!result.done) {
      if (!condition(...result.value)) return false
      result = iterator.next()
    }
    return true
  },

  // Return `true` if at least one item in collection matches `condition`
  // called as `condition(value, item, collection)`
  any(collection, condition) {
    if (!assert.isDefined(collection, "spell.any(collection)")) return false
    const iterator = spell.getIteratorFor(collection)
    let result = iterator.next()
    while (!result.done) {
      if (condition(...result.value)) return true
      result = iterator.next()
    }
    return false
  },

  // Remove items from `collection` which match `condition`.
  // called as `condition(value, item, collection)`
  removeWhere(collection, condition) {
    if (!assert.isDefined(collection, "spell.removeWhere(collection)")) return
    const toRemove = []
    const iterator = spell.getIteratorFor(collection)
    let itemsToRemove = iterator.next()
    while (!result.done) {
      if (condition(...result.value)) itemsToRemove.push(result.value[1])
      result = iterator.next()
    }
    spell.removeItemsOf(collection, ...itemsToRemove)
  },

  // Remove `items` from `collection`.
  // For array: `items` are 1-based positions.
  // For object: `items` are string keys.
  removeItemsOf(collection, ...items) {
    if (!assert.isDefined(collection, "spell.removeItemsOf(collection)")) return
    items.forEach(item => spell.removeItemOf(collection, item))
  },

  // Remove all occurance of `things` from collection, in-place.
  // For object: removes `values`
  remove(collection, ...things) {
    if (!assert.isDefined(collection, "spell.remove(collection)")) return
    things.forEach(thing => {
      let item = spell.indexOf(collection, thing)
      while (item !== undefined) {
        spell.removeItemOf(collection, item)
        item = spell.indexOf(collection, thing)
      }
    })
  },

  ////////////
  // Randomizing / random item selection
  //----------

  // Return a random key of `collection`
  randomKeyOf(collection) {
    if (!assert.isDefined(collection, "spell.randomKeyOf(collection)")) return undefined
    if (spell.isArrayLike(collection)) return spell.randomNumber(1, spell.itemCountOf(collection))
    return spell.randomKeyOf(spell.keysOf(collection))
  },

  // Return a single item from `collection`, picked randomly.
  randomItemOf(collection) {
    if (!assert.isDefined(collection, "spell.randomItemOf(collection)")) return undefined
    if (typeof collection.randomItem === "function") return collection.randomItem()
    const key = spell.randomKeyOf(collection);
    return spell.getItemOf(collection, key)
  },

  // Return list of up to `count` items from `collection`, picked randomly,
  // where each item can be returned only once.
  // Returns same type as was passed in.
  randomItemsOf(collection, count) {
    if (!assert.isDefined(collection, "spell.randomItemsOf(collection)")) return undefined
    const items = spell.keysOf(collection)
    const shuffledItems = _.shuffle(items).slice(0, count)
    const results = spell.newThingLike(collection)
    shuffled.forEach((item, index) => {
      spell.setItemOf(results, item, spell.getItemOf(collection, index))
    })
    return results
  },

  // Randomize `collection` in-place.
  // Array-only?
  randomize(collection) {
    if (!assert.isDefined(collection, "spell.randomize(collection)")) return undefined
    const randomized = spell.randomItemsOf(collection)
    spell.setItemsOf(collection, 0, ...randomized)
  },

  // Return smallest item of `collection` according to `<` comparison.
  smallestOf(collection) {
    if (!assert.isDefined(collection, "spell.smallestOf(collection)")) return undefined
    const values = spell.valuesOf(collection)
    return values.reduce(
      (smallest, next) => next < smallest ? next : smallest,
      values[0]
    )
  },

  // Return largest item of `collection` according to `>` comparison
  largestOf(collection) {
    if (!assert.isDefined(collection, "spell.largestOf(collection)")) return undefined
    const values = spell.valuesOf(collection)
    return values.reduce(
      (largest, next) => next > largest ? next : largest,
      values[0]
    )
  },


  ////////////
  // Sorting
  //----------

  // Sort `collection` in-place, `ascending` or descending.
  // If an array: `itemGetter` is one of:
  //    - string name of property to sort by
  //    - array of names to sort by
  //    - method which takes in `value` and returns sort key
  // TODO: If an object, sorts keys???
  sort(collection, itemGetter, ascending = true) {
    if (!assert.isArrayLike(collection, "spell.addAtPosition(collection)")) return
    const sorted = _.sortBy(collection, itemGetter)
    if (!ascending) sorted.reverse()
    spell.setItemsOf(collection, 0, ...sorted)
  },

})
