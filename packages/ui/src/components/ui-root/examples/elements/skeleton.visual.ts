import type { VisualHooks } from "$/ui/test/test.types"

/** A tag for a host whose `ready` never resolves:  NOT `ui-*`, so the visual fixture's settle doesn't wait for it. */
const WAIT = "x-visual-wait"

/**
 * States of `skeleton.html` for `yarn test:visual`:  `loading`, the root held before ready (an element inside that
 * never gets ready, an hour's timeout), so its `<ui-placeholder>` skeletons are what's captured.
 * - `DOMElement` is imported IN the state (the page):  the spec also loads this file in node to list its states, where
 *   the element layer can't load.
 */
export default {
  states: {
    loading: {
      open: async (root) => {
        const { DOMElement } = await import("$/ui/elements")
        if (!customElements.get(WAIT)) customElements.define(WAIT, class extends DOMElement {})
        const old = root.querySelector("ui-root")!
        const held = document.createElement("ui-root")
        held.setAttribute("timeout", "3600s")
        held.innerHTML = `<${WAIT}></${WAIT}>${old.innerHTML}`
        old.replaceWith(held)
      }
    }
  }
} satisfies VisualHooks
