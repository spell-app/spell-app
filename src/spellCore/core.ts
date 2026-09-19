//----------------------------
//  `spell` base runtime library for use with classes created with spell
//----------------------------
import global from "global"
import forEach from "lodash/forEach"
import _isArrayLike from "lodash/isArrayLike"
import isEqual from "lodash/isEqual"

import { extend } from "~/util"
import { assert } from "~/spellCore"
import { defineSpellCoreModule, type SpellCore } from "./SpellCore"

/** Options accepted by `spellCore.defineProperty()`. */
export type DefinePropertyOptions<T = unknown> = {
  property: string
  value?: T
  type?: string
  initializer?: () => T
  enumeration?: unknown[]
  enumerationProp?: string
}

/** Special methods for `isOfType()`, keyed by type name. */
type IsOfTypeSpecials = Record<string, (thing: unknown) => boolean>

// Random integer between `min` and `max` inclusive.
// If you pass just one number, we'll do `1..min`
export function randomNumber(): number | undefined
export function randomNumber(max: number): number | undefined
export function randomNumber(min: number, max: number): number | undefined
export function randomNumber(min?: number, max?: number): number | undefined {
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
  return Math.floor(Math.random() * (max! - min! + 1)) + min!
}

// Create the `spellCore` singeton, using a class for recognition when debugging.
export const spellCore = new (class spellCore {})() as SpellCore

