import { UIHost } from "$/ui/core"

import type { DocsSearchController } from "./ui-docs-search.types"

/****************
 * ### `DocsSearchHost`
 * Host base of `<ui-docs-search>`:  its script API (delegated to the controller, `UIDocsSearch`).
 * - `summon()` -- show the field and focus it, its text selected:  what `/` and Cmd / Ctrl+K do.  A field that isn't
 *   on screen opens the drawer it's in first (a closed `<ui-flyout>` / `<ui-sidebar>`), e.g. a narrow top bar's
 *   search button
 * - `query` -- the text typed
 * - `focus()` -- the host's own:  `delegatesFocus` puts it in the field
 * - NOTE: the fork checks host prototype members against prop names;  none of these is one.
 ****************/
export class DocsSearchHost extends UIHost {
  /** The controller, typed. */
  private get search(): DocsSearchController | undefined {
    return this.controller as unknown as DocsSearchController | undefined
  }

  summon(): Promise<void> {
    return this.search?.summon() ?? this.ready.then(() => this.search?.summon())
  }

  get query(): string {
    return this.search?.query ?? ""
  }
}
