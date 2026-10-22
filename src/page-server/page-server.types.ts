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
 * moved here from `spell-kit/server/page`, epic `repo-split` P6).
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
 * TEMPORARY (until the merge, epic `people-and-orgs` T3):  what that epic moved OUT of the shared folders into its
 * packages, as URL paths.  The shared repo still holds them for the other checkouts, so the root mount would serve
 * them:  here they answer "not found", as they will everywhere once it merges (Q30).
 * - `/ui`:  Spell UI's docs, now `/components/ui/` (`spell-ui/docs/`)
 * - `/brand/components`:  the brand elements' docs, now `/components/brand/` (`spell-brand/docs/`)
 */
export const MOVED_OUT = ["/ui", "/brand/components"]
