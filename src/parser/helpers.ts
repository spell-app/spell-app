/** `Class` type, e.g. `Class<Token>`. */
export interface Class<T> extends Function {
  new (...args: any[]): T
}

/** Die with some error `message` and optional `props`. */
export function die(message: string, params?: any) {
  console.warn(`DIE!  ${message}`, params || "(no params)")
  return new Error(message)
}

/** Reject with `message` if any `props` passed in are `null`/`undefined`. */
export function rejectOnUndefinedProp(props: any, messagePrefix: string) {
  for (const prop in props) {
    if (props[prop] === null || props[prop] === undefined)
      throw die(`${messagePrefix} undefined property ${prop}.`, props)
  }
}

/**
 * Memoization for arbitrary properties on any object.
 * - Pass with a `getter` to calculate the cached value and store it.
 * - Pass without a `getter` to return the value only if it's previously been calculated.
 * - Use `clearMemoized()` to clear memoized values so they'll be calculated again.
 *
 * Example:
 * ```typescript
 * get someExpensiveValue() {
 *   return getMemoized(
 *      this,
 *      "someExpensiveValue",
 *      // type of getter = return type of `expensiveCalculation()`
 *      () => this.expensiveCalculation()
 *   )
 * }
 * ```
 */
export function getMemoized<T>(thing: any, key: string, getter?: () => T) {
  let memoized = MEMOIZED.get(thing)
  if (!memoized) {
    memoized = {}
    MEMOIZED.set(thing, memoized)
  }
  if (!(key in memoized) && getter) {
    memoized[key] = getter()
  }
  return memoized[key] as T | undefined
}
const MEMOIZED = new WeakMap<any, Record<string, any>>()

/**
 * Clear value(s) memozied with `getMemoized(thing, ...)`.
 *
 * - If you pass `keys`, we'll clear just that property.
 * - If you don't pass any `keys`, we'll clear ALL memoized values for `thing`.
 */
export function clearMemoized(thing: any, ...keys: string[]) {
  if (!MEMOIZED.has(thing)) return
  if (!keys.length) MEMOIZED.delete(thing)
  const memoized = { ...MEMOIZED.get(thing) }
  for (const key of keys) {
    delete memoized[key]
  }
  MEMOIZED.set(thing, memoized)
}