export const coreMethods = defineSpellCoreModule({
  /** Do nothing -- use this as a placeholder, e.g. in an `if` branch. */
  doNothing(): void {},

  //----------------------------
  // Meta-programming
  //--------

  /**
   * Object.defineProperty alias.
   * NOTE: `get`ters and `set`ters are defined configurably.
   */
  define(thing: object, propertyName: PropertyKey, descriptor: PropertyDescriptor): object {
    if (descriptor.configurable === undefined && (descriptor.get || descriptor.set)) descriptor.configurable = true
    return Object.defineProperty(thing, propertyName, descriptor)
  },

  /**
   * Define a `property` on the `thing`.
   * This is most useful for `Observable`s where `$props` is an observable proxy object.
   * For everything else, we'll define `$props` as a plain object as necessary.
   * - `thing` is object to define property on (likely a prototype)
   * - `property` is property name
   * - `value` is default value to use if not set
   * - `type` is type name or Class. If provided, we'll only set property if value matches `type`
   * - `enumeration` is array of legal values. If provided, we'll only set if value is in enumeration.
   * - `enumerationProp` is property name -- if defined, we'll set `thing[enumerationProp]` and `thing.constructor[enumerationProp]`
   */
  defineProperty(thing: object, options: DefinePropertyOptions): void {
    const { property, type, initializer, enumeration, enumerationProp } = options
    const descriptor: PropertyDescriptor = { configurable: true }

    // If we get an `initializer()`, call it to get a value for each instance,
    // store that in `$props`
    if (type) {
      descriptor.set = function (this: object, newValue: unknown) {
        if (!spellCore.isOfType(newValue, type)) {
          spellCore.console.warn(`Expected ${property} to be type '${type}', got:`, newValue)
        }
        extend.setProp(this, property, newValue)
      }
    } else if (enumeration) {
      // If the specified an `enumerationProp`, define the enumeration on the object and its constructor
      if (enumerationProp) {
        spellCore.define(thing, enumerationProp, { value: enumeration })
        if (thing.constructor !== Function) {
          spellCore.define(thing.constructor, enumerationProp, { value: enumeration })
        }
      }
      descriptor.set = function (this: object, newValue: unknown) {
        if (!enumeration.includes(newValue)) {
          spellCore.console.warn(`Expected ${property} to be one of '${enumeration}', got:`, newValue)
        }
        extend.setProp(this, property, newValue)
      }
    }
    if (!descriptor.get) {
      descriptor.get = function (this: object) {
        return extend.getProp(this, property, initializer)
      }
    }
    if (!descriptor.set) {
      descriptor.set = function (this: object, newValue: unknown) {
        extend.setProp(this, property, newValue)
      }
    }
    spellCore.define(thing, property, descriptor)
  },

  /**
   * Create an new, "empty" instance of `thing.constructor`.
   * - TODO: number? string?  non-constructable thing???
   */
  newThingLike(thing: unknown): unknown {
    if (!assert.isDefined(thing, "spellCore.newThingLike()")) return undefined
    // if (spellCore.isArrayLike(thing)) return []
    try {
      const target = thing as { constructor: new () => unknown }
      return new target.constructor()
    } catch (e) {
      return {}
    }
  },

  //----------------------------
  // exports
  //--------

  // list of named exports
  EXPORTS: {} as Record<string, unknown>,

  // Add a named export (which may replace existing export).
  // SIDE EFFECT: globalizes exports!
  addExport(name: string, thing: unknown): void {
    this.EXPORTS[name] = thing
    this.globalizeExports()
  },

  // globalize all exports
  globalizeExports(): void {
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
  } as Record<string, string>,

  /** Return string "type" of `thing`.
   * TODO:  Return type aliases, e.g. ["number", "integer"]
   * TODO:  Return inherited class types ?
   * TODO:  NaN => `unknown` ???
   */
  typeOf(thing: unknown): string {
    if (thing === null || thing === undefined) return "unknown"
    if (typeof thing === "number" && isNaN(thing)) return "unknown"
    const objectType = typeof thing
    const constructor = (thing as object).constructor.name.toLowerCase()
    const type = objectType !== "object" || constructor === "object" ? objectType : constructor
    return spellCore.TYPE_NAME_CONVERSIONS[type] || type
  },

  /** Special methods for `isOfType()` */
  IS_OF_TYPE_SPECIALS: {
    integer: (thing: unknown): boolean => spellCore.isAnInteger(thing),
    character: (thing: unknown): boolean => spellCore.typeOf(thing) === "text" && (thing as string).length === 1,
    char: (thing: unknown): boolean => spellCore.isOfType(thing, "character")
  } as IsOfTypeSpecials,

  /** Is `thing` an instance of string `type` (as per `spellCore.typeOf()`)? */
  isOfType(thing: unknown, type: string): boolean {
    // TODO: check for inherited types
    if (typeof type === "string") type = type.toLowerCase()
    if (spellCore.IS_OF_TYPE_SPECIALS[type]) return spellCore.IS_OF_TYPE_SPECIALS[type](thing)
    const thingType = spellCore.typeOf(thing)
    return type === thingType
  },

  /** Does the type of `thing` match the type of `otherThing`? */
  matchesType(thing: unknown, otherThing: unknown): boolean {
    // TODO: check for inherited types
    return spellCore.typeOf(thing) === spellCore.typeOf(otherThing)
  },

  /** Is `thing` a valid number (doesn't include NaN). */
  isANumber(thing: unknown): thing is number {
    return typeof thing === "number" && !isNaN(thing)
  },

  /** Is `thing` a valid integer (doesn't include NaN)
   * NOTE: treats `0` as an integer as well. ??? */
  isAnInteger(thing: unknown): boolean {
    return typeof thing === "number" && !isNaN(thing) && parseInt(String(thing), 10) === thing
  },

  // TODO: isText, etc

  // Is `thing` an array-like thing?
  isArrayLike(thing: unknown): boolean {
    return _isArrayLike(thing)
  },

  // Assert that `value` is not:
  //  `false`
  //  `null`
  //  `undefined`
  // NOTE: explicitly does NOT include `0`
  isTruthy(value: unknown): boolean {
    return value !== false && value !== null && value !== undefined
  },

  // Return `true` if value is defined (e.g. not undefined).
  // TESTME
  isDefined(value: unknown): boolean {
    return typeof value !== "undefined"
  },

  //----------------------------
  // get/set access for paths
  //--------
  get(thing: unknown, path: string): unknown {
    return undefined
  },

  set(thing: unknown, path: string, value: unknown): void {},

  //----------------------------
  // operators
  //--------

  // Does `thing` conceptually equal `otherThing`?
  // Uses lodash `isEqual` semantics.
  equals(thing: unknown, otherThing: unknown): boolean {
    return isEqual(thing, otherThing)
  },

  //----------------------------
  // math
  //--------

  randomNumber,

  // Return a range of numbers from `start` to `end`, inclusive.
  getRange(start: number, end: number): number[] {
    const range: number[] = []
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
  repeat(count: number, callback: () => void): void {
    for (let i = 0; i < count; i++) callback()
  }
})
Object.assign(spellCore, coreMethods)
