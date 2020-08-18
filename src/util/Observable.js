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

/**
 * Methodology:
 * - Create a subclass of `Observable`.
 * - Observable public properties should be declated as `@prop key defaulValue`
 * - Observable transient private properties are declared as `@state key defaulValue`
 * - "Normal" getters/setters will be reactive if they reference a `@prop` or `@state` variable.
 * - As for all classes, non-observable SHARED properties or defaults can be defined with `@proto`
 *
 * - NOTE: We can't trap `delete this[<prop>]`, do `this.<prop> = undefined` instead.
 *
 * Props vs State
 * - `props` are "normal" reactive user gettable/settable properties, just assign to them to change reactively.
 * - `state` are transient internal state, e.g. `@state runCount = 0`
 *    - We set up a getter to access its value:  `print(this.runCount)`
 *    - To update the value, do `this.setState("runCount", this.runCount + 1)`
 *    - Use `this.resetState()` or `this.resetState(<stateKey>...)` to reset state.
 */

export class Observable {
  constructor(props) {
    this.__props__ = { _state: {} }
    // TODO: we could do this on demand with a getter, but that would mess up hooks
    //       because `createStore()` is attempting to be too clever in regard to memoizing in hooks.
    Object.defineProperty(this, "_props", { value: createStore(this.__props__) })
    // NOTE: you cannot initialize state this way!!!
    // Assign start state as `@state key = <value>` or call `this.setState(<key>, <value>)` after construction.
    Object.assign(this, props)
  }

  /** Pointer to our reactive `_state` object (initialized on construction). */
  get _state() {
    return this._props._state
  }

  /**
   * Set property `key` on our `_state` to `value`.
   * If `value` is `undefined`, deletes instead.
   * `key` can be a dotted path.
   */
  setState(key, value) {
    const { _state } = this
    if (value === undefined) _unset(_state, key)
    else _set(_state, key, value)
  }

  /**
   * Reset our `state` to its defaults.
   * By default we totally clear state, pass specific string `keys` array to clear just those.
   */
  resetState(...keys) {
    if (arguments.length === 0) keys = Object.keys(this._state)
    keys.forEach((key) => this.setState(key, undefined))
  }

  /**
   * Clean up this object when it's being "removed".
   * Note that this must be called manually.
   */
  onRemove() {}

  /** Make toJSON() output our `props`. */
  toJSON() {
    return this.__props__
  }
}
global.Observable = Observable

/**
 * A `@prop` is a (semi-) permanent reactive property defined on an `Observable`,
 * stored in `_props`.  You can get and set it as if it's a normal property.
 */
export function prop(target, key, descriptor) {
  // console.warn("@prop", key, descriptor, target)
  if (descriptor.get || descriptor.set) {
    console.warn("cant do @prop descriptor with get or set", descriptor)
    return descriptor
  }

  const { initializer, value, writable, configurable } = descriptor
  const get = function () {
    if (!hasOwnProp(this._props, key)) this._props[key] = initializer ? initializer() : value
    return this._props[key]
  }
  let set
  if (writable) {
    set = function (newValue) {
      if (newValue === undefined) {
        if (hasOwnProp(this, key)) delete this[key]
        if (hasOwnProp(this._props, key)) delete this._props[key]
        if (hasOwnProp(this._state, key)) delete this._state[key]
      } else {
        this._props[key] = newValue
      }
    }
  } else {
    set = function (newValue) {
      console.warn(`Attempting to set readonly property '${key}' of`, this, "to", newValue)
    }
  }
  return { get, set, enumerable: true, configurable }
}

/**
 * A `@state` is a transient reactive property defined on an `Observable`,
 * stored in `._props._state` (which is set during object construction).
 * You cannot modify `@state` directy!  Instead do `this.setState("prop", newValue)`.
 * Call `this.resetState()` to reset all state variables to their default
 * or `this.resetState(<key>...)` to reset certain state variables.
 */
export function state(target, key, descriptor) {
  // console.warn("@state", key, descriptor, target)
  if (descriptor.get || descriptor.set) {
    console.warn("cant do @state descriptor with get or set", descriptor)
    return descriptor
  }

  const { initializer, value, configurable /* writable, */ } = descriptor
  const get = function () {
    if (!hasOwnProp(this._state, key)) this._state[key] = initializer ? initializer() : value
    return this._state[key]
  }
  const set = function (newValue) {
    console.warn(`Attempting to set readonly state '${key}' of`, this, "to", newValue)
  }
  return { get, set, enumerable: false, configurable }
}
