/* eslint-disable no-use-before-define */
//
//  # ESNext Stage 2 decorators
//
//  UGH:  The decorator proposal has changed AGAIN
//        and this is all non-viable with the new scheme.
//
//  This is working according to babel-proposal-decorators `^7.0.0` as of 3/18/218
//  For explanation of how that works, see:
//    https://github.com/tc39/proposal-decorators/blob/master/previous/METAPROGRAMMING.md
//

import assert from "assert"

// ES5 "standard" descriptor properties.
const ES5_DESCRIPTOR_PROPS = {
  value: 1,
  get: 1,
  set: 1,
  enumerable: 1,
  writable: 1,
  configurable: 1
}

// Return a key we'll use to for a private value, e.g. when we memoize something.
// Note that we want this to be consistent so we can use it
// for both `memoize()` and `clearMemoized()` below.
//
// Currenly using "#property" for the key -- consider using a Symbol?
function getPrivateKey(key) {
  return `#${key}`
}

//
//  # Problems with Babel 7.1
//
//  The spec[1] says that "normal" property descriptor keys:
//       `value`, `get, `set`, `enumerable, `writable`, `configurable`
//  should be merged with the "new" properties:
//      `key`, `kind`, `placement`, `initialize`
//  so according to spec, you might have a descriptor
//      `{ key: "someProp", value: "foo" }`
//  or  `{ key: "someProp", get() { return "foo" } }`
//
//  In babel, the "normal descriptor" is a separate property, so you'd have:
//      `{ key: "someProp", descriptor: { value: "foo" } }`
//  or  `{ key: "someProp", descriptor: { get() { return "foo" } } }`
//
// Use `getDescriptorProp`, `setDescriptorProp` and `clearDescriptorProp` to work around this.
//
// [1] https://github.com/tc39/proposal-decorators/blob/master/METAPROGRAMMING.md

// Return a descriptor property,
// whether the descriptor is set up according to spec or in Babel's different format.
// See "Problems with Babel" above.
export function getDescriptorProp(descriptor, key) {
  return descriptor.descriptor?.[key] || descriptor[key]
}

// Clone the `descriptor` and set some prop,
// whether the descriptor is set up according to spec or in Babel's different format.
// See "Problems with Babel" above.
export function setDescriptorProp(descriptor, key, value) {
  // Babel-style, or new descriptor prop which is always set directly.
  const doubleDescriptor = ES5_DESCRIPTOR_PROPS[key] && descriptor.descriptor
  if (doubleDescriptor) {
    return {
      ...descriptor,
      descriptor: {
        ...descriptor.descriptor,
        [key]: value
      }
    }
  }
  // Spec-style where all keys are on one object.
  return {
    ...descriptor,
    [key]: value
  }
}

// Clone the `descriptor` and clear some prop,
// whether the descriptor is set up according to spec or in Babel's different format.
// See "Problems with Babel" above.
export function clearDescriptorProp(descriptor, key) {
  const clone = { ...descriptor }
  // Babel-style, or new descriptor prop which is always set directly.
  const doubleDescriptor = ES5_DESCRIPTOR_PROPS[key] && descriptor.descriptor
  if (doubleDescriptor) {
    clone.descriptor = { ...clone.descriptor }
    delete clone.descriptor[key]
  } else {
    delete clone[key]
  }
  return clone
}

// Define field or method on the prototype rather than during object construction.
// Use with caution with objects or arrays, as the values will be shared with all instances!
export function proto(descriptor) {
  assert(descriptor.kind === "field" || descriptor.kind === "method")
  return {
    ...descriptor,
    placement: "prototype"
  }
}

// Define field or method as read-only.
export function readonly(descriptor) {
  assert(descriptor.kind === "field" || descriptor.kind === "method")
  return {
    ...descriptor,
    writeable: false
  }
}

// Define field or method non-enumerably.
export function nonEnumerable(descriptor) {
  // console.info("nonEnumerable", descriptor);
  assert(descriptor.kind === "field" || descriptor.kind === "method")
  return setDescriptorProp(descriptor, "enumerable", false)
}

// Allow user to provide an explicit value for some property;
// if they have not, use the provided function as a getter.
export function overrideableGetter(descriptor) {
  assert(descriptor.kind === "method")
  const getter = getDescriptorProp(descriptor, "get")
  assert(getter)
  const key = getPrivateKey(descriptor.key)
  descriptor = setDescriptorProp(descriptor, "get", function() {
    if (Object.prototype.hasOwnProperty.call(this, key)) return this[key]
    return getter.apply(this)
  })
  descriptor = setDescriptorProp(descriptor, "set", function(value) {
    // console.warn("setting ", key, "to", value)
    this[key] = value
  })
  return descriptor
}

