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
 * ### `<ui-title>`
 * A title:  `<div class="title">` (`<a>` with `href`).
 ****************/
export const titleVocabulary = {
  tag: "ui-title",
  topics: ["content parts", "typography", "containers"],
  aka: ["accordion title", "summary", "toggle header"],
  noun: "title",
  ui: false,
  description: "A title:  a step's, an accordion panel's, a search result's.",
  attributes: [{ name: "href", kind: "string", description: "Renders a link (`<a>`)." }],
  events: [],
  slots: [{ name: "", description: "Text." }],
  parts: [{ name: "title", description: "The title box." }],
  states: [
    { name: "in-step", description: "Owned by a step." },
    { name: "in-accordion", description: "Owned by an accordion." },
    { name: "in-search", description: "Owned by a search." }
  ],
  texts: []
} as const satisfies E.ComponentVocabulary
