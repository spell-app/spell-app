////////////////
// ## Class utilities
////////////////

/**
 * Return true if `thing` has own property `prop`.
 * - Use this if `thing` may be `null` or `undefined`.
 */
export function hasOwnProp(thing: any, prop: string) {
  return thing != null && Object.hasOwn(thing, prop)
}

/**
 * Return class hierarchy for some instance, most-specific class first.
 * - Stops when we hit `stopAt` constructor (inclusive).
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

/**
 * Walk `thing`'s prototype chain looking for an own property descriptor for `property`.
 * - Pass `type` as `"get"` or `"set"` to require specifically a getter or setter.
 * - Returns descriptor if found, `false` otherwise.
 * - NOTE: walks via `__proto__` rather than `Object.getPrototypeOf`.
 */
export function hasDescriptor(thing: any, property: string, type?: "get" | "set") {
  while (thing) {
    const desc = Object.getOwnPropertyDescriptor(thing, property)
    if (desc) {
      if (!type) return desc
      else if (type === "get" && desc.get) return desc
      else if (type === "set" && desc.set) return desc
    }
    thing = thing.__proto__
  }
  return false
}
