/**
 * Entry of `spell-ui.js`, the ONE classic script a `.html` doc loads -- `file://` blocks ES modules.
 * - Built by `node scripts/bundle-spell-ui.js` (part of `yarn docs:update`);  edit THIS, never the bundle.
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
 */

import "spell-ui:icons"
import "spell-ui:emoji"
import "@spell-app/ui"
import "spell-ui:lazy"
import "./spell-ui-sources.js"
import "./spell-doc-runtime.js"
import { defineSite } from "$/server/site"

export { UI } from "@spell-app/ui"

defineSite()
