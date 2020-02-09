//----------------------------
//  `spell` base runtime library for use with classes created with spell
//----------------------------
import global from "global"
import forEach from "lodash/forEach"
import _isArrayLike from "lodash/isArrayLike"
import isEqual from "lodash/isEqual"

import { assert } from "."

const spellCore = {
  //----------------------------
  // Meta-programming
  //--------

  // Object.defineProperty alias.
  // NOTE: `get`ters and `set`ters are defined configurably.
  define(thing, propertyName, descriptor) {
    if (descriptor.get || descriptor.set) descriptor.configurable = true
    return Object.defineProperty(thing, propertyName, descriptor)
  },

  // Create an new, "empty" instance of `thing.constructor`.
  // TODO: number? string?  non-constructable thing???
  newThingLike(thing) {
    if (!assert.isDefined(thing, "spellCore.newThingLike()")) return undefined
    if (spellCore.isArrayLike(thing)) return []
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

  // Return string "type" of `thing`.
  // TODO:  Return type aliases, e.g. ["number", "integer"]
  // TODO:  Return inherited class types ?
  // TODO:  NaN => `unknown` ???
  typeOf(thing) {
    if (thing === null || thing === undefined) return "unknown"
    if (typeof thing === "number" && isNaN(thing)) return "unknown"
    const objectType = typeof thing
    const constructor = thing.constructor.name.toLowerCase()
    const type = objectType !== "object" || constructor === "object" ? objectType : constructor
    return spellCore.TYPE_NAME_CONVERSIONS[type] || type
  },

  // Special methods for `isOfType()`
  IS_OF_TYPE_SPECIALS: {
    integer: thing => spellCore.isAnInteger(thing),
    character: thing => spellCore.typeOf(thing) === "text" && thing.length === 1,
    char: thing => spellCore.isOfType(thing, "character")
  },

  // Is `thing` an instance of string `type` (as per `spellCore.typeOf()`)?
  // TODO: inherited types
  isOfType(thing, type) {
    if (spellCore.IS_OF_TYPE_SPECIALS[type]) return spellCore.IS_OF_TYPE_SPECIALS[type](thing)
    const thingType = spellCore.typeOf(thing)
    return type === thingType
  },

  // Is `thing` a valid number (doesn't include NaN)
  isANumber(thing) {
    return typeof thing === "number" && !isNaN(thing)
  },

  // Is `thing` a valid integer (doesn't include NaN)
  // NOTE: treats `0` as an integer as well. ???
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
  isDefined(value) {
    return typeof value !== "undefined"
  },

  // Return `true` if value is defined (e.g. not undefined).
  isUndefined(value) {
    return typeof value === "undefined"
  },

  //----------------------------
  // operators
  //--------

  // Does `thing` conceptually equal `otherThing`?
  // Uses lodash `isEqual` semantics.
  equals(thing, otherThing) {
    return isEqual(thing, otherThing)
  },

  // Does `thing` conceptually equal `otherThing`?
  // Uses lodash `isEqual` semantics.
  assertEquals(thing, otherThing, thingSource, otherThingSource) {
    if (isEqual(thing, otherThing)) {
      console.info(`YES: Expected "${thingSource}" to be "${otherThingSource}"`)
    } else {
      console.warn(`NO: Expected "${thingSource}" to be "${otherThingSource}", got: "${thing}"`)
    }
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
  // components
  //--------

  // Create an element (ala `React.createElement()`)
  createElement(tagName, properties, ...children) {
    throw new global.RuntimeError("TODO: spellCore.createElement()")
  }
}

export default spellCore
