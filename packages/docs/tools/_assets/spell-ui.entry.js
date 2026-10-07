/**
 * Entry of `spell-ui.js`, the ONE classic script a `.html` doc loads -- `file://` blocks ES modules.
 * - Built by `node scripts/bundle-spell-ui.js` (part of `spell dev docs update`);  edit THIS, never the bundle.
 * - `@spell-app/ui` ~== UI's built `dist/index.js`:  every family, each `define()`s its tags as it's imported.
 *   Solid and `@spell-app/solid-element` come from UI's `node_modules`, so there's exactly one copy.
 * - Order matters -- imports run top to bottom:
 *   - `spell-ui:icons` FIRST:  a module the bundler writes, registering the icons our widgets and pages draw
 *     with `UI.icons` before any element asks for one (a classic script can't load UI's icon packs)
 *   - then UI, which defines -- and so upgrades -- every `ui-*` already in the page
 *   - then `spell-ui:lazy`, pointing `<ui-code>` / `<ui-markdown>`'s engine loaders at their lazy scripts (before
 *     any element highlights:  that waits for `UI.load()`), and the source elements' saver (`spell-ui-sources.js`)
 *   - then the page runtime, with every tag defined
 *   - then the site header (`$/server/site`):  `defineSite()` runs once every import has, so `<spell-site-header>`
 *     upgrades -- and sets `--spell-site-header-height` -- before the runtime first measures its sticky offsets
 *     (the runtime waits for the `ui-*` definitions first)
 * - `$/...` aliases resolve through esbuild's own tsconfig `paths` support:  `packages/docs/tsconfig.json` extends
 *   the root's `tsconfig.base.json`.
 * - Exports become `window.SpellUI` (`UI`), for the page runtime's checks and for poking in DevTools.
 * - Component packs (epic `epic-components`):  `<ui-components source="x.pack.js">` in a `<ui-root>` loads a pack's
 *   classic script, which calls `SpellUI.registerPack(pack)` and imports the modules it shares with the page from
 *   `SpellUI.packModules` (`spell dev pack build` maps each of their specifiers there), so a pack never brings a
 *   second Solid or Spell UI.
 *   - `packModules` is the EXACT specifier a pack's build leaves external => that module's namespace.  Add one here
 *     AND to the pack build's externals, together.
 *   - `import * as` a Solid package, against `packages/ui/AGENTS.md` ("One Solid per page"), on purpose and ONLY
 *     here:  that rule keeps a library's bundles from pinning all of Solid, but this map exists so a pack can use any
 *     export, which no tree-shaker can know ahead.  So the whole of `solid-js` / `@solidjs/web` stays in this bundle
 *     (`ui`'s own code never holds such a map).
 * - The look:  UI's `spell-brand` theme (the Spell brand as Claude Design drew it), on every page, applied as soon
 *   as the bundle runs (epic `design-system`, P9;  `spell` before, which stays as it is for everything else).
 *   Its sheet is inlined like every other `import()`, so it registers a few microtasks after the bundle runs, not
 *   a network round trip later.  It ships no font files:  its serif is an installed Palatino, else `serif`.
 *   - it adds the brand's roles (`--spell-surface-warm`, `--spell-type-lede` ...), which `spell-doc.css` and the
 *     other docs sheets read for eyebrows, ledes, asides and panels
 */

import "spell-ui:icons"
import "spell-ui:emoji"
import { ThemeSheets } from "@spell-app/ui"
import * as solidWeb from "@solidjs/web"
import * as solid from "solid-js"
import * as uiCore from "@spell-app/ui/core"
import * as uiForms from "@spell-app/ui/forms"
import "spell-ui:lazy"
import "./spell-ui-sources.js"
import "./spell-doc-runtime.js"
import { defineSite } from "$/server/site"

export { UI, registerPack } from "@spell-app/ui"

/** What a component pack imports, by the specifier its build leaves external => the page's copy of that module. */
export const packModules = Object.freeze({
  "solid-js": solid,
  "@solidjs/web": solidWeb,
  "$/ui/core": uiCore,
  "$/ui/forms": uiForms
})

void ThemeSheets.apply("spell-brand")
defineSite()
