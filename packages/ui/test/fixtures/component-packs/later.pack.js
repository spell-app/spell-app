/**
 * A test component pack (`src/components/ui-components/ComponentPacks.test.ts`) whose `define()` LOADS its families
 * first, as one built on ES modules does (`import()`):  it returns a promise, and defines `<later-card>` only when it
 * settles, well after the script ran.
 * - `<later-card>`:  a `DOMElement` (the page's own class), ready at once.
 */
;(() => {
  const { registerPack, packModules } = globalThis.SpellUI
  const { DOMElement } = packModules["$/ui/core"]

  class LaterCard extends DOMElement {
    connectedCallback() {
      this.markReady()
    }
  }

  registerPack({
    name: "later",
    prefix: "later-",
    catalog: { "later-card": { folder: "later-card" } },
    define: () =>
      new Promise((resolve) => setTimeout(resolve, 200)).then(() => customElements.define("later-card", LaterCard))
  })
})()
