/**
 * The English vocabulary of `<ui-title>`, one of the 13 generic content parts:  every name the tag uses.
 * - The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - The noun IS the part word, and the class its root carries:  `<ui-title>` => `class="title"`.
 *   Parts have no `ui` class (`ui: false`), except a STANDALONE `<ui-header>`, which is Fomantic's `ui header`.
 * - Owners declare the parts they own (`ownsParts` in THEIR vocabularies).
 *   `OwnerContext` finds a part's nearest owner, and the part sets `:state(in-<owner>)`;
 *   its `states` list the owners Fomantic styles it in.
 * - `UIParts.css` styles every part;  its header lists the tokens owners must set.
 */

import type { E } from "$/ui/core"

/****************
 * ### `titleVocabulary`
 * The names of `<ui-title>`, a title:  `<div class="title">` (`<a>` with `href`).
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
