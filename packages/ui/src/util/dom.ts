/**
 * Small DOM helpers that know about shadow roots and custom element upgrade timing.
 * - Every helper is safe to IMPORT outside a browser (SSR, node tooling);  only calling them needs a DOM,
 *   except `isBrowser()` which exists to ask.
 */

////////////////
// ## Environment
////////////////

/**
 * True when running with a real DOM and custom element registry.
 * - Checks `customElements` too, not just `window`:  some SSR shims fake `window` but have no registry.
 */
export function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined" && typeof customElements !== "undefined"
}

////////////////
// ## Timing
////////////////

/**
 * Resolve on the next animation frame, with its timestamp.
 * - Use to let layout / style settle, e.g. after inserting an element and before measuring it.
 */
export function nextFrame(): Promise<number> {
  return new Promise((resolve) => requestAnimationFrame(resolve))
}

/**
 * Resolve with the class for custom element `tag` once it's defined -- immediately if it already is.
 * - Thin cover over `customElements.whenDefined()` so callers needn't know about the registry,
 *   and a translated registry (`ie-*` tags) can later be swapped in here.
 */
export function whenDefined(tag: string): Promise<CustomElementConstructor> {
  return customElements.whenDefined(tag)
}

////////////////
// ## Traversal
////////////////

/**
 * Like `element.closest(selector)`, but keeps climbing out of shadow roots, following the FLAT tree.
 * - Why:  a generic part (`<ui-header>`) slotted into a component, or rendered inside its shadow root,
 *   must find its owner (`ui-card`) however it got there -- `closest()` stops at the shadow boundary.
 * - Order at each step:
 *   - `assignedSlot` -- a slotted element's rendered parent is its slot, inside the owner's shadow
 *   - `parentElement` -- ordinary light-DOM parent
 *   - shadow root's `host` -- step out of a shadow tree
 * - Includes `element` itself, as `closest()` does.
 * - NOTE: closed shadow roots hide `assignedSlot`, so a slotted element climbs through its light parent instead.
 */
export function closestAcrossShadow<T extends Element = Element>(element: Element, selector: string): T | null {
  let current: Element | null = element
  while (current) {
    if (current.matches(selector)) return current as T
    current = current.assignedSlot ?? current.parentElement ?? hostOf(current)
  }
  return null

  /** Host of the shadow root `node` lives in, or `null` at the document. */
  function hostOf(node: Element): Element | null {
    const root = node.getRootNode()
    return root instanceof ShadowRoot ? root.host : null
  }
}
