import type { SolidElement } from "@spell-app/solid-element"
import { ServerElement } from "@spell-app/solid-element/server"

import type { ElementDefinition, UIHost } from "$/ui/elements"

import type { ServerHostState } from "./server.types"

/****************
 * ### `ServerHost`
 * Turns a parsed (linkedom) element into a stand-in `UIHost` a controller can render against in node.
 * - The element keeps its DOM side:  attributes, `children`, `parentElement`, `getRootNode()`, so owner climbs
 *   (`PartContext`) and slot scans (`SlotContent`) read the real page.
 * - Adds the host side:  the fork's instance API (`ServerElement.attach()`), `controller`, `setState()`,
 *   `ready` / `markReady()`, and recording stand-ins for `internals` and `renderRoot`.
 * - What a render left on the host -- custom states, internals ARIA -- is kept in `ServerHost.state()` for the
 *   flattener, which writes it out as classes and attributes.
 ****************/
export class ServerHost {
  /**
   * Make `element` a stand-in host for `definition`;  returns it typed as one.
   * - SIDE EFFECT:  defines the host API on `element` itself.  Idempotent.
   */
  static attach(element: Element, definition: ElementDefinition): UIHost & SolidElement {
    const host = ServerElement.attach(element, definition.props) as unknown as UIHost & SolidElement
    if (STATES.has(element)) return host
    const state: ServerHostState = { states: new Set(), internals: {} }
    STATES.set(element, state)
    const internals = new Proxy(state.internals, {
      get(target, key) {
        if (key === "states") return state.states
        if (key in INTERNALS_METHODS) return INTERNALS_METHODS[key as keyof typeof INTERNALS_METHODS]
        return target[key as string]
      }
    })
    const api: Record<string, unknown> = {
      controller: undefined,
      internals,
      renderRoot: SERVER_RENDER_ROOT,
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
  static state(element: Element): ServerHostState | undefined {
    return STATES.get(element)
  }
}

/** Host state per attached element. */
const STATES = new WeakMap<Element, ServerHostState>()

/** `ElementInternals` methods a render may call:  forms and validity do nothing on a server. */
const INTERNALS_METHODS = {
  setFormValue: () => undefined,
  setValidity: () => undefined,
  checkValidity: () => true,
  reportValidity: () => true,
  labels: [],
  form: null,
  validity: { valid: true },
  validationMessage: "",
  willValidate: false
}

/**
 * `renderRoot` on a server:  nothing renders into it (the view is a string), so listeners and queries are no-ops.
 * - A constructor wiring delegated listeners on its shadow root (`DialogElement`, `UIShape`) runs unchanged.
 */
const SERVER_RENDER_ROOT = {
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  querySelector: () => null,
  querySelectorAll: () => [],
  adoptedStyleSheets: []
}
