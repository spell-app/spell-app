import _set from "lodash/set"
import _unset from "lodash/unset"
import { store as createStore, view, batch, autoEffect, clearEffect } from "@risingstack/react-easy-state"

import { Derivative } from "./Derivative"
import * as extend from "./extend"

// re-export react-easy-state props for convenience
export { createStore, view, batch, autoEffect, clearEffect }

/**
 * Methodology:
 * - Create a subclass of `Observable`.
 * - Observable public properties should be declared as `@prop key defaulValue`
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
export class Observable<
  Props extends Record<string, any> = Record<string, any>,
  State extends Record<string, any> = Record<string, any>
> extends Derivative {
  /** On construction, assign `props` passed in to our instance. */
  constructor(props: Partial<Props & State>) {
    super()
    extend.initializeExtended(this, "props", "state")
    // Assign properties to our instance -- invoking our getter/setters for `props` or `state`.
    Object.assign(this, props)
  }

  //-----------------
  // Props
  //-----------------

  /** Return reactive `property`, defaulting to `initializer` if never set. */
  protected getProp<T>(property: string, initializer?: () => T) {
    return extend.getProp(this, property, initializer)
  }
  /**
   * Set reactive `property` to `value`.
   * - If `value` is `undefined`, deletes the property instead.
   */
  protected setProp<T>(property: string, value: T) {
    return extend.setProp(this, property, value)
  }

  //-----------------
  // State
  //-----------------

  /** Get state `property`, defaulting to `initializer` if never set. */
  protected getState<T>(property: string, initializer?: () => T): T {
    return extend.getState(this, property, initializer)
  }
  /**
   * Set property `property` on our `$state` to `value`.
   * - If `value` is `undefined`, deletes the property instead.
   * - `property` can be a dotted path.
   */
  protected setState<T>(property: string, value: T) {
    return extend.setState(this, property, value)
  }

  /**
   * Reset our `state` to its defaults.
   * - By default we clear state entirely.
   * - Pass specific string `properties` path(s) to clear just those.
   */
  protected resetState(...properties: string[]) {
    return extend.resetState(this, ...properties)
  }

  /**
   * Clean up this object when it's being "removed".
   * Note that this must be called manually.
   * TODO: finalizer???
   */
  onRemove() {}

  /** Output our non-state `props` when serializing to JSON. */
  toJSON() {
    return extend.getProps(this)
  }
}
