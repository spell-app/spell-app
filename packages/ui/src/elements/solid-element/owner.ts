/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/**
 * FIX 8 + FIX 11 -- the Solid owner an element's root is created under.
 * - Solid's compiler stamps `_$owner` (the owner current at creation) on custom elements and `<slot>`s its JSX
 *   creates.  The element's root is created under the owner found here, so app context reaches it.
 * - FIX 8:  `@solidjs/element`'s walk followed `parentNode` only, which ends at a `ShadowRoot`:  an element created
 *   inside another element's shadow root WITHOUT JSX (`innerHTML`, `document.createElement`, a template clone)
 *   lost all context from the page.  Here the walk continues at the shadow root's host.
 * - FIX 11:  rc.11 preferred the owner stamped on the element's ASSIGNED SLOT (and on its ancestors' slots).  In
 *   Solid 2 a root created under an owner is that owner's CHILD, disposed with it, so a slotted element's whole
 *   root died with whatever branch rendered the slot:  a host whose `<Show>` / `<Switch>` / `<Dynamic>` re-created
 *   its `<slot>` silently froze every element slotted into it.  (Solid 1's roots were never owned, so the slot
 *   preference was only a context feature there.)  Also racy:  it applied only when the host had ALREADY rendered
 *   its slot when the child connected.  See `lookupOwner()` for the owner picked instead.
 * - Kept from rc.11:  `withSolid` falls back to an ownerless root when the found owner belongs to a different copy
 *   of Solid (solidjs/solid#3053).
 */

import { isDisposed, type Owner } from "solid-js"

/** A node that may carry Solid's owner stamp. */
type Stamped = Node & { _$owner?: Owner; host?: Stamped }

/**
 * The owner that CREATED `element`:  its own stamp, else the nearest stamped ancestor's, crossing shadow roots.
 * - Why the creator:  it owns the element's DOM, so its lifetime covers the element's.  A slot only DISPLAYS its
 *   assigned nodes:  the light DOM belongs to whoever wrote it, and outlives any branch that renders a `<slot>`.
 * - An unstamped element (HTML, `innerHTML`, `createElement`) takes its nearest stamped ancestor:  that owner
 *   created (or holds) the DOM it sits in.  Nothing stamped => `undefined`, an ownerless root that lives until
 *   `dispose()` / disconnect.
 * - NEVER the assigned `<slot>`'s owner.  The cost:  context a component provides AROUND its `<slot>` no longer
 *   reaches slotted elements (rc.11's "share context through slot markers").  Solid 2 has no public way to inherit
 *   context without being owned;  app context still arrives through the creator (`UPSTREAM.md`, PR 11).
 * - A stamp whose owner is already disposed is skipped:  adopting it would make a root nothing ever disposes.
 */
export function lookupOwner(element: Element): Owner | undefined {
  let next: Stamped | null = element as Stamped
  while (next) {
    const owner = next._$owner
    if (owner && !isDisposed(owner)) return owner
    // a ShadowRoot (nodeType 11 with a host) continues at its host;  NEVER read `host` elsewhere (`<a>.host` is a URL part)
    next = (next.parentNode ?? (next.nodeType === 11 ? next.host : null) ?? null) as Stamped | null
  }
  return undefined
}
