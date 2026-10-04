import { UIHost } from "$/ui/core"

import type { DocsNavController } from "./ui-docs-nav.types"

/****************
 * ### `DocsNavHost`
 * Host base of `<ui-docs-nav>`:  its script API, for the page template that puts it in a `<ui-sidebar>` /
 * `<ui-flyout>` (delegated to the controller, `UIDocsNav`).
 * - `focusSearch()` -- focus the search field (`<ui-docs-search>`'s `summon()`:  what `/` and Cmd / Ctrl+K do),
 *   opening the drawer the nav is in first if it's closed
 * - `revealCurrent()` -- scroll the current page's item into view, inside the nav's scroll container (never the
 *   page);  a flyout calls it once open (a hidden nav can't measure)
 * - `favorites` -- the starred tags, A-Z
 * - `listed` -- resolves once the component list has loaded and rendered (also on a load error:  then it shows
 *   the error)
 * - NOTE: the fork checks host prototype members against prop names;  none of these is one.
 ****************/
export class DocsNavHost extends UIHost {
  /** The controller, typed. */
  private get nav(): DocsNavController | undefined {
    return this.controller as unknown as DocsNavController | undefined
  }

  focusSearch() {
    this.nav?.focusSearch()
  }

  revealCurrent() {
    this.nav?.revealCurrent()
  }

  get favorites(): string[] {
    return this.nav?.favoriteTags() ?? []
  }

  get listed(): Promise<void> {
    return this.nav?.listed ?? this.ready.then(() => this.nav?.listed)
  }
}
