import type { SolidElement } from "$/ui/elements/solid-element"
import { ServerElement } from "$/ui/elements/solid-element/server"

import type { E } from "$/ui/core"
import type { SSR } from "$/ui/static"

/****************
 * ### `ServerDOMElement`
 * Turns a parsed (linkedom) element into a stand-in `DOMElement` a component can render against in node.
 * - The element keeps its DOM side:  attributes, `children`, `parentElement`, `getRootNode()`, so owner climbs
 *   (`PartContext`) and slot scans (`SlotContent`) read the real page.
 * - Adds the DOM element side:  solid-element's instance API (`ServerElement.attach()`), `component`, `setState()`,
 *   `ready` / `markReady()`, and recording stand-ins for `internals` and `renderRoot`.
 * - What a render left on the DOM element -- custom states, internals ARIA -- is kept for the flattener
 *   (`ServerDOMElement.stateFor()`), which writes it out as classes and attributes.
 * - Node only (`$/ui/static`):  imports solid-element's server half, and types only from `$/ui/core`;
 *   NEVER imported by a component or `$/ui`.
 * - STATIC and instance-free:  the DOM element IS the element;  what it adds lives on the element and in `states`.
 ****************/
export class ServerDOMElement {
  /**
   * DOM element state per attached element.
   * - Page-wide, so the flattener reads what any render left;  weak, so a rendered page's elements go with it.
   * - Not `readonly`:  a `WeakMap` can't be cleared, so `reset()` replaces it.
   */
  private static states = new WeakMap<Element, SSR.ServerDOMElementState>()

  /**
   * Make `element` a stand-in DOM element for `definition`;  returns it typed as one.
   * - SIDE EFFECT:  defines the DOM element API on `element` itself.  Idempotent.
   */
  static attach(element: Element, definition: E.ElementDefinition): E.DOMElement & SolidElement {
    const domElement = ServerElement.attach(element, definition.props) as unknown as E.DOMElement & SolidElement
    if (ServerDOMElement.states.has(element)) return domElement
    const state: SSR.ServerDOMElementState = { states: new Set(), internals: {} }
    ServerDOMElement.states.set(element, state)
    const internals = new Proxy(state.internals, {
      get(target, key) {
        if (key === "states") return state.states
        if (key in INTERNALS_METHODS) {
          return INTERNALS_METHODS[key as keyof typeof INTERNALS_METHODS]
        }
        return target[key as string]
      }
    })
    const api: Record<string, unknown> = {
      component: undefined,
      internals,
      renderRoot: RENDER_ROOT,
      ready: Promise.resolve(),
      markReady: () => undefined,
      setState: (name: string, on: boolean) => (on ? state.states.add(name) : state.states.delete(name))
    }
    for (const [key, value] of Object.entries(api)) {
      Object.defineProperty(element, key, { value, configurable: true, writable: true })
    }
    return domElement
  }

  /**
   * What a render left on `element`'s DOM element:  custom states and internals values;
   * `undefined` if never attached.
   */
  static stateFor(element: Element): SSR.ServerDOMElementState | undefined {
    return ServerDOMElement.states.get(element)
  }

  /**
   * Forget every attached element's state, for tests.
   * - The elements keep their DOM element API:  `attach()` again records afresh.
   */
  static reset() {
    ServerDOMElement.states = new WeakMap()
  }
}

/** `ElementInternals` methods a render may call:  forms and validity do nothing on a server. */
const INTERNALS_METHODS = {
  setFormValue: () => undefined,
  setValidity: () => undefined,
  checkValidity: () => true,
  reportValidity: () => true,
  labels: [],
  // `ElementInternals.form`'s own "no form" (a platform boundary)
  form: null,
  validity: { valid: true },
  validationMessage: "",
  willValidate: false
}

/**
 * `renderRoot` on a server:  nothing renders into it (the view is a string), so listeners and queries are no-ops.
 * - A constructor wiring delegated listeners on its shadow root (`DialogComponent`, `UIShape`) runs unchanged.
 * - `querySelector()`'s `null`:  the platform's "not found".
 */
const RENDER_ROOT = {
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  querySelector: () => null,
  querySelectorAll: () => [],
  adoptedStyleSheets: []
}
