import { hasOwnProp } from "$/util/class"

import { isTrackingCells } from "./cells"
import { Cell } from "./Cell"
import { Derived } from "./Derived"
import { HAS_SCHEMA, schemaOf, type PropInfo } from "./Schema"

/** Export all `extend` functionality as a barrel. */
export * as extend from "./extend"

/**
 * Reactive `props` and `state` for any object, on spell cells (`cells.ts`).
 * - Each object keeps its values in its own RECORDS, `Map`s -- the ONLY truth, read and written synchronously:  a
 *   read right after a write sees it.  Cells only say who read what, and tell them when it changes.
 * - `props` are its public properties:  `keys()` / `toJSON()` list them, in the order they were first set.  `state`
 *   is transient, internal, e.g. a `Task`'s `status`, and never listed.
 * - Kept ON the object, under symbols -- `Object.keys()`, JSON and the Thing Explorer's plain-field scan don't see
 *   them.  `Observable` makes them as it's constructed (one shape for every instance);  any other object gets them
 *   on first use.
 * - Values are NOT made reactive themselves:  no proxies, so `===` holds everywhere.  A list or plain object a prop
 *   holds is the same object;  changing it IN PLACE notifies nobody -- set the prop to a new one.  Spell's `List`s
 *   copy on write, so a program's lists are fine.
 */

////////////////
// ## Records
////////////////

/** Prop values, by name, in the order they were first set -- see `keysOf()`. */
export const PROPS = Symbol("props")
/** State values, by name. */
export const STATE = Symbol("state")
/** Cells of props someone read, by name -- made on first tracked read. */
export const PROP_CELLS = Symbol("propCells")
/** Cells of state someone read, by name -- made on first tracked read. */
export const STATE_CELLS = Symbol("stateCells")
/** Cell of the props' key SET -- changed only when a key comes or goes, see `keysOf()`. */
export const KEYS = Symbol("keys")
/** Memoized derived values, by name -- see `derive()`. */
export const DERIVED = Symbol("derived")

/** What `extend` keeps on an object, under the symbols above. */
export type Extended = {
  [PROPS]: Map<string, unknown>
  [STATE]: Map<string, unknown> | null
  [PROP_CELLS]: Map<string, Cell> | null
  [STATE_CELLS]: Map<string, Cell> | null
  [KEYS]: Cell | null
  [DERIVED]: Map<string, Derived> | null
}

/**
 * `target`'s records, made if it has none -- non-enumerable, so they never show.
 * - `Observable` makes its own as it's constructed, so this is the slow path for other objects.
 */
export function extendedFor(target: any): Extended {
  if (target[PROPS]) return target
  for (const key of [STATE, PROP_CELLS, STATE_CELLS, KEYS, DERIVED]) {
    Object.defineProperty(target, key, { value: null, writable: true, configurable: true })
  }
  Object.defineProperty(target, PROPS, { value: new Map(), writable: true, configurable: true })
  return target
}

/**
 * DEPRECATED:  a no-op kept for callers of the `easy-state` era -- records are made on first use, see `extendedFor()`.
 * - `what` is ignored.
 */
export function initializeExtended(target: any, ..._what: Array<"derived" | "props" | "state">) {
  extendedFor(target)
}

////////////////
// ## Props
////////////////

/**
 * Prop `property` of `target`, tracked:  a reader re-runs when it changes, even if it's unset now.
 * - Unset:  `initializer()`'s value, stored once per object -- else what its class's schema declares:  its `init`,
 *   stored the same way, or its `default`, NOT stored.  See `PropInfo`.
 * - An initializer is called with `this` ~== `target`, and its value stored WITHOUT notifying the prop's readers:
 *   nobody can have read another value.  The key set does change, so `keysOf()` readers hear of it.
 */
