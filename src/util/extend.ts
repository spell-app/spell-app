import { store as createStore, batch } from "@risingstack/react-easy-state"
import _set from "lodash/set"
import _unset from "lodash/unset"

import { hasOwnProp } from "./class"

/** Export all `extend` functionality as a barrel. */
export * as extend from "./extend"

/**
 * Per-object `props`/`state` storage, keyed by object identity rather than a property on
 * `target` itself.
 * - Lets us attach reactive `props`/`state` to any object without mutating its shape directly.
 * - `WeakMap` means entries are garbage-collected along with `target` -- no manual cleanup needed.
 * - NOTE: `derived` data is NOT kept here -- see `derivedFor()`, which stores directly on `target`.
 */
export const EXTEND_MAP = new WeakMap<any, Record<string, any>>()

/** Lazily-created `props`/`state` storage for one object, as tracked in `EXTEND_MAP`. */
export type ExtendedData = {
  /** Reactive public `props` -- raw `map` plus the `react-easy-state` `$store` proxy over it. */
  props?: { map: Record<string, any>; $store: Record<string, any> }
  /** Reactive private `state` -- raw `map` plus the `react-easy-state` `$store` proxy over it. */
  state?: { map: Record<string, any>; $store: Record<string, any> }
}

/** Set up `ExtendedData` for the `target` object. */
export function extendedFor(target: any): ExtendedData {
  if (!EXTEND_MAP.has(target)) EXTEND_MAP.set(target, {})
  return EXTEND_MAP.get(target)!
}

/**
 * Eagerly set up `ExtendedData` for `target`, for whichever of `"derived" | "props" | "state"`
 * are named in `what`.
 * - Needed before assigning props/state on a fresh instance -- e.g. `Observable`'s constructor
 *   calls this before `Object.assign(this, props)`, so the reactive getters/setters already exist.
 */
export function initializeExtended(target: any, ...what: Array<"derived" | "props" | "state">) {
  if (!EXTEND_MAP.has(target)) EXTEND_MAP.set(target, {})
  if (what.includes("derived")) derivedFor(target)
  if (what.includes("props")) propsFor(target)
  if (what.includes("state")) stateFor(target)
}

////////////////
// ## Derived
////////////////

// /** `@derived` decorator. */
// export function derived(target: any, context: DecoratorContext) {
//   if (context.kind !== "getter") {
//     throw new CustomError({
//       message: `@derived decorator must be called with a getter`,
//       context: target,
//       activity: `@dervied ${String(context.name)}`,
//       params: context
//     })
//   }
//   return () => getDerived(target, context.name, context.access.get as () => any)
// }

/**
 * Return raw `derived` map for `target` object.
 * - SIDE EFFECT: defines a non-enumerable `__derived__` property directly on `target` if missing --
 *   unlike `props`/`state`, this is stored on `target` itself rather than in `EXTEND_MAP`.
 */
function derivedFor(target: any) {
  if (!target.__derived__) {
    Object.defineProperty(target, "__derived__", { value: {} })
  }
  return target.__derived__
}

/**
 * Return cached `property` for `target`, calling `getter()` to get initial value.
 * - To reset the value:
 *   - Call `clearDerived(target)` to reset all derived properties.
 *   - Call `clearDerived(target, property)` to reset just that property.
 */
export function getDerived<T>(target: any, property: string, getter: () => T): T {
  const derived = derivedFor(target)
  if (!hasOwnProp(derived, property)) derived[property] = { value: getter.apply(target) }
  return derived[property].value as T
}

/**
 * Return cached `property` for `target`,
 * calling `getter()` to get initial value or whenever `dependencies` change.
 * - To reset the value:
 *   - Call `this.clearDerived()` to reset all derived properties.
 *   - Call `this.clearDerived(property)` to reset just that property.
 */
export function getDerivedFrom<T>(target: any, property: string, getter: () => T, dependencies?: unknown[]): T {
  if (!dependencies) {
    return getDerived(target, property, getter)
  }
  const derived = derivedFor(target)
  let entry = derived[property]
  // convert Object dependencies to WeakRefs to avoid circular references
  dependencies = dependencies.map(objectToWeakRef)
  const recalculate = !entry?.dependencies || !dependenciesMatch(dependencies, entry.dependencies)
  if (recalculate) {
    entry = { value: getter.apply(target), dependencies }
    derived[property] = entry
  }
  return entry.value as T
}

/**
 * Clear specified derived `properties` of target.
 * - If no `properties` are passed, clears all derived properties.
 */
export function clearDerived(target: any, ...properties: string[]) {
  const derived = derivedFor(target)
  if (properties.length === 0) properties = Object.keys(derived)
  properties.forEach((property) => delete derived[property])
}

////////////////
// ## Props
////////////////

/**
 * Return raw `props` map for `target` object.
 * - SIDE EFFECT: on first call, also defines a non-enumerable `$props` property on `target`
 *   pointing at the raw (non-reactive) map, for debugging/inspection.
 */
