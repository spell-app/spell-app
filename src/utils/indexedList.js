// Characteristics:
//  - assume defined on the prototype with a decorator.
//  - instance has 0 impact until accessed, at which point it's a single method bind and a few sets.
//  - lookup uses a WeakMap, not sure how slow that is.
//  - input params
//      - `keyProp`      (required) Name of key to use for index.
//      - `parentProp`   (optional) If provided name of key which yields instance "parent".
//                                  If parent is found, lookup by key will check parent's indexedList if not on instance.
//      - `normalizeKey` (optional) If provided, method to use to normalize key. e.g. `_.snakeCase`.
//      - `transformer`  (optional) If provided, `add(item)` will run through this function, to transform raw input as necessary.
//      - `unique`       (optional) If `true`, we'll remove any item with same key when adding new ones.
//
//  - main `variable` is a FUNCTION with an associated list / map
//  - `variables()`                   => returns all as a NEW array (in original order)
//  - `variables(foo)`                => returns item with key = 'foo'
//  - `variables.add(item)`           => add single item (using transformer if necessary), returns item.
//  - `variables.add(item...)`        => Add multiple items at once, returns array.
//  - `variables = item`              => Same as a call to `variables.add(item)` (e.g. adds to existing items).
//                                       Return value should not be used (may not be what was actually addeed),
//  - `variables = [item...]`         => Same as a call to `variables.add(item...)`.
//                                       Return value should not be used (may not be what was actually addeed),
//  - `variables.remove(key)`
//  - `variables.remove(key...)`      => remove item with key(s) from list and map. Returns array of removed items.
//  - `variables.remove("*")`         => Clear all.  Returns all items.
//  - `variables.remove(function)`    => Remove all items where `function(item, index)` is truthy.
//                                       This is like a reverse-filter
//
// TODO: way to get all including parents?

import identity from "lodash/identity"

import { getDescriptorProp, setDescriptorProp, clearDescriptorProp } from "./decorators.js"

export function indexedList(props) {
  if (!props) throw new TypeError("@indexedList() must be passed at least `{ keyProp }`")

  const { keyProp, parentProp, transformer = identity, normalizeKey = identity, unique = false } = props

  // Add one or more items to the list.
  function addItems() {
    // `this` is the bound `getItem` method.
    // Actually create the stored list + map when adding.
    const storage = this["#storage"] || (this["#storage"] = { list: [], map: {} })
    const results = []
    for (var i = 0; i < arguments.length; i++) {
      // call the `transformer` on each item (default is to just return the item passed in)
      const item = transformer.call(this.thing, arguments[i])
      const key = normalizeKey(item[keyProp])
      if (key != null) {
        if (unique && storage.map[key]) this.remove(item[keyProp])
        storage.map[key] = item
      }
      storage.list.push(item)
      results.push(item)
    }
    // If passed one thing, return one thing
    if (results.length === 1) return results[0]
    // Otherwise return the array
    return results
  }

  // Remove one or more items to the list specified by `key.
  // TODOC:  pass:
  //  - a (list of) key
  //  - a function as a reverse filter
  function removeItems(...keys) {
    // `this` is the bound `getItem` method.
    const storage = this["#storage"]
    if (!storage) return []
    const removed = []
    if (keys.length === 1 && keys[0] === "*") {
      removed.push(...storage.list)
      storage.list = []
      storage.map = {}
    } else if (keys.length === 1 && typeof keys[0] === "function") {
      const method = keys[0]
      storage.list = storage.list.filter((item, index) => {
        if (method(item, index)) {
          removed.push(item)
          const itemKey = normalizeKey(item[keyProp])
          delete storage.map[itemKey]
          return false
        }
        return true
      })
      return removed
    } else {
      const normalizedKeys = keys.map(normalizeKey)
      storage.list = storage.list.filter(item => {
        const itemKey = normalizeKey(item[keyProp])
        if (normalizedKeys.includes(itemKey)) {
          removed.push(item)
          delete storage.map[itemKey]
          return false
        }
        return true
      })
    }
    return removed
  }

  const STORAGE = new WeakMap()
  // ====> Works:  getter/setter on proto, storage on proto as well.
  // TODO: can we add directly to instance on first get and avoid the STORAGE bit?
  return function(descriptor) {
    // TODOC:  get single key, get local
    function getStoredFor(thing, key) {
      let accessor = STORAGE.get(thing)
      if (!accessor) {
        if (parentProp) {
          accessor = function(key, localOnly) {
            // `this` is the instance
            const storage = accessor["#storage"]
            if (key === undefined) return storage ? [...storage.list] : []

            key = normalizeKey(key)
            if (storage && storage.map[key]) return storage.map[key]

            if (!localOnly && this[parentProp]) return this[parentProp][descriptor.key](...arguments)
          }
        } else {
          accessor = function(key) {
            // `this` is the instance
            const storage = accessor["#storage"]
            if (key === undefined) return storage ? [...storage.list] : []

            key = normalizeKey(key)
            return storage && storage.map[key]
          }
        }

        accessor = accessor.bind(thing)
        accessor.thing = thing
        // Hook up the add/remove methods, no need to bind them!
        accessor.add = addItems
        accessor.remove = removeItems
        STORAGE.set(thing, accessor)
      }
      return accessor
    }

    descriptor = setDescriptorProp(descriptor, "kind", "method")
    descriptor = setDescriptorProp(descriptor, "placement", "prototype")
    descriptor = clearDescriptorProp(descriptor, "writable")
    descriptor = setDescriptorProp(descriptor, "enumerable", false)
    descriptor = setDescriptorProp(descriptor, "get", function() {
      return getStoredFor(this, descriptor.key)
    })
    descriptor = setDescriptorProp(descriptor, "set", function(value) {
      const accessor = getStoredFor(this, descriptor.key)
      if (Array.isArray(value)) accessor.add(...value)
      else accessor.add(value)
    })
    return descriptor
  }
}
