/** Base class with assertion methods */
import _get from "lodash/get"

import { OPTIONAL } from "./constants"

/** Return `true` if `value` matches `type`(s).
 * DOCME
 */
export function checkType(value, type) {
  if (Array.isArray(type)) return type.some(nextType => checkType(value, nextType))
  // eslint-disable-next-line valid-typeof
  if (typeof type === "string") return typeof value === type
  if (type === null) return value === null
  if (type === undefined) return value === undefined
  return value instanceof type
}

/** Base class with assertion methods usable on construction. */
export class Assertable {
  /** Debug: assert that a condition is true, generally called on constructor as sanity check. */
  assert(expressionValue, ...message) {
    if (!expressionValue) console.warn(`Error creating ${this.constructor.name}: `, ...message)
  }

  /** Debug: assert that type of `property` (path) matches `type`. */
  assertType(property, type, optional) {
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

  /** Assert that `this[property]` is an array, and that each item is of `type` */
  assertArrayType(property, type, optional) {
    this.assertType(property, Array, OPTIONAL)
    if (Array.isArray(this[property])) {
      this[property].forEach((arg, index) => this.assertType(`${property}[${index}]`, type))
    }
  }
}
