/* eslint-disable import/prefer-default-export */

//
//  # Class utilities
//

export function hasOwnProp(thing, key) {
  return thing != null && Object.hasOwn(thing, key)
}

/**
 * Return the class hierarchy for some instance, with the most-specific class first.
 * Stops when we hit `stopAt` constructor (inclusive).
 * Returns `undefined` if `thing` doesn't have a constructor.
 */
export function getSuperHierarchy(thing, stopAt = Object) {
  if (typeof thing?.constructor !== "function") return undefined
  const supers = []
  let proto = thing
  while ((proto = Object.getPrototypeOf(proto))) {
    if (typeof proto.constructor === "function") supers.push(proto.constructor)
    if (proto.constructor === stopAt) break
  }
  return supers
}
