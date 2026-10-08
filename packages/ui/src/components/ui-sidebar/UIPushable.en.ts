/**
 * Every name `<ui-sidebar>`, `<ui-pushable>` and `<ui-pusher>` use:  tags, attributes (kind + allowed values),
 * events, slots, parts, states, texts.  Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-sidebar position="right" width="thin" transition="scale down" visible>` =>
 *   `ui right thin scale down visible sidebar`.  Without `transition`, the element adds Fomantic's default for
 *   its side (`uncover` left / right, `overlay` top / bottom).
 * - `position` and `transition` are `kind: "valueOnly"`:  each emits its value alone.
 * - `width` (`kind: "width"`, as `<ui-flyout>`'s) takes Fomantic's sidebar words (`very thin` ... `very wide`),
 *   which the element adds after the noun (`ui left sidebar thin`),
 *   AND columns of the viewport (`4`, `1/4`, `25%` => `four wide`).
 * - `pushable` / `pusher` have no `ui` (Fomantic's `.pushable`, `.pusher`).
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-pushable>`
 * The box a sidebar slides in:
 * `<div class="pushable" part="pushable"><slot>`, holding `<ui-sidebar>`s and a `<ui-pusher>`.
 ****************/
export const pushableVocabulary = {
  tag: "ui-pushable",
  topics: ["layout", "navigation", "modules"],
  aka: ["sidebar container", "pushable area"],
  noun: "pushable",
  ui: false,
  description: "The context a sidebar appears in:  it clips them and moves its pusher.",
  attributes: [],
  events: [],
  slots: [{ name: "", description: "`<ui-sidebar>`s and one `<ui-pusher>`." }],
  parts: [{ name: "pushable", description: "The clipping box." }],
  states: [{ name: "pushable", description: "Always:  its sidebars find it by this." }],
  texts: []
} as const satisfies E.ComponentVocabulary
