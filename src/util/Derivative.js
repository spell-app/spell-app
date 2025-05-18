import { hasOwnProp } from "./class"

/**
 * Wrapper to add `@derived`-like functionality to class instances.
 * - Call as one of:
 *   - `class MyClass extends Derivative() {...}`
 *   - `class MyClass extends Derivative(OtherClass) {...}`
 *
 * - To make static getters memoizable, use:
 *
 * ```
 * static get myProp() {
 *   initDerived(this)
 *   return derived(this, "myProp" ()=> {...})
 * }
 * ```
 */
export function Derivative(BaseClass) {
  if (BaseClass) {
    return class Derivative extends BaseClass {
      /**
       * Return memoized `property` for this object by calling `getter()`.
       * returning the exact same value each time.
       * - To reset the value:
       *   - Call `this.clearDerived()` to reset all derived properties.
       *   - Call `this.clearDerived(property)` to reset just that property.
       */
      memoized(property, getter, dependencies) {
        return getMemoized(this, property, getter, dependencies)
      }
      /**
       * Return derived `property` for this object by calling `getter()`.
       * - By default, the same value will be returned each time.
       * - To reset the value:
       *   - Call `this.clearDerived()` to reset all derived properties.
       *   - Call `this.clearDerived(property)` to reset just that property.
       *   - Pass a `dependencies` array -- the value will change
       *     whenever any of the dependencies change.
       */
      derived(property, getter, dependencies) {
        return getDerived(this, property, getter, dependencies)
      }
      /**
       * Clear derived properties, recalculating them next time they are accessed.
       * - Call with no arguments to reset ALL derived properties.
       * - Pass a specific `property` to clear just that property.
       */
      clearDerived(property) {
        clearDerived(this, property)
      }
    }
  }
  return class Derivative {
    /**
     * Return memoized `property` for this object by calling `getter()`.
     * returning the exact same value each time.
     * - To reset the value:
     *   - Call `this.clearDerived()` to reset all derived properties.
     *   - Call `this.clearDerived(property)` to reset just that property.
     */
    memoized(property, getter, dependencies) {
      return getMemoized(this, property, getter, dependencies)
    }
    /**
     * Return derived `property` for this object by calling `getter()`.
     * - By default, the same value will be returned each time.
     * - To reset the value:
     *   - Call `this.clearDerived()` to reset all derived properties.
     *   - Call `this.clearDerived(property)` to reset just that property.
     *   - Pass a `dependencies` array -- the value will change
     *     whenever any of the dependencies change.
     */
    derived(property, getter, dependencies) {
      return getDerived(this, property, getter, dependencies)
    }
    /**
     * Clear derived properties, recalculating them next time they are accessed.
     * - Call with no arguments to reset ALL derived properties.
     * - Pass a specific `property` to clear just that property.
     */
    clearDerived(property) {
      clearDerived(this, property)
    }
  }
}

/**
 * Set `target` object up for use with derived properties.
 * - NOTE: you can safely call this repeatedly with the same `target`.
 */
export function initDerived(target) {
  if (!hasOwnProp(target, "__derived__")) {
    // TODO: add to FinalizationRegistry to clearDerived() when deallocated?
    Object.defineProperty(target, "__derived__", { value: {}, writable: true })
  }
  return target.__derived__
}

/**
 * Clear derived property/ies of `target` object,
 * causing derived values to be recalculated next time they're called for.
 *
 * - Pass string `property` to clear a single property.
 * - Call with no arguments to clear all derived properties.
 */
export function clearDerived(target, property) {
  if (!hasOwnProp(target, "__derived__")) return
  if (property) delete target.__derived__[property]
  else target.__derived__ = {}
}

/**
 * Memoize value of `property` for `target` obtained by calling `getter()`,
 * returning exactly the same value across calls.
 * - To recalculate the value, call `clearDerived()`.
 */
export function getMemoized(target, property, getter) {
  const derived = initDerived(target)
  if (!derived[property]) {
    derived[property] = getter()
  }
  return derived[property]
}
/**
 * Get derived value of `property` for `target` obtained by calling `getter()`,
 * remembering value across calls.  We will recalculate value automatically
 * when `dependencies` change across calls.
 */
export function getDerived(target, property, getter, dependencies) {
  if (!dependencies) return getMemoized(target, property, getter)
  const derived = initDerived(target)
  const lastValue = derived[property]
  // convert Object dependencies to WeakRefs to avoid circular references
  dependencies = dependencies.map(convertObjectToWeakRef)
  const recalculate = !lastValue || !dependenciesMatch(dependencies, lastValue.dependencies)
  if (recalculate) {
    derived[property] = {
      value: getter(),
      dependencies
    }
  }
  return derived[property].value
}

export function convertObjectToWeakRef(thing) {
  if (thing instanceof Object) return new WeakRef(thing)
  return thing
}
export function convertObjectFromWeakRef(thing) {
  if (thing instanceof WeakRef) return thing.deref()
  return thing
}

export function dependenciesMatch(list1, list2) {
  // Quick exit if either is not an array or lengths don't match.
  if (
    !Array.isArray(list1) || //
    !Array.isArray(list2) ||
    list1.length !== list2.length
  ) {
    return false
  }
  for (const i = 0; i < list1.length; i++) {
    const item1 = convertObjectFromWeakRef(list1[i])
    const item2 = convertObjectFromWeakRef(list2[i])
    return item1 === item2
  }
}
