/**
 * Constants of the `ui-button` family, and `DOMElementClick`:  what the component and its native fallback share.
 * - No element code, so every file of the family may import it.
 * - A constant only `UIButton` reads sits below that class instead.
 */

////////////////
// ## Types
////////////////

/** The `type` of `<ui-button>`'s inner `<button>` in a browser, and the default of its own `type`. */
export const DEFAULT_TYPE = "button"

/** The `reset` button `type`:  it resets the button's form (`UIT.SUBMIT` submits it). */
export const RESET = "reset"

////////////////
// ## Clicking the DOM element
////////////////

/****************
 * ### `DOMElementClick`
 * What `click()` on a `<ui-button>` does:  it presses the button inside, as `click()` on a native button would.
 * - Shared by the component and its native fallback.
 * - Static:  a press needs nothing but the inner control.
 ****************/
export class DOMElementClick {
  /**
   * `control.click()`, with its event stopped at the control's shadow root.
   * - The activation still runs:  submit, toggle, invoker command, link.
   * - No second click reaches the page, which already has the DOM element's own.
   * - SIDE EFFECT:  a `click` listener on the root while the (synchronous) call runs.
   */
  static press(control: HTMLElement) {
    const root = control.getRootNode()
    root.addEventListener("click", DOMElementClick.contain)
    try {
      control.click()
    } finally {
      root.removeEventListener("click", DOMElementClick.contain)
    }
  }

  /** Keep a click inside the root it reached. */
  private static contain(event: Event) {
    event.stopPropagation()
  }
}
