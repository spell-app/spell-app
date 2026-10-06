import type { E } from "$/ui/core"
// Import directly to avoid circular import
import { UIHost } from "./UIHost"

/****************
 * ### `SourceBodyHost`
 * Host base of the elements whose content can come from a file (`<ui-section source>` and its subclasses,
 * `<ui-accordion source>`):  their script API, delegated to the controller's `SourceBody`.
 * - `load()` -- fetch and insert the body now, even while folded / closed;  the same promise until `source` or
 *   `select` changes;  rejects when it fails.  Resolves at once without `source`.
 * - `reload()` -- fetch it again past the cache and replace it (a live update);  resolves once it's in.
 * - Before the controller exists (not yet connected):  both resolve at once, doing nothing.
 * - Knows its controller only as a `SourceBodyController` (`elements.types`):  NEVER imports a component.
 * - NOTE: the fork checks host prototype members against prop names;  neither is an attribute of these elements.
 ****************/
export class SourceBodyHost extends UIHost {
  /** Fetch and insert the body now, even while folded / closed;  `SourceBody.load()`. */
  load(): Promise<void> {
    return this.bodyController?.loadBody() ?? Promise.resolve()
  }

  /** Fetch the body again past the cache and replace it;  `SourceBody.reload()`. */
  reload(): Promise<void> {
    return this.bodyController?.reloadBody() ?? Promise.resolve()
  }

  /** The controller, typed;  `undefined` until the fork creates it. */
  private get bodyController(): E.SourceBodyController | undefined {
    return this.controller as unknown as E.SourceBodyController | undefined
  }
}
