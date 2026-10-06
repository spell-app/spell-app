/**
 * Every name `<ui-rail>` uses:  tag, attributes (kind + allowed values), slots, parts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:  `<ui-rail position="left" close="very">`
 *   => `ui left very close rail`.  `ui-rail.css` keys on those words.
 * - `position` is the SIDE, emitted as a bare word (`left rail`), hence `kind: "valueOnly"` (as the
 *   menu's `position`).  Fomantic has no side-less rail:  without one the rail sits over its container's start.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-rail>`
 * A rail:  `<div class="ui ... rail" part="rail"><slot></slot></div>`, absolutely positioned beside (or inside) the
 * nearest positioned box around it -- usually a `<ui-segment>` or a `ui-container` with `position: relative`.
 ****************/
export const railVocabulary = {
  tag: "ui-rail",
  topics: ["layout", "containers", "elements"],
  aka: ["side rail", "aside", "gutter", "margin column"],
  skeleton: false,
  noun: "rail",
  description: "A rail is used to show accompanying content outside the boundaries of the main view of a site.",
  attributes: [
    { name: "size", kind: "size", description: "Size of the rail's text, `mini` ... `massive`." },
    {
      name: "position",
      kind: "valueOnly",
      values: ["left", "right"],
      description: "Side:  `left` or `right` of its container."
    },
    { name: "internal", kind: "keyOnly", description: "Inside its container's edge instead of outside it." },
    { name: "dividing", kind: "keyOnly", description: "A vertical rule between the rail and its container." },
    { name: "attached", kind: "keyOnly", description: "Flush against its container:  no gap." },
    {
      name: "close",
      kind: "keyOrValueAndKey",
      values: ["very"],
      description: 'Closer to its container:  `close` (1em away), `close="very"` (0.5em away).'
    }
  ],
  events: [],
  slots: [{ name: "", description: "The rail's content, e.g. a `<ui-segment>`, a sticky menu, an ad." }],
  parts: [{ name: "rail", description: "The rail box." }],
  states: [],
  texts: []
} as const satisfies E.ComponentVocabulary
