/* GENERATED -- do not edit:  `spell dev pack build brand` */
/**
 * The `brand` pack's script:  registers with the page's Spell UI, which adds the catalog and calls `define()`.
 * - `define()` imports every family barrel, which defines its tags:  inlined in the script, run only when called.
 */
import { CATALOG } from "./brand.catalog"

/** The docs bundle's global (`spell-ui.entry.js`). */
const { SpellUI } = globalThis as unknown as { SpellUI: { registerPack(pack: object): void } }

SpellUI.registerPack({
  name: "brand",
  prefix: "brand-",
  catalog: CATALOG,
  define: () =>
    Promise.all([
      import("../brand-blob"),
      import("../brand-checklist"),
      import("../brand-color"),
      import("../brand-color-picker"),
      import("../brand-color-range"),
      import("../brand-color-set"),
      import("../brand-composer"),
      import("../brand-flourish"),
      import("../brand-logo"),
      import("../brand-phone")
    ]).then(() => undefined)
})
