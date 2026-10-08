/**
 * Types of the site header and section editor, plus the list of properties they switch between.
 * - Browser code:  no node imports.
 */

/**
 * One PROPERTY of the site:  a part with its own home page, switched between in the site header.
 * - `path`:  home page, relative to the repo root (`pages/index.html`), or server-absolute (`/ui/`)
 * - `serverOnly`:  only exists when served by the page server (`/ui/`:  the shared pages with the branch's built
 *   bundle laid over them, `UI_SITE`;  `/editor/` is the app)
 * - `ownTab`:  always opens in its own browser tab (`target`), never in place:  the app is a whole program, too big
 *   for VS Code's side bar, and a frame that left the page server can't step back (`liveClient.ts`)
 * - `match`:  whether a page path (`location.pathname`) belongs to this property;  the FIRST match wins
 */
export type SiteProperty = {
  name: string
  path: string
  serverOnly?: boolean
  ownTab?: boolean
  match: (path: string) => boolean
}

/**
 * The docs home, relative to the repo root:  a routing page, a card per property (claude-design P5).  The header's
 * Spell logo goes there;  no tab is lit on it.
 */
export const SITE_HOME = "pages/index.html"

/**
 * Every property, in header order (Owen, 2026-10-05, Q6 of epic `claude-design`):  Epics · Guides · Brand · Spell UI
 * · Templates · Goals · App.  The home's cards are in the same order (`packages/docs/tools/index.js` `areaCards()`).
 * - each docs area lights on its own pages (`docsArea()`):  a plan doc Epics, a guide Guides, a template (the plan
 *   template under `templates/epics/` too) Templates;  the home and the scratch details pages, none
 * - each area's list page is its tab's home (`<area>/index.html`)
 */
export const PROPERTIES: SiteProperty[] = [
  { name: "Epics", path: "epics/index.html", match: (path) => docsArea(path) === "epics" },
  { name: "Guides", path: "guides/index.html", match: (path) => docsArea(path) === "guides" },
  // Brand:  the shared `brand/` pages, moved from `packages/brand` (claude-design P11);  its home is the Brand index
  { name: "Brand", path: "brand/index.html", match: (path) => docsArea(path) === "brand" },
  {
    name: "Spell UI",
    path: "/ui/",
    serverOnly: true,
    match: (path) => /^(?:\/worktrees\/[^/]+)?\/ui(\/|$)|\/packages\/ui\/site\//.test(path)
  },
  { name: "Templates", path: "templates/index.html", match: (path) => docsArea(path) === "templates" },
  { name: "Goals", path: "goals/index.html", match: (path) => docsArea(path) === "goals" },
  { name: "App", path: "/editor/", serverOnly: true, ownTab: true, match: (path) => /^\/editor(\/|$)/.test(path) }
]

/** A docs area:  a root folder of the checkout (each a link into the shared content repo) with a tab of its own. */
export type DocsArea = "epics" | "guides" | "brand" | "templates" | "goals"

/**
 * Which docs area page path `path` (`location.pathname`:  served, or a `file://` path) is in;  `undefined` for the
 * home (`pages/`) and anything else.
 * - the area is the FIRST area folder in the path:  `templates/epics/plan.html` is a template, not an epic
 * - a worktree's page served from the main checkout (`/worktrees/<w>/...`) or opened from disk
 *   (`.claude/worktrees/<w>/...`):  from inside the worktree, so a worktree named `goals` isn't the Goals area
 * - older checkouts' paths still land:  `packages/docs/content/<x>` (2026-10-04 .. 10-05) and `packages/docs/<x>`
 *   (before):  `epics/` (or `plans/`) Epics, `templates/` Templates, the home and `details/` none, the rest Guides
 * - any other package's files (`packages/ui/...`):  none
 */
export function docsArea(path: string): DocsArea | undefined {
  const inside = path.replace(/^.*\/worktrees\/[^/]+(?=\/)/, "")
  const old = /\/packages\/docs\/(?:content\/)?(.*)$/.exec(inside)
  if (old) {
    const first = old[1]!.split("/")[0]!
    if (first === "epics" || first === "plans") return "epics"
    if (first === "templates") return "templates"
    if (!first || first === "index.html" || first === "details" || first === "tools") return undefined
    return "guides"
  }
  if (/\/packages\//.test(inside)) return undefined
  return /\/(epics|guides|brand|templates|goals)\//.exec(inside)?.[1] as DocsArea | undefined
}

/**
 * `localStorage` key of the chosen color scheme:  `light`, `dark`, or absent for the OS's.
 * - ONE key for every doc site:  Spell UI's `ThemePreference` reads and writes it too, as
 *   `DOCS_LOOK_KEYS.scheme` (`packages/ui/src/docs-components/docs-components.types.ts`), so a switch on one site
 *   holds on the others.  MUST stay equal:  `ui`'s `UIDocsThemes.test.tsx` pins it.
 */
export const SCHEME_KEY = "spell-site:scheme"

/**
 * Keys the scheme lived under before `SCHEME_KEY` (2026-10-04):  read once while `SCHEME_KEY` is absent, copied to
 * it, then removed.  First valid one wins.
 * - `spell-site:theme`:  this header's
 * - `spell-ui-site:scheme`:  Spell UI's site
 * - MUST equal `DOCS_LEGACY_SCHEME_KEYS` in `ui`'s `docs-components.types.ts`
 */
export const LEGACY_SCHEME_KEYS = ["spell-site:theme", "spell-ui-site:scheme"] as const

/** Media query of the OS's dark scheme:  what an absent `SCHEME_KEY` follows. */
export const DARK_QUERY = "(prefers-color-scheme: dark)"

/** A color scheme a page shows. */
export type SiteScheme = "light" | "dark"

/**
 * Classes on `<html>` that force a scheme:  Spell UI's (`ThemePreference`), which the site header sets too, and so
 * does a page with its own light / dark switch (Spell App's pill).
 */
export const SCHEME_CLASSES = { light: "ui-light", dark: "ui-dark" } as const satisfies Record<SiteScheme, string>

/**
 * The scheme `classes` (`<html>`'s) force, or `undefined` when neither class is on (the page follows the OS).
 * - Why:  the site header's sun / moon shows what the page SHOWS, also when the page switched it itself.
 */
export function forcedScheme(classes: { contains(token: string): boolean }): SiteScheme | undefined {
  if (classes.contains(SCHEME_CLASSES.dark)) return "dark"
  if (classes.contains(SCHEME_CLASSES.light)) return "light"
  return undefined
}

/** `sessionStorage` key:  edit mode on for this tab. */
export const EDIT_KEY = "spell-site:edit"