// Memoize a calculated value.
// Works for a getter wihtout a setter or for a method.
// You can clear the value with `@clearMemoized(propName)`
// TODO: allow setter, which clears the memoized value?  Where would the setter place the value?
// TODO: allow use with method, using a WeakMap to save results according to specific args?
export function memoize(descriptor) {
  // console.info("memoize", descriptor);
  // Currently only works for getters without setters.
  const getter = getDescriptorProp(descriptor, "get")
  const setter = getDescriptorProp(descriptor, "set")
  if (getter) return _memoizeGetter(descriptor, getter, setter)

  const method = getDescriptorProp(descriptor, "value")
  if (typeof method === "function") return _memoizeMethod(descriptor, method)

  throw new TypeError("Don't know how to memoize something without a getter or method")
}

// Memoize a getter with an optional setter.
function _memoizeGetter(descriptor, getter, setter) {
  const privateKey = getPrivateKey(descriptor.key)
  function wrappedGetter() {
    if (!Object.prototype.hasOwnProperty.call(this, privateKey)) {
      // Add the property non-enumerably, but configurably
      //  so we can clear it with `@clearMemoized(key)`.
      Object.defineProperty(this, privateKey, {
        configurable: true,
        value: getter.apply(this)
      })
    }
    return this[privateKey]
  }
  descriptor = setDescriptorProp(descriptor, "get", wrappedGetter)

  if (setter) {
    descriptor = setDescriptorProp(descriptor, "set", wrappedSetter)
  }
  return descriptor

  function wrappedSetter(...args) {
    delete this[privateKey]
    return setter.apply(this, args)
  }
}

// Memoize a method.
function _memoizeMethod(descriptor, method) {
  const privateKey = getPrivateKey(descriptor.key)
  function wrappedMethod(...args) {
    if (!Object.prototype.hasOwnProperty.call(this, privateKey)) {
      // Add the property non-enumerably, but configurably
      //  so we can clear it with `@clearMemoized(key)`.
      Object.defineProperty(this, privateKey, {
        configurable: true,
        value: method.apply(this, args)
      })
    }
    return this[privateKey]
  }
  return setDescriptorProp(descriptor, "value", wrappedMethod)
}

// Clear memoized values for some `property` when invoking a normal function.
// TODO: take a list of properties???
export function clearMemoized(property) {
  return function(descriptor) {
    // console.info("clearMemoized", property, descriptor);
    // Currently only works for a normal function
    // TODO: make this work for setters?
    assert(descriptor.kind === "method")
    const method = getDescriptorProp(descriptor, "value")
    assert(typeof method === "function")

    // Use same key pattern as `memoized` above.
    const privateKey = getPrivateKey(property)
    function wrapped(...args) {
      delete this[privateKey]
      return method.apply(this, args)
    }
    return setDescriptorProp(descriptor, "value", wrapped)
  }
}

/** Memoize getter return value as long as `property` doesn't change. */
export function memoizeForProp(property) {
  const propCache = new WeakMap()
  const valueCache = new WeakMap()
  return function(descriptor) {
    const getter = getDescriptorProp(descriptor, "get")
    assert(getter)
    function wrapped() {
      const currentProp = this[property]
      if (!propCache.has(this) || propCache.get(this) !== currentProp) {
        propCache.set(this, currentProp)
        valueCache.set(this, getter.apply(this))
      }
      return valueCache.get(this)
    }
    return setDescriptorProp(descriptor, "get", wrapped)
  }
}

/** Memoize getter return value as long as value of `properties` don't change. */
export function memoizeForProps(...properties) {
  const propCache = new WeakMap()
  const valueCache = new WeakMap()
  return function(descriptor) {
    const getter = getDescriptorProp(descriptor, "get")
    assert(getter)
    function wrapped() {
      const cachedProp = propCache.get(this)
      const currentProp = properties.map(prop => this[prop])
      if (!cachedProp || !cachedProp.all((value, index) => value === currentProp[index])) {
        propCache.set(this, currentProp)
        valueCache.set(this, getter.apply(this))
      }
      return valueCache.get(this)
    }
    return setDescriptorProp(descriptor, "get", wrapped)
  }
}
