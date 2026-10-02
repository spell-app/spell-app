/**
 * Every name `<ui-sidebar>`, `<ui-pushable>` and `<ui-pusher>` use:  tags, attributes (kind + allowed values),
 * events, slots, parts, states, texts.  Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-sidebar position="right" width="thin" transition="scale down" visible>` =>
 *   `ui right thin scale down visible sidebar`.  Without `transition`, the element adds Fomantic's default for
 *   its side (`uncover` left / right, `overlay` top / bottom).
 * - `position` and `transition` are `kind: "valueOnly"`:  each emits its value alone.
 * - `width` (`kind: "width"`, as `<ui-flyout>`'s) takes Fomantic's sidebar words (`very thin` ... `very wide`),
 *   which the element adds after the noun (`ui left sidebar thin`), AND columns of the viewport (`4`, `1/4`, `25%`
 *   => `four wide`).
 * - `pushable` / `pusher` have no `ui` (Fomantic's `.pushable`, `.pusher`).
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-pusher>`
 * The page content beside a sidebar:  `<div class="pusher" part="pusher"><slot>`, moved, dimmed and made `inert`
 * by its `<ui-pushable>`.
 ****************/
export const pusherVocabulary = {
  tag: "ui-pusher",
  topics: ["layout", "navigation", "modules"],
  aka: ["page content", "pushed content"],
  skeleton: null,
  noun: "pusher",
  ui: false,
  description: "The content a sidebar pushes (and dims) when it appears.",
  attributes: [],
  events: [],
  slots: [{ name: "", description: "The page content." }],
  parts: [{ name: "pusher", description: "The content box;  its `::after` is the dimmer." }],
  states: [{ name: "pusher", description: "Always:  its `<ui-pushable>` finds it by this." }],
  texts: []
} as const satisfies ComponentVocabulary
