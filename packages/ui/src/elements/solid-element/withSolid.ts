/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/**
 * `withSolid(Component)`:  the mixin that renders a Solid component into an element's render root.
 * - Works on this package's elements AND on `component-register`'s (it only uses the shared element API:
 *   `renderRoot`, `addPropertyChangedCallback`, `addReleaseCallback`).
 * - Differences from `@solidjs/element` rc.11, each from its own fix module:
 *   - the owner is the element's CREATOR's, found across shadow roots, never its slot's (`owner.ts`)
 *   - the component runs untracked, inside an error boundary (`errors.ts`)
 *   - an adopted declarative shadow root is emptied first (`shadowRoot.ts`)
 *   - the element is provided as context, so hooks work from nested components (`current.ts`)
 *   - delegated events don't leak `target` / `currentTarget` out of the shadow root, and reach enclosing
 *     Solid handlers (`events.ts`)
 */

import { createRoot, createSignal, runWithOwner, untrack, type Signal } from "solid-js"
import { insert, type JSX } from "@solidjs/web"

import { ElementContext } from "./current"
import { renderWithBoundary } from "./errors"
import { registerRoot, unregisterRoot } from "./events"
import { lookupOwner } from "./owner"
import { clearAdoptedRoot } from "./shadowRoot"
import type { ComponentOptions, ComponentType, FunctionComponent, SolidElement } from "./solid-element.types"

/** Wrap `Component` so it renders into `options.element.renderRoot` with reactive props. */
export function withSolid<T extends object>(Component: ComponentType<T>): FunctionComponent<T> {
  return (rawProps: T, options: ComponentOptions) => {
    const element = options.element as SolidElement
    const owner = lookupOwner(element)
    let rootBodyStarted = false
    if (owner) {
      try {
        return runWithOwner(owner, createComponent)
      } catch (error) {
        // A throw before the root body ever ran can only be the owner adoption itself failing:  the looked-up
        // `_$owner` was stamped by a DIFFERENT copy of the Solid runtime (an element library bundling its own
        // solid-js on a Solid page -- solidjs/solid#3053), whose owner layout this copy can't link into.
        // Render in an ownerless root instead;  anything thrown after the body started is a real error.
        if (rootBodyStarted) throw error
        console.warn(
          `<${element.localName}>: found an _$owner from a different copy of the Solid runtime (a second ` +
            "solid-js is on this page -- likely bundled into a compiled element library). Owners cannot be " +
            "adopted across copies; rendering without an owner. Context will not cross this boundary."
        )
      }
    }
    return createComponent()

    /** The component's root:  props, release, boundary, insert. */
    function createComponent() {
      return createRoot((dispose) => {
        rootBodyStarted = true
        const props = createProps(rawProps)
        element.addPropertyChangedCallback((key: string, value: unknown) => {
          ;(props as Record<string, unknown>)[key] = value
        })
        element.addReleaseCallback(() => {
          unregisterRoot(element.renderRoot)
          element.renderRoot.textContent = ""
          dispose()
        })
        const view = renderWithBoundary(element, () => {
          const children = ElementContext({
            value: element,
            // `untrack`:  the provider evaluates children in a memo, which would re-run the whole component
            // whenever a prop read in its body changed
            get children() {
              return untrack(() => construct(Component, props, options)) as JSX.Element
            }
          }) as unknown
          // the provider's children memo is lazy:  read it once so the component runs NOW, during setup
          if (typeof children === "function") children()
          return children
        })
        // the component (and `noShadowDOM()`) ran above, so the render root can be resolved now
        clearAdoptedRoot(element)
        // delegation root, bridged so handlers' state doesn't leak out of the shadow root (`events.ts`)
        registerRoot(element.renderRoot)
        return insert(element.renderRoot, view)
      })
    }
  }
}

/**
 * One signal per key, exposed as getters (reading tracks) and setters (writing updates).
 * - Values are stored as-is:  a function-valued prop (a callback) is a value, not a computation.
 * - `ownedWrite`:  these signals are written by the element's property setters, a DOM API anyone may call from
 *   anywhere -- including a Solid component body or memo, where Solid 2 otherwise throws
 *   (`REACTIVE_WRITE_IN_OWNED_SCOPE`).
 */
export function createProps<T extends object>(raw: T): T {
  const props = {} as T
  for (const key of Object.keys(raw)) {
    const initial = (raw as Record<string, unknown>)[key]
    const [get, set] = createSignal(() => initial, { ownedWrite: true }) as Signal<unknown>
    Object.defineProperty(props, key, {
      get,
      set(value: unknown) {
        set(() => value)
      },
      enumerable: true
    })
  }
  return props
}

/** Call a function component, or `new` a class component (`component-register` allows both). */
function construct<T>(Component: ComponentType<T>, props: T, options: ComponentOptions): unknown {
  const typed = options as ComponentOptions<SolidElement & T>
  return isConstructor(Component) ? new Component(props, typed) : (Component as FunctionComponent<T>)(props, typed)
}

/** A `class` (not a plain function), per its source text, as `component-register` tells them apart. */
export function isConstructor(fn: unknown): fn is new (...args: any[]) => unknown {
  return typeof fn === "function" && Function.prototype.toString.call(fn).startsWith("class")
}
