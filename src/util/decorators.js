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
 * Return a key we'll use to for a private value, e.g. when we memoize something.
 * Note that we want this to be consistent so we can use it
 * for both `memoize()` and `clearMemoized()` below.
 *
 *  Currenly using "#key" for the key -- consider using a Symbol?
 */
function getPrivateKey(key) {
  return `#${key}`
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
 * Allow user to provide an explicit value for some key;
 * if they have not, return the value from the provided getter.
 */
export function overrideableGetter(target, key, descriptor) {
  const privateKey = getPrivateKey(key)
  const { get, set } = descriptor
  if (typeof get !== "function") throw new TypeError("@overrideableGetter: Only know how to apply to getter/setter.")
  return {
    ...descriptor,
    get() {
      if (hasOwnProp(this, privateKey)) return this[privateKey]
      return get.apply(this)
    },
    set(value) {
      this[privateKey] = value
      if (set) set.apply(this, value)
    }
  }
}

/**
 * Memoize value calculated by a getter the first time it's called.
 * You can clear the value when calling another method with `@clearMemoized(propName)`
 */
export function memoize(target, key, descriptor) {
  const getter = descriptor.get
  if (!getter) throw new TypeError("@memoize: Only know how to apply to getter/setter")

  const privateKey = getPrivateKey(key)
  descriptor = {
    ...descriptor,
    get() {
      if (!hasOwnProp(this, privateKey)) {
        // Add the property non-enumerably, but configurably
        //  so we can clear it with `@clearMemoized(key)`.
        Object.defineProperty(this, privateKey, {
          configurable: true,
          value: getter.apply(this)
        })
      }
      return this[privateKey]
    }
  }

  // Hook up setter to clear the private value.
  const setter = descriptor.set
  if (setter) {
    descriptor = {
      ...descriptor,
      set(...args) {
        delete this[privateKey]
        return setter.apply(this, args)
      }
    }
  }
  return descriptor
}

/**
 * Clear previously memoized values for one or more `properties`
 * when invoking a normal function.
 */
export function clearMemoized(...properties) {
  const privateKeys = properties.map(property => getPrivateKey(property))

  return function(target, key, descriptor) {
    const { value: method, set } = descriptor
    if (typeof method === "function") {
      return {
        ...descriptor,
        value(...args) {
          const thing = this
          privateKeys.forEach(privateKey => delete thing[privateKey])
          return method.apply(this, args)
        }
      }
    }
    if (typeof set === "function") {
      return {
        ...descriptor,
        set(...args) {
          const thing = this
          privateKeys.forEach(privateKey => delete thing[privateKey])
          return set.apply(this, args)
        }
      }
    }
    throw new TypeError(`@clearMemoized: Only know how to apply to getter or method`)
  }
}

/** Memoize getter return value as long as value of `properties` don't change. */
export function memoizeForProp(...properties) {
  const propCache = new WeakMap()
  const valueCache = new WeakMap()
  function valuesDiffer(cachedProps, currentProps) {
    return cachedProps.any((value, index) => value !== currentProps[index])
  }
  return function(target, key, descriptor) {
    const { get } = descriptor
    if (typeof get !== "function") throw new TypeError("@memoizeForProp: Only know how to apply to getter.")
    return {
      ...descriptor,
      get() {
        const cachedProps = propCache.get(this)
        const currentProps = properties.map(property => this[property])
        if (!cachedProps || valuesDiffer(currentProps)) {
          propCache.set(this, currentProps)
          const value = get.apply(this)
          valueCache.set(this, value)
        }
        return valueCache.get(this)
      }
    }
  }
}
