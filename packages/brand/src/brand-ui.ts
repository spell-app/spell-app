/**
 * Entry of the brand pages' bundle, `_assets/ui/brand-ui.js` (+ `brand-ui.css`):  the ONE script a `.spell.html`
 * page loads.
 * - Built by `yarn build` here (`scripts/build.ts`, config `vite.config.ts`) into `_assets/ui/`, COMMITTED:  viewing
 *   a page needs no build step.  Edit THIS (and the sources), never `_assets/ui/`.
 * - A page in `spell-design-system/` loads it as:
 *     <link rel="stylesheet" href="../_assets/ui/brand-ui.css">
 *     <script type="module" src="../_assets/ui/brand-ui.js"></script>
 *   An ES module:  from the page server, not `file://` (judgement J4).
 * - What it holds, in import order (ES modules evaluate top to bottom):
 *   0. `./hues`:  the brand's `accent` hue, added to Spell UI's `hues` before any element is defined
 *   1. the page CSS:  `@spell-app/ui`'s foundation (`ui.css`:  layers, tokens, reset, typography, native markup),
 *      extracted to `brand-ui.css`
 *   2. `BuiltInPacks`:  pointed at `_assets/ui/icon-packs/` (a symlink to ui's packs) from THIS file's URL, so
 *      every Font Awesome 7 icon draws, offline
 *   3. every `ui-*` family (`$/ui`) and every `ui-brand-*` element (`$/brand/components`), defined at once:  brand
 *      pages are small and use many families
 *   4. the `spell-brand` theme (`ThemeSheets.apply`), then the site header (`defineSite()`)
 * - Lazy, by `import()`:  the runtime, the theme sheets, `<ui-code>`'s and `<ui-markdown>`'s engines, emoji names.
 * - `window.UI`:  the runtime, for poking in DevTools.
 */
import "./hues"
import "$/ui/styles/ui.css"

import { BuiltInPacks } from "$/ui/icons"
import { UI } from "$/ui/runtime"
import { ThemeSheets } from "$/ui/styles"
import { defineSite } from "$/server/site"

import "$/ui"
import "$/brand/components"

/** This bundle's folder, `.../_assets/ui/`:  a string slice, NOT `new URL(".", import.meta.url)` (Vite would inline it). */
const ASSETS = import.meta.url.slice(0, import.meta.url.lastIndexOf("/") + 1)

BuiltInPacks.base = ASSETS
Object.assign(globalThis, { UI })

void ThemeSheets.apply("spell-brand")
defineSite()
