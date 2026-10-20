/**
 * Lets a page of ANY component set load component packs (`<ui-components source="x.pack.js">`):  `globalThis.SpellUI`,
 * what a pack's classic script calls `registerPack()` on and takes its shared modules from (`packModules`), as the
 * docs bundle gives them (`spell-epic/src/tools/_assets/spell-ui.entry.js`).
 * - Why:  every set's pages (the page server's `componentSets` setting:  Spell UI's at `/components/ui/`, Epic UI's at
 *   `/components/epics/`, App UI's at `/components/app/`, the brand's at `/components/brand/`) load the epics pack,
 *   `epics.pack.js`, whose `<epic-thread>` and `<epic-comment-pane>` draw the comments (epic `epic-engine`);  and the
 *   other sets draw their live examples with a pack's elements (`<epic-*>`, the app's `spell.pack.js`).
 * - In the site's ONE build (`site.ts`), every set's, since epic `epic-engine`:  every module here stays WHOLE (a pack
 *   may use any export), so a page's eager script grows:  Spell UI's 305 KB => 555 KB (79 => 155 KB gzipped,
 *   2026-10-20).  Until then only the other sets' own build of the site had it (`sets.ts`, `site/_assets/sets/`, epic
 *   `epic-workflow` P10), to spare Spell UI's pages that;  once they loaded the epics pack for the comments they needed
 *   it too, and the two builds were the same.
 * - `import * as` the Solid packages, against "One Solid per page" in `packages/ui/AGENTS.md`, on purpose and ONLY
 *   here and in the docs bundle.
 * - SIDE EFFECT:  sets `globalThis.SpellUI`;  listed in `package.json`'s `sideEffects`, or the bundler drops it.
 * - `packModules` MUST name the pack build's externals (`PACK_MODULES` in `tools/ComponentPack.ts`).
 *   - Also `@solidjs/h` and `ui-root`, as the docs bundle's:  the app's element bundles (`/element/spell.pack.js`,
 *     App UI's live `<spell-app>`) take the page's Solid only when ALL their shared modules are here
 *     (`spell-solid-shared.js`, app's `vite.solid.config.ts`), else they'd load a second one.
 * - A pack's elements draw Spell UI's in their shadow roots (`<epic-phase>`'s `<ui-section>`), which the root never
 *   sees:  so a pack's `define()` waits for EVERY Spell UI family first (`$/ui`), as the docs bundle has them.  Only
 *   then, after the root is in, so it never defines the root early.
 *   - `ui-root` arrives later, from the site entry (`site.ts`), once it imports it:  importing it defines
 *     `<ui-root>`, which the site does only once its layout and theme are in.  A pack's script comes a network round
 *     trip after the root asks for it, by when it's in the map.
 * - The code and markdown families join the map then too (`shareFamilies()`), as a pack's `define()` starts:
 *   the app's `<spell-code>` and `<spell-markdown>` extend them (`spell-ui-shared.js`, app's `vite.solid.config.ts`),
 *   so on App UI's pages they extend the page's own.
 */
import * as solidH from "@solidjs/h"
import * as solidWeb from "@solidjs/web"
import * as solid from "solid-js"
import * as uiCore from "$/ui/core"
import * as uiForms from "$/ui/forms"
import type { ComponentPack } from "$/ui/components/ui-components/UIComponents.types"
import { registerPack } from "$/ui/components/ui-components/ComponentPacks"

/**
 * What a pack imports, by the specifier its build leaves external => the page's copy of that module.
 * - `$/spell-element`:  Spell UI's core module, which carries all of it (`$/ui/core` re-exports it):  one per page.
 * - REFACTOR: `$/spell-solid` too, spell-element's name until epic `repo-split` P3:  the epics pack, which every set's
 *   layout loads, reads it until spell-epic follows the rename (that epic's T6).  Delete it then.
 */
const packModules: Record<string, unknown> = {
  "solid-js": solid,
  "@solidjs/web": solidWeb,
  "@solidjs/h": solidH,
  "$/spell-element": uiCore,
  "$/spell-solid": uiCore,
  "$/ui/core": uiCore,
  "$/ui/forms": uiForms
}

/**
 * `registerPack()`, its `define()` after every Spell UI family's:  the ones its elements draw in their shadow roots.
 * - The families a pack's elements may EXTEND join `packModules` first (`shareFamilies()`).
 */
function registerWithFamilies(pack: ComponentPack): void {
  registerPack({ ...pack, define: () => import("$/ui").then(shareFamilies).then(() => pack.define()) })
}

/** Put the families a pack's elements may extend in `packModules`, by their specifiers. */
async function shareFamilies(): Promise<void> {
  const [code, markdown] = await Promise.all([import("$/ui/components/ui-code"), import("$/ui/components/ui-markdown")])
  packModules["$/ui/components/ui-code"] = code
  packModules["$/ui/components/ui-markdown"] = markdown
}

const spellUI = (globalThis as { SpellUI?: object }).SpellUI
Object.assign(globalThis, { SpellUI: { ...spellUI, UI: uiCore.UI, registerPack: registerWithFamilies, packModules } })
