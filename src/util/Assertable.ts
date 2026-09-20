import _get from "lodash/get"
import { Derivative } from "./Derivative"
import { OPTIONAL } from "./constants"

/**
 * Return `true` if `value` matches `type`(s).
 * - Works with type = `"boolean"`, `"string"`, `"number"`.
 * - Works with `Date`, `Array`, `Function`, custom classes.
 * - Works with `null`, `undefined`.
 * - Pass `type` as an array to succeed if it is any of the specified types.
 */
export function checkType(value: any, type: any): boolean {
  if (Array.isArray(type)) return type.some((nextType: any) => checkType(value, nextType))

  if (typeof type === "string") return typeof value === type
  if (type === null) return value === null
  if (type === undefined) return value === undefined
  return value instanceof type
}

/** Base class with assertion methods usable on construction. */
export class Assertable extends Derivative {
  /** Debug: assert that `expressionValue` is truthy, generally called in constructor as sanity check. */
  assert(expressionValue: any, ...message: any[]) {
    if (!expressionValue) console.warn(`Error creating ${this.constructor.name}: `, ...message)
  }

  /**
   * Debug: assert that type of `this[property]` matches `type`.
   * - `property` can be a simple string or dotted/indexed path.
   * - See `checkType()` for possibilities for type.
   * - If you pass `OPTIONAL`, returns true if `value === undefined`
   */
  assertType(property: string, type: any, optional?: typeof OPTIONAL) {
    const propValue = _get(this, property)
    if (optional === OPTIONAL && propValue === undefined) return
    this.assert(
      checkType(propValue, type),
      `\nexpected property '${property}' to be \n\t`,
      type,
      `\nActual value: \n\t`,
      propValue
    )
  }

  /**
   * Debug: assert that `this[property]` is an array, and that each item is of `type`.
   * - `property` can be a simple string or dotted/indexed path.
   * - See `checkType()` for possibilities for type.
   * - TODO: `optional` param is accepted but not actually forwarded anywhere -- the array-level
   *   check always passes `OPTIONAL` regardless, and per-item checks never receive it.  Intentional?
   */
  assertArrayType(property: string, type: any, optional?: typeof OPTIONAL) {
    this.assertType(property, Array, optional)
    const value = _get(this, property)
    if (Array.isArray(value)) {
      value.forEach((arg, index) => this.assertType(`${property}[${index}]`, type))
    }
  }
}
