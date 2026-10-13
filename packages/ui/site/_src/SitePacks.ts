/**
 * Lets a page of a COMPONENT SET load component packs (`<ui-components source="x.pack.js">`):  `globalThis.SpellUI`,
 * what a pack's classic script calls `registerPack()` on and takes its shared modules from (`packModules`), as the
 * docs bundle gives them (`packages/epics/tools/_assets/spell-ui.entry.js`).
 * - Why:  the component sets' pages (Epic UI at `/epic-ui/`, App UI at `/app-ui/`:  `COMPONENT_SETS` in
 *   `$/server/page`) load Spell UI's site, and draw their live examples with a pack's elements (`epics.pack.js`'s
 *   `<epic-*>`, the app's `spell.pack.js`).
 * - ONLY in the sets' build of the site (`sets.ts`, `site/_assets/sets/`), never in Spell UI's own:  every module
 *   here stays WHOLE (a pack may use any export), and in one build with Spell UI's pages that cost them +118 KB
 *   (36 KB gzipped) as a static import, more as `import()`s (measured 2026-10-12, epic `epic-workflow` P10).
 * - `import * as` the Solid packages, against "One Solid per page" in `packages/ui/AGENTS.md`, on purpose and ONLY
 *   here and in the docs bundle.
 * - SIDE EFFECT:  sets `globalThis.SpellUI`;  listed in `package.json`'s `sideEffects`, or the bundler drops it.
 * - `packModules` MUST name the pack build's externals (`PACK_MODULES` in `packages/cli/src/dev/packBuild.ts`).
 *   - Also `@solidjs/h` and `ui-root`, as the docs bundle's:  the app's element bundles (`/element/spell.pack.js`,
 *     App UI's live `<spell-app>`) take the page's Solid only when ALL their shared modules are here
 *     (`spell-solid-shared.js`, app's `vite.solid.config.ts`), else they'd load a second one.
 * - A pack's elements draw Spell UI's in their shadow roots (`<epic-phase>`'s `<ui-section>`), which the root never
 *   sees:  so a pack's `define()` waits for EVERY Spell UI family first (`$/ui`), as the docs bundle has them.  Only
 *   then, after the root is in, so it never defines the root early.
 *   - `ui-root` arrives later, from the site entry (`site.ts`), once it imports it:  importing it defines
 *     `<ui-root>`, which the site does only once its layout and theme are in.  A pack's script comes a network round
 *     trip after the root asks for it, by when it's in the map.
 */
import * as solidH from "@solidjs/h"
import * as solidWeb from "@solidjs/web"
import * as solid from "solid-js"
import * as uiCore from "$/ui/core"
import * as uiForms from "$/ui/forms"
import type { ComponentPack } from "$/ui/components/ui-components/UIComponents.types"
import { registerPack } from "$/ui/components/ui-components/ComponentPacks"

/** What a pack imports, by the specifier its build leaves external => the page's copy of that module. */
const packModules: Record<string, unknown> = {
  "solid-js": solid,
  "@solidjs/web": solidWeb,
  "@solidjs/h": solidH,
  "$/ui/core": uiCore,
  "$/ui/forms": uiForms
}

/** `registerPack()`, its `define()` after every Spell UI family's:  the ones its elements draw in their shadow roots. */
function registerWithFamilies(pack: ComponentPack): void {
  registerPack({ ...pack, define: () => import("$/ui").then(() => pack.define()) })
}

const spellUI = (globalThis as { SpellUI?: object }).SpellUI
Object.assign(globalThis, { SpellUI: { ...spellUI, UI: uiCore.UI, registerPack: registerWithFamilies, packModules } })
