/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/**
 * FIX 6 -- connect / disconnect (`component-register` issue #5).
 * - Default, as before:  a disconnect not followed by a reconnect within a microtask disposes the component;
 *   connecting again renders from scratch.  A same-tick move keeps it.
 * - `keepAlive: true`:  the reactive root survives any disconnect;  props keep flowing while detached, and only
 *   `element.dispose()` ends it.  Moving an element (re-parenting, sorting a list) keeps its state.
 * - `onConnect(fn)` / `onDisconnect(fn)`:  every connect (the first included, right after setup) and every
 *   disconnect, synchronously.  `onCleanup` runs on dispose, as in any Solid root.
 */

import { addHook, runHooks, withCurrentElement } from "./current"
import { restoreUpgradeProperties } from "./upgrade"
import { STATE, type SolidElement, type SolidElementClass } from "./solid-element.types"

/** Run `fn` on every connect of the current element, the first included. */
export function onConnect(fn: () => void) {
  addHook("connect", fn)
}

/** Run `fn` on every disconnect of the current element. */
export function onDisconnect(fn: () => void) {
  addHook("disconnect", fn)
}

/**
 * `connectedCallback` body.
 * - First connect:  re-apply pre-upgrade properties (an explicit set, so it reflects), then render.
 * - NEVER reflects defaults:  a bare element grows no attributes, as native elements and Lit's `useDefault`.
 */
export function connected(element: SolidElement) {
  const state = element[STATE]
  restoreUpgradeProperties(element)
  if (!state.initialized) {
    const Class = element.constructor as SolidElementClass
    state.initialized = true
    const values = { ...state.values }
    withCurrentElement(element, () => Class.Component(values, { element }))
  }
  runHooks(element, "connect")
}

/** `disconnectedCallback` body;  disposes a microtask later unless `keepAlive` or re-attached by then. */
export function disconnected(element: SolidElement) {
  runHooks(element, "disconnect")
  if ((element.constructor as SolidElementClass).options.keepAlive) return
  queueMicrotask(() => {
    if (!element.isConnected) dispose(element)
  })
}

/** `element.dispose()`:  release callbacks newest first, forget change callbacks;  idempotent. */
export function dispose(element: SolidElement) {
  const state = element[STATE]
  if (!state.initialized) return
  state.initialized = false
  state.propertyChangedCallbacks.length = 0
  let callback
  while ((callback = state.releaseCallbacks.pop())) callback(element)
}
