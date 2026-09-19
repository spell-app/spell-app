import { store as createStore, batch } from "@risingstack/react-easy-state"
import _set from "lodash/set"
import _unset from "lodash/unset"

import { hasOwnProp } from "./class"

/** Export all `extend` functionality as a barrel. */
export * as extend from "./extend"

export const EXTEND_MAP = new WeakMap<any, Record<string, any>>()

export type ExtendedData = {
  props?: { map: Record<string, any>; $store: Record<string, any> }
  state?: { map: Record<string, any>; $store: Record<string, any> }
}

/** Set up `ExtendedData` for the `target` object. */
export function extendedFor(target: any): ExtendedData {
  if (!EXTEND_MAP.has(target)) EXTEND_MAP.set(target, {})
  return EXTEND_MAP.get(target)!
}

/** Initialize `ExtendedData` for the `target` object. */
export function initializeExtended(target: any, ...what: Array<"derived" | "props" | "state">) {
  if (!EXTEND_MAP.has(target)) EXTEND_MAP.set(target, {})
  if (what.includes("derived")) derivedFor(target)
  if (what.includes("props")) propsFor(target)
  if (what.includes("state")) stateFor(target)
}

//-----------------
// Derived
//-----------------

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

/** Return raw `derived` map for `target` object. */
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

//-----------------
// Props
//-----------------

/** Return raw `props` map for `target` object. */
function propsFor(target: any) {
  const extended = extendedFor(target)
  if (!extended.props) {
    const map = {}
    extended.props = { map, $store: createStore(map) }
    // DEBUG
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
export function setProps(target: any, props: Record<string, any>) {
  batch(() => {
    Object.entries(props).forEach(([prop, value]) => setProp(target, prop, value))
  })
}

//-----------------
// State
//-----------------

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

//-----------------
// Override
//-----------------
/**
 * Override getter defined for `property` on `target`,
 * returning explicit `value` instead.
 * - Note that you can call this repeatedly.
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

//-----------------
// Utilities
//-----------------

export function objectToWeakRef(thing: any) {
  if (thing instanceof Object) return new WeakRef(thing)
  return thing
}
export function objectFromWeakRef(thing: any) {
  if (thing instanceof WeakRef) return thing.deref()
  return thing
}

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
    return item1 === item2
  }
}
