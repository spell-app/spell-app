//////////
//  `spell` base runtime library for use with classes created with spell
//////////
import _ from "lodash"
import { assert } from "."
const spell = {

  //////////
  // Meta-programming
  //--------

  // Object.defineProperty alias.
  define(thing, propertyName, descriptor) {
    return Object.defineProperty(thing, propertyName, descriptor)
  },

  // Create an new, "empty" instance of `thing.constructor`.
  newThingLike(thing, ...args) {
    if (!assert.isDefined(thing, "spell.newThingLike()")) return undefined
    try {
      return new (collection.constructor)(...args)
    } catch (e) {
      if (spell.isArrayLike(thing)) return [...args]
      return {...args}
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


  //////////
  // operators
  //--------

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

  //////////
  // components
  //--------

  // Create an element (ala `React.createElement()`)
  createElement(tagName, properties, ...children) {
    throw new RuntimeError("TODO: spell.createElement()")
  },

}

export default spell