export function getProp<T>(target: any, property: string): T | undefined
export function getProp<T>(target: any, property: string, initializer?: () => T): T
export function getProp<T>(target: any, property: string, initializer?: () => T) {
  const extended = extendedFor(target)
  if (isTrackingCells()) cellOf(extended, PROP_CELLS, property).read()
  const record = extended[PROPS]
  if (record.has(property)) return record.get(property)
  let info: PropInfo | undefined
  if (!initializer) {
    info = declared(target, property)
    initializer = info?.init as (() => T) | undefined
    if (!initializer) return info?.default
  }
  const value = initializer.call(target)
  if (value === undefined) return info?.default
  record.set(property, value)
  extended[KEYS]?.changed()
  return value
}

/**
 * Set prop `property` of `target` to `value` -- returns `value`.
 * - `undefined` deletes it instead, see `deleteProp()`.
 * - `===` its current value:  nothing happens, nobody's notified.
 * - Overwriting keeps its place in `keysOf()`;  a new key goes last.
 */
export function setProp<T>(target: any, property: string, value: T): T {
  storeProp(target, property, value)
  return value
}

/**
 * Set prop `property` of `target` to `value`, as `setProp()` -- returns whether it CHANGED.
 * - For `Observable.setProp()`, which checks the type of a changed value only.
 */
export function storeProp(target: any, property: string, value: unknown): boolean {
  if (value === undefined) return deleteProp(target, property)
  const extended = extendedFor(target)
  const record = extended[PROPS]
  const added = !record.has(property)
  if (!added && record.get(property) === value) return false
  record.set(property, value)
  extended[PROP_CELLS]?.get(property)?.changed()
  if (added) extended[KEYS]?.changed()
  return true
}

/** Delete prop `property` of `target`:  it leaves `keysOf()`, and a later set appends it.  Returns whether it was set. */
export function deleteProp(target: any, property: string): boolean {
  const extended = extendedFor(target)
  if (!extended[PROPS].delete(property)) return false
  extended[PROP_CELLS]?.get(property)?.changed()
  extended[KEYS]?.changed()
  return true
}

/**
 * A plain object whose own keys are reactive props:  each a getter / setter over `getProp()` / `setProp()`.
 * - SHALLOW:  what a key holds isn't made reactive -- set the key to a new value.
 * - Getters and functions of `init` are copied as they are:  `this` in them is the new object, so they read its
 *   reactive keys.
 * - For class-less state with a few keys, e.g. a test's fake.  A class with `@prop`s says more.
 */
export function reactiveObject<T extends object>(init: T): T {
  const target = {} as T
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(init))) {
    if (descriptor.get || descriptor.set || typeof descriptor.value === "function") {
      Object.defineProperty(target, key, descriptor)
      continue
    }
    Object.defineProperty(target, key, {
      get: () => getProp(target, key),
      set: (value) => setProp(target, key, value),
      enumerable: true,
      configurable: true
    })
    setProp(target, key, descriptor.value)
  }
  return target
}

/** Set several `props` of `target`, in order.  NOTE: no batching needed:  readers re-run once anyway, later. */
export function setProps(target: any, props: Record<string, any>) {
  for (const [property, value] of Object.entries(props)) setProp(target, property, value)
}

/**
 * Names of `target`'s props, in the order they were first set -- tracked:  a reader re-runs when a key comes or
 * goes, NOT when a value changes.
 * - A `Map`, so `"2"` and `"10"` keep their places:  a plain object would hoist integer-like keys to the front.
 */
export function keysOf(target: any): string[] {
  const extended = extendedFor(target)
  if (isTrackingCells()) (extended[KEYS] ??= new Cell()).read()
  return [...extended[PROPS].keys()]
}

/**
 * `target`'s props as a plain object -- e.g. its `toJSON()`.
 * - Tracked:  a reader re-runs when a key comes or goes (as `keysOf()`), AND when a value changes,
 *   e.g. a `<ui-form debug>` showing a spell object as JSON redraws as a task is ticked.
 * - NOTE: a plain object hoists integer-like keys (`"2"`, `"10"`) to the front:  `keysOf()` is the order.
 */
export function getProps(target: any): Record<string, any> {
  const extended = extendedFor(target)
  if (isTrackingCells()) {
    ;(extended[KEYS] ??= new Cell()).read()
    for (const property of extended[PROPS].keys()) cellOf(extended, PROP_CELLS, property).read()
  }
  return Object.fromEntries(extended[PROPS])
}

