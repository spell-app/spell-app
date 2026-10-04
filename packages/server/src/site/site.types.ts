/**
 * Types of the site header and section editor, plus the list of properties they switch between.
 * - Browser code:  no node imports.
 */

/**
 * One PROPERTY of the site:  a part with its own home page, switched between in the site header.
 * - `path`:  home page, relative to the repo root (`packages/docs/index.html`), or server-absolute (`/ui/`)
 * - `serverOnly`:  only exists when served by the page server (`/ui/` is `packages/ui/site/`, mounted there;  `/editor/` is the app)
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
 * Every property, in header order (Owen, 2026-10-03:  Goals before Spell UI;  no Epics tab:  plan docs are docs,
 * and the docs index lists them.  2026-10-04:  Brand between Spell UI and App, epic `design-system`).
 * - Brand:  `packages/brand`, Claude Design's pages and their Spell UI copies;  a repo path like Docs and Goals, so
 *   it works from `file://` too
 */
export const PROPERTIES: SiteProperty[] = [
  { name: "Docs", path: "packages/docs/index.html", match: (path) => /\/packages\/docs\//.test(path) },
  { name: "Goals", path: "goals/index.html", match: (path) => /\/goals\//.test(path) },
  {
    name: "Spell UI",
    path: "/ui/",
    serverOnly: true,
    match: (path) => /^\/ui(\/|$)|\/packages\/ui\/site\//.test(path)
  },
  { name: "Brand", path: "packages/brand/index.html", match: (path) => /\/packages\/brand\//.test(path) },
  { name: "App", path: "/editor/", serverOnly: true, ownTab: true, match: (path) => /^\/editor(\/|$)/.test(path) }
]

/**
 * `localStorage` key of the chosen color scheme:  `light`, `dark`, or absent for the OS's.
 * - ONE key for every doc site:  Spell UI's `ThemePreference` reads and writes it too, as
 *   `DOCS_LOOK_KEYS.scheme` (`packages/ui/src/docs-components/docs-components.types.ts`), so a switch on one site
 *   holds on the others.  MUST stay equal:  `ui`'s `ui-docs-themes.test.tsx` pins it.
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

/** `sessionStorage` key:  edit mode on for this tab. */
export const EDIT_KEY = "spell-site:edit"
