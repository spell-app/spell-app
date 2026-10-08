import { createSignal, untrack, type Accessor } from "solid-js"

import type { E } from "$/ui/core"

/****************
 * ### `Controlled`
 * One auto-controlled property (`value`, `open`, `active`):  the DOM element's property / attribute is authoritative
 * when set;  until then an internal starting value stands in (e.g. a dropdown's `selected` items).
 * - `request(next, announce)` is every USER transition:  it dispatches the event first (`announce()`), then
 *   - a vetoed (cancelable) event changes nothing
 *   - if the DOM element set the property DURING the event -- e.g. re-set the old value in a `ui-change` handler --
 *     the DOM element's value stands and the UI "reverts" (it never showed the new one:  Solid batches to a microtask)
 *   - otherwise the new value is written to the DOM element's PROPERTY (and reflects), so `el.value` is always current,
 *     like a native `<input>`
 * - Why watch the property instead of comparing values:  a DOM element re-setting the SAME value it already had is
 *   still a decision.  solid-element calls change callbacks on every write, equal or not.
 * - "Set" ~== the converted value isn't `undefined`:  a boolean (`open`, `active`) is always the DOM element's (its
 *   default is the same `false` the internal value would be);  `el.value = undefined` hands a dropdown back to
 *   its `selected` items.
 * - DEPRECATED (goes with `UIComponent.controlled()`, until brand's components move to the decorators):
 *   `@controlled("open") accessor isOpen` is the same machinery on the record (`Reactive`).
 * - Made by `UIComponent.controlled()`;  knows the DOM element only by type,
 *   so it never loads `UIComponent` / `DOMElement`.
 ****************/
export class Controlled<T> {
  /** Current value:  DOM element's when set, else internal. */
  readonly get: Accessor<T>

  /** The DOM element. */
  private readonly domElement: E.DOMElement

  /** Property on the DOM element, e.g. `value` (`valor` on a translated tag). */
  private readonly property: string

  /** Converted DOM element value (`undefined` => uncontrolled). */
  private readonly value: Accessor<T | undefined>

  /** DOM element writes to `key` so far;  compared around `announce()`. */
  private writes = 0

  constructor({ domElement, key, property, value, initial }: ControlledProps<T>) {
    this.domElement = domElement
    this.property = property
    this.value = value
    const [internal] = createSignal<T>(initial as Exclude<T, Function>)
    this.get = () => {
      const current = value()
      return current === undefined ? internal() : current
    }
    domElement.addPropertyChangedCallback((changed: string) => {
      if (changed === key) this.writes++
    })
  }

  /** Is the DOM element controlling it right now? */
  get isControlled(): boolean {
    return untrack(this.value) !== undefined
  }

  /**
   * A user transition to `next`:  `announce()` dispatches the event and returns false when vetoed.
   * - Returns true when `next` was applied.
   */
  request(next: T, announce: () => boolean): boolean {
    const before = this.writes
    if (!announce() || this.writes !== before) return false
    this.set(next)
    return true
  }

  /**
   * Write the DOM element's property without an event, e.g. form reset.
   * - `undefined` removes the DOM element's value, so the internal starting value shows again.
   */
  set(next: T | undefined) {
    ;(this.domElement as unknown as Record<string, unknown>)[this.property] = next
  }
}

/** Constructor props for `Controlled`. */
export type ControlledProps<T> = {
  /** The element whose property this is. */
  domElement: E.DOMElement
  /** Definition key solid-element's change callbacks name (camelCase canonical). */
  key: string
  /** Property on the DOM element. */
  property: string
  /** Converted DOM element value, `undefined` when not set. */
  value: Accessor<T | undefined>
  /** Internal starting value. */
  initial: T
}
