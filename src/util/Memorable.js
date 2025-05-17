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
      dervived({ property, getter, dependsOn }) {
        return derived(this, property, getter, dependsOn)
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
    derived({ property, getter, dependsOn }) {
      return derived(this, property, getter, dependsOn)
    }
    clearMemoized(property) {
      clearMemoized(this, property)
    }
  }
}

/** Set `target` object up for use with memoization. */
export function initMemo(target) {
  if (!hasOwnProp(target, "__memo__")) {
    Object.defineProperty(target, "__memo__", { value: {}, writable: true })
  }
}
/**
 * Return memoized `property` of `targer`,
 * calling `getter` to get the value if not defined.
 */
export function memo(target, property, getter) {
  if (!hasOwnProp(target.__memo__, property)) target.__memo__[property] = getter()
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
  if (!hasOwnProp(target, "__memo__")) return
  if (property) {
    delete target.__memo__[property]
    delete target.__memo__[`${property}=>dependsOn`]
  } else target.__memo__ = {}
}

/**
 * Get derived value of `property` for `target` by calling `getter()`,
 * remembering value across calls.
 * - If you pass `dependsOn` array, `property` will automatically be recalculated
 *   when the `dependsOn` values change since last call.
 */
export function derived(target, property, getter, dependsOn) {
  const dependsProp = `${property}=>dependsOn`
  const memo = target.__memo__
  const recalculate =
    !hasOwnProp(memo, property) || //
    (dependsOn && memo[dependsProp]?.some((value, index) => value !== dependsOn[index]))
  if (recalculate) {
    memo[property] = getter()
    if (dependsOn) memo[dependsProp] = dependsOn
  }
  return memo[property]
}
