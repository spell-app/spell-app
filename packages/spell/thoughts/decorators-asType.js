function getMatcher(type) {
  if (type === null) return thing => thing === null
  if (type === undefined || type === "undefined") return thing => thing === undefined
  if (type === "boolean" || type === Boolean) return thing => typeof thing === "boolean"
  if (type === "string" || type === String) return thing => typeof thing === "string"
  if (type === "number" || type === Number) return thing => typeof thing === "number" && !isNaN(thing)
  if (type === "function" || type === Function) return thing => typeof thing === "function"
  if (type === "symbol" || type === Symbol) return thing => typeof thing === "symbol"
  if (type === "bigint" || type === BigInt) return thing => typeof thing === "bigint"
  // try case-insensitive class name
  if (typeof type === "string") return thing => thing?.constructor.name.toLowerCase() === type.toLowerCase()
  // try `instanceof` to match class
  if (type instanceof Function) return thing => !!thing && thing instanceof type
  // FUGGIT.
  throw new TypeError(`getMatcher(${type}): don't know how to match type.`)
}

/** Given an array of types as:
 *  - null
 *  - undefined
 *  - string, e.g. "string", "boolean", "number"
 *  - "Date", "RegExp"
 *  - function / class (e.g. Date, CustomClass, Object)
 * return a method which validates `thing` against an optimized array of matcher functions.
 *
 * NOTE: `"number"` or `Number` will match fail if value is `NaN`.
 */
export function isOfType(...types) {
  if (types.length === 0) throw new TypeError("@isOfType(): must pass at least one type.")
  const matchers = types.map(getMatcher)
  const splainType = types.length === 1 ? ["a", types[0]] : ["one of (", ...types, ")"]
  return thing => {
    const matched = matchers.some(matcher => matcher(thing))
    if (!matched) console.warn("Expected", thing, "to be", ...splainType, ":\ngot", thing)
    return matched
  }
}
global.isOfType = isOfType

/** Throw if we're attempting to set value as other than type. */
export function asType(...types) {
  return function(target, property, descriptor) {
    const { get, set, initializer, value: defaultValue, enumerable, configurable } = descriptor
    if (get || set) throw new TypeError("@type doesn't work with getters or setters or...")

    const matchesType = isOfType(...types)
    return {
      get() {
        if (initializer) {
          const value = initializer()
          Object.defineProperty(this, property, { value, enumerable, configurable })
          return value
        }
        return defaultValue
      },
      // once we set, we'll override the default
      set(value) {
        console.warn("asType", property, types, "\nvalue", types)
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
