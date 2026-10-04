/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/**
 * Test helpers:  unique tags, the two implementations side by side, and settling.
 * - `reproduce()` runs ONE observation against both implementations:  the original must show the bug (its
 *   exact wrong value, so an unrelated failure can't pass for it), the fork the fixed value.
 */

import * as original from "@solidjs/element"
import { flush } from "solid-js"
import { expect, it } from "vite-plus/test"

import { customElement } from "./customElement"
import { getCurrentElement, noShadowDOM } from "./current"

/** A tag no other test uses:  `name-<n>`. */
export function nextTag(name: string): string {
  return `${name}-${++count}`
}

/** Tag counter. */
let count = 0

/** `customElement` of either implementation;  the original ignores a 4th argument. */
export type CustomElementFn = (tag: string, props: any, Component: any, options?: any) => CustomElementConstructor

/** One implementation's API, as the tests use it. */
export type Implementation = {
  customElement: CustomElementFn
  noShadowDOM: () => void
  getCurrentElement: () => HTMLElement
}

/** The implementations under test:  `original` = `@solidjs/element` rc.11 + `component-register` 0.8.8. */
export const IMPLEMENTATIONS: Record<"original" | "fork", Implementation> = {
  original: original as unknown as Implementation,
  fork: { customElement, noShadowDOM, getCurrentElement } as unknown as Implementation
}

/** Apply pending Solid writes, then wait a microtask (disconnect disposal, reflection guards). */
export async function settle() {
  flush()
  await Promise.resolve()
  await Promise.resolve()
  flush()
}

/** A connected container, removed by `cleanup()`. */
export function mount(html = ""): HTMLElement {
  const container = document.createElement("div")
  container.innerHTML = html
  document.body.append(container)
  return container
}

/** Empty the page between tests. */
export function cleanup() {
  document.body.replaceChildren()
}

/**
 * Two tests from one observation:  `original` yields the BUGGY value, `fork` the fixed one.
 * - The two expected values MUST differ, or the test proves nothing.
 */
export function reproduce<T>(
  title: string,
  observe: (api: Implementation) => T | Promise<T>,
  expected: { original: T; fork: T }
) {
  it(`original (component-register 0.8.8 / @solidjs/element rc.11) has the bug:  ${title}`, async () => {
    expect(expected.original).not.toEqual(expected.fork)
    expect(await observe(IMPLEMENTATIONS.original)).toEqual(expected.original)
  })
  it(`fork fixes it:  ${title}`, async () => {
    expect(await observe(IMPLEMENTATIONS.fork)).toEqual(expected.fork)
  })
}
