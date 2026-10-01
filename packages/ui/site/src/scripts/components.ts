import { PART_NOUNS } from "$/ui/components/ui-parts/ui-parts.vocabulary.en"

/**
 * Auto-loader for live examples:  imports the component FAMILY for every undefined `ui-*` tag on the page.
 * - Why:  MDX treats `<script>` as JSX (it is NOT bundled like an `.astro` script), so an MDX page can't import a
 *   component client-side on its own.  This makes every page "just work":  write `<ui-button>` in an example and
 *   `$/ui/components/ui-button/index.ts` loads (it defines `ui-button`, `ui-buttons`, `ui-or`), on the pages that use it
 *   only.
 * - Tag => family (its folder, named after its main tag):  the tag itself (`ui-button`) or its singular
 *   (`ui-buttons`), a content part (`ui-header` => `ui-parts`, from `PART_NOUNS`), a family-prefixed sub-tag
 *   (`ui-breadcrumb-section`, `ui-placeholder-line`), or `EXTRA_TAGS`.
 * - Imports source through the `$` alias, so the site always shows the working tree, not a build.
 */
const MODULES = import.meta.glob("$/ui/components/*/index.ts")

/** Family folder (`ui-button`) => loader for `src/components/ui-<family>/index.ts`. */
const FAMILIES = new Map<string, () => Promise<unknown>>()
for (const [path, load] of Object.entries(MODULES)) {
  const family = /\/components\/([^/]+)\/index\.ts$/.exec(path)?.[1]
  if (family) FAMILIES.set(family, load)
}

/** Tags a family defines besides `ui-<family>` / `ui-<family>s` / `ui-<family>-*` / the parts, => its folder. */
const EXTRA_TAGS: Record<string, string> = {
  "ui-or": "ui-button",
  "ui-row": "ui-grid",
  "ui-column": "ui-grid",
  "ui-textarea": "ui-input",
  "ui-radio": "ui-checkbox",
  "ui-field": "ui-form",
  "ui-fields": "ui-form",
  "ui-event": "ui-feed",
  "ui-pushable": "ui-sidebar",
  "ui-pusher": "ui-sidebar",
  "ui-side": "ui-shape"
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
 * - `ui-buttons` => `ui-button`
 * - `ui-header` => `ui-parts`
 * - `ui-placeholder-line` => `ui-placeholder`
 */
function familyOf(tag: string): string {
  const name = tag.slice("ui-".length)
  if (FAMILIES.has(tag)) return tag
  if (tag.endsWith("s") && FAMILIES.has(tag.slice(0, -1))) return tag.slice(0, -1)
  if ((PART_NOUNS as readonly string[]).includes(name)) return "ui-parts"
  if (EXTRA_TAGS[tag]) return EXTRA_TAGS[tag]
  const prefix = `ui-${name.split("-")[0]}`
  return FAMILIES.has(prefix) ? prefix : ""
}
