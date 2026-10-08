/**
 * The English vocabulary of `<ui-extra>`, one of the 13 generic content parts:  every name the tag uses.
 * - The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - The noun IS the part word, and the class its root carries:  `<ui-extra>` => `class="extra"`.
 *   Parts have no `ui` class (`ui: false`), except a STANDALONE `<ui-header>`, which is Fomantic's `ui header`.
 * - Owners declare the parts they own (`ownsParts` in THEIR vocabularies).
 *   `OwnerContext` finds a part's nearest owner, and the part sets `:state(in-<owner>)`;
 *   its `states` list the owners Fomantic styles it in.
 * - `UIParts.css` styles every part;  its header lists the tokens owners must set.
 */

import type { E } from "$/ui/core"

/****************
 * ### `extraVocabulary`
 * The names of `<ui-extra>`, extra content:  `<div class="extra">`.
 ****************/
export const extraVocabulary = {
  tag: "ui-extra",
  topics: ["content parts", "cards"],
  aka: ["footer", "card footer", "extra content"],
  noun: "extra",
  ui: false,
  description: "Extra content, set apart from the main content, e.g. a card's footer.",
  attributes: [{ name: "text", kind: "keyOnly", description: "In a feed:  a block of extra text." }],
  events: [],
  slots: [{ name: "", description: "Content." }],
  parts: [{ name: "extra", description: "The extra box." }],
  states: [
    { name: "in-card", description: "Owned by a card." },
    { name: "in-item", description: "Owned by an item." },
    { name: "in-feed", description: "Owned by a feed." }
  ],
  texts: []
} as const satisfies E.ComponentVocabulary
