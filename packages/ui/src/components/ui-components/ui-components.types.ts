/**
 * Shared constants and types of the `ui-components` family:  `<ui-components>`, its native fallback and
 * `ComponentPacks` (the page's registry of component packs) import them from here.
 * - Runtime-light:  types only from `<ui-root>`'s folder (a pack's catalog has the shape of `<ui-root>`'s own).
 */
import type { RootCatalogEntry } from "$/ui/components/ui-root/ui-root.types"

import type { componentsVocabulary } from "./ui-components.vocabulary.en"

/** `componentsVocabulary`'s type. */
export type ComponentsVocabulary = typeof componentsVocabulary

////////////////
// ## Packs
////////////////

/**
 * A COMPONENT PACK:  another package's custom elements (any tag prefix), loaded on demand by `<ui-root>`.
 * - A pack is a classic script calling `SpellUI.registerPack(pack)` as it runs (`ComponentPacks.register()`);  an
 *   ES module may call `registerPack()` from `$/ui` itself.
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

/** A pack load waiting for its script to call `registerPack()`. */
export type PendingPack = {
  /** The `<script>` loading it:  `document.currentScript` while it runs. */
  readonly script: HTMLScriptElement
  /** The name its URL implies (`ComponentPacks.nameFor()`):  the match when `document.currentScript` is gone. */
  readonly name: string
  /** Resolve the load with the registered pack. */
  readonly resolve: (pack: ComponentPack) => void
  /** Fail the load. */
  readonly reject: (error: Error) => void
}

/** The attribute naming a pack's script:  `<ui-components source>`, which `<ui-root>` reads. */
export const SOURCE = "source"

/** A pack's tag prefix:  lowercase words joined by `-`, ending in `-` (`epic-`, `x-`, `my-app-`). */
export const PACK_PREFIX = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*-$/

/** Spell UI's own prefix, which no pack may take. */
export const UI_PREFIX = "ui-"

/** What a pack's file name ends in, after its name:  `epics.pack.js`, else plain `.js`. */
export const PACK_FILE_SUFFIX = /(?:\.pack)?\.js$/
