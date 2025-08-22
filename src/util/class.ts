/* eslint-disable import/prefer-default-export */

//
//  # Class utilities
//

/**
 * Return true if `thing` has own property `prop`.
 * - Use this if `thing` may be `null` or `undefined`.
 */
export function hasOwnProp(thing: any, prop: string) {
  return thing != null && Object.hasOwn(thing, prop)
}

/**
 * Return the class hierarchy for some instance, with the most-specific class first.
 * Stops when we hit `stopAt` constructor (inclusive).
 * - Returns `undefined` if `thing` doesn't have a constructor.
 */
export function getSuperHierarchy(thing: any, stopAt: any = Object) {
  if (typeof thing?.constructor !== "function") return undefined
  const supers = []
  let proto = thing
  while ((proto = Object.getPrototypeOf(proto))) {
    if (typeof proto.constructor === "function") supers.push(proto.constructor)
    if (proto.constructor === stopAt) break
  }
  return supers
}
