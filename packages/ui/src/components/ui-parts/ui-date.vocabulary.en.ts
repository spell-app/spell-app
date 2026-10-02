/**
 * Every name the generic content parts use -- `<ui-content>`, `<ui-header>`, `<ui-description>`, `<ui-meta>`,
 * `<ui-extra>`, `<ui-actions>`, `<ui-title>`, `<ui-summary>`, `<ui-date>`, `<ui-author>`, `<ui-avatar>`,
 * `<ui-detail>`, `<ui-value>`.  Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - The noun IS the part word, and the class it renders:  `<ui-meta>` => `<div class="meta">`.  Parts have no
 *   `ui` class (`ui: false`), except a STANDALONE `<ui-header>`, which is Fomantic's `ui header`.
 * - Owners declare what they own (`ownsParts` in THEIR vocabularies);  `OwnerContext` finds a part's nearest
 *   owner and the part sets `:state(in-<owner>)`.  Each part's `states` lists the owners Fomantic styles it in.
 * - `<ui-header>` owns parts too:  a nested `<ui-header>` is its sub header, a `<ui-content>` its text column.
 * - `ui-parts.css` styles every part;  see its header for the owner tokens owners must set.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-date>`
 * A date:  `<time class="date">`.
 ****************/
export const dateVocabulary = {
  tag: "ui-date",
  topics: ["content parts", "date & time", "social"],
  aka: ["timestamp", "time ago", "posted at"],
  skeleton: null,
  noun: "date",
  ui: false,
  description: "When something happened;  inline and small inside a summary.",
  attributes: [{ name: "datetime", kind: "string", description: "Machine-readable date, as `<time datetime>`." }],
  events: [],
  slots: [{ name: "", description: "The human-readable date." }],
  parts: [{ name: "date", description: "The `<time>`." }],
  states: [{ name: "in-feed", description: "Owned by a feed." }],
  texts: []
} as const satisfies ComponentVocabulary
