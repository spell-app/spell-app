/**
 * `spell` base runtime library for use with classes created with spell.
 * - Meta-programming (`checkProp`, `newThingLike`), type checks, get/set-by-path
 *   stubs, `equals`, math and primitive iteration all live here -- collection-shaped methods
 *   (`itemCountOf`, `forEach`, etc) live in `collection-core.ts` / `collection-other.ts` instead.
 */
import _isArrayLike from "lodash/isArrayLike"
import isEqual from "lodash/isEqual"

import { flushCells } from "$/util"
import { assert } from "$/core"
import { defineSpellCoreModule, type PropCheck, type SpellCore } from "./spellCore.types"

/** Special methods for `isOfType()`, keyed by type name. */
type IsOfTypeSpecials = Record<string, (thing: unknown) => boolean>

/**
 * Random integer between `min` and `max` inclusive.
 * - Pass just one number and we'll treat it as `max`, ranging `1..max`.
 */
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

/**
 * The `spellCore` singleton -- compiled `spell` code calls `spellCore.foo(...)` for every built-in.
 * - Built from an instance of an inline class (rather than a plain object) purely so it prints as
 *   `spellCore {...}` -- not `Object {...}` -- when logged / inspected while debugging.
 * - Cast to `SpellCore` since its real shape is assembled piecemeal by every module's `Object.assign()`
 *   call below (and in `collection-core.ts`, `collection-other.ts`, etc) -- see `spellCore.types.ts`.
 */
export const spellCore = new (class spellCore {})() as SpellCore

