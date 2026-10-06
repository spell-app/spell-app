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
 * ### `<ui-summary>`
 * A summary:  `<div class="summary">`.
 ****************/
export const summaryVocabulary = {
  tag: "ui-summary",
  topics: ["content parts", "social"],
  aka: ["event summary", "headline"],
  skeleton: "none",
  noun: "summary",
  ui: false,
  description: "A feed event's summary line, e.g. who did what, with an inline date.",
  attributes: [],
  events: [],
  slots: [{ name: "", description: "Text, `<ui-author>`, `<ui-date>`." }],
  parts: [{ name: "summary", description: "The summary box." }],
  states: [{ name: "in-feed", description: "Owned by a feed." }],
  texts: []
} as const satisfies E.ComponentVocabulary
