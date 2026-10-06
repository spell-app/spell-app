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
 * ### `<ui-value>`
 * A value:  `<div class="value">`.
 ****************/
export const valueVocabulary = {
  tag: "ui-value",
  topics: ["content parts", "data display"],
  aka: ["statistic value", "number", "metric value"],
  skeleton: false,
  noun: "value",
  ui: false,
  description: "A statistic's value;  a search result's price.",
  attributes: [{ name: "text", kind: "keyOnly", description: "In a statistic:  a word value, smaller and bold." }],
  events: [],
  slots: [{ name: "", description: "The value:  a number, a word, an icon or image." }],
  parts: [{ name: "value", description: "The value box." }],
  states: [
    { name: "in-statistic", description: "Owned by a statistic." },
    { name: "in-search", description: "Owned by a search." }
  ],
  texts: []
} as const satisfies E.ComponentVocabulary
