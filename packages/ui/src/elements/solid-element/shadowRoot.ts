/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/**
 * FIX 9 (and the shadow half of FIX 1) -- the render root.
 * - `component-register`'s `renderRoot` was `this.shadowRoot || this.attachShadow({ mode: "open" })`:
 *   - no `delegatesFocus`, `slotAssignment`, closed mode ...
 *   - an existing DECLARATIVE shadow root (server-rendered `<template shadowrootmode>`) was used as is, so the
 *     client render was APPENDED after the server markup -- everything shown twice
 * - Here:  `shadowRootInit` is passed through;  an existing root (open, or closed via `internals.shadowRoot`) is
 *   adopted and emptied right before the first render.  No hydration:  content is replaced.
 * - Still resolved lazily, on first render, so `noShadowDOM()` inside the component keeps working.
 */

import { STATE, type ElementOptions, type SolidElement } from "./solid-element.types"

/** `element.renderRoot` getter body:  resolve once, per `options.shadowRootInit`. */
export function resolveRenderRoot(element: SolidElement, options: ElementOptions): HTMLElement | ShadowRoot {
  const state = element[STATE]
  if (state.renderRoot) return state.renderRoot
  const init = options.shadowRootInit ?? { mode: "open" }
  if (init === false) return (state.renderRoot = element)
  const existing = element.shadowRoot ?? element.internals?.shadowRoot
  if (existing) {
    state.adopted = existing.childNodes.length > 0
    return (state.renderRoot = existing)
  }
  return (state.renderRoot = element.attachShadow(init))
}

/** Empty an adopted declarative root once, right before the first render. */
export function clearAdoptedRoot(element: SolidElement) {
  // resolving the root is what finds (and flags) a declarative one
  const root = element.renderRoot
  const state = element[STATE]
  if (!state?.adopted) return
  state.adopted = false
  root.replaceChildren()
}
