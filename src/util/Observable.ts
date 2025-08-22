import global from "global"
import _set from "lodash/set"
import _unset from "lodash/unset"
import { store as createStore, view, batch, autoEffect, clearEffect } from "@risingstack/react-easy-state"

import { hasOwnProp } from "./class"
import { Derivative } from "./Derivative"

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
export class Observable<Props extends Record<string, any> = Record<string, any>> extends Derivative {
  /** INTERNAL non-reactive state object, only for manipulation in this file. */
  private __props__: Record<string, any> = { $state: {} }
  /** Reactive store of `props` and `state`. */
  protected $props: Record<string, any> = createStore(this.__props__)
  /** Pointer to our reactive `$state` object, a subset of `$props`. */
  protected get $state() {
    return this.$props.$state
  }

  constructor(props: Props) {
    super()
    // Assign properties to our instance -- invoking our getter/setters for `props`
    Object.assign(this, props)
  }

  /**
   * Get state `property`, defaulting to `initializer` if never set.
   * - `property` can be a dotted path.
   */
  protected getState<T>(property: string, initializer?: () => T) {
    if (!hasOwnProp(this.__props__.$state, property) && initializer) {
      this.__props__.$state[property] = initializer()
    }
    return this.$state[property]
  }
  /**
   * Set property `property` on our `$state` to `value`.
   * - If `value` is `undefined`, deletes instead.
   * - `property` can be a dotted path.
   */
  protected setState<T>(property: string, value: T) {
    const { $state } = this
    if (value === undefined) _unset($state, property)
    else _set($state, property, value)
    return value
  }

  /**
   * Reset our `state` to its defaults.
   * By default we totally clear state, pass specific string `properties` array to clear just those.
   */
  protected resetState(...properties: string[]) {
    if (arguments.length === 0) this.__props__.$state = {}
    else properties.forEach((property) => this.setState(property, undefined))
  }

  /**
   * Clean up this object when it's being "removed".
   * Note that this must be called manually.
   * TODO: finalizer???
   */
  onRemove() {}

  /** Output our non-state `props` when serializing to JSON. */
  toJSON() {
    const { $state, ...nonStateProps } = this.__props__
    return nonStateProps
  }

  /** Return reactive `property`, starting with `initializer` if not already set. */
  protected getProp<T>(property: string, initializer?: () => T) {
    if (!hasOwnProp(this.$props, property) && initializer) {
      this.$props[property] = initializer()
    }
    return this.$props[property]
  }
  /**
   * Set reactive `property` to `value`.
   * - NOTE: if setting to `undefined`, we'll delete the property instead.
   */
  protected setProp<T>(property: string, value: T) {
    if (value === undefined) {
      if (hasOwnProp(this.$props, property)) delete this.$props[property]
      // // TODO: necessary?
      // if (hasOwnProp(this, property)) delete this[property]
      // // TODO: necessary?
      // if (hasOwnProp(this.$state, property)) delete this.$state[property]
    } else {
      this.$props[property] = value
    }
  }
}
global.Observable = Observable

// /**
//  * A `@prop` is a (semi-) permanent reactive property defined on an `Observable`,
//  * stored in `$props`.  You can get and set it as if it's a normal property.
//  */
// export function prop(target, property, descriptor) {
//   // console.warn("@prop", key, descriptor, target)
//   if (descriptor.get || descriptor.set) {
//     console.warn("cant do @prop descriptor with get or set", descriptor)
//     return descriptor
//   }
//   const { initializer, value, writable, configurable } = descriptor
//   console.info("@prop", { target, key, initializer, value, writable, configurable })
//   const get = function () {
//     if (!hasOwnProp(this.$props, key)) this.$props[key] = initializer ? initializer() : value
//     return this.$props[key]
//   }
//   let set
//   if (writable) {
//     set = function (newValue) {
//       if (newValue === undefined) {
//         if (hasOwnProp(this, key)) delete this[key]
//         if (hasOwnProp(this.$props, key)) delete this.$props[key]
//         if (hasOwnProp(this.$state, key)) delete this.$state[key]
//       } else {
//         this.$props[key] = newValue
//       }
//     }
//   } else {
//     set = function (newValue) {
//       console.warn(`Attempting to set readonly property '${key}' of`, this, "to", newValue)
//     }
//   }
//   return { get, set, enumerable: true, configurable }
// }

// /**
//  * A `@state` is a transient reactive property defined on an `Observable`,
//  * stored in `.$props.$state` (which is set during object construction).
//  * You cannot modify `@state` directy!  Instead do `this.setState("prop", newValue)`.
//  * Call `this.resetState()` to reset all state variables to their default
//  * or `this.resetState(<key>...)` to reset certain state variables.
//  */
// export function state(target, key, descriptor) {
//   // console.warn("@state", key, descriptor, target)
//   if (descriptor.get || descriptor.set) {
//     console.warn("cant do @state descriptor with get or set", descriptor)
//     return descriptor
//   }

//   const { initializer, value, configurable /* writable, */ } = descriptor
//   const get = function () {
//     if (!hasOwnProp(this.$state, key)) this.$state[key] = initializer ? initializer() : value
//     return this.$state[key]
//   }
//   const set = function (newValue) {
//     console.warn(`Attempting to set readonly state '${key}' of`, this, "to", newValue)
//   }
//   return { get, set, enumerable: false, configurable }
// }
