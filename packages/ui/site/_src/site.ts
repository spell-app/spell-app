/**
 * Entry of the Spell UI site's bundle, `site/_assets/site.js` (+ `site.css`):  the ONE script every page loads.
 * - Built by `yarn site:bundle` (`scripts/site-bundle.ts`, config `vite.site.config.ts`) into `site/_assets/`,
 *   COMMITTED:  viewing a page needs no build step.  Edit THIS (and the library source), never `_assets/`.
 * - A page loads it as (paths relative to the page;  `../` from `components/`):
 *     <link rel="stylesheet" href="_assets/site.css">
 *     <script type="module" src="_assets/site.js"></script>
 * - What it holds, in import order (ES modules evaluate top to bottom):
 *   1. `./snapshot`:  every `<ui-docs-example>`'s markup, kept before anything upgrades
 *   2. the page CSS:  `@spell-app/ui`'s foundation (`ui.css`:  layers, tokens, reset, typography, native markup) +
 *      the site's layout glue (`./site.css`) -- extracted to `_assets/site.css`, which the page links
 *   3. `SiteData`, `BuiltInPacks`:  pointed at `_data/components.json` and `_assets/icon-packs/` from THIS file's
 *      URL, so a page at any depth finds them
 *   4. `ThemePreference.restore()`:  the viewer's theme and colour scheme, re-applied (the scheme already was, by
 *      the page's inline `<head>` script, `ThemePreference.HEAD_SCRIPT`);  Spell unless the viewer picked another
 *   5. `defineSite()`:  the `<spell-site-header>` bar shared by every page the page server serves
 *   6. `SiteShell.mount()`:  the page's `main` into the ONE layout, `_parts/layout.html` (fetched)
 *   7. THEN `<ui-root>` (`import()`):  defined only once the layout AND the theme's sheet are in, so its
 *      `display="when-ready"` shows the whole page at once, already themed;  every OTHER family, `<ui-docs-*>` included, is a lazy chunk it imports on first use
 *   8. `SiteRouter`:  links to other pages swap only the `main`, the layout stays
 * - Lazy, by `import()`:  families, the runtime, icon packs (`_assets/icon-packs/`), emoji names, `<ui-code>`'s and
 *   `<ui-markdown>`'s engines, spell's highlighter, the Temporal polyfill.
 * - `window.UI`:  the runtime (`UI.load()` works at once;  the rest after it), for poking in DevTools.
 */
import "./snapshot"

import "$/ui/styles/ui.css"
import "./site.css"

import { BuiltInPacks } from "$/ui/icons"
import { UI } from "$/ui/runtime"
import { SiteData } from "$/ui/docs-components/SiteData"
import { ThemePreference } from "$/ui/docs-components/ThemePreference"
import { defineSite } from "$/server/site"

import { SiteRouter } from "./SiteRouter"
import { SiteShell } from "./SiteShell"

/** This bundle's folder, `.../_assets/`:  a string slice, NOT `new URL(".", import.meta.url)` (Vite would inline it). */
const ASSETS = import.meta.url.slice(0, import.meta.url.lastIndexOf("/") + 1)

/** The site's root (`/ui/`):  the folder above `_assets/`. */
const SITE_ROOT = new URL("../", ASSETS)

BuiltInPacks.base = ASSETS
SiteData.url ??= `${ASSETS}../_data/components.json`
Object.assign(globalThis, { UI })

// the viewer's theme + scheme (`<ui-docs-themes>`):  started NOW, beside the layout's fetch;  `<ui-root>` waits for it
const theme = ThemePreference.restore().catch((error: unknown) => console.warn("Spell UI site:  theme", error))

defineSite()

void SiteShell.mount(SITE_ROOT).then(async (content) => {
  const router = content && new SiteRouter(SITE_ROOT, content)
  router?.followPage()
  // the swaps' landing, for the first page:  saved folds before the sections draw;  the hash once the root is ready
  router?.land(new URL(location.href), undefined, true)
  // the theme's sheet in place BEFORE the root shows the page:  no restyle (and reflow) after first paint
  await theme
  await import("$/ui/components/ui-root")
  router?.start()
})
