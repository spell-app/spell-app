import { BUILT_IN_ICON_PACKS, ICON_PACK_INDEX, type BuiltInIconPack } from "./icons.types"

/**
 * Where the packs `@spell-app/ui` ships live:  `icon-packs/<id>/pack.js`, next to the module that holds THIS class.
 * - Dev / tests:  this file is `src/icons/BuiltInPacks.ts`, so `src/icons/icon-packs/<id>/`.
 * - Library build:  bundled into `dist/core.js`, so `dist/icon-packs/<id>/` -- where `emitIconPacks()`
 *   (`vite.config.ts`) copies them.  The docs site:  `site/_assets/icon-packs/<id>/` (a symlink, `yarn site:bundle`).
 * - A consumer that bundles `@spell-app/ui` moves this code away from `node_modules/@spell-app/ui/dist/icon-packs/`:  copy that
 *   folder next to the app's chunks, or point a pack elsewhere with `base` (`docs/icons.md`, "Shipping icons").
 */
export class BuiltInPacks {
  /**
   * Base the pack folders resolve against;  `import.meta.url` unless overridden (tests, unusual deployments).
   * - NOTE:  NEVER passed to `new URL()` as a literal `import.meta.url`:  Vite would turn a template URL next to
   *   it into a glob and bundle every pack.
   */
  static base = import.meta.url

  /** Is `source` the id of a pack we ship (`fa7-brands`), rather than a URL? */
  static has(source: string): source is BuiltInIconPack {
    return (BUILT_IN_ICON_PACKS as readonly string[]).includes(source)
  }

  /** Absolute URL of built-in pack `id`'s index, under `base` (a `<ui-root assets>` folder) or `BuiltInPacks.base`. */
  static url(id: BuiltInIconPack, base: string = BuiltInPacks.base): string {
    return new URL(`icon-packs/${id}/${ICON_PACK_INDEX}`, base).href
  }
}
