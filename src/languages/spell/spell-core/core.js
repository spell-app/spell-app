//////////
//  `spell` base runtime library for use with classes created with spell
//////////
import { assert } from "."
const spell = {

  //////////
  // Meta-programming
  //--------

  // Object.defineProperty alias.
  define(thing, propertyName, descriptor) {
    return Object.defineProperty(thing, propertyName, descriptor)
  },

  // Create an new instance of `thing.constructor` with constructor `args`.
  newThingLike(thing, ...args) {
    if (!assert.defined(thing, "spell.newThingLike()")) return undefined
    try {
      return new (collection.constructor)(...args)
    } catch (e) {
      if (spell.isArrayLike(thing)) return []
      return {}
    }
  },


  //////////
  // types
  //--------

  // Return string "type" of `thing`.
  // TODO... ???
  typeOf(thing) {
    if (thing == null) return "unknown"
    const objectType = typeof thing
    if (objectType !== "object") {
      if (objectType === "number" && isNaN(thing)) return "unknown"
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
    return spell.any(types, (type => type === thingType))
  },

  // Is `thing` a valid number (doesn't include NaN)
  isANumber(thing) {
    return (typeof thing === "number" && !isNaN(thing))
  },

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


  //////////
  // operators
  //--------

  // empty array / object / ???
  // TODO: algorithm?
  isEmpty(thing) {},

  // Does `thing` conceptually equal `otherThing`?
  // Uses lodash `isEqual` semantics.
  equals(thing, otherThing) {
    return _.isEqual(thing, otherThing)
  },



  //////////
  // math
  //--------

  // Random integer between `start` and `end` inclusive.
  randomNumber(start, end) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  // Return smallest item of `thing`
  // TODO: what can `thing` be???
  smallestOf(thing) {},

  // Return largest item of `thing`
  // TODO: what can `thing` be???
  largestOf(thing) {},


  //////////
  // components
  //--------

  // Create an element (ala `React.createElement()`)
  createElement(tagName, properties, ...children) {},

}

export default spell
