/**
 * Entry of the COMPONENT SETS' build of the site, `site/_assets/sets/site.js` (+ `site.css`):  the one script a page of
 * Epic UI, App UI or the brand's set loads (`COMPONENT_SETS` in `$/server/page`, epic `epic-workflow` P10;  served at
 * `/components/<set>/` since epic `people-and-orgs` P18).
 * - The page server serves this folder as a set's `_assets/` (`/components/epics/_assets/site.js`), so a set's page links
 *   `_assets/site.js` as a Spell UI page does, and the site takes the set's folder as its root.
 * - Spell UI's own site (`site.ts`), plus `SitePacks`:  `globalThis.SpellUI`, so a component pack's script registers
 *   and shares this page's Solid and Spell UI.  Its own build (`vite.site.config.ts`, mode `sets`), so Spell UI's
 *   pages never pay for the whole modules it keeps.
 * - In import order:  the examples' snapshot first (before anything upgrades), `SpellUI`, then the site.
 */
import "./snapshot"
import "./SitePacks"
import "./site"
