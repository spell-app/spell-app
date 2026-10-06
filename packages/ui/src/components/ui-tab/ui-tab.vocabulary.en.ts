/**
 * Every name `<ui-tabs>` and `<ui-tab>` use:  tags, attributes (kind + allowed values), events, slots, parts,
 * states, texts.  Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Fomantic's words:  a `.ui.tab` is a PANE (`<div class="ui bottom attached tab segment" data-tab>`);  the tabs
 *   you click are the items of a `tabular` (or `pointing` / `secondary` / `text`) MENU.  So `<ui-tab>` is the pane,
 *   and `<ui-tabs>` draws the menu from its panes' `label`s, with `ui-menu.css`.
 * - Class words come out through `ClassBuilder`:
 *   - `<ui-tabs tabular attached size="small">` => the root `ui small tabular top attached tabs` and its tab list
 *     `ui small tabular top attached menu` (the same words, Fomantic's noun `menu`)
 *   - `<ui-tab>` in those tabs => `ui active bottom attached tab segment` (the menu's opposite edge;  `active` while
 *     selected)
 * - `selected` is the canonical chosen state (`active`, Fomantic's word, is an alias);  the chosen pane is the tabs'
 *   `value`.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-tab>`
 * One pane:  `<div class="ui ... tab segment" part="tab">` around its content;  a `role="tabpanel"` host, shown
 * while it's the selected pane of its `<ui-tabs>`.
 ****************/
export const tabVocabulary = {
  tag: "ui-tab",
  topics: ["navigation", "containers", "content parts", "modules"],
  aka: ["tab panel", "pane"],
  skeleton: "none",
  noun: "tab",
  description: "A tab pane:  the content shown while its tab is selected.",
  attributes: [
    {
      name: "value",
      kind: "string",
      description: "What the tabs' `value` (and the URL hash, with `history`) calls this pane;  default its index."
    },
    { name: "label", kind: "string", description: "Text of its tab;  default its `value`.  Also names the pane." },
    { name: "icon", kind: "icon", description: "Icon on its tab (a Font Awesome name)." },
    {
      name: "selected",
      kind: "keyOnly",
      key: "active",
      aliases: ["active"],
      description:
        "The pane shown first, when the tabs have no `value`;  alone (no `<ui-tabs>`), shows it.  Alias:  `active`."
    },
    { name: "disabled", kind: "boolean", description: "Its tab can't be selected (skipped by the arrow keys)." },
    { name: "loading", kind: "keyOnly", description: "Busy:  a spinner in place of the content." },
    {
      name: "lazy",
      kind: "boolean",
      description:
        "Stamp its `<template>` children into it the first time it's shown (and listen for `ui-show` with " +
        "`first: true` to fill it yourself)."
    },
    {
      name: "attached",
      kind: "keyOrValueAndKey",
      values: ["top", "bottom"],
      description: "Joined to a menu edge;  inside `<ui-tabs>`, the tabs decide."
    },
    { name: "basic", kind: "keyOnly", description: "No segment box;  inside `<ui-tabs>`, the tabs decide." },
    { name: "inverted", kind: "keyOnly", description: "A dark pane;  inside `<ui-tabs>`, the tabs decide." }
  ],
  events: [
    {
      name: "ui-show",
      detail: "{ value: string, first: boolean }",
      description: "Became the shown pane;  `first` the first time (fill a lazy pane now)."
    }
  ],
  slots: [{ name: "", description: "The pane's content." }],
  parts: [{ name: "tab", description: "The pane box." }],
  states: [
    { name: "pane", description: "Always:  `ui-tab.css` tells a pane's host from a tab set's by it." },
    { name: "selected", description: "The shown pane." },
    { name: "in-tabs", description: "A pane of a `<ui-tabs>` (a `role=tabpanel` host)." }
  ],
  texts: []
} as const satisfies E.ComponentVocabulary
