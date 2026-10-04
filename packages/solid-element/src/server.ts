/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/**
 * Rendering an element's component OUTSIDE a browser (server render), as `@spell-app/solid-element/server`.
 * - Why:  the element class can't exist in node (`HTMLElement`, `customElements`, `attachInternals`,
 *   `attachShadow`), but a component written for it can still run under `@solidjs/web`'s server build, given:
 *   - an element-shaped object to hold its bookkeeping (`ServerElement.attach()`), e.g. a linkedom element
 *   - its props converted from attributes as the element would (`ServerElement.props()`)
 *   - the element current while it is constructed, and as context while it renders (`ServerElement.run()`),
 *     so `onConnect()` & co register instead of throwing
 * - Hooks are registered and NEVER run:  nothing connects, resets or restores on a server.
 * - Not in the barrel:  browser bundles never load it.
 */

import { untrack } from "solid-js"

import {
  STATE,
  type AnyPropsDefinition,
  type ElementState,
  type PropertyChangedCallback,
  type SolidElement
} from "./solid-element.types"
import { ElementContext, withCurrentElement } from "./current"
import { initialValue, normalizeProps } from "./props"

/****************
 * ### `ServerElement`
 * Element-shaped objects for server rendering:  attach the bookkeeping, convert props, run the component.
 ****************/
export class ServerElement {
  /**
   * Give `element` the instance API a component may call while it renders:  `[STATE]`, `addReleaseCallback()`,
   * `addPropertyChangedCallback()`, `lookupProp()`, `dispose()`.
   * - SIDE EFFECT:  defines them on `element` itself;  `renderRoot` is the element (nothing is inserted).
   * - Idempotent.
   */
  static attach<E extends object>(element: E, propsDefinition: AnyPropsDefinition = {}): E & SolidElement {
    const target = element as E & SolidElement
    if (target[STATE]) return target
    const props = normalizeProps(propsDefinition)
    const state: ElementState = {
      values: {},
      initialized: true,
      releaseCallbacks: [],
      propertyChangedCallbacks: [],
      hooks: {},
      last: {}
    }
    const api = {
      [STATE]: state,
      renderRoot: element,
      addReleaseCallback: (fn: (element: SolidElement) => void) => void state.releaseCallbacks.push(fn),
      addPropertyChangedCallback: (fn: PropertyChangedCallback) => void state.propertyChangedCallbacks.push(fn),
      lookupProp: (name: string) => props.byAttribute.get(name)?.key ?? (props.byKey.has(name) ? name : undefined),
      dispose: () => ServerElement.dispose(target)
    }
    for (const [key, value] of Object.entries(api)) Object.defineProperty(element, key, { value, configurable: true })
    Object.defineProperty(element, STATE, { value: state, configurable: true })
    return target
  }

  /**
   * Prop values for `element` as the browser element would hold them on first connect:  each prop's default,
   * then its attribute's text through the prop's converter.
   * - `getAttribute`:  the element's, e.g. a linkedom element.
   */
  static props(
    element: { getAttribute(name: string): string | null },
    propsDefinition: AnyPropsDefinition = {}
  ): Record<string, unknown> {
    const values: Record<string, unknown> = {}
    for (const prop of normalizeProps(propsDefinition).list) {
      const text = prop.attribute ? element.getAttribute(prop.attribute) : null
      values[prop.key] = text === null ? initialValue(prop) : prop.fromAttribute(text)
    }
    return values
  }

  /**
   * Run `fn` (construct or render the component) with `element` current, under `ElementContext`, so a hook
   * registered now or later (inside `<Show>`) finds its element.
   * - MUST run under a Solid owner (`createRoot`, `renderToString`).
   */
  static run<T>(element: SolidElement, fn: () => T): T {
    return withCurrentElement(element, () => {
      const view = ElementContext({
        value: element,
        get children() {
          return untrack(fn) as never
        }
      }) as unknown
      return (typeof view === "function" ? view() : view) as T
    })
  }

  /** Run `element`'s release callbacks, newest first;  idempotent. */
  static dispose(element: SolidElement) {
    const state = element[STATE]
    if (!state.initialized) return
    state.initialized = false
    for (const fn of state.releaseCallbacks.splice(0).reverse()) fn(element)
    state.propertyChangedCallbacks.length = 0
  }
}
