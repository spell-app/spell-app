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
 * ### `<ui-meta>`
 * Metadata:  `<div class="meta">`.
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
