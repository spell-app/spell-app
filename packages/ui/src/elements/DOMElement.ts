import type { SolidElement } from "./solid-element"

import type { E } from "$/ui/core"

/**
 * `HTMLElement`, or a stand-in outside a browser, so modules that define DOM elements can be IMPORTED during SSR
 * (the classes are never constructed there).
 * - Module-level, not a static:  the `extends` clause below reads it while the class is being defined.
 */
const BaseElement = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement

/****************
 * ### `DOMElement`
 * The base class of every Spell UI DOM element:  the `<ui-button>` in the page, with its attributes,
 * properties and events.  As the platform's `<a>` is an `HTMLAnchorElement`, a `<ui-button>` is a `DOMElement`.
 *
 * - Its COMPONENT (a `UIComponent` subclass, `UIButton`) holds the state and draws the shadow DOM:
 *   `domElement.component` points at it, `component.domElement` back here.
 *   solid-element builds the component the first time the element connects, and with `keepAlive`
 *   it lives until `dispose()`, across moves.
 *
 * - solid-element (`@spell-app/solid-element`) extends this class for every tag (its `BaseElement` option),
 *   and owns the platform's plumbing:  the shadow root (`shadowRootInit`, `delegatesFocus`),
 *   `ElementInternals` (`internals: true`), a property per attribute, upgrading, the lifecycle.
 * - This class adds what is OURS:  the `ready` promise, custom states,
 *   the link to the component, and swallowing clicks while the component is disabled.
 *
 * - A family adds its own script API in a subclass, `DOM<Name>Element` (`DOMNagElement`):
 *   `elementSetup.DOMElement` names it.
 * - NOTE: solid-element refuses a prototype member named like a property it makes for an attribute:
 *   never add one a vocabulary attribute could be called.
 * - Knows its component only by type:  `UIComponent` imports this file, never the other way round.
 ****************/
export class DOMElement extends BaseElement {
  /** Platform internals:  states, ARIA defaults, forms (attached by solid-element). */
  declare readonly internals: ElementInternals

  /** Where the component renders:  the shadow root (solid-element's `renderRoot`). */
  declare readonly renderRoot: ShadowRoot

  /** solid-element's:  call back on every write to a prop, equal or not (`@controlled`). */
  declare addPropertyChangedCallback: SolidElement["addPropertyChangedCallback"]

  /** solid-element's:  call back when the element is released (`dispose()`), newest first. */
  declare addReleaseCallback: SolidElement["addReleaseCallback"]

  /** solid-element's:  release the component and everything it holds;  idempotent.  `keepAlive` waits for it. */
  declare dispose: SolidElement["dispose"]

  /** This element's component;  `undefined` until it first connects, and again once it broke. */
  component?: E.UIComponent<any>

  /** Resolves once the first render is done with its styles adopted (or failed). */
  readonly ready: Promise<void>

  /** Resolves `ready`. */
  private resolveReady!: () => void

  constructor() {
    super()
    this.ready = new Promise((resolve) => (this.resolveReady = resolve))
    // capture on the DOM element itself, so a disabled element swallows clicks before page listeners on it run
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

  /** Resolve `ready`;  called by the component once it has rendered with styles, or by the error path. */
  markReady() {
    this.resolveReady()
  }

  ////////////////
  // ## Events
  ////////////////

  /** Swallow clicks while the component says the element is disabled. */
  private readonly onClickCapture = (event: MouseEvent) => {
    if (!this.component?.isDisabled) return
    event.preventDefault()
    event.stopImmediatePropagation()
  }
}