function propsFor(target: any) {
  const extended = extendedFor(target)
  if (!extended.props) {
    const map = {}
    extended.props = { map, $store: createStore(map) }
    // DEBUG: expose raw map as `$props` for inspection
    Object.defineProperty(target, "$props", { value: map })
  }
  return extended.props
}

/** Return current `props` for `target` as a non-reactive object. */
export function getProps(target: any) {
  return propsFor(target).map
}

/** Return reactive `property`, defaulting to `initializer` if never set. */
export function getProp<T>(target: any, property: string): T | undefined
export function getProp<T>(target: any, property: string, initializer?: () => T): T
export function getProp<T>(target: any, property: string, initializer?: () => T) {
  const props = propsFor(target)
  if (!hasOwnProp(props.map, property) && initializer) {
    props.map[property] = initializer.call(target)
  }
  return props.$store[property]
}

/**
 * Set reactive `property` to `value`.
 * - If `value` is `undefined`, deletes the property instead.
 */
export function setProp<T>(target: any, property: string, value: T) {
  const props = propsFor(target)
  if (value === undefined) delete props.$store[property]
  else props.$store[property] = value
  return value
}
/** Set multiple reactive `props` at once, in a single `batch()` so reactive consumers only re-run once. */
export function setProps(target: any, props: Record<string, any>) {
  batch(() => {
    Object.entries(props).forEach(([prop, value]) => setProp(target, prop, value))
  })
}

////////////////
// ## State
////////////////

// /** `@state` decorator. */
// export function state<T>(target: any, context: DecoratorContext) {
//   if (context.kind !== "getter") {
//     throw new CustomError({
//       message: `@state decorator must be called with a getter`,
//       context: target,
//       activity: `@state ${String(context.name)}`,
//       params: context
//     })
//   }
//   return () => getState(target, context.name, context.access.get as () => T)
// }

/** Return raw `state` map for `target` object. */
function stateFor(target: any) {
  const extended = extendedFor(target)
  if (!extended.state) {
    const map = {}
    extended.state = { map, $store: createStore(map) }
    Object.defineProperty(target, "$state", { value: map })
  }
  return extended.state
}

/** Return reactive `property`, defaulting to `initializer` if never set. */
export function getState<T>(target: any, property: string): T | undefined
export function getState<T>(target: any, property: string, initializer?: () => T): T
export function getState<T>(target: any, property: string, initializer?: () => T) {
  const state = stateFor(target)
  if (!hasOwnProp(state.map, property) && initializer) {
    state.map[property] = initializer.call(target)
  }
  return state.$store[property]
}

/**
 * Set reactive `property` to `value`.
 * - If `value` is `undefined`, deletes the property instead.
 */
export function setState<T>(target: any, property: string, value: T) {
  const { $store } = stateFor(target)
  if (value === undefined) _unset($store, property)
  else _set($store, property, value)
  return value
}

/**
 * Clear reactive state `properties` of target.
 * - By default we clear state entirely.
 * - Pass specific string `properties` path(s) to clear just those.
 * - `properties` can be dotted paths!
 */
export function resetState<T>(target: any, ...properties: string[]) {
  const state = stateFor(target)
  if (properties.length === 0) properties = Object.keys(state.map)
  batch(() => {
    properties.forEach((property) => _unset(state.$store, property))
  })
}

////////////////
// ## Override
////////////////
/**
 * Override getter defined for `property` on `target`, returning explicit `value` instead.
 * - NOTE: can call this repeatedly -- each call replaces the previous override.
 */
export function overrideProp(target: any, property: string, value: any) {
  Object.defineProperty(target, property, {
    get() {
      return value
    },
    set(value) {
      overrideProp(this, property, value)
    },
    configurable: true
  })
}

////////////////
// ## Utilities
////////////////

/**
 * Wrap `thing` in a `WeakRef` if it's an object, otherwise pass it through unchanged.
 * - Used to store `dependencies` arrays (see `getDerivedFrom()`) without holding strong
 *   references, so a dependency doesn't leak or create circular references.
 */
export function objectToWeakRef(thing: any) {
  if (thing instanceof Object) return new WeakRef(thing)
  return thing
}

/**
 * Unwrap a `WeakRef` back to its referent, otherwise pass `thing` through unchanged.
 * - Inverse of `objectToWeakRef()`.
 * - Returns `undefined` if the referent has been garbage-collected.
 */
export function objectFromWeakRef(thing: any) {
  if (thing instanceof WeakRef) return thing.deref()
  return thing
}

/**
 * Return `true` if EVERY corresponding item of `list1` and `list2` is `===` equal, after
 * unwrapping any `WeakRef`s (see `objectFromWeakRef()`).
 * - Returns `false` if either isn't an array, or their lengths differ.
 */
export function dependenciesMatch(list1: any[], list2: any[]) {
  // Quick exit if either is not an array or lengths don't match.
  if (
    !Array.isArray(list1) || //
    !Array.isArray(list2) ||
    list1.length !== list2.length
  ) {
    return false
  }
  for (let i = 0; i < list1.length; i++) {
    const item1 = objectFromWeakRef(list1[i])
    const item2 = objectFromWeakRef(list2[i])
    if (item1 !== item2) return false
  }
  return true
}
