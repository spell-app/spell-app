import type { SourceBodyController } from "./elements.types"
import { UIHost } from "./UIHost"

/****************
 * ### `SourceBodyHost`
 * Host base of the elements whose content can come from a file (`<ui-section source>` and its subclasses,
 * `<ui-accordion source>`):  their script API, delegated to the controller's `SourceBody`.
 * - `load()` -- fetch and insert the body now, even while folded / closed;  the same promise until `source` or
 *   `select` changes;  rejects when it fails.  Resolves at once without `source`.
 * - `reload()` -- fetch it again past the cache and replace it (a live update);  resolves once it's in.
 * - Before the controller exists (not yet connected):  both resolve at once, doing nothing.
 * - NOTE: the fork checks host prototype members against prop names;  neither is an attribute of these elements.
 ****************/
export class SourceBodyHost extends UIHost {
  load(): Promise<void> {
    return this.bodyController?.loadBody() ?? Promise.resolve()
  }

  reload(): Promise<void> {
    return this.bodyController?.reloadBody() ?? Promise.resolve()
  }

  /** The controller, typed. */
  private get bodyController(): SourceBodyController | undefined {
    return this.controller as unknown as SourceBodyController | undefined
  }
}
