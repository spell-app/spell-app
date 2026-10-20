/****************
 * ### Pack modules
 * The modules a component pack SHARES with the page, by the keys a page's `SpellUI.packModules` offers them under
 * (`ComponentPack`'s build;  "Component packs" in `packages/ui/AGENTS.md`).
 * - Its own file, of no imports:  the app's and the brand's Vite configs import `packModuleKey()` too, and a config
 *   never loads the pack build (Vite, the DOM types of `tools.types.ts`).
 ****************/

/**
 * The modules a pack SHARES with the page instead of bundling:  the import specifiers its build leaves external, by
 * their `packModules` key (`packModuleKey()`:  `@spell-app/ui/core` is `$/ui/core`).
 * - Each is read from `globalThis.SpellUI.packModules[<specifier>]`:  spell-epic's docs bundle's
 *   (`spell-ui.entry.js`), and the component sets' site build's (`site/_src/SitePacks.ts`).
 * - `$/spell-element`:  what the pack's elements are written on (`E.UIComponent` ...).
 *   The page's is Spell UI's core module, which carries all of it, so a page has one (`packModules`).
 * - Any other `$/ui...`, `$/spell-element/...`, Solid or `@spell-app/...` import fails the build:
 *   a second copy of spell-element, Spell UI's core or Solid on a page breaks them.
 * - Another one:  add it here AND to both `packModules`, AND to the guides' copy
 *   (spell-epic's `src/tools/bundle-experiment.ts`, which builds a guide's live elements the same way).
 */
export const PACK_MODULES = ["solid-js", "@solidjs/web", "$/spell-element", "$/ui/core", "$/ui/forms"]

/**
 * The `packModules` key of the module an import names:  its `$/` name, the key every page has always offered.
 * - Since epic `repo-split` P6 another repo's code imports Spell UI and spell-element by their npm names:
 *   `@spell-app/ui/core` => `$/ui/core`, `@spell-app/spell-element` => `$/spell-element`.
 * - A family's published entry, `@spell-app/ui/ui-code`, is its folder's:  `$/ui/components/ui-code`.
 * - So the keys a page's bundle offers (spell-epic's docs bundle, `SitePacks.ts`) stay as they were:
 *   the run-time names didn't change, only how a repo's source spells the import.
 * - Any other specifier comes back as it is.
 */
export function packModuleKey(specifier: string): string {
  const family = /^@spell-app\/ui\/(ui-[a-z-]+)$/.exec(specifier)
  if (family) return `$/ui/components/${family[1]}`
  return specifier.replace(/^@spell-app\//, "$/")
}
