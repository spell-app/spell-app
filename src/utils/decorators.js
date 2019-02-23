//
//  # ESNext Stage 2 decorators
//

import assert from "assert";


// Wrap a getter with the specified function.
// We break this out because babel 7.0 seems to be non-standard:
//  spec says `get` should be `descriptor.get`
//  babel says `get` is found at `descriptor.descriptor.get`
// `makeGetter(key, oldGetter)` should return the new getter.
function wrapGetter(descriptor, makeGetter) {
  // Spec style
  if (descriptor.get) {
    return {
      ...descriptor,
      get: makeGetter(descriptor.key, descriptor.get)
    }
  }
  if (descriptor.descriptor.get) {
    return {
      ...descriptor,
      descriptor: {
        ...descriptor.descriptor,
        get: makeGetter(descriptor.key, descriptor.descriptor.get)
      }
    }
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


// Memoize a calculated value.
// NOTE: Only applies to getters without setters.
export function memoize(descriptor) {
  return wrapGetter(descriptor, function (key, getter) {
    const privateKey = `#${descriptor.key}`;
    return function() {
      if (!this[privateKey]) this[privateKey] = getter.apply(this);
      return this[privateKey];
    }
  });
}
