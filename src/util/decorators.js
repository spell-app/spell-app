/**
 * Legacy decorators.
 * We were attempting to use ESNext Stage 2 decorators, but:
 *  - they're not realiable
 *  - they're not compatible with mobx
 * See: https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy
 */

/** Safe "hasOwnProperty" you can apply to a random `thing`. */
function hasOwnProp(thing, key) {
  return Object.prototype.hasOwnProperty.call(thing, key)
}

/**
 * Define field or method on the prototype rather than during object construction.
 * Use with caution with objects or arrays, as the values will be shared with all instances!
 */
export function proto(target, key, descriptor) {
  const { initializer, ...otherProps } = descriptor
  if (initializer) {
    return {
      ...otherProps,
      value: initializer()
    }
  }
  console.warn(`@proto called w/o initializer`, { target, key, descriptor })
  return descriptor
}

/** Define field or method as read-only. */
export function readonly(target, key, descriptor) {
  return {
    ...descriptor,
    writable: false
  }
}

/** Define field or method non-enumerably. */
export function nonEnumerable(target, key, descriptor) {
  return {
    ...descriptor,
    enumerable: false
  }
}

/**
 * Provide a getter for some value, but allow user to provide an explicit value
 * for an instance which overrides it.  Note: you MUST NOT provide a setter.
 *
 * NOTE: `delete thing.foo` WILL NOT WORK after a set -- instance will keep the new value.
 *       `thing.foo = undefined` WILL WORK to clear the value though.
 *
 * Example:
 *    class Thing {
 *      @overrideable get prop() { return "original value" }
 *    }
 *    const it = new Thing()
 *    it.prop                 <<<< "original value"
 *    it.prop = "new value"   <<<< logs "set was called with new value"
 *    it.prop                 <<<< "new value"
 *    delete it.prop
 *    it.prop                 <<<< "orignal value"
 */
export function overrideable(target, key, descriptor) {
  const { get, set, ...descriptorProps } = descriptor
  if (!get || set) throw new TypeError("@overrideable: Only know how to apply to getter without setter.")
  return {
    ...descriptorProps,
    get,
    set(value) {
      Object.defineProperty(this, key, { ...descriptorProps, writable: true, value })
    }
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
export function memoize(target, key, descriptor) {
  const { get, set, ...descriptorProps } = descriptor
  if (!get) throw new TypeError("@memoize: Only know how to apply to getter/setter")

  const newSet =
    set &&
    function(value) {
      if (hasOwnProp(this, key)) delete this[key]
      set.apply(this, [value])
    }

  descriptorProps.configurable = true
  descriptor = {
    ...descriptorProps,
    get() {
      const value = get.apply(this)
      Object.defineProperty(this, key, {
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
  return descriptor
}

/**
 * Memoize getter return value as long as value of `this[property]` doesn't change.
 * TODO: make this work for functins?
 * TODO: allow setters? they should work in theory...
 */
export function memoizeForProp(property) {
  const propCache = new WeakMap()
  const valueCache = new WeakMap()
  return function(target, key, descriptor) {
    const { get, set } = descriptor
    if (!get || set) throw new TypeError("@memoizeForProp: Only know how to apply to getter without setter.")
    return {
      ...descriptor,
      get() {
        const currentProp = this[property]
        if (!propCache.has(this) || propCache.get(this) !== currentProp) {
          propCache.set(this, currentProp)
          valueCache.set(this, get.apply(this))
        }
        return valueCache.get(this)
      }
    }
  }
}
