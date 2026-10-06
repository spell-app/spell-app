import { createSignal, untrack, type Accessor } from "solid-js"

import type { E } from "$/ui/core"

/****************
 * ### `Controlled`
 * One auto-controlled property (`value`, `open`, `active`):  the host's property / attribute is authoritative
 * when set;  until then an internal starting value stands in (e.g. a dropdown's `selected` items).
 * - `request(next, announce)` is every USER transition:  it dispatches the event first (`announce()`), then
 *   - a vetoed (cancelable) event changes nothing
 *   - if the host set the property DURING the event -- e.g. re-set the old value in a `ui-change` handler --
 *     the host's value stands and the UI "reverts" (it never showed the new one:  Solid batches to a microtask)
 *   - otherwise the new value is written to the host PROPERTY (and reflects), so `el.value` is always current,
 *     like a native `<input>`
 * - Why watch the property instead of comparing values:  a host re-setting the SAME value it already had is
 *   still a decision.  The fork calls change callbacks on every write, equal or not.
 * - "Set" ~== the converted value isn't `undefined`:  a boolean (`open`, `active`) is always the host's (its
 *   default is the same `false` the internal value would be);  `el.value = undefined` hands a dropdown back to
 *   its `selected` items.
 * - Made by `UIElement.controlled()`;  knows the host only by type, so it never loads `UIElement` / `UIHost`.
 ****************/
export class Controlled<T> {
  /** Current value:  host's when set, else internal. */
  readonly get: Accessor<T>

  /** The host. */
  private readonly host: E.UIHost

  /** Property on the host, e.g. `value` (`valor` on a translated tag). */
  private readonly property: string

  /** Converted host value (`undefined` => uncontrolled). */
  private readonly value: Accessor<T | undefined>

  /** Host writes to `key` so far;  compared around `announce()`. */
  private writes = 0

  constructor({ host, key, property, value, initial }: ControlledProps<T>) {
    this.host = host
    this.property = property
    this.value = value
    const [internal] = createSignal<T>(initial as Exclude<T, Function>)
    this.get = () => {
      const current = value()
      return current === undefined ? internal() : current
    }
    host.addPropertyChangedCallback((changed: string) => {
      if (changed === key) this.writes++
    })
  }

  /** Is the host controlling it right now? */
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
   * Write the host property without an event, e.g. form reset.
   * - `undefined` removes the host's value, so the internal starting value shows again.
   */
  set(next: T | undefined) {
    ;(this.host as unknown as Record<string, unknown>)[this.property] = next
  }
}

/** Constructor props for `Controlled`. */
export type ControlledProps<T> = {
  /** The element whose property this is. */
  host: E.UIHost
  /** Definition key the fork's change callbacks name (camelCase canonical). */
  key: string
  /** Property on the host. */
  property: string
  /** Converted host value, `undefined` when not set. */
  value: Accessor<T | undefined>
  /** Internal starting value. */
  initial: T
}