/**
 * Key a typed object's JSON names its class under:  `"@type"`, JSON-LD's spelling.
 * - No prop can be named `@...` (spell's names are words), so it never collides, where `"type"` would.
 */
export const TYPE_KEY = "@type"

/**
 * `target`'s props as a plain object, its class's name FIRST:  `{ "@type": "Card", "rank": "ace", ... }`.
 * - What a spell object's `toJSON()` answers (`Thing`, `List`), so its JSON can be read back as that class.
 * - `type`:  the name to write, default `target`'s class's.
 * - `"@type"` is NOT a prop:  `keysOf()` and `getProps()` never list it.
 * - Tracked, as `getProps()`.
 * - NOTE: a plain object, so an integer-like prop (`"2"`) is hoisted even above `"@type"`, as `getProps()` says.
 */
export function typedJSON(target: any, type: string = target.constructor.name): Record<string, any> {
  return { [TYPE_KEY]: type, ...getProps(target) }
}

////////////////
// ## State
////////////////

/**
 * State `property` of `target`, tracked -- `initializer()`'s value if unset, stored silently as `getProp()`'s.
 * - `property` is a top-level name:  a dotted path in `setState()` changes the object under its first part.
 */
export function getState<T>(target: any, property: string): T | undefined
export function getState<T>(target: any, property: string, initializer?: () => T): T
export function getState<T>(target: any, property: string, initializer?: () => T) {
  const extended = extendedFor(target)
  if (isTrackingCells()) cellOf(extended, STATE_CELLS, property).read()
  const record = (extended[STATE] ??= new Map())
  if (record.has(property)) return record.get(property)
  if (!initializer) return undefined
  const value = initializer.call(target)
  if (value !== undefined) record.set(property, value)
  return value
}

/**
 * Set state `property` of `target` to `value` -- returns `value`.
 * - `undefined` deletes it.  `===` its current value:  nothing happens.
 * - `property` may be a dotted path, e.g. `loadState.isDirty`:  sets it IN the object under `loadState` (made if
 *   missing), and notifies `loadState`'s readers.
 */
export function setState<T>(target: any, property: string, value: T): T {
  const extended = extendedFor(target)
  const record = (extended[STATE] ??= new Map())
  const dot = property.indexOf(".")
  if (dot === -1) {
    if (value === undefined) {
      if (record.delete(property)) extended[STATE_CELLS]?.get(property)?.changed()
    } else if (!record.has(property) || record.get(property) !== value) {
      record.set(property, value)
      extended[STATE_CELLS]?.get(property)?.changed()
    }
    return value
  }
  const top = property.slice(0, dot)
  const path = property.slice(dot + 1)
  let holder = record.get(top) as object | undefined
  if (value === undefined) {
    if (!holder || !unsetPath(holder, path)) return value
  } else {
    if (holder && getPath(holder, path) === value) return value
    if (!holder) record.set(top, (holder = {}))
    setPath(holder, path, value)
  }
  extended[STATE_CELLS]?.get(top)?.changed()
  return value
}

/** Does `target` have state `property`?  Untracked:  a reader doesn't re-run when it comes or goes. */
export function hasState(target: any, property: string): boolean {
  return extendedFor(target)[STATE]?.has(property) ?? false
}

/** State `property` of `target`, UNTRACKED:  for a write that compares with the value it replaces (`@state`'s `equals`). */
export function peekState<T>(target: any, property: string): T | undefined {
  return extendedFor(target)[STATE]?.get(property) as T | undefined
}

/**
 * Clear state `properties` of `target` -- all of it if none are named.
 * - Dotted paths clear inside their top-level object, as `setState()`.
 */
export function resetState(target: any, ...properties: string[]) {
  const extended = extendedFor(target)
  const record = extended[STATE]
  if (!record) return
  if (properties.length === 0) properties = [...record.keys()]
  for (const property of properties) setState(target, property, undefined)
}

////////////////
// ## Derived
////////////////

