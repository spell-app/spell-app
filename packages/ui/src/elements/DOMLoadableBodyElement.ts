import type { E } from "$/ui/core"
// Import directly to avoid circular import
import { DOMElement } from "./DOMElement"

/****************
 * ### `DOMLoadableBodyElement`
 * The DOM element of the components whose content can come from a file
 * (`<ui-section source>` and its subclasses, `<ui-accordion source>`):
 * their script API, handed on to the component's `LoadableBody`.
 * - `load()` -- fetch and insert the body now, even while folded / closed;  the same promise until `source` or
 *   `select` changes;  rejects when it fails.  Resolves at once without `source`.
 * - `reload()` -- fetch it again past the cache and replace it (a live update);  resolves once it's in.
 * - Before the component exists (not yet connected):  both resolve at once, doing nothing.
 * - Knows its component only as a `LoadableBodyComponentShape` (`elements.types`):  NEVER imports a component.
 * - NOTE: `DOMElement` checks its members against the attributes' property names;
 *   neither is an attribute of these elements.
 ****************/
export class DOMLoadableBodyElement extends DOMElement {
  /** Fetch and insert the body now, even while folded / closed;  `LoadableBody.load()`. */
  load(): Promise<void> {
    return this.loadable?.loadBody() ?? Promise.resolve()
  }

  /** Fetch the body again past the cache and replace it;  `LoadableBody.reload()`. */
  reload(): Promise<void> {
    return this.loadable?.reloadBody() ?? Promise.resolve()
  }

  /** The component, typed;  `undefined` until the first connect builds it. */
  private get loadable(): E.LoadableBodyComponentShape | undefined {
    return this.component as unknown as E.LoadableBodyComponentShape | undefined
  }
}
