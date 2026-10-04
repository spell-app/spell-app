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
 * and the docs index lists them).
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
  { name: "App", path: "/editor/", serverOnly: true, ownTab: true, match: (path) => /^\/editor(\/|$)/.test(path) }
]

/** `localStorage` key of the chosen color scheme:  `light`, `dark`, or absent for the OS's. */
export const THEME_KEY = "spell-site:theme"

/** `sessionStorage` key:  edit mode on for this tab. */
export const EDIT_KEY = "spell-site:edit"
