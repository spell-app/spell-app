/**
 * Assertion primitives
 * TODO: some way to control output
 */

import isArrayLikeObject from "lodash/isArrayLikeObject"
import { spellCore } from "."

/** Assert that some `condition` is truthy:
 *  - if truthy, return `true`
 *  - if not truthy, calls `assert.failed(...message)` and returns `false`. */
export default function assert(condition, ...message) {
  if (spellCore.isTruthy(condition)) return true
  assert.failed(message)
  return false
}

/** Method Called when an assertion fails.
 * Default is to log a warning to the console, overide method if you want. */
assert.failed = function(...message) {
  console.warn(...message)
}

/** Assert that `thing` is "equal to" `otherThing` according to `spellCore.equals()`. */
assert.equals = function(thing, otherThing, ...message) {
  const condition = spellCore.equals(thing, otherThing)
  return assert(condition, ...message)
}

/** Assert that `thing` is not `null`, `undefined` or `NaN`.
 *  - Pass `method` name to make it easier to track errors, along with optional `message` bits. */
assert.isDefined = function(thing, method = "", ...message) {
  if (message.length === 0) message.push("expected defined thing, got: ", thing)
  return assert(thing !== null && thing !== undefined && !Number.isNaN(thing), method, ...message)
}

/** Assert that `thing` is "array-like" according to `lodash.isArrayLikeObject()`.
 *  Pass `method` name to make it easier to track errors, along with optional `message` bits. */
assert.isArrayLike = function(thing, method = "", ...message) {
  if (message.length === 0) message.push("expected an array-like thing, got: ", thing)
  return assert(isArrayLikeObject(thing), method, ...message)
}
