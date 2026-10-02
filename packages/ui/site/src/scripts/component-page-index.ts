import type { ClientIndex } from "../lib/ComponentIndex"

/**
 * The page's component index:  tag => `{ folder, search }`, from `ComponentIndex.clientIndex()` at build time
 * (`components/ComponentBrowser.astro` writes it into the sidebar as JSON), for the sidebar's search.
 * - Live examples load through `<ui-root>` (`layouts/Docs.astro`), which has its own tag => family catalog.
 */
export class ComponentPageIndex {
  /** Id of the `<script type="application/json">` holding it. */
  static readonly ID = "site-component-index"
  /** Parsed once per page. */
  private static cached?: ClientIndex

  /** The index;  `{}` if the page has none (a page not on `Docs.astro`). */
  static read(): ClientIndex {
    return (ComponentPageIndex.cached ??= ComponentPageIndex.parse())
  }

  /** Parse the JSON;  a broken one is logged and treated as empty. */
  private static parse(): ClientIndex {
    const text = document.getElementById(ComponentPageIndex.ID)?.textContent
    if (!text) return {}
    try {
      return JSON.parse(text) as ClientIndex
    } catch (error) {
      console.error("[site] unreadable component index", error)
      return {}
    }
  }
}
