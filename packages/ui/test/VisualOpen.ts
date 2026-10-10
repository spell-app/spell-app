/**
 * Helpers for the open-state hooks (`examples/elements/<example>.visual.ts`) of `yarn test:visual`.
 * - Runs IN THE PAGE (the fixture imports the hooks), but is also IMPORTED by the node side (for state names):
 *   no DOM access at module level, no value imports.
 */
export class VisualOpen {
  /**
   * Set `property` to `value` on the element `selector` finds under `root`:
   * the element's own API, e.g. `open` on a dropdown, `visible` on a modal.
   * - Throws when nothing matches, so an edited example fails its state loudly instead of capturing nothing.
   */
  static set(root: HTMLElement, selector: string, property = "open", value: unknown = true) {
    const element = root.querySelector(selector)
    if (!element) throw new Error(`VisualOpen.set():  nothing matches ${JSON.stringify(selector)}`)
    ;(element as unknown as Record<string, unknown>)[property] = value
  }

  /** Show the element `selector` finds under `root`:  the shared `visible` (a modal, a popup, a dimmer ...). */
  static show(root: HTMLElement, selector: string) {
    VisualOpen.set(root, selector, "visible")
  }
}
