/**
 * Legacy decorators.
 * We were attempting to use ESNext Stage 2 decorators, but:
 *  - they're not realiable
 *  - they're not compatible with mobx
 * See: https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy
 */

import { hasOwnProp } from "./class"

/**
 * Define field or method on the prototype rather than during object construction.
 * Use with caution with objects or arrays, as the values will be shared with all instances!
 */
export function proto(target, property, descriptor) {
  const { initializer, ...otherProps } = descriptor
  if (initializer) {
    return {
      ...otherProps,
      value: initializer()
    }
  }
  console.warn(`@proto called w/o initializer`, { target, property, descriptor })
  return descriptor
}

/** Define field or method non-enumerably. */
export function nonEnumerable(target, property, descriptor) {
  return {
    ...descriptor,
    enumerable: false
  }
}

/**
 * Define field or method as read-only.
 * MUST provide an instance value at class level.
 */
export function readonly(target, property, descriptor) {
  return {
    ...descriptor,
    configurable: false,
    writable: false
  }
}

/**
 * Define a value exactly once and then don't let it change.
 * e.g. a value that you'll set in the constructor that should be fixed from then on.
 * Returns `undefined` until you set it the first time.
 */
export function writeOnce(target, property, descriptor) {
  if (hasOwnProp(descriptor, "value") || descriptor.initializer !== null)
    throw new TypeError("@writeOnce must be called as '@writeOnce propName' with no initial value")
  const { enumerable } = descriptor
  return {
    enumerable,
    configurable: false,
    get() {
      return undefined
    },
    set(value) {
      Object.defineProperty(this, property, {
        enumerable,
        configurable: false,
        writable: false,
        value
      })
    }
  }
}

/**
 * Provide a getter for some value, but allow user to provide an explicit value
 * for an instance which overrides it.  Note: you MUST NOT provide a setter.
 *
 * NOTE: `delete thing.foo` WILL WORK after a set -- instance will go back to the getter.
 *
 * Example:
 *    class Thing {
 *      @overrideable get prop() { return "original value" }
 *    }
 *    const it = new Thing()
 *    it.prop                 <<<< "original value"
 *    it.prop = "new value"   <<<< "new value"
 *    it.prop                 <<<< "new value"
 *    delete it.prop
 *    it.prop                 <<<< "orignal value"
 */
export function overrideable(target, property, descriptor) {
  const { get, set, ...descriptorProps } = descriptor
  if (!get || set) throw new TypeError("@overrideable: Only know how to apply to getter without setter.")
  return {
    ...descriptorProps,
    get,
    set(value) {
      Object.defineProperty(this, property, { ...descriptorProps, writable: true, value })
    }
  }
}

/**
 * Forward `properties` (methods, values, etc) from follwing `property`.
 * This allows you to use them on the target object just like they were defined there.
 */
export function forward(...properties) {
  return function(target, property, descriptor) {
    properties.forEach(prop => {
      Object.defineProperty(target, prop, {
        configurable: false,
        enumerable: false,
        get() {
          const value = this[property][prop]
          // NOTE: This will return a different function each time.
          //       Could memoize them using a Map()
          if (typeof value === "function") return value.bind(this)
          return value
        },
        set(value) {
          this[property][prop] = value
        }
      })
    })
    return descriptor
  }
}

/**
 * Memoize value calculated by a getter the first time it's called.
 * If you `delete` the prop, accessing again will re-calculate the value.
 * If you provide a setter (e.g. to do some side effect),
 * calling that will also clear the memoized value.
 *
 * TODO: consider allowing memoization of function return values
 * TODO: consider switching to lodash-decorators ?
 */
export function memoize(target, property, descriptor) {
  const { get, set, ...descriptorProps } = descriptor
  if (!get) throw new TypeError("@memoize: Only know how to apply to getter/setter")

  const newSet =
    set &&
    function(value) {
      if (hasOwnProp(this, property)) delete this[property]
      set.apply(this, [value])
    }

  descriptorProps.configurable = true
  return {
    ...descriptorProps,
    get() {
      const value = get.apply(this)
      Object.defineProperty(this, property, {
        ...descriptorProps,
        get() {
          return value
        },
        set: newSet
      })
      return value
    },
    set: newSet
  }
}

/**
 * Memoize getter return value as long as value of `this[sourceProp]` doesn't change.
 * TODO: make this work for functins?
 * TODO: allow setters? they should work in theory...
 */
export function memoizeForProp(sourceProp) {
  const propCache = new WeakMap()
  const valueCache = new WeakMap()
  return function(target, property, descriptor) {
    const { get, set } = descriptor
    if (!get || set) throw new TypeError("@memoizeForProp: Only know how to apply to getter without setter.")
    return {
      ...descriptor,
      get() {
        const currentProp = this[sourceProp]
        if (!propCache.has(this) || propCache.get(this) !== currentProp) {
          propCache.set(this, currentProp)
          valueCache.set(this, get.apply(this))
        }
        return valueCache.get(this)
      }
    }
  }
}
