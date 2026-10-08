import { E } from "$/ui/core"
import type { DocsNavController } from "./ui-docs-nav.types"

/****************
 * ### `DocsNavHost`
 * Host base of `<ui-docs-nav>`:  its script API, for the page template that puts it in a `<ui-sidebar>` /
 * `<ui-flyout>` (delegated to the controller, `UIDocsNav`).
 * - NOTE: the fork checks host prototype members against prop names;  none of these is one.
 ****************/
export class DocsNavHost extends E.UIHost {
  /** The controller, typed. */
  private get nav(): DocsNavController | undefined {
    return this.controller as unknown as DocsNavController | undefined
  }

  /**
   * Focus the search field (`<ui-docs-search>`'s `summon()`:  what `/` and Cmd / Ctrl+K do), opening the drawer the
   * nav is in first if it's closed.
   */
  focusSearch() {
    this.nav?.focusSearch()
  }

  /**
   * Scroll the current page's item into view, inside the nav's scroll container (never the page).
   * - A flyout calls it once open:  a hidden nav can't measure.
   */
  revealCurrent() {
    this.nav?.revealCurrent()
  }

  /** The starred tags, A-Z;  `[]` before the controller exists. */
  get favorites(): string[] {
    return this.nav?.favoriteTags ?? []
  }

  /** Resolves once the component list has loaded and rendered -- also on a load error:  then it shows the error. */
  get listed(): Promise<void> {
    return this.nav?.listed ?? this.ready.then(() => this.nav?.listed)
  }
}
