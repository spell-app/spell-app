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
