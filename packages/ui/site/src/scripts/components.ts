import { PART_NOUNS } from "$/ui/components/parts/parts.vocabulary.en"

/**
 * Auto-loader for live examples:  imports the component FAMILY for every undefined `ui-*` tag on the page.
 * - Why:  MDX treats `<script>` as JSX (it is NOT bundled like an `.astro` script), so an MDX page can't import a
 *   component client-side on its own.  This makes every page "just work":  write `<ui-button>` in an example and
 *   `$/ui/components/button/index.ts` loads (it defines `ui-button`, `ui-buttons`, `ui-or`), on the pages that use it
 *   only.
 * - Tag => family:  `ui-<family>` or its plural (`ui-buttons`), a content part (`ui-header` => `parts`, from
 *   `PART_NOUNS`), a family-prefixed sub-tag (`ui-breadcrumb-section`, `ui-placeholder-line`), or `EXTRA_TAGS`.
 * - Imports source through the `$` alias, so the site always shows the working tree, not a build.
 */
const MODULES = import.meta.glob("$/ui/components/*/index.ts")

/** Family name => loader for `src/components/<family>/index.ts`. */
const FAMILIES = new Map<string, () => Promise<unknown>>()
for (const [path, load] of Object.entries(MODULES)) {
  const family = /\/components\/([^/]+)\/index\.ts$/.exec(path)?.[1]
  if (family) FAMILIES.set(family, load)
}

/** Tags a family defines besides `ui-<family>` / `ui-<family>s` / `ui-<family>-*` / the parts. */
const EXTRA_TAGS: Record<string, string> = {
  "ui-or": "button",
  "ui-row": "grid",
  "ui-column": "grid",
  "ui-textarea": "input",
  "ui-radio": "checkbox",
  "ui-field": "form",
  "ui-fields": "form",
  "ui-event": "feed",
  "ui-pushable": "sidebar",
  "ui-pusher": "sidebar",
  "ui-side": "shape"
}

/**
 * Import the family of each distinct undefined `ui-*` tag under `root`.
 * - Tags with no family (not built yet) are skipped silently.
 * - Resolves when every import has settled;  a failing module is logged, not thrown, so one broken component
 *   can't take the rest of the page down.
 */
export async function loadComponents(root: ParentNode = document): Promise<void> {
  const loaders = new Set<() => Promise<unknown>>()
  for (const el of root.querySelectorAll(":not(:defined)")) {
    const load = el.localName.startsWith("ui-") ? FAMILIES.get(familyOf(el.localName)) : undefined
    if (load) loaders.add(load)
  }
  const results = await Promise.allSettled([...loaders].map((load) => load()))
  for (const result of results) {
    if (result.status === "rejected") console.error("[site] component failed to load", result.reason)
  }
}

/**
 * Family that defines `tag`;  `""` if none.
 * - `ui-buttons` => `button`
 * - `ui-header` => `parts`
 * - `ui-placeholder-line` => `placeholder`
 */
function familyOf(tag: string): string {
  const name = tag.slice("ui-".length)
  if (FAMILIES.has(name)) return name
  if (name.endsWith("s") && FAMILIES.has(name.slice(0, -1))) return name.slice(0, -1)
  if ((PART_NOUNS as readonly string[]).includes(name)) return "parts"
  if (EXTRA_TAGS[tag]) return EXTRA_TAGS[tag]
  const prefix = name.split("-")[0]
  return FAMILIES.has(prefix) ? prefix : ""
}
