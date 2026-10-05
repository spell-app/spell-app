/**
 * Shared constants of the `ui-button` family.
 * - Runtime-light:  no element code, so every file of the family may import it.
 */

/** `<ui-button>`'s inner `<button type>` in a browser, and its `type` default. */
export const DEFAULT_TYPE = "button"

/**
 * The native submitter's attributes a server render (`$/ui/server`) copies from the host onto the inner `<button>`,
 * so a static form submits as the browser would with that button:  not vocabulary, read off the host as written.
 */
export const FORM_ATTRIBUTES = ["form", "formaction", "formenctype", "formmethod", "formnovalidate", "formtarget"]

/** `icon-position` that puts the icon after the text. */
export const ICON_END = "right"

/** Class words of a trailing icon box:  Fomantic's `<i class="right ... icon">`, spaced on its start side. */
export const RIGHT_ICON_CLASS = "right icon"

/****************
 * ### `HostPress`
 * `host.click()` on a `<ui-button>`:  pressing its inner control, shared by the element and its native fallback.
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
