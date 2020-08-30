//----------------------------
//  `spell` base runtime library for use with classes created with spell
//----------------------------
import global from "global"
import forEach from "lodash/forEach"
import _isArrayLike from "lodash/isArrayLike"
import isEqual from "lodash/isEqual"

import { hasOwnProp } from "~/util"
import { assert } from "."

// Create the `spellCore` singeton, using a class for recognition when debugging.
export const spellCore = new (class spellCore {})()
Object.assign(spellCore, {
  //----------------------------
  // Meta-programming
  //--------

  // Object.defineProperty alias.
  // NOTE: `get`ters and `set`ters are defined configurably.
  define(thing, propertyName, descriptor) {
    if (descriptor.configurable === undefined && (descriptor.get || descriptor.set)) descriptor.configurable = true
    return Object.defineProperty(thing, propertyName, descriptor)
  },

  /**
   * Define a `property` on the `thing`.
   * This is most useful for `Observable`s where `_props` is an observable proxy object.
   * For everything else, we'll define `_props` as a plain object as necessary.
   * - `thing` is object to define property on (likely a prototype)
   * - `property` is property name
   * - `value` is default value to use if not set
   * - `type` is type name or Class. If provided, we'll only set property if value matches `type`
   * - `enumeration` is array of legal values. If provided, we'll only set if value is in enumeration.
   * - `enumerationProp` is property name -- if defined, we'll set `thing[enumerationProp]` and `thing.constructor[enumerationProp]`
   */
  defineProperty(thing, { property, value, type, initializer, enumeration, enumerationProp /* get, set, */ }) {
    const descriptor = { configurable: true }
    function baseSet(newValue) {
      if (!hasOwnProp(this, "_props")) this._props = {}
      this._props[property] = newValue
    }

    // If we get an `initializer()`, call it to get a value for each instance,
    // store that in `_props`
    if (initializer) {
      descriptor.get = function () {
        const instanceValue = initializer.apply(this)
        // On initial `get()`, run the initializer and `set` the value in _props.
        baseSet.call(this, instanceValue)
        // Define a getter to return the value from props, preserving `set`
        Object.defineProperty(this, property, {
          configurable: true,
          get() {
            return this._props[property]
          },
          set: descriptor.set
        })
        return instanceValue
      }
    } else if (type) {
      descriptor.set = function (newValue) {
        if (!spellCore.isOfType(newValue, type)) {
          spellCore.console.warn(`Expected ${property} to be type '${type}', got:`, newValue)
        }
        baseSet.call(this, newValue)
      }
    } else if (enumeration) {
      // If the specified an `enumerationProp`, define the enumeration on the object and its constructor
      if (enumerationProp) {
        spellCore.define(thing, enumerationProp, { value: enumeration })
        if (thing.constructor !== Function) spellCore.define(thing.constructor, enumerationProp, { value: enumeration })
      }
      descriptor.set = function (newValue) {
        if (!enumeration.includes(newValue)) {
          spellCore.console.warn(`Expected ${property} to be one of '${enumeration}', got:`, newValue)
        }
        baseSet.call(this, newValue)
      }
    }
    if (!descriptor.get) {
      descriptor.get = function () {
        return hasOwnProp(this._props, property) ? this._props[property] : value
      }
    }
    if (!descriptor.set) descriptor.set = baseSet
    spellCore.define(thing, property, descriptor)
  },

  // Create an new, "empty" instance of `thing.constructor`.
  // TODO: number? string?  non-constructable thing???
  newThingLike(thing) {
    if (!assert.isDefined(thing, "spellCore.newThingLike()")) return undefined
    // if (spellCore.isArrayLike(thing)) return []
    try {
      return new thing.constructor()
    } catch (e) {
      return {}
    }
  },

  //----------------------------
  // exports
  //--------

  // list of named exports
  EXPORTS: {},

  // Add a named export (which may replace existing export).
  // SIDE EFFECT: globalizes exports!
  addExport(name, thing) {
    this.EXPORTS[name] = thing
    this.globalizeExports()
  },

  // globalize all exports
  globalizeExports() {
    forEach(this.EXPORTS, (thing, name) => {
      global[name] = thing
    })
  },

  //----------------------------
  // types
  //--------

  TYPE_NAME_CONVERSIONS: {
    array: "list",
    boolean: "choice",
    string: "text"
  },

  /** Return string "type" of `thing`.
   * TODO:  Return type aliases, e.g. ["number", "integer"]
   * TODO:  Return inherited class types ?
   * TODO:  NaN => `unknown` ???
   */
  typeOf(thing) {
    if (thing === null || thing === undefined) return "unknown"
    if (typeof thing === "number" && isNaN(thing)) return "unknown"
    const objectType = typeof thing
    const constructor = thing.constructor.name.toLowerCase()
    const type = objectType !== "object" || constructor === "object" ? objectType : constructor
    return spellCore.TYPE_NAME_CONVERSIONS[type] || type
  },

  /** Special methods for `isOfType()` */
  IS_OF_TYPE_SPECIALS: {
    integer: (thing) => spellCore.isAnInteger(thing),
    character: (thing) => spellCore.typeOf(thing) === "text" && thing.length === 1,
    char: (thing) => spellCore.isOfType(thing, "character")
  },

  /** Is `thing` an instance of string `type` (as per `spellCore.typeOf()`)? */
  isOfType(thing, type) {
    // TODO: check for inherited types
    if (typeof type === "string") type = type.toLowerCase()
    if (spellCore.IS_OF_TYPE_SPECIALS[type]) return spellCore.IS_OF_TYPE_SPECIALS[type](thing)
    const thingType = spellCore.typeOf(thing)
    return type === thingType
  },

  /** Does the type of `thing` match the type of `otherThing`? */
  matchesType(thing, otherThing) {
    // TODO: check for inherited types
    return spellCore.typeOf(thing) === spellCore.typeOf(otherThing)
  },

  /** Is `thing` a valid number (doesn't include NaN). */
  isANumber(thing) {
    return typeof thing === "number" && !isNaN(thing)
  },

  /** Is `thing` a valid integer (doesn't include NaN)
   * NOTE: treats `0` as an integer as well. ??? */
  isAnInteger(thing) {
    return typeof thing === "number" && !isNaN(thing) && parseInt(thing, 10) === thing
  },

  // TODO: isText, etc

  // Is `thing` an array-like thing?
  isArrayLike(thing) {
    return _isArrayLike(thing)
  },

  // Assert that `value` is not:
  //  `false`
  //  `null`
  //  `undefined`
  // NOTE: explicitly does NOT include `0`
  isTruthy(value) {
    return value !== false && value !== null && value !== undefined
  },

  // Return `true` if value is defined (e.g. not undefined).
  // TESTME
  isDefined(value) {
    return typeof value !== "undefined"
  },

  //----------------------------
  // get/set access for paths
  //--------
  get(thing, path) {},

  set(thing, path, value) {},

  //----------------------------
  // operators
  //--------

  // Does `thing` conceptually equal `otherThing`?
  // Uses lodash `isEqual` semantics.
  equals(thing, otherThing) {
    return isEqual(thing, otherThing)
  },

  //----------------------------
  // math
  //--------

  // Random integer between `min` and `max` inclusive.
  // If you pass just one number, we'll do `1..min`
  randomNumber(min, max) {
    if (arguments.length === 1) [max, min] = [min, 1]
    if (
      !assert(
        spellCore.isANumber(min) && spellCore.isANumber(max),
        "spellCore.randomNumber(): you must pass two numbers, got",
        min,
        max
      )
    )
      return undefined
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  // Return a range of numbers from `start` to `end`, inclusive.
  getRange(start, end) {
    const range = []
    if (
      !assert(
        spellCore.isANumber(start) && spellCore.isANumber(end),
        "spellCore.getRange(): you must pass two numbers, got",
        start,
        end
      )
    )
      return range

    if (start < end) {
      for (let next = start; next <= end; next++) range.push(next)
    } else {
      for (let next = start; next >= end; next--) range.push(next)
    }
    return range
  },

  //----------------------------
  // primitive iteration
  //--------
  repeat(count, callback) {
    for (let i = 0; i < count; i++) callback()
  }
})
