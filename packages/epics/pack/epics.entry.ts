/* GENERATED -- do not edit:  `spell dev pack build epics` */
/**
 * The `epics` pack's script:  registers with the page's Spell UI, which adds the catalog and calls `define()`.
 * - `define()` imports every family barrel, which defines its tags:  inlined in the script, run only when called.
 */
import { CATALOG } from "./epics.catalog"

/** The docs bundle's global (`spell-ui.entry.js`). */
const { SpellUI } = globalThis as unknown as { SpellUI: { registerPack(pack: object): void } }

SpellUI.registerPack({
  name: "epics",
  prefix: "epic-",
  catalog: CATALOG,
  define: () =>
    Promise.all([
      import("../components/epic-answer"),
      import("../components/epic-choices"),
      import("../components/epic-commit"),
      import("../components/epic-event"),
      import("../components/epic-item"),
      import("../components/epic-original"),
      import("../components/epic-overview"),
      import("../components/epic-page"),
      import("../components/epic-phase"),
      import("../components/epic-section"),
      import("../components/epic-update")
    ]).then(() => undefined)
})
