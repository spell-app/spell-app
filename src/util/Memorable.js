import { hasOwnProp } from "./class"

/**
 * Wrapper to add `@memoize`-like functionality to class instances.
 * - Call as one of:
 *   - `class MyClass extends Memorable() {...}`
 *   - `class MyClass extends Memorable(OtherClass) {...}`
 *
 * - To make static getters memoizable, use:
 *
 * ```
 * static get myProp() {
 *   initMemo(this)
 *   return memo(this, "myProp", ()=> {...})
 * }
 * ```
 */
export function Memorable(BaseClass) {
  if (BaseClass) {
    return class Memorable extends BaseClass {
      constructor(...args) {
        super(...args)
        initMemo(this)
      }
      memoized(property, getter) {
        return memo(this, property, getter)
      }
      clearMemoized(property) {
        clearMemoized(this, property)
      }
    }
  }
  return class Memorable {
    constructor() {
      initMemo(this)
    }
    memoized(property, getter) {
      return memo(this, property, getter)
    }
    clearMemoized(property) {
      clearMemoized(this, property)
    }
  }
}

/** Set `target` object up for use with memoization. */
export function initMemo(target) {
  if (!hasOwnProp(target, "__memo__")) {
    Object.defineProperty(target, "__memo__", { value: {}, enumerable: false })
  }
}
/**
 * Return memoized `property` of `targer`,
 * calling `getter` to get the value if not defined.
 */
export function memo(target, property, getter) {
  if (!(property in target.__memo__)) target.__memo__[property] = getter()
  return target.__memo__[property]
}

/**
 * Clear memoized property/ies of `target` object,
 * causing memoized values to be recalculated next time they're called for.
 *
 * - Pass string `property` to clear a single property.
 * - Call with no arguments to clear all memoized properties.
 */
export function clearMemoized(target, property) {
  if (!("__memo__" in target)) return
  if (property) delete target.__memo__[property]
  else target.__memo__ = {}
}
