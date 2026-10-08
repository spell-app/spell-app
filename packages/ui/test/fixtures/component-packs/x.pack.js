/**
 * A test component pack (`src/components/ui-components/ComponentPacks.test.ts`):  a CLASSIC script, as
 * `spell dev pack build` writes one, taking what it shares with the page from `SpellUI.packModules`.
 * - `<x-card>`:  a `DOMElement` (the page's own class), ready only once the test says (`__xPack.cards`, `markReady()`),
 *   with a skeleton in the catalog.
 * - `<x-note>`:  a plain element, ready at once, no skeleton.
 * - Counts its runs (`__xPack.runs`), so a test can check a page runs it once.
 */
;(() => {
  const { registerPack, packModules } = globalThis.SpellUI
  const { DOMElement } = packModules["$/ui/core"]
  const state = (globalThis.__xPack ??= { runs: 0, cards: new Set() })
  state.runs += 1

  class XCard extends DOMElement {
    connectedCallback() {
      state.cards.add(this)
    }
  }

  class XNote extends HTMLElement {}

  registerPack({
    name: "x",
    prefix: "x-",
    catalog: {
      "x-card": { folder: "x-card", skeleton: { width: "12em", height: "4em" } },
      "x-note": { folder: "x-note" }
    },
    define() {
      customElements.define("x-card", XCard)
      customElements.define("x-note", XNote)
    }
  })
})()
