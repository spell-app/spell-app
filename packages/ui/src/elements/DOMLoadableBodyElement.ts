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
 *   A subclass names its component class (`DOMEpicFoldElement extends E.DOMLoadableBodyElement<EpicFold<any>>`).
 * - NOTE: `DOMElement` checks its members against the attributes' property names;
 *   neither is an attribute of these elements.
 ****************/
export class DOMLoadableBodyElement<
  C extends LoadableBodyComponentType = LoadableBodyComponentType
> extends DOMElement<C> {
  /** Fetch and insert the body now, even while folded / closed;  `LoadableBody.load()`. */
  load(): Promise<void> {
    return this.component?.loadBody() ?? Promise.resolve()
  }

  /** Fetch the body again past the cache and replace it;  `LoadableBody.reload()`. */
  reload(): Promise<void> {
    return this.component?.reloadBody() ?? Promise.resolve()
  }
}

/** What a `DOMLoadableBodyElement`'s component is:  a component, with the `LoadableBodyComponentShape` API. */
type LoadableBodyComponentType = E.UIComponent<any> & E.LoadableBodyComponentShape
