import type { SolidElement } from "@spell-app/solid-element"
import { ServerElement } from "@spell-app/solid-element/server"

import type { E } from "$/ui/core"
import type { SSR } from "$/ui/static"

/****************
 * ### `ServerHost`
 * Turns a parsed (linkedom) element into a stand-in `UIHost` a controller can render against in node.
 * - The element keeps its DOM side:  attributes, `children`, `parentElement`, `getRootNode()`, so owner climbs
 *   (`PartContext`) and slot scans (`SlotContent`) read the real page.
 * - Adds the host side:  the fork's instance API (`ServerElement.attach()`), `controller`, `setState()`,
 *   `ready` / `markReady()`, and recording stand-ins for `internals` and `renderRoot`.
 * - What a render left on the host -- custom states, internals ARIA -- is kept for the flattener
 *   (`ServerHost.stateFor()`), which writes it out as classes and attributes.
 * - Node only (`$/ui/static`):  imports the fork's server half, and types only from `$/ui/core`;  NEVER imported by a
 *   component or `$/ui`.
 * - STATIC and instance-free:  the host IS the element;  what it adds lives on the element and in `states`.
 ****************/
export class ServerHost {
  /**
   * Host state per attached element.
   * - Page-wide, so the flattener reads what any render left;  weak, so a rendered page's elements go with it.
   * - Not `readonly`:  a `WeakMap` can't be cleared, so `reset()` replaces it.
   */
  private static states = new WeakMap<Element, SSR.ServerHostState>()

  /**
   * Make `element` a stand-in host for `definition`;  returns it typed as one.
   * - SIDE EFFECT:  defines the host API on `element` itself.  Idempotent.
   */
  static attach(element: Element, definition: E.ElementDefinition): E.UIHost & SolidElement {
    const host = ServerElement.attach(element, definition.props) as unknown as E.UIHost & SolidElement
    if (ServerHost.states.has(element)) return host
    const state: SSR.ServerHostState = { states: new Set(), internals: {} }
    ServerHost.states.set(element, state)
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
      controller: undefined,
      internals,
      renderRoot: RENDER_ROOT,
      ready: Promise.resolve(),
      markReady: () => undefined,
      setState: (name: string, on: boolean) => (on ? state.states.add(name) : state.states.delete(name))
    }
    for (const [key, value] of Object.entries(api)) {
      Object.defineProperty(element, key, { value, configurable: true, writable: true })
    }
    return host
  }

  /** What a render left on `element`'s host:  custom states and internals values;  `undefined` if never attached. */
  static stateFor(element: Element): SSR.ServerHostState | undefined {
    return ServerHost.states.get(element)
  }

  /**
   * Forget every attached element's state, for tests.
   * - The elements keep their host API:  `attach()` again records afresh.
   */
  static reset() {
    ServerHost.states = new WeakMap()
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
 * - A constructor wiring delegated listeners on its shadow root (`DialogElement`, `UIShape`) runs unchanged.
 * - `querySelector()`'s `null`:  the platform's "not found".
 */
const RENDER_ROOT = {
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  querySelector: () => null,
  querySelectorAll: () => [],
  adoptedStyleSheets: []
}
