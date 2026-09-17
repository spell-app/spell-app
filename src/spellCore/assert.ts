/**
 * Assertion primitives
 * TODO: some way to control output
 */

import isArrayLikeObject from "lodash/isArrayLikeObject"
import { spellCore } from "."

/** Callable `assert` function, plus extra assertion helpers hung off of it. */
export type Assert = {
  (condition: unknown, ...message: unknown[]): boolean
  failed: (...message: unknown[]) => void
  equals: (thing: unknown, otherThing: unknown, ...message: unknown[]) => boolean
  isDefined: (thing: unknown, method?: string, ...message: unknown[]) => boolean
  isArrayLike: (thing: unknown, method?: string, ...message: unknown[]) => boolean
}

/** Assert that some `condition` is truthy:
 *  - if truthy, return `true`
 *  - if not truthy, calls `assert.failed(...message)` and returns `false`. */
function assertFn(condition: unknown, ...message: unknown[]): boolean {
  if (spellCore.isTruthy(condition)) return true
  assert.failed(message)
  return false
}

export const assert: Assert = Object.assign(assertFn, {
  /** Method Called when an assertion fails.
   * Default is to log a warning to the console, overide method if you want. */
  failed(...message: unknown[]): void {
    console.warn(...message)
  },

  /** Assert that `thing` is "equal to" `otherThing` according to `spellCore.equals()`. */
  equals(thing: unknown, otherThing: unknown, ...message: unknown[]): boolean {
    const condition = spellCore.equals(thing, otherThing)
    return assert(condition, ...message)
  },

  /** Assert that `thing` is not `null`, `undefined` or `NaN`.
   *  - Pass `method` name to make it easier to track errors, along with optional `message` bits. */
  isDefined(thing: unknown, method = "", ...message: unknown[]): boolean {
    if (message.length === 0) message.push("expected defined thing, got: ", thing)
    return assert(thing !== null && thing !== undefined && !Number.isNaN(thing as number), method, ...message)
  },

  /** Assert that `thing` is "array-like" according to `lodash.isArrayLikeObject()`.
   *  Pass `method` name to make it easier to track errors, along with optional `message` bits. */
  isArrayLike(thing: unknown, method = "", ...message: unknown[]): boolean {
    if (message.length === 0) message.push("expected an array-like thing, got: ", thing)
    return assert(isArrayLikeObject(thing), method, ...message)
  }
})
