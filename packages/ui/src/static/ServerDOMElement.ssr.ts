/*! Derived from `@solidjs/element` and `component-register`:  MIT licence, (c) Ryan Carniato. */
import type { E } from "$/ui/core"
import type { SSR } from "$/ui/static"

/****************
 * ### `ServerDOMElement`
 * Turns a parsed (linkedom) element into a stand-in `DOMElement` a component can render against in node,
 * where no `HTMLElement` exists.
 * - The element keeps its DOM side (attributes, `children`, `parentElement`, `getRootNode()`),
 *   so owner climbs (`PartContext`) and slot scans (`SlotContent`) read the real page.
 * - Adds the DOM element side a component may use while it renders:
 *   - `attributeValues`, converted from its attributes, as the browser element would on first connect
 *   - `addReleaseCallback()`, `addPropertyChangedCallback()`, `dispose()`
 *   - `component`, `setState()`, `ready` / `markReady()`
 *   - recording stand-ins for `internals` and `renderRoot`
 * - Lifecycle methods (`onConnect()` ...) never run:  nothing connects, resets or restores on a server.
 * - What a render left on the DOM element -- custom states, internals ARIA -- is kept for the flattener
 *   (`ServerDOMElement.stateFor()`), which writes it out as classes and attributes.
 * - Node only (`$/ui/static`):  types only from `$/ui/core`;  NEVER imported by a component or `$/ui`.
 * - STATIC and instance-free:  the DOM element IS the element;  what it adds lives on the element and in `states`.
 * - Began as solid-element's `/server` entry, merged into its one user (epic `spell-element`, Q11).
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
   * - `startsVisible`:  its family's `elementSetup.visible`, for `visible` / `hidden` as the markup says.
   * - SIDE EFFECT:  defines the DOM element API on `element` itself.  Idempotent.
   */
  static attach(
    element: Element,
    definition: E.ElementDefinition,
    startsVisible: E.StartsVisible = "shown"
  ): E.DOMElement {
    const domElement = element as unknown as E.DOMElement
    if (ServerDOMElement.states.has(element)) return domElement
    const releaseCallbacks: (() => void)[] = []
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
      attributeValues: ServerDOMElement.attributeValuesOf(element, definition, startsVisible),
      addReleaseCallback: (callback: () => void) => void releaseCallbacks.push(callback),
      // nothing writes a property on a server
      addPropertyChangedCallback: () => undefined,
      dispose: () => {
        for (const callback of releaseCallbacks.splice(0).reverse()) callback()
      },
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
   * `element`'s attribute values as the browser element would hold them on first connect:
   * each attribute's text converted, else its starting value.
   * - `visible`:  what the markup says, `hidden` included (`ElementDefinition.visibleInMarkup()`).
   */
  static attributeValuesOf(
    element: Element,
    definition: E.ElementDefinition,
    startsVisible: E.StartsVisible = "shown"
  ): Record<string, unknown> {
    const values: Record<string, unknown> = {}
    for (const attribute of definition.attributes) {
      const text = element.getAttribute(attribute.attribute)
      values[attribute.key] = text === null ? definition.startingValue(attribute) : definition.convert(attribute, text)
    }
    if (definition.takesShared("visible")) {
      values.visible = definition.visibleInMarkup((name) => element.getAttribute(name), startsVisible)
    }
    return values
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
