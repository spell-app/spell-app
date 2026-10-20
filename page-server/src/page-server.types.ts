/**
 * Constants of spell-app's page server's own route module (`pageServerRoutes`).
 * - MUST stay runtime-light:  values and `import type` only.
 */

/**
 * How long a request for a bundle's file waits for the startup build, in ms (`BundleBuild`),
 * before it's answered as it stands (a 404, while the file is still missing).
 * - each build takes a few seconds (2 s for both on an M-series Mac, 2026-10-07);  a cold `tsx` and vite add some
 */
export const BUNDLE_WAIT_MS = 120_000

/**
 * Code colours (highlight.js) for every docs page, from the repo instead of cdnjs (epic `airplane` P1;
 * moved here from `$/server/page`, epic `repo-split` P6).
 * - `cdn`:  the tag older pages still carry;  a plain, blocking `<script>`
 *   - so a hanging network (plane wifi asking to pay first) held up the page's own scripts behind it,
 *     and the page showed raw markup for tens of seconds
 * - `local`:  the same file (11.9.0), at the docs pages' engine route
 * - `localHighlight()` swaps one for the other on every page
 */
export const HIGHLIGHT_JS = {
  cdn: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js",
  local: "/_epic/assets/highlight.min.js"
} as const

/**
 * Folders the epic engine's files were in before, as URL paths:  old => where they are now (`movedFolderPath()`).
 * - a safety net for a page that still loads the engine from a checkout path, not its routes (`/_epic/...`):
 *   the shared pages were migrated (`epic migrate --step engine-asset-routes`, epic `epic-eject` T13),
 *   but a page made or restored from an older copy may not be
 * - the docs assets:  `packages/docs/tools/_assets` (until `people-and-orgs` P16), `packages/epics/tools/_assets`
 *   (until the switch to spell-epic, `epic-eject` I5), now spell-epic's `src/tools/_assets`
 * - the epics pack:  `packages/epics/pack` (until `people-and-orgs` P18), `packages/epics/components/__pack`,
 *   now spell-epic's `src/components/__pack`
 * - through the checkout's `spell-epic` link (`engineFolder` in `.epic/config.json5`)
 * - Once every page and checkout is past them, they go.
 */
export const MOVED_FOLDERS: readonly (readonly [from: string, to: string])[] = [
  ["/packages/docs/tools/_assets", "/spell-epic/src/tools/_assets"],
  ["/packages/epics/tools/_assets", "/spell-epic/src/tools/_assets"],
  ["/packages/epics/pack", "/spell-epic/src/components/__pack"],
  ["/packages/epics/components/__pack", "/spell-epic/src/components/__pack"]
]

/**
 * TEMPORARY (until the merge, epic `people-and-orgs` T3):  what that epic moved OUT of the shared folders into its
 * packages, as URL paths.  The shared repo still holds them for the other checkouts, so the root mount would serve
 * them:  here they answer "not found", as they will everywhere once it merges (Q30).
 * - `/ui`:  Spell UI's docs, now `/components/ui/` (`packages/ui/docs/`)
 * - `/brand/components`:  the brand elements' docs, now `/components/brand/` (`packages/brand/docs/`)
 */
export const MOVED_OUT = ["/ui", "/brand/components"]
