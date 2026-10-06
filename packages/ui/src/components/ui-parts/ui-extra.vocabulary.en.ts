/**
 * Every name the generic content parts use -- `<ui-content>`, `<ui-header>`, `<ui-description>`, `<ui-meta>`,
 * `<ui-extra>`, `<ui-actions>`, `<ui-title>`, `<ui-summary>`, `<ui-date>`, `<ui-author>`, `<ui-avatar>`,
 * `<ui-detail>`, `<ui-value>`.  Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - The noun IS the part word, and the class it renders:  `<ui-meta>` => `<div class="meta">`.  Parts have no
 *   `ui` class (`ui: false`), except a STANDALONE `<ui-header>`, which is Fomantic's `ui header`.
 * - Owners declare what they own (`ownsParts` in THEIR vocabularies);  `OwnerContext` finds a part's nearest
 *   owner and the part sets `:state(in-<owner>)`.  Each part's `states` lists the owners Fomantic styles it in.
 * - `<ui-header>` owns parts too:  a nested `<ui-header>` is its sub header, a `<ui-content>` its text column.
 * - `ui-parts.css` styles every part;  see its header for the owner tokens owners must set.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-extra>`
 * Extra content:  `<div class="extra">`.
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
