/**
 * Entry of `spell-ui.js`, the ONE classic script a `.html` doc loads -- `file://` blocks ES modules.
 * - Built by `node scripts/bundle-spell-ui.js` (part of `yarn docs:update`);  edit THIS, never the bundle.
 * - `@spell/ui` ~== UI's built `dist/index.js`:  every family, each `define()`s its tags as it's imported.
 *   Solid and `@spell/solid-element` come from UI's `node_modules`, so there's exactly one copy.
 * - Order matters -- imports run top to bottom:
 *   - `spell-ui:icons` FIRST:  a module the bundler writes, registering the icons our widgets and pages draw
 *     with `UI.icons` before any element asks for one (a classic script can't load UI's icon packs)
 *   - then UI, which defines -- and so upgrades -- every `ui-*` already in the page
 *   - then the page runtime, with every tag defined
 * - Exports become `window.SpellUI` (`UI`), for the page runtime's checks and for poking in DevTools.
 */

import "spell-ui:icons"
import "@spell/ui"
import "./spell-doc-runtime.js"

export { UI } from "@spell/ui"
