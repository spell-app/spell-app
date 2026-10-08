/**
 * The English vocabulary of `<ui-description>`, one of the 13 generic content parts:  every name the tag uses.
 * - The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - The noun IS the part word, and the class its root carries:  `<ui-description>` => `class="description"`.
 *   Parts have no `ui` class (`ui: false`), except a STANDALONE `<ui-header>`, which is Fomantic's `ui header`.
 * - Owners declare the parts they own (`ownsParts` in THEIR vocabularies).
 *   `OwnerContext` finds a part's nearest owner, and the part sets `:state(in-<owner>)`;
 *   its `states` list the owners Fomantic styles it in.
 * - `UIParts.css` styles every part;  its header lists the tokens owners must set.
 */

import type { E } from "$/ui/core"

/****************
 * ### `descriptionVocabulary`
 * The names of `<ui-description>`, descriptive text:  `<div class="description">`.
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
