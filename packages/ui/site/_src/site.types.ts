/**
 * Constants the site bundle's glue (`SiteShell`, `SiteRouter`, `SiteSections`) shares -- and the site's checks
 * (`tools/SiteCheck.ts`), which is why they live here.
 * - Pure data, at the bottom of the folder's imports:  no imports at all, so a node tool loads it by path without
 *   pulling in the browser code beside it.
 */

/** The page's own content box:  what a page file holds besides its `<head>`, and what the router swaps. */
export const PAGE_MAIN = "main#main"

/** `localStorage` key prefix of a page's folds (`SiteSections`), + the page's path:  `{ [section id]: folded }`. */
export const FOLDS_KEY = "spell-ui-site:folds:"
