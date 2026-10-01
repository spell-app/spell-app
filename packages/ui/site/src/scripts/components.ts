import type { ClientIndex } from "../lib/ComponentIndex"

/**
 * Auto-loader for live examples:  imports the component FAMILY for every undefined `ui-*` tag on the page.
 * - Why:  MDX treats `<script>` as JSX (it is NOT bundled like an `.astro` script), so an MDX page can't import a
 *   component client-side on its own.  This makes every page "just work":  write `<ui-button>` in an example and
 *   `$/ui/components/ui-button/index.ts` loads (it defines `ui-button`, `ui-buttons`, `ui-or`), on the pages that use it
 *   only.
 * - Tag => family folder comes from `ComponentDefinitions` (one definition per tag), written into every page at
 *   build time as `#site-component-index` (`ComponentPageIndex`).  Not imported here:  `ComponentDefinitions` eagerly
 *   imports every vocabulary (~500 KB of source), which no page should download to look up a folder name.
 * - Imports source through the `$` alias, so the site always shows the working tree, not a build.
 */
const MODULES = import.meta.glob("$/ui/components/*/index.ts")

/** Family folder (`ui-button`) => loader for `src/components/ui-<family>/index.ts`. */
const FAMILIES = new Map<string, () => Promise<unknown>>()
for (const [path, load] of Object.entries(MODULES)) {
  const family = /\/components\/([^/]+)\/index\.ts$/.exec(path)?.[1]
  if (family) FAMILIES.set(family, load)
}

/**
 * Import the family of each distinct undefined `ui-*` tag under `root`.
 * - Tags with no definition or no family (not built yet) are skipped silently.
 * - Resolves when every import has settled;  a failing module is logged, not thrown, so one broken component
 *   can't take the rest of the page down.
 */
export async function loadComponents(root: ParentNode = document): Promise<void> {
  const index = ComponentPageIndex.read()
  const loaders = new Set<() => Promise<unknown>>()
  for (const el of root.querySelectorAll(":not(:defined)")) {
    const folder = index[el.localName]?.folder
    const load = folder ? FAMILIES.get(folder) : undefined
    if (load) loaders.add(load)
  }
  const results = await Promise.allSettled([...loaders].map((load) => load()))
  for (const result of results) {
    if (result.status === "rejected") console.error("[site] component failed to load", result.reason)
  }
}

/**
 * The page's component index:  tag => `{ folder, search }`, from `ComponentIndex.clientIndex()` at build time
 * (`components/ComponentBrowser.astro` writes it into the sidebar as JSON).
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
