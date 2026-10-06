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
 * ### `<ui-description>`
 * Descriptive text:  `<div class="description">`.
 ****************/
export const descriptionVocabulary = {
  tag: "ui-description",
  topics: ["content parts", "text"],
  aka: ["body text", "summary text", "details"],
  noun: "description",
  ui: false,
  description: "A description of the content:  card / item / modal / list / step / search text, a comment's text.",
  attributes: [],
  events: [],
  slots: [{ name: "", description: "Text." }],
  parts: [{ name: "description", description: "The description box." }],
  states: [
    { name: "in-card", description: "Owned by a card." },
    { name: "in-item", description: "Owned by an item." },
    { name: "in-comment", description: "Owned by a comment." },
    { name: "in-modal", description: "Owned by a modal." },
    { name: "in-flyout", description: "Owned by a flyout." },
    { name: "in-list", description: "Owned by a list." },
    { name: "in-step", description: "Owned by a step." },
    { name: "in-search", description: "Owned by a search." }
  ],
  texts: []
} as const satisfies E.ComponentVocabulary
