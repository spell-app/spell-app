/**
 * Small DOM helpers that know about shadow roots and custom element upgrade timing.
 * - Every helper is safe to IMPORT outside a browser (SSR, node tooling);  only calling them needs a DOM,
 *   except `isBrowser()` which exists to ask.
 * - NEVER `instanceof Node` / `Element` / `ShadowRoot`:  `ui`'s server render calls these on linkedom elements in
 *   node, which has no such globals.  Compare `nodeType` against `NodeType` instead.
 */

////////////////
// ## Node types
////////////////

/**
 * `Node.nodeType` values we test, without the `Node` global (node has none):  `node.nodeType === NodeType.text`.
 */
export const NodeType = {
  element: 1,
  text: 3,
  documentFragment: 11
} as const
/** One of `NodeType`'s values, e.g. `3`. */
export type NodeType = (typeof NodeType)[keyof typeof NodeType]

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
  for (let current: Element | undefined = element; current; current = flatParentFor(current)) {
    if (current.matches(selector)) return current as T
  }
  return null
}

/**
 * `element`'s parent in the FLAT tree:  its slot when it's slotted, else its parent element, else its shadow root's
 * host;  `undefined` at the top.
 * - The one climb `closestAcrossShadow()`, `ui`'s owner and settings lookups and `<ui-sticky>` share.
 * - NOTE: a closed shadow root hides `assignedSlot`, so a slotted element climbs through its light parent instead.
 */
export function flatParentFor(element: Element): Element | undefined {
  if (element.assignedSlot) return element.assignedSlot
  if (element.parentElement) return element.parentElement
  const root = element.getRootNode() as Partial<ShadowRoot>
  return root.nodeType === NodeType.documentFragment && root.host ? root.host : undefined
}
