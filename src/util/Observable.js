import global from "global"
import _set from "lodash/set"
import _unset from "lodash/unset"
import { store as createStore, view, batch, autoEffect, clearEffect } from "@risingstack/react-easy-state"

import { hasOwnProp } from "./class"

// re-export react-easy-state props for convenience
export { createStore, view, batch, autoEffect, clearEffect }

// DEBUG
global.createStore = createStore
global.autoEffect = autoEffect
global.clearEffect = clearEffect

/** Internal routine to set/clear a prop. */
function _setOrUnsetProp(thing, key, value) {
  if (value === undefined) {
    _unset(thing, key)
    _unset(thing._props, key)
    _unset(thing._state, key)
  } else {
    // NOTE: we set on `this` assuming we have a `setter` established for all `@props`
    _set(thing, key, value)
  }
  return thing
}

/**
 * Methodology:
 * - inherit from Observable
 * - observable public properties should be declated as `@prop key defaulValue`
 * - observable transient private properties are declared as `@state key defaulValue`
 *    - use `observable.reset()` to clear all state properties.
 *    - override `.reset()` in a subclass to do other things.
 * - non-observable properties can be defined as normal.
 * - (non-observable) shared properties can be defined with `@proto`
 * - you can define getters/setters as normal
 * - use `set(props)` or `set(prop, value)` to set multiple prop/state/normal values
 *    - NOTE: `delete prop` or `delete state` WON'T WORK!
 *    - ALWAYS use `observable.set(...)` to update!
 * BAD:
 *  - we can't trap `delete`!  have to use `.set({ prop, undefined })`
 *  - may have problems with arrow functions?
 *
 * TODO: `@sharedProp` for an overrideable shared property?
 * HMMM:
 *  - `@sharedProp` set on prototype, reactive on instances when it changes?
 */

export class Observable {
  constructor(props) {
    // TODO: we could do this dynamically with getters, but that would mess up hooks
    //       because `createStore()` is attempting to be too clever in regard to memoizing in hooks.
    Object.defineProperty(this, "_props", { value: createStore() })
    Object.defineProperty(this, "_state", { value: createStore() })
    this.set(props)
  }

  /**
   * Set an object of `props` on this object, returning `this`.
   * Keys can be paths, e.g. `.set({ "dotted.path[0].prop": 1 })`
   *
   * If a prop value is `undefined`, we'll `delete` the prop instead.
   * You can also call as `.set(path, value)` which is more efficient.
   */
  set(props) {
    batch(() => {
      // eslint-disable-next-line prefer-rest-params
      if (arguments.length === 2 || typeof props === "string") _setOrUnsetProp(this, arguments[0], arguments[1])
      else if (props) Object.keys(props).forEach(key => _setOrUnsetProp(this, key, props[key]))
    })
    return this
  }

  /**
   * Reset our `state` to its defaults.
   * By default we totally clear state, pass specific string `keys` array to only clear some.
   */
  resetState(...keys) {
    if (arguments.length === 0) keys = Object.keys(this._state)
    keys.forEach(key => delete this._state[key])
  }

  /**
   * Watch some `callback`, re-executing when observable props or state change.
   * Returns `reaction` which you can use to `.clearWatch()` later.
   *
   * NOTE: you must `clearWatch()` yourself or manually call `onRemove()`
   * or you'll get a memory leak.  :-(
   */
  watch(callback) {
    const reaction = autoEffect((...args) => callback.apply(this, args))
    if (!this._reactions) Object.defineProperty(this, "_reactions", { value: [] })
    this._reactions.push(reaction)
    return reaction
  }
  /** Clear a `reaction` generated from `this.watch()` */
  clearWatch(reaction) {
    clearEffect(reaction)
    const index = this._reactions ? this._reactions.indexOf(reaction) : -1
    if (index !== -1) this._reactions.splice(index, 1)
  }

  /** Clean up all `watch`es `onRemove()` (which must be called manually). */
  onRemove() {
    if (this._reactions) this._reactions.forEach(reaction => clearEffect(reaction))
  }
}
global.Observable = Observable

/**
 * A `@prop` is a (semi-) permanent reactive property defined on an Observable,
 * stored in `_props`.
 */
export function prop(target, key, descriptor) {
  // console.warn("@prop", key, descriptor, target)
  if (descriptor.get || descriptor.set) {
    console.warn("cant do @prop descriptor with get or set", descriptor)
    return descriptor
  }

  const { initializer, value, writable, configurable } = descriptor
  const get = function() {
    if (!hasOwnProp(this._props, key)) this._props[key] = initializer ? initializer() : value
    return this._props[key]
  }
  let set
  if (writable) {
    set = function(newValue) {
      if (newValue === undefined) {
        if (hasOwnProp(this, key)) delete this[key]
        if (hasOwnProp(this._props, key)) delete this._props[key]
        if (hasOwnProp(this._state, key)) delete this._state[key]
      } else {
        this._props[key] = newValue
      }
    }
  } else {
    set = function(newValue) {
      console.warn(`Attempting to set readonly property '${key}' of`, this, "to", newValue)
    }
  }
  return { get, set, enumerable: true, configurable }
}

/**
 * A `@state` is a transitive reactive property defined on an Observable, stored in `._state`.
 * You cannot modify `@state` directy!  Instead do `this.set("_state.prop", newValue)`.
 * Call `.resetState()` to reset all state variables to their default.
 */
export function state(target, key, descriptor) {
  // console.warn("@state", key, descriptor, target)
  if (descriptor.get || descriptor.set) {
    console.warn("cant do @state descriptor with get or set", descriptor)
    return descriptor
  }

  const { initializer, value, configurable /* writable, */ } = descriptor
  const get = function() {
    if (!hasOwnProp(this._state, key)) this._state[key] = initializer ? initializer() : value
    return this._state[key]
  }
  const set = function(newValue) {
    console.warn(`Attempting to set readonly state '${key}' of`, this, "to", newValue)
  }
  // let set
  // if (writable) {
  //   set = function(newValue) {
  //     if (newValue === undefined) {
  //       if (hasOwnProp(this, key)) delete this[key]
  //       if (hasOwnProp(this._state, key)) delete this._state[key]
  //     } else {
  //       this._state[key] = newValue
  //     }
  //   }
  // } else {
  //   set = function(newValue) {
  //     console.warn(`Attempting to set readonly property '${key}' of`, this, "to", newValue)
  //   }
  // }
  return { get, set, enumerable: false, configurable }
}
