/**
 * Constants of the `ui-button` family, and `HostPress`, which the element and its native fallback share.
 * - Runtime-light, at the bottom of the folder's imports:  no element code, so every file of the family may import
 *   it.  Constants only `UIButton` reads sit below that class (epic `wwod-spell-ui`, Q18).
 */

////////////////
// ## Types
////////////////

/** `<ui-button>`'s inner `<button type>` in a browser, and its `type` default. */
export const DEFAULT_TYPE = "button"

/** The `reset` button `type`:  resets the host's form (`UIT.SUBMIT` submits it). */
export const RESET = "reset"

////////////////
// ## Pressing the host
////////////////

/****************
 * ### `HostPress`
 * `host.click()` on a `<ui-button>`:  pressing its inner control, shared by the element and its native fallback.
 * - STATIC, instance-free:  one press needs nothing but the control.
 ****************/
export class HostPress {
  /**
   * `control.click()`, its event stopped at the control's shadow root:  the activation runs (submit, toggle, invoker,
   * link), and no second click reaches the page, which already has the host's.
   * - SIDE EFFECT:  a `click` listener on the root for the duration of the (synchronous) call.
   */
  static press(control: HTMLElement) {
    const root = control.getRootNode()
    root.addEventListener("click", HostPress.contain)
    try {
      control.click()
    } finally {
      root.removeEventListener("click", HostPress.contain)
    }
  }

  /** Keep a click inside the root it reached. */
  private static contain(event: Event) {
    event.stopPropagation()
  }
}
