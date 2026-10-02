/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/**
 * FIX 7 -- an error boundary around every element's render, on by default.
 * - Without one, an error thrown while rendering or updating ANY Solid element halts Solid's scheduler for the
 *   whole page (`[REACTIVITY_HALTED]`):  every other element, and a host app on the same runtime, freezes.
 * - With it, the failing element stops rendering but stays in the DOM, and
 *   - `:state(errored)` is set when the element has internals
 *   - `errorEvent` (if set) is dispatched, cancelable, `detail: { error }`
 *   - unless cancelled:  `onError(element, error)` (default one `console.error`) and `fallback(element, error)`'s
 *     content replaces the render
 * - `onError` and event listeners run outside any reactive owner, so they may write signals (Solid 2 forbids
 *   writes in owned scopes);  `fallback` runs under the boundary, so its JSX is disposed with the element.
 * - `errorBoundary: false` restores the old behaviour.
 */

import { Errored, runWithOwner, untrack, type Accessor, type Element as SolidNode } from "solid-js"

import { STATE, type ElementOptions, type SolidElement, type SolidElementClass } from "./solid-element.types"

/**
 * The render inside a boundary (unless disabled);  `render` runs untracked either way.
 * - `<Errored>`, called as a function, not `createErrorBoundary`:  rc.13 moved that to `solid-js/internal`, and
 *   `Errored` is the public wrapper over it in every RC.  `children` is a GETTER, so `render` runs inside it.
 */
export function renderWithBoundary(element: SolidElement, render: () => unknown): unknown {
  const options: ElementOptions = STATE in element ? (element.constructor as SolidElementClass).options : {}
  if (options.errorBoundary === false) return untrack(render)
  return Errored({
    get children() {
      return untrack(render) as SolidNode
    },
    fallback: (error: Accessor<unknown>) => {
      const cause = error()
      const handled = runWithOwner(null, () => report(element, cause, options))
      return (handled && options.fallback ? untrack(() => options.fallback!(element, cause)) : undefined) as SolidNode
    }
  })
}

/**
 * Report `error` for `element`;  false when a listener cancelled the error event (it took over).
 * - SIDE EFFECT:  `:state(errored)`, the error event, `onError` / `console.error`.
 */
function report(element: SolidElement, error: unknown, options: ElementOptions): boolean {
  element.internals?.states.add("errored")
  if (options.errorEvent) {
    const event = new CustomEvent(options.errorEvent, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { error }
    })
    if (!element.dispatchEvent(event)) return false
  }
  if (options.onError) options.onError(element, error)
  else console.error(`<${element.localName}> failed to render:`, error)
  return true
}
