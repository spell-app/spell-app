import { untrack } from "solid-js"

import { E } from "$/ui/core"
import type { DocsSearchController } from "./ui-docs-search.types"

/****************
 * ### `DocsSearchHost`
 * Host base of `<ui-docs-search>`:  its script API (delegated to the controller, `UIDocsSearch`).
 * - `focus()` is the host's own:  `delegatesFocus` puts it in the field.
 * - NOTE: the fork checks host prototype members against prop names;  none of these is one.
 ****************/
export class DocsSearchHost extends E.UIHost {
  /** The controller, typed. */
  private get search(): DocsSearchController | undefined {
    return this.controller as unknown as DocsSearchController | undefined
  }

  /**
   * Show the field and focus it, its text selected:  what `/` and Cmd / Ctrl+K do.
   * - A field that isn't on screen opens the drawer it's in first (a closed `<ui-flyout>` / `<ui-sidebar>`), e.g. a
   *   narrow top bar's search button.
   */
  summon(): Promise<void> {
    return this.search?.summon() ?? this.ready.then(() => this.search?.summon())
  }

  /**
   * The text typed;  `""` before the controller exists.
   * - Untracked, as before P14:  a page's Solid effect reading it doesn't re-run on every keystroke.
   */
  get query(): string {
    return untrack(() => this.search?.query) ?? ""
  }
}
