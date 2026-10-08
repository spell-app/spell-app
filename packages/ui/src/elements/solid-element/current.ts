/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/**
 * Which element is rendering:  `getCurrentElement()`, `noShadowDOM()`, and the hook registry the lifecycle /
 * form hooks share.
 * - `component-register` kept a module variable, set only while the component FUNCTION runs.  Here the element is
 *   also provided as Solid context, so a hook registered by a nested component or later (inside `<Show>`)
 *   still finds its element.
 */

import { createContext, getOwner, onCleanup, useContext } from "solid-js"

import { STATE, type HookName, type SolidElement } from "./solid-element.types"

/**
 * The element whose component is rendering, as context.
 * - `null` default:  Solid 2's `useContext` throws on a context with neither a default nor a provider.
 */
export const ElementContext = createContext<SolidElement | null>(null)

/** Element set up right now by `connectedCallback` (outside any Solid owner). */
let current: SolidElement | undefined

/** The element being rendered:  during setup, or anywhere under its component's owner. */
export function getCurrentElement(): SolidElement {
  return (current ?? (getOwner() ? useContext(ElementContext) : null))!
}

/** Run `fn` with `element` current;  restores the outer one (nested upgrades). */
export function withCurrentElement<T>(element: SolidElement, fn: () => T): T {
  const outer = current
  current = element
  try {
    return fn()
  } finally {
    current = outer
  }
}

/**
 * Render into the element itself instead of a shadow root;  call it first thing in the component.
 * - Per instance;  `shadowRootInit: false` does the same for every instance.
 */
export function noShadowDOM() {
  const element = getCurrentElement()
  Object.defineProperty(element, "renderRoot", { value: element, configurable: true })
}

////////////////
// ## Hooks
////////////////

/**
 * Register `fn` under hook `name` for the current element;  removed again when the registering owner is
 * disposed (so a hook in a conditional child goes away with it).
 * - Throws outside a component:  there is no element to hook.
 */
export function addHook(name: HookName, fn: (...args: any[]) => void) {
  const element = getCurrentElement()
  if (!element) throw new Error(`on${name.charAt(0).toUpperCase()}${name.slice(1)}() called outside a component`)
  const hooks = element[STATE].hooks
  const set = (hooks[name] ??= new Set())
  set.add(fn)
  if (getOwner()) onCleanup(() => set.delete(fn))
  // state-like hooks hear what the platform reported before they existed (e.g. `formAssociatedCallback`
  // fires on insertion, BEFORE `connectedCallback` renders the component)
  const last = element[STATE].last[name]
  if (last) fn(...last)
}

/** Call every `name` hook of `element` with `args`. */
export function runHooks(element: SolidElement, name: HookName, ...args: unknown[]) {
  const state = element[STATE]
  if (REPLAYED.has(name)) state.last[name] = args
  const set = state.hooks[name]
  if (set) for (const fn of [...set]) fn(...args)
}

/** Hooks that report a STATE (latest wins) rather than an event, replayed to late registrations. */
const REPLAYED = new Set<HookName>(["formAssociated", "formDisabled"])
