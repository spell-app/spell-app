/**
 * The English vocabulary of `<ui-meta>`, one of the 13 generic content parts:  every name the tag uses.
 * - The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - The noun IS the part word, and the class its root carries:  `<ui-meta>` => `class="meta"`.
 *   Parts have no `ui` class (`ui: false`), except a STANDALONE `<ui-header>`, which is Fomantic's `ui header`.
 * - Owners declare the parts they own (`ownsParts` in THEIR vocabularies).
 *   `OwnerContext` finds a part's nearest owner, and the part sets `:state(in-<owner>)`;
 *   its `states` list the owners Fomantic styles it in.
 * - `UIParts.css` styles every part;  its header lists the tokens owners must set.
 */

import type { E } from "$/ui/core"

/****************
 * ### `metaVocabulary`
 * The names of `<ui-meta>`, metadata:  `<div class="meta">`.
 ****************/
export const metaVocabulary = {
  tag: "ui-meta",
  topics: ["content parts", "text"],
  aka: ["metadata", "subtitle", "byline", "caption"],
  noun: "meta",
  ui: false,
  description: "Metadata about the content, e.g. a date or a category;  a comment's `metadata`.",
  attributes: [],
  events: [],
  slots: [{ name: "", description: "Short items, spaced apart (`<span>`s, links)." }],
  parts: [{ name: "meta", description: "The meta box." }],
  states: [
    { name: "in-card", description: "Owned by a card." },
    { name: "in-item", description: "Owned by an item." },
    { name: "in-feed", description: "Owned by a feed." },
    { name: "in-comment", description: "Owned by a comment." }
  ],
  texts: []
} as const satisfies E.ComponentVocabulary
