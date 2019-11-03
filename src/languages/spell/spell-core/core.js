// ////////
//  `spell` base runtime library for use with classes created with spell
// ////////
import _ from "lodash"
import { assert } from "."
const spell = {
  // ////////
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
    if (!assert.isDefined(thing, "spell.newThingLike()")) return undefined
    if (spell.isArrayLike(thing)) return []
    try {
      return new thing.constructor()
    } catch (e) {
      return {}
    }
  },

  // ////////
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
    _.forEach(this.EXPORTS, (thing, name) => {
      global[name] = thing
    })
  },

  // ////////
  // types
  //--------

  // Return string "type" of `thing`.
  // TODO:  string => text ?
  // TODO:  boolean => choice ?
  // TODO:  array => list ?  array-like?
  // TODO:  function => ????
  typeOf(thing) {
    if (thing == null) return "unknown"
    const objectType = typeof thing
    if (objectType !== "object") {
      return objectType
    }
    if (thing.constructor && thing.constructor.name) return thing.constructor.name.toLowerCase()
    return "unknown"
  },

  // Is `thing` an instance of string `types` (as per `spell.typeOf()`)?
  // If more than one `type`, returns `true` if any match.
  // `null`/`undefined` only match themselves.
  isOfType(thing, ...types) {
    const thingType = spell.typeOf(thing)
    return types.some(type => type === thingType)
  },

  // Is `thing` a valid number (doesn't include NaN)
  isANumber(thing) {
    return typeof thing === "number" && !isNaN(thing)
  },

  // TODO: isText, etc

  // Is `thing` an array-like thing?
  isArrayLike(thing) {
    return _.isArrayLike(thing)
  },

  // Assert that `value` is not:
  //  `false`
  //  `null`
  //  `undefined`
  // NOTE: explicitly does NOT include `0`
  isTruthy(value) {
    return value !== false && value !== null && value !== undefined
  },

  // ////////
  // operators
  //--------

  // Does `thing` conceptually equal `otherThing`?
  // Uses lodash `isEqual` semantics.
  equals(thing, otherThing) {
    return _.isEqual(thing, otherThing)
  },

  // Does `thing` conceptually equal `otherThing`?
  // Uses lodash `isEqual` semantics.
  assertEquals(thing, otherThing, thingSource, otherThingSource) {
    if (_.isEqual(thing, otherThing)) {
      console.info(`YES: Expected "${thingSource}" to be "${otherThingSource}"`)
    } else {
      console.warn(`NO: Expected "${thingSource}" to be "${otherThingSource}", got: "${thing}"`)
    }
  },

  // ////////
  // math
  //--------

  // Random integer between `min` and `max` inclusive.
  // If you pass just one number, we'll do `1..min`
  randomNumber(min, max) {
    if (arguments.length === 1) {
      max = min
      min = 1
    }
    if (
      !assert(
        spell.isANumber(min) && spell.isANumber(max),
        "spell.randomNumber(): you must pass two numbers, got",
        min,
        max
      )
    )
      return undefined
    if (!assert(min <= max, "spell.randomNumber(): min (", min, ") must be less than max (", max, ")")) return undefined
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  // ////////
  // components
  //--------

  // Create an element (ala `React.createElement()`)
  createElement(tagName, properties, ...children) {
    throw new RuntimeError("TODO: spell.createElement()")
  }
}

export default spell
