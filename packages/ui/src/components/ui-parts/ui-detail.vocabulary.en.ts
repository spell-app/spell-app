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
 * ### `<ui-detail>`
 * A detail:  `<span class="detail">` (`<a>` with `href`).
 ****************/
export const detailVocabulary = {
  tag: "ui-detail",
  topics: ["content parts", "text"],
  aka: ["secondary text", "note"],
  skeleton: "none",
  noun: "detail",
  ui: false,
  description: "A label's dimmer second value, e.g. a count.",
  attributes: [{ name: "href", kind: "string", description: 'Renders a link (`<a class="detail" href>`).' }],
  events: [],
  slots: [{ name: "", description: "Text, an icon." }],
  parts: [{ name: "detail", description: "The detail box." }],
  states: [{ name: "in-label", description: "Owned by a label." }],
  texts: []
} as const satisfies E.ComponentVocabulary