/**
 * Memoized derived value `name` of `target`:  `fn()`, re-computed only when what it read changes -- and its readers
 * re-run only when its value REALLY changes (`===`).  See `Derived`.
 * - `fn` is called with `this` ~== `target`.  It MUST be pure:  read cells, write nothing.
 * - The `fn` of the FIRST call is kept:  pass the same one every time, e.g. from a getter.
 * - `equals(old, next)` true keeps the OLD value, and its readers don't re-run (default `===`), e.g. a filtered list
 *   with the same items.  Kept from the first call, like `fn`.
 */
export function derive<T>(target: any, name: string, fn: (this: any) => T, equals?: (old: T, next: T) => boolean): T {
  const extended = extendedFor(target)
  const derived = (extended[DERIVED] ??= new Map())
  let value = derived.get(name)
  if (!value) derived.set(name, (value = new Derived(fn, target, equals)))
  return value.get() as T
}

/**
 * Cached `property` of `target`:  `getter()` once, then the same value every time -- NOT reactive.
 * - To reset the value:
 *   - Call `clearDerived(target)` to reset all derived properties.
 *   - Call `clearDerived(target, property)` to reset just that property.
 * - NOTE: a different thing from `derive()`:  this never re-computes by itself.
 */
export function getDerived<T>(target: any, property: string, getter: () => T): T {
  const derived = derivedFor(target)
  if (!hasOwnProp(derived, property)) derived[property] = { value: getter.apply(target) }
  return derived[property].value as T
}

/**
 * Cached `property` of `target`, calling `getter()` to get initial value or whenever `dependencies` change.
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
// ## Override
////////////////

/**
 * Override getter defined for `property` on `target`, returning explicit `value` instead.
 * - NOTE: can call this repeatedly -- each call replaces the previous override.
 * - NOT reactive:  a plain own property.
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

////////////////
// ## Helpers
////////////////

/** Cell of `property` in `extended`'s `which` cells, made if need be. */
function cellOf(extended: Extended, which: typeof PROP_CELLS | typeof STATE_CELLS, property: string): Cell {
  const cells = (extended[which] ??= new Map())
  let cell = cells.get(property)
  if (!cell) cells.set(property, (cell = new Cell()))
  return cell
}

/** What `target`'s class declares about `property` -- `undefined` if undeclared, or `target` isn't an `Observable`. */
function declared(target: any, property: string): PropInfo | undefined {
  const Class = target.constructor
  return Class?.[HAS_SCHEMA] ? schemaOf(Class).info(property) : undefined
}

/**
 * Value at dotted `path` (`a.b.c`) in `holder` -- `undefined` if any step is missing.
 * - Dots only:  no `[0]` brackets.  `setState()`'s dotted state names are all this needs.
 * - Here, not lodash's `get`:  this folder stays free of lodash, so `ui` can import it.
 */
function getPath(holder: any, path: string): unknown {
  for (const key of path.split(".")) {
    if (holder == null) return undefined
    holder = holder[key]
  }
  return holder
}

/** Set dotted `path` in `holder` to `value`, making plain objects for missing steps. */
function setPath(holder: any, path: string, value: unknown) {
  const keys = path.split(".")
  const last = keys.pop()!
  for (const key of keys) {
    if (holder[key] == null || typeof holder[key] !== "object") holder[key] = {}
    holder = holder[key]
  }
  holder[last] = value
}

/** Delete dotted `path` from `holder` -- `true` if it was there. */
function unsetPath(holder: any, path: string): boolean {
  const keys = path.split(".")
  const last = keys.pop()!
  const parent = keys.length ? getPath(holder, keys.join(".")) : holder
  if (parent == null || typeof parent !== "object" || !Object.hasOwn(parent, last)) return false
  delete (parent as Record<string, unknown>)[last]
  return true
}

/**
 * `getDerived()`'s cache for `target`.
 * - SIDE EFFECT:  defines a non-enumerable `__derived__` property directly on `target` if missing.
 */
function derivedFor(target: any) {
  if (!target.__derived__) {
    Object.defineProperty(target, "__derived__", { value: {} })
  }
  return target.__derived__
}
