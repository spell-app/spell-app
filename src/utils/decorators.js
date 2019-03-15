//
//  # ESNext Stage 2 decorators
//

import assert from "assert";


// ES5 "standard" descriptor properties.
const ES5_DESCRIPTOR_PROPS = {
  value: 1,
  get: 1,
  set: 1,
  enumerable: 1,
  writable: 1,
  configurable: 1
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
// Use `getDescriptorProp` and `wrapDescriptorProp` to work around this.
//
// [1] https://github.com/tc39/proposal-decorators/blob/master/METAPROGRAMMING.md

// Return a descriptor property,
// whether the descriptor is set up according to spec or in Babel's different format.
// See "Problems with Babel" above.
export function getDescriptorProp(descriptor, key) {
  return descriptor.descriptor?.[key] || descriptor[key];
}

// Clone the `descriptor` and set some prop,
// whether the descriptor is set up according to spec or in Babel's different format.
// See "Problems with Babel" above.
export function setDescriptorProp(descriptor, key, value) {
  // Babel-style, or new descriptor prop which is always set directly.
  const doubleDescriptor = ES5_DESCRIPTOR_PROPS[key] && descriptor.descriptor;
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


// Define field or method on the prototype rather than during object construction.
// Use with caution with objects or arrays, as the values will be shared with all instances!
export function proto(descriptor) {
  assert(descriptor.kind === "field" || descriptor.kind === "method");
  return {
    ...descriptor,
    placement: "prototype"
  }
}

// Define field or method non-enumerably.
export function nonEnumerable(descriptor) {
//console.info("nonEnumerable", descriptor);
  assert(descriptor.kind === "field" || descriptor.kind === "method");
  return setDescriptorProp(descriptor, "enumerable", false);
  return {
    ...descriptor,
    placement: "prototype"
  }
}


// Return a key we'll use to memoize a value.
// Note that we want this to be consistent so we can use it
// for both `memoize()` and `clearMemoized()` below.
//
// Currenly using "#property" for the key -- consider using a Symbol?
function getMemoizeKey(key) {
  return `#${key}`
}

// Memoize a calculated value.
// Works for a getter wihtout a setter or for a method.
// You can clear the value with `@clearMemoized(propName)`
// TODO: allow setter, which clears the memoized value?  Where would the setter place the value?
// TODO: allow use with method, using a WeakMap to save results according to specific args?
export function memoize(descriptor) {
//console.info("memoize", descriptor);
  // Currently only works for getters without setters.
  const getter = getDescriptorProp(descriptor, "get");
  const setter = getDescriptorProp(descriptor, "set");
  if (getter) return _memoizeGetter(descriptor, getter, setter);

  const method = getDescriptorProp(descriptor, "value");
  if (typeof method === "function")
    return _memoizeMethod(descriptor, method);

  throw new TypeError("Don't know how to memoize something without a getter or method");
}

// Memoize a getter with an optional setter.
function _memoizeGetter(descriptor, getter, setter) {
  const privateKey = getMemoizeKey(descriptor.key);
  function wrappedGetter() {
    if (!this.hasOwnProperty(privateKey)) {
      // Add the property non-enumerably, but configurably
      //  so we can clear it with `@clearMemoized(key)`.
      Object.defineProperty(this, privateKey, {
        configurable: true,
        value: getter.apply(this)
      });
    }
    return this[privateKey];
  }
  descriptor = setDescriptorProp(descriptor, "get", wrappedGetter);

  if (setter) {
    function wrappedSetter() {
      delete this[privateKey];
      return setter.apply(this, arguments);
    }
    descriptor = setDescriptorProp(descriptor, "set", wrappedSetter);
  }
  return descriptor;
}

// Memoize a method.
function _memoizeMethod(descriptor, method) {
  const privateKey = getMemoizeKey(descriptor.key);
  function wrappedMethod(...args) {
    if (!this.hasOwnProperty(privateKey)) {
      // Add the property non-enumerably, but configurably
      //  so we can clear it with `@clearMemoized(key)`.
      Object.defineProperty(this, privateKey, {
        configurable: true,
        value: method.apply(this, args)
      });
    }
    return this[privateKey];
  }
  return setDescriptorProp(descriptor, "value", wrappedMethod);
}


// Clear memoized values for some `property` when invoking a normal function.
export function clearMemoized(property) {
  return function(descriptor) {
//console.info("clearMemoized", property, descriptor);
    // Currently only works for a normal function
    // TODO: make this work for setters?
    assert(descriptor.kind === "method");
    const method = getDescriptorProp(descriptor, "value");
    assert(typeof method === "function");

    // Use same key pattern as `memoized` above.
    const privateKey = getMemoizeKey(property);
    function wrapped() {
      delete this[privateKey];
      return method.apply(this, arguments);
    }
    return setDescriptorProp(descriptor, "value", wrapped);
  }
}

