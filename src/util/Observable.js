import global from "global"
import _set from "lodash/set"
import _unset from "lodash/unset"
import { store as _store, batch, autoEffect, clearEffect } from "@risingstack/react-easy-state"

import { proto, readonly } from "./decorators"

// DEBUG
global._store = _store
global.autoEffect = autoEffect
global.clearEffect = clearEffect

function hasOwnProp(thing, key) {
  if (!thing) return false
  return Object.prototype.hasOwnProperty.call(thing, key)
}

/** Internal routine to set/clear a prop. */
function _setOrUnsetProp(thing, key, value) {
  if (value === undefined) {
    _unset(thing, key)
    _unset(thing._props, key)
  } else {
    // NOTE: we set on `this` assuming we have a `setter` established for all `@props`
    _set(thing, key, value)
  }
  return thing
}

/**
 * Methodology:
 * - inherit from Observable
 * - all observable properties must be defined as `@prop`
 *    - props are non-enumerable by default?
 * - use getters/setters as normal
 * - use `@memoProp` for memoized reactive property
 * - use `@protoProp` to sets default value on prototype, instance can override reactively
 * - you can `@prop @readonly` if you want
 * - use `set(props)` to set multiple values and/or delete props
 * BAD:
 *  - we don't get `delete`!  have to use `.set({ prop, undefined })`
 *  - may have problems with arrow functions?
 * HMMM:
 *  - `@sharedProp` set on prototype, reactive on instances when it changes?
 */

export class Observable {
  constructor(props) {
    Object.defineProperty(this, "_props", { value: _store() })
    this.set(props)
  }
  /**
   * Set an object of `props` on this object, returning the object itself.
   * If a prop value is `undefined`, we'll `delete` the prop instead.
   * Keys can be paths, e.g. `.set({ "dotted.path[0].prop": 1 })`
   * You can also call as `.set(path, value)`
   */
  set(props) {
    // eslint-disable-next-line prefer-rest-params
    if (arguments.length === 2 || typeof props === "string") _setOrUnsetProp(this, arguments[0], arguments[1])
    else if (props) Object.keys(props).forEach(key => _setOrUnsetProp(this, key, props[key]))
    return this
  }
  /** Watch some callback, re-executing when observable props change. */
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
 * A `@prop` is a reactive property defined on an Observable.
 */
export function prop(target, key, descriptor) {
  // console.warn("@prop", key, descriptor)
  const { get, set, initializer, value, writable, ...rest } = descriptor
  const output = { ...rest }
  // if no get or set, this is just a normal propery
  if (!get && !set) {
    output.get = function() {
      if (!hasOwnProp(this._props, key)) {
        this._props[key] = initializer ? initializer() : value
      }
      return this._props[key]
    }
    if (writable) {
      output.set = function(newValue) {
        if (newValue === undefined) {
          delete this[key]
          delete this._props[key]
        } else this._props[key] = newValue
      }
    } else {
      output.set = function(newValue) {
        console.warn(`Attempting to set readonly property '${key}' of`, this, "to", newValue)
      }
    }
    return output
  }
  return descriptor
}

/**
 * A `@memoProp` is a property whose value we memoize reactively on construction.
 * TODO: clear with `set({ prop: undefined })` ???
 */
export function memoProp(target, key, descriptor) {
  // console.warn("@memoProp", key, descriptor)
  const { get, set, initializer, value, writable, ...rest } = descriptor
  const getter = typeof value === "function" ? value : get
  if (typeof getter !== "function") throw new TypeError(`@memoProp: you must provide either a get or method`)

  return {
    ...rest,
    get() {
      if (!hasOwnProp(this._props, key)) {
        this._props[key] = getter.apply(this)
      }
      return this._props[key]
    },
    set(newValue) {
      console.warn(`Attempting to set readonly property '${key}' of`, this, "to", newValue)
    }
  }
}

export class Test extends Observable {
  @prop empty
  @prop undefined = undefined
  @prop default = 1
  @prop array = []
  @prop @readonly readonly = {}
  // @protoProp proto = "foo"
  // @protoProp protoObj = {}
  @memoProp get memo() {
    return { memo: true }
  }
  @memoProp memoDate() {
    return Date.now()
  }
}
global.Test = Test

global.it = new Test()

// /**
//  * A `@protoProp` is a property whose default is set on the prototype,
//  * but the instance can override???
//  */
// export function protoProp(target, key, descriptor) {
//   console.warn("@protoProp", key, descriptor)
//   const { get, set, initializer, value, writable, ...rest } = descriptor
//   const output = { ...rest }
//   // if no get or set, this is just a normal propery
//   if (!get && !set) {
//     let defaultSet = false
//     let defaultValue
//     output.get = function() {
//       if (hasOwnProp(this._props, key)) return this._props[key]
//       if (!defaultSet) {
//         defaultValue = initializer ? initializer() : value
//         defaultSet = true
//       }
//       return defaultValue
//     }
//     if (writable) {
//       output.set = function(newValue) {
//         if (newValue === undefined) delete this._props[key]
//         else this._props[key] = newValue
//       }
//     } else {
//       output.set = function(newValue) {
//         console.warn(`Attempting to set readonly property '${key}' of`, this, "to", newValue)
//       }
//     }
//     return output
//   }
//   return descriptor
// }
