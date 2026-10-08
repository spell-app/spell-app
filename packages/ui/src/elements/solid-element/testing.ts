/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/**
 * Test helpers:  unique tags, the implementation under test, and settling.
 * - `reproduce()` checks that one observation gives the FIXED value.
 *   Each call still names the value the original library gave (`@solidjs/element` rc.11 + `component-register`
 *   0.8.8), as the record of the bug;  `ui` doesn't carry that library, so it isn't run here (epic `spell-element`, P1).
 */

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

/** `customElement`'s signature, as the tests call it. */
export type CustomElementFn = (tag: string, props: any, Component: any, options?: any) => CustomElementConstructor

/** One implementation's API, as the tests use it. */
export type Implementation = {
  customElement: CustomElementFn
  noShadowDOM: () => void
  getCurrentElement: () => HTMLElement
}

/** The implementation under test. */
export const IMPLEMENTATIONS: Record<"fork", Implementation> = {
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
 * One test:  `observe` gives the fixed value, `expected.fork`.
 * - `expected.original`:  what the original library gave, the bug.
 *   It MUST differ from the fixed value, or the test proves nothing.
 */
export function reproduce<T>(
  title: string,
  observe: (api: Implementation) => T | Promise<T>,
  expected: { original: T; fork: T }
) {
  it(`fixed:  ${title}`, async () => {
    expect(expected.original).not.toEqual(expected.fork)
    expect(await observe(IMPLEMENTATIONS.fork)).toEqual(expected.fork)
  })
}
