/**
 * The types and constants the `ui-components` family's files share:  its component (`UIComponents`), its
 * vocabulary, `ComponentPacks` (the page's registry of component packs), and `<ui-root>`, which reads `source`.
 * - Pure data:  `import type` only (a pack's catalog has the shape of `<ui-root>`'s own), so node can load it.
 */

import type { RootCatalogEntry } from "$/ui/components/ui-root/UIRoot.types"

import type { componentsVocabulary } from "./UIComponents.en"

/** `componentsVocabulary`'s type. */
export type ComponentsVocabulary = typeof componentsVocabulary

/** The attribute naming a pack's script:  `<ui-components source>`, which `<ui-root>` reads. */
export const SOURCE = "source"

/**
 * A COMPONENT PACK:  another package's custom elements (any tag prefix), loaded on demand by `<ui-root>`.
 * - A pack is a classic script calling `SpellUI.registerPack(pack)` as it runs (`ComponentPacks.register()`);
 *   an ES module may call `registerPack()` from `$/ui` itself.
 * - It shares the page's Solid and Spell UI (`SpellUI.packModules`), never bundling its own copy.
 */
export type ComponentPack = {
  /** Its name, unique on the page:  `epics` for `epics.pack.js` (how a load finds its pack without `currentScript`). */
  readonly name: string
  /** The prefix of every tag it defines, ending in `-`:  `epic-`.  Never `ui-` (Spell UI's own). */
  readonly prefix: string
  /** Every tag it defines => what `<ui-root>` needs before it's ready (a skeleton);  each tag starts with `prefix`. */
  readonly catalog: Readonly<Record<string, RootCatalogEntry>>
  /** Define every tag of the pack;  called once, by `registerPack()`. */
  define(): void
}
