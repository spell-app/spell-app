/**
 * Types of the site header and section editor, plus the list of properties they switch between.
 * - Browser code:  no node imports.
 */

/**
 * One PROPERTY of the site:  a part with its own home page, switched between in the site header.
 * - `path`:  home page, relative to the repo root (`pages/index.html`), or server-absolute (`/components/ui/`)
 * - `serverOnly`:  only exists when served by the page server
 *   - `/components/<set>/`:  a component set's `docs/` folder,
 *     with Spell UI's site bundle laid over it (`COMPONENT_SETS`)
 *   - `/editor/`:  the app
 * - `ownTab`:  always opens in its own browser tab (`target`), never in place
 *   - the app is a whole program, too big for VS Code's side bar
 *   - a frame that left the page server can't step back (`liveClient.ts`)
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
 * The home page, relative to the repo root:  a routing page, a card per property (claude-design P5).
 * - the header's Spell logo goes there;  no tab is lit on it
 */
export const SITE_HOME = "pages/index.html"

/**
 * Every property, in header order (Owen, 2026-10-11, epic `epic-workflow` J40):
 * Guides · Goals · Epics · Epic/UI · Spell/UI · App · App/UI · Brand · Templates.
 * - Owen's words:  "Docs toolbar:  Guides Goals Epics Epic/UI Spell/UI App App/UI";
 *   asked where Brand and Templates go, "At the end"
 * - the slashed names are the tab labels as he typed them (J41):  "the UI set of Epic", "of Spell", "of the app";
 *   prose keeps "Epic UI", "Spell UI", "App UI"
 * - (before, claude-design Q6, 2026-10-05:  Epics · Guides · Brand · Spell UI · Templates · Goals · App)
 * - the home's cards are in the same order (`packages/epics/tools/index.js` `areaCards()`)
 * - each docs area's tab lights on its own pages (`docsArea()`):
 *   - an epic page:  Epics
 *   - a guide:  Guides
 *   - a template (the plan template under `templates/epics/` too):  Templates
 *   - the home and the scratch details pages:  none
 * - each area's list page is its tab's home (`<area>/index.html`)
 * - the component sets light on their address and on their `docs/` folder's long one (`componentSet()`)
 *   - `COMPONENT_SETS` in `$/server/page`, served at `/components/<set>/` (epic `people-and-orgs` P18)
 *   - the brand's set has no tab of its own:  it lights Brand, beside the Brand tab's own pages
 * - App means the editor, opened in its own browser tab
 */
export const PROPERTIES: SiteProperty[] = [
  { name: "Guides", path: "guides/index.html", match: (path) => docsArea(path) === "guides" },
  { name: "Goals", path: "goals/index.html", match: (path) => docsArea(path) === "goals" },
  { name: "Epics", path: "epics/index.html", match: (path) => docsArea(path) === "epics" },
  { name: "Epic/UI", path: "/components/epics/", serverOnly: true, match: (path) => componentSet(path) === "epics" },
  // Spell UI's site bundle's own folder too (`packages/ui/site/`)
  {
    name: "Spell/UI",
    path: "/components/ui/",
    serverOnly: true,
    match: (path) => componentSet(path) === "ui" || /\/packages\/ui\/site\//.test(path)
  },
  { name: "App", path: "/editor/", serverOnly: true, ownTab: true, match: (path) => /^\/editor(\/|$)/.test(path) },
  { name: "App/UI", path: "/components/app/", serverOnly: true, match: (path) => componentSet(path) === "app" },
  // Brand:  the shared `brand/` pages, moved from `packages/brand` (claude-design P11);  its home is the Brand index.
  // And the brand's element set, `/components/brand/`
  {
    name: "Brand",
    path: "brand/index.html",
    match: (path) => docsArea(path) === "brand" || componentSet(path) === "brand"
  },
  { name: "Templates", path: "templates/index.html", match: (path) => docsArea(path) === "templates" }
]

/**
 * Which component set page path `path` is in (`location.pathname`);  `undefined` for anything else.
 * - by its served address, `/components/<set>/` (a worktree's too, `/worktrees/<w>/components/<set>/`)
 * - or by its folder's long one, `packages/<package>/docs/` (a `file://` page too)
 * - the sets:  `ui`, `epics`, `app`, `brand`, as `COMPONENT_SETS` in `$/server/page` names them
 *   (its prefixes' tails, and their packages:  `docs/` of `packages/ui`, `packages/epics` ...)
 */
export function componentSet(path: string): string | undefined {
  return (
    /^(?:\/worktrees\/[^/]+)?\/components\/([^/]+)(?:\/|$)/.exec(path)?.[1] ??
    /\/packages\/(ui|epics|app|brand)\/docs\//.exec(path)?.[1]
  )
}

/** A docs area:  a root folder of the checkout (each a link into the shared content repo) with a tab of its own. */
export type DocsArea = "epics" | "guides" | "brand" | "templates" | "goals"

/**
 * Which docs area page path `path` is in (`location.pathname`:  served, or a `file://` path).
 * `undefined` for the home (`pages/`) and anything else.
 * - the area is the FIRST area folder in the path:  `templates/epics/plan.html` is a template, not an epic
 * - a worktree's page, served from the main checkout (`/worktrees/<w>/...`) or opened from disk
 *   (`.claude/worktrees/<w>/...`):  read from inside the worktree,
 *   so a worktree named `goals` isn't the Goals area
 * - older checkouts' paths still land:
 *   `packages/docs/content/<x>` (2026-10-04 .. 10-05) and `packages/docs/<x>` (before)
 *   - `epics/` (or `plans/`):  Epics
 *   - `templates/`:  Templates
 *   - the home and `details/`:  none
 *   - the rest:  Guides
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
  // a component set's address (`/components/epics/`) or folder:  its own tab (`componentSet()`)
  if (/\/packages\//.test(inside) || /^\/components\//.test(inside)) return undefined
  return /\/(epics|guides|brand|templates|goals)\//.exec(inside)?.[1] as DocsArea | undefined
}

/**
 * `localStorage` key of the chosen color scheme:  `light`, `dark`, or absent for the OS's.
 * - ONE key for every doc site, so a switch on one site holds on the others:
 *   Spell UI's `ThemePreference` reads and writes it too, as `DOCS_LOOK_KEYS.scheme`
 *   (`packages/ui/src/docs-components/docs-components.types.ts`)
 * - MUST stay equal:  `ui`'s `UIDocsThemes.test.tsx` pins it
 */
export const SCHEME_KEY = "spell-site:scheme"

/**
 * Keys the scheme lived under before `SCHEME_KEY` (2026-10-04).
 * Read once while `SCHEME_KEY` is absent, copied to it, then removed;  the first valid one wins.
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
 * Classes on `<html>` that force a scheme:  Spell UI's (`ThemePreference`).
 * - the site header sets them too, and so does a page with its own light / dark switch (Spell App's pill)
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
