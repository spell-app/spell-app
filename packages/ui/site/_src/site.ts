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
 *   3. `<ui-root>`:  every OTHER family, `<ui-docs-*>` included, is a lazy chunk it imports on first use
 *   4. `SiteData`, `BuiltInPacks`:  pointed at `_data/components.json` and `_assets/icon-packs/` from THIS file's
 *      URL, so a page at any depth finds them
 *   5. `ThemePreference.restore()`:  the viewer's theme and colour scheme, re-applied (the scheme already was, by
 *      the page's inline `<head>` script, `ThemePreference.HEAD_SCRIPT`);  `$/ui/styles` loads only if a theme is set
 *   6. `defineSite()`:  the `<spell-site-header>` bar shared by every page the page server serves
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

import "$/ui/components/ui-root"

/** This bundle's folder, `.../_assets/`:  a string slice, NOT `new URL(".", import.meta.url)` (Vite would inline it). */
const ASSETS = import.meta.url.slice(0, import.meta.url.lastIndexOf("/") + 1)

BuiltInPacks.base = ASSETS
SiteData.url ??= `${ASSETS}../_data/components.json`
Object.assign(globalThis, { UI })

// the viewer's theme + scheme (`<ui-docs-themes>`):  started NOW, so the theme's chunk loads beside the families'
void ThemePreference.restore()

defineSite()
