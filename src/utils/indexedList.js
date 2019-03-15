// Characteristics:
//  - assume defined on the prototype with a decorator.
//  - instance value MUST have 0 impact until used.
//  - input params
//      - keyProp
//      - parentProp (optional) if provided lookup will look to parent if defined)
//      - normalizeKey (optional) if provided, method to use to normalize key. e.g. `_.snakeCase`.
//      - constructor (optional) if provided, `add()` will use constructor if not instanceof
//
//  - main `variable` is a FUNCTION with an associated list / map
//  - `variables(foo)`        => returns item with key = 'foo'
//  - `variables()`           => returns all as an array (in original order)
//  - `variables.add()`       => add item (using constructor if necessary), returns item
//                            => pass multiple to add many at once, returns array
//  - `variables.remove(foo)` => remove item with key `foo` from list and map
//
//  TODO: `indexedSet` for only once per key?

import identity from "lodash/identity";
import { getDescriptorProp, setDescriptorProp } from "./decorators.js";

export function indexedListProp(props) {
  const { keyProp, parentProp, normalizeKey = identity } = props;
  const constructor = props.hasOwnProperty("constructor")
    ? props.constructor
    : undefined
  ;

  const STORAGE = new WeakMap();
  function getStorageFor(thing, createIfNecessary) {
// TODO: NEVER return storage for the prototype???
    const storage = STORAGE[thing];
    if (!storage && createIfNecessary) {
      return STORAGE[thing]
        = { list: [], map: {}, add: addItems.bind(thing), remove: remove.bind(thing) };
    }
    return storage;
  }

  // Main accessor function
  function accessor(key) {
    const stored = STORAGE[this];
    // TODO: way to get all?
    if (key === undefined) return stored.list ? [...stored.list : [];
    // TODO: parentKey
    return stored.map?.[key];
  }

  function addItems(storage, items) {
    const results = items.map(item => {
      // Normalize `item` if a constructor was specified
      if (constructor && !(item instanceof constructor)) item = new constructor(item);
      stored.list.push(item);
      const index = normalizeKey(item[keyProp]);
      if (index != null) stored.map[index] = item;
      return item;
    });
    // If passed one thing, return one thing
    if (results.length === 1) return results[0];
    // Otherwise return the array
    return results;
  }

  function removeItems(storage, keys) {
    if (!storage) return [];
    const removed = [];
    const normalizedKeys = keys.map(normalizeKey);
    storage.list = storage.list.filter(item => {
      const itemKey = normalizeKey(item[keyProp]);
      if (normalizedKeys.includes(itemKey)) {
        removed.push(item);
        return false;
      }
      return true;
    });
    return removed;
  }

  return function(descriptor) {
    // TODO: we want to return a CLASS INITIALIZER which:
    //  - when called on the prototype returns nothing
    //  - when called on an instance, returns the (accessor with add+remove) bound to the instance
    descriptor = { ...descriptor, placement: "prototype" }
    return setDescriptorProp(descriptor, "get", function() { return accessor.bind(this) });
  }
}