/** Meta-programming, exports, type-checking, path access, equality, math and iteration primitives. */
export const coreMethods = defineSpellCoreModule({
  /** Do nothing -- use this as a placeholder, e.g. in an `if` branch. */
  doNothing(): void {},

  /**
   * Settle everything that follows spell state NOW:  pending derived checks, then the host's Solid -- see
   * `flushCells()` in `$/util`.
   * - Spell state itself never needs it:  a read right after a write sees the write.  It's for what DRAWS it:  a
   *   test asserting on the DOM, imperative code measuring it.
   * - NEVER Solid's `flush()` directly:  a reader of only a derived value hears of a change on a microtask.
   */
  flush(): void {
    flushCells()
  },

  ////////////////
  // ## Meta-programming
  ////////////////

  /**
   * Warn if `value` fails `check` for `property`.
   * - Returns whether it passed:  callers store `value` either way.
   * - Called by `Thing.setProp()` / `List.setProp()`, i.e. compiled property setters like
   *   `set title(value) { this.setProp('title', value, { type: 'text' }) }`.
   */
  checkProp(property: string, value: unknown, check?: PropCheck): boolean {
    if (check?.type && !spellCore.isOfType(value, check.type)) {
      spellCore.console.warn(`Expected ${property} to be type '${check.type}', got:`, value)
      return false
    }
    if (check?.oneOf && !check.oneOf.includes(value)) {
      spellCore.console.warn(`Expected ${property} to be one of '${check.oneOf}', got:`, value)
      return false
    }
    return true
  },

  /**
   * Create an new, "empty" instance of `thing.constructor`.
   * - What collection helpers build their results in, e.g. `map()`, `filter()`, `duplicateCollection()`.
   * - NOT registered for the Thing Explorer -- see `ThingRegistry.quietly()` -- so a copy the program keeps
   *   doesn't show either.  See `CODE-DEBT.md`.
   * - TODO: number? string?  non-constructable thing???
   */
  newThingLike(thing: unknown): unknown {
    if (!assert.isDefined(thing, "spellCore.newThingLike()")) return undefined
    // if (spellCore.isArrayLike(thing)) return []
    try {
      const target = thing as { constructor: new () => unknown }
      // scratch, e.g. `map()`'s result:  NOT one of the program's things -- see `ThingRegistry.quietly()`
      return spellCore.things.quietly(() => new target.constructor())
    } catch (e) {
      return {}
    }
  },

  ////////////////
  // ## types
  ////////////////

  /** Maps a JS `typeof`/constructor-name result to the `spell`-facing type name shown to users. */
  TYPE_NAME_CONVERSIONS: {
    array: "list",
    boolean: "choice",
    string: "text"
  } as Record<string, string>,

  /**
   * Return string "type" of `thing`, as shown to `spell` users -- e.g. `"text"` for a string,
   * `"list"` for an array, or the lowercased constructor name for a custom class.
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

  /**
   * Special methods for `isOfType()`, for type names `typeOf()` never actually returns
   * (`integer`, `character`, `char`) -- checked instead of a plain `=== typeOf(thing)` comparison.
   */
  IS_OF_TYPE_SPECIALS: {
    integer: (thing: unknown): boolean => spellCore.isAnInteger(thing),
    character: (thing: unknown): boolean => spellCore.typeOf(thing) === "text" && (thing as string).length === 1,
    char: (thing: unknown): boolean => spellCore.isOfType(thing, "character")
  } as IsOfTypeSpecials,

  /**
   * Types `thing` is, most specific first:  its `typeOf()`, then each super-class's -- e.g. a joker is
   * `["joker", "card", "thing", ...]`, for `a joker is a card`.
   * - Up its prototype chain, stopping before plain `Object`, which every object would be.
   * - By class NAME, lowercased and converted as `typeOf()` does -- skipping any unnamed class, e.g. a mixin's.
   */
  typesOf(thing: unknown): string[] {
    const types = [spellCore.typeOf(thing)]
    if (thing === null || typeof thing !== "object") return types
    // `typeOf()` already has its own class:  start with its super-class
    for (
      let proto = Object.getPrototypeOf(Object.getPrototypeOf(thing)) as object | null;
      proto && proto !== Object.prototype;
      proto = Object.getPrototypeOf(proto) as object | null
    ) {
      const name = (proto.constructor as { name?: string } | undefined)?.name?.toLowerCase()
      const type = name && (spellCore.TYPE_NAME_CONVERSIONS[name] || name)
      if (type && !types.includes(type)) types.push(type)
    }
    return types
  },

  /**
   * Is `thing` an instance of string `type`, or of a sub-type of it -- as per `spellCore.typesOf()`?
   * - Compiles from `thing is a Bee` => `spellCore.isOfType(thing, 'Bee')` -- see `expressions.ts`.
   * - e.g. a joker is a card, if `a joker is a card`.
   */
  isOfType(thing: unknown, type: string): boolean {
    if (typeof type === "string") type = type.toLowerCase()
    if (spellCore.IS_OF_TYPE_SPECIALS[type]) return spellCore.IS_OF_TYPE_SPECIALS[type](thing)
    return spellCore.typesOf(thing).includes(type)
  },

  /**
   * Is `thing` of `otherThing`'s type -- the same type, or a sub-type of it?
   * - Compiles from `thing is the same type as other` -- see `expressions.ts`.
   * - NOT symmetrical:  a joker is the same type as a card, but a card isn't the same type as a joker.
   */
  matchesType(thing: unknown, otherThing: unknown): boolean {
    return spellCore.isOfType(thing, spellCore.typeOf(otherThing))
  },

  /** Is `thing` a valid number (doesn't include NaN). */
  isANumber(thing: unknown): thing is number {
    return typeof thing === "number" && !isNaN(thing)
  },

  /**
   * Is `thing` a valid integer (doesn't include NaN).
   * NOTE: treats `0` as an integer as well. ???
   */
  isAnInteger(thing: unknown): boolean {
    return typeof thing === "number" && !isNaN(thing) && parseInt(String(thing), 10) === thing
  },

  // TODO: isText, etc

  /** Is `thing` an array-like thing (`Array`, `arguments`, or anything with a numeric `length`)? */
  isArrayLike(thing: unknown): boolean {
    return _isArrayLike(thing)
  },

  /**
   * Assert that `value` is not `false`, `null` or `undefined`.
   * NOTE: explicitly does NOT include `0` -- unlike plain JS truthiness, `0` counts as truthy here.
   */
  isTruthy(value: unknown): boolean {
    return value !== false && value !== null && value !== undefined
  },

  /**
   * Return `true` if `value` is defined (e.g. not `undefined`).
   * - Compiles from `thing is defined` / `thing exists` / `there is a thing` -- see `expressions.ts`.
   * TESTME
   */
  isDefined(value: unknown): boolean {
    return typeof value !== "undefined"
  },

  ////////////////
  // ## get/set access for paths
  ////////////////

  /**
   * Get `path` off `thing`.
   * TODO: unimplemented stub -- always returns `undefined`, no caller wires this up yet.
   */
  get(thing: unknown, path: string): unknown {
    return undefined
  },

  /**
   * Set `path` on `thing` to `value`.
   * TODO: unimplemented stub -- currently a no-op, no caller wires this up yet.
   */
  set(thing: unknown, path: string, value: unknown): void {},

  ////////////////
  // ## operators
  ////////////////

  /** Does `thing` conceptually equal `otherThing`?  Uses lodash `isEqual` semantics (deep, structural). */
  equals(thing: unknown, otherThing: unknown): boolean {
    return isEqual(thing, otherThing)
  },

  ////////////////
  // ## math
  ////////////////

  randomNumber,

  /**
   * `[1, 2, ... count]`:  one number per time round a `repeat {count} times` loop -- `[]` if `count` is under 1.
   * - NOT `getRange(1, count)`, which counts DOWN for a `count` under 1, e.g. `[1, 0]`.
   */
  countTo(count: number): number[] {
    const range: number[] = []
    for (let next = 1; next <= count; next++) range.push(next)
    return range
  },

  /** Return a range of numbers from `start` to `end`, inclusive -- counts down if `start > end`. */
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

  ////////////////
  // ## primitive iteration
  ////////////////

  /**
   * Call `callback()` `count` times, ignoring its return value.
   * TODO: `repeat {number} times` currently compiles to `spellCore.map(spellCore.getRange(...), ...)`
   * instead (see `lists.ts`) -- no rule currently calls this method; confirm whether it's still needed.
   */
  repeat(count: number, callback: () => void): void {
    for (let i = 0; i < count; i++) callback()
  }
})
Object.assign(spellCore, coreMethods)
