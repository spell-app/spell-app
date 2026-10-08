/**
 * Every name `<ui-sticky>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`:  `<ui-sticky pushing>` => `ui pushing sticky`.
 * - Stuck-ness is a STATE (`:state(stuck)`, `:state(bound)`), not a class:  CSS `position: sticky` does the sticking,
 *   the element only reports it.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-sticky>`
 * A sticky:  `<div class="ui ... sticky" part="sticky">` around the slot, between two sentinels.
 ****************/
export const stickyVocabulary = {
  tag: "ui-sticky",
  topics: ["layout", "navigation", "modules"],
  aka: ["affix", "pinned", "fixed header", "sticky header"],
  noun: "sticky",
  description: "Sticky content stays fixed to the viewport while its container is on screen.",
  attributes: [
    {
      name: "offset",
      kind: "number",
      default: 0,
      description: "Pixels between the top edge of the viewport (or scroll container) and the stuck content."
    },
    {
      name: "bottom-offset",
      kind: "number",
      default: 0,
      description: "Pixels between the bottom edge and the content stuck there (with `pushing`)."
    },
    {
      name: "pushing",
      kind: "keyOnly",
      description:
        "Also sticks to the BOTTOM edge:  content below the fold stays in view there until the page reaches it."
    }
  ],
  events: [
    {
      name: "ui-stick",
      detail: "{ edge: StickyEdge }",
      description: "Stuck to an edge (`top`, or `bottom` with `pushing`), Fomantic's `onStick`."
    },
    {
      name: "ui-unstick",
      detail: "{ edge: StickyEdge }",
      description:
        "Left the edge it was stuck to:  scrolled back, or pushed out by the end of its container (`:state(bound)`)."
    }
  ],
  slots: [{ name: "", description: "The content that sticks." }],
  parts: [{ name: "sticky", description: "The sticky box around the slot." }],
  states: [
    { name: "stuck", description: "Stuck to the top or bottom edge." },
    { name: "bound", description: "Pushed out by the end of its container (Fomantic's `bound`)." }
  ],
  texts: []
} as const satisfies E.ComponentVocabulary
