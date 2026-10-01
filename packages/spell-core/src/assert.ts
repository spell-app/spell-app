/**
 * Assertion primitives.
 * TODO: some way to control output
 */

import isArrayLikeObject from "lodash/isArrayLikeObject"
import { spellCore } from "#spell-core"

/** Callable `assert` function, plus extra assertion helpers hung off of it. */
export type Assert = {
  /** Call signature -- see `assertCondition()`. */
  (condition: unknown, ...message: unknown[]): boolean
  /** See `assert.failed()`. */
  failed: (...message: unknown[]) => void
  /** See `assert.equals()`. */
  equals: (thing: unknown, otherThing: unknown, ...message: unknown[]) => boolean
  /** See `assert.isDefined()`. */
  isDefined: (thing: unknown, method?: string, ...message: unknown[]) => boolean
  /** See `assert.isArrayLike()`. */
  isArrayLike: (thing: unknown, method?: string, ...message: unknown[]) => boolean
}

/**
 * Assert that some `condition` is truthy.
 * - If truthy, returns `true`.
 * - If not truthy, calls `assert.failed(message)` -- the whole rest-`message` array as ONE argument,
 *   not spread -- and returns `false`.
 */
function assertCondition(condition: unknown, ...message: unknown[]): boolean {
  if (spellCore.isTruthy(condition)) return true
  assert.failed(message)
  return false
}

export const assert: Assert = Object.assign(assertCondition, {
  /**
   * Method called when an assertion fails -- default logs a warning to console, override if you
   * want different behavior (e.g. throwing, or reporting to a service).
   * - NOTE: `assertCondition()` always calls this with its whole `message` array as ONE argument
   *   (not spread), so `console.warn(...message)` here ends up logging that single array, not each
   *   part separately.
   */
  failed(...message: unknown[]): void {
    console.warn(...message)
  },

  /** Assert that `thing` is "equal to" `otherThing` according to `spellCore.equals()`. */
  equals(thing: unknown, otherThing: unknown, ...message: unknown[]): boolean {
    const condition = spellCore.equals(thing, otherThing)
    return assert(condition, ...message)
  },

  /**
   * Assert that `thing` is not `null`, `undefined` or `NaN`.
   * - Pass `method` name to make it easier to track errors, along with optional `message` bits.
   * - Defaults `message` to `"expected defined thing, got: ", thing` when none given.
   */
  isDefined(thing: unknown, method = "", ...message: unknown[]): boolean {
    if (message.length === 0) message.push("expected defined thing, got: ", thing)
    return assert(thing !== null && thing !== undefined && !Number.isNaN(thing as number), method, ...message)
  },

  /**
   * Assert that `thing` is "array-like" according to `lodash.isArrayLikeObject()`.
   * - Pass `method` name to make it easier to track errors, along with optional `message` bits.
   * - Defaults `message` to `"expected an array-like thing, got: ", thing` when none given.
   */
  isArrayLike(thing: unknown, method = "", ...message: unknown[]): boolean {
    if (message.length === 0) message.push("expected an array-like thing, got: ", thing)
    return assert(isArrayLikeObject(thing), method, ...message)
  }
})
