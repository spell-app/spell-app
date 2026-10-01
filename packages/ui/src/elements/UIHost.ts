import type { SolidElement } from "@spell-app/solid-element"

import type { UIElement } from "./UIElement"

/**
 * `HTMLElement`, or a stand-in outside a browser, so modules that define hosts can be IMPORTED during SSR
 * (the classes are never constructed there).
 */
const BaseElement = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement

/**
 * Base class of every element's HOST -- the `BaseElement` option `@spell-app/solid-element` extends.
 * - The fork owns the platform plumbing:  shadow root (`shadowRootInit`, `delegatesFocus`), `ElementInternals`
 *   (`internals: true`), prop accessors, the upgrade step, lifecycle.  This class keeps what is OURS:  the
 *   `ready` promise, custom states, the controller link and the disabled-click guard.
 * - The per-element logic is a `UIElement` controller, created once by the render function;  with `keepAlive`
 *   it lives until `dispose()`, across moves.
 * - NOTE: prototype members here are checked by the fork against prop names;  never add one that a
 *   vocabulary attribute could be called.
 */
export class UIHost extends BaseElement {
  /** Platform internals:  states, ARIA defaults, forms (attached by the fork). */
  declare readonly internals: ElementInternals

  /** Where the component renders:  the shadow root (the fork's `renderRoot`). */
  declare readonly renderRoot: ShadowRoot

  /** The fork's instance API. */
  declare addPropertyChangedCallback: SolidElement["addPropertyChangedCallback"]
  declare addReleaseCallback: SolidElement["addReleaseCallback"]
  declare dispose: SolidElement["dispose"]

  /** Controller, once rendered. */
  controller?: UIElement<any>

  /** Resolves once the first render is done with its styles adopted (or failed). */
  readonly ready: Promise<void>

  /** Resolves `ready`. */
  private resolveReady!: () => void

  constructor() {
    super()
    this.ready = new Promise((resolve) => (this.resolveReady = resolve))
    // capture on the host itself, so a disabled element swallows clicks before page listeners on it run
    this.addEventListener("click", this.onClickCapture, { capture: true })
  }

  ////////////////
  // ## States
  ////////////////

  /** Add or remove custom state `name` (`:state(name)`). */
  setState(name: string, on: boolean) {
    if (on) this.internals.states.add(name)
    else this.internals.states.delete(name)
  }

  /** Resolve `ready`;  called by the controller once it has rendered with styles, or by the error path. */
  markReady() {
    this.resolveReady()
  }

  ////////////////
  // ## Events
  ////////////////

  /** Swallow clicks while the controller says the element is disabled. */
  private readonly onClickCapture = (event: MouseEvent) => {
    if (!this.controller?.isDisabled()) return
    event.preventDefault()
    event.stopImmediatePropagation()
  }
}
