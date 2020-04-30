/**
 * Legacy decorators.
 * We were attempting to use ESNext Stage 2 decorators, but:
 *  - they're not realiable
 *  - they're not compatible with mobx
 * See: https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy
 */

/** Safe "hasOwnProperty" you can apply to a random `thing`. */
function hasOwnProp(thing, property) {
  return Object.prototype.hasOwnProperty.call(thing, property)
}

/** Given an array of types as:
 *  - null
 *  - undefined
 *  - string, e.g. "string", "boolean"
 *  - function / class (e.g. Date, CustomClass, Object)
 * return an optimized array of matchers
 * one of which will return `true` if the `thing` passed matches that type.
 *
 * NOTE: "number" will match valid numbers but not `NaN` ???
 */
function isOfType(...types) {
  const matchers = types.map(type => {
    if (type === null) return thing => thing === null
    if (type === undefined) return thing => thing === undefined
    if (type === "number" || type === Number) return thing => typeof thing === "number" && !isNaN(thing)
    if (typeof type === "string") {
      // eslint-disable-next-line valid-typeof
      return thing => typeof thing === type
    }
    if (type instanceof Function) return thing => !!thing && (thing instanceof type || thing.constructor === type)
    throw new TypeError(`isOfTypes() don't know how to check for ${type}`)
  })
  return thing => matchers.some(matcher => matcher(thing))
}
global.isOfType = isOfType

/** Throw if we're attempting to set value as other than type. */
export function asType(...types) {
  return function(target, property, descriptor) {
    const { get, set, initializer, value: descriptorValue, enumerable, configurable } = descriptor
    if (get || set) throw new TypeError("@type doesn't work with getters or setters or...")

    const matchesType = isOfType(...types)
    console.warn("MATCHERS>>>>>", matchesType)
    return {
      // return `undefined` until we're set explicitly
      // TODO: initializer() to get default value?
      get() {
        if (initializer) {
          const value = initializer()
          Object.defineProperty(this, property, { value })
          return value
        }
        return descriptorValue
      },
      set(value) {
        console.info("asType", value, types)
        if (!matchesType(value)) {
          console.warn("attempting to set", this, "to invalid type", value, "\ntypes:", types)
          // TODO: smarter error for god's sake!!!!
          throw new TypeError(`invalid type for ${property}`)
        }
        Object.defineProperty(this, property, { value, enumerable, configurable })
      },
      enumerable,
      configurable
    }
  }
}

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
