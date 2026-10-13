/**
 * The English vocabulary of `<ui-actions>`, one of the 13 generic content parts:  every name the tag uses.
 * - The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - The noun IS the part word, and the class its root carries:  `<ui-actions>` => `class="actions"`.
 *   Parts have no `ui` class (`ui: false`), except a STANDALONE `<ui-header>`, which is Fomantic's `ui header`.
 * - Owners declare the parts they own (`ownsParts` in THEIR vocabularies).
 *   `OwnerContext` finds a part's nearest owner, and the part sets `:state(in-<owner>)`;
 *   its `states` list the owners Fomantic styles it in.
 * - `UIParts.css` styles every part;  its header lists the tokens owners must set.
 */

import type { E } from "$/ui/core"

/****************
 * ### `actionsVocabulary`
 * The names of `<ui-actions>`, actions:  `<div class="actions">`.
 ****************/
export const actionsVocabulary = {
  tag: "ui-actions",
  topics: ["content parts", "buttons", "dialogs"],
  aka: ["footer buttons", "button bar", "dialog actions"],
  noun: "actions",
  ui: false,
  description: "Actions a person can take:  a modal's or toast's buttons, a comment's reply links.",
  attributes: [],
  events: [],
  slots: [{ name: "", description: "Buttons or links." }],
  parts: [{ name: "actions", description: "The actions box." }],
  states: [
    { name: "in-comment", description: "Owned by a comment." },
    { name: "in-modal", description: "Owned by a modal." },
    { name: "in-flyout", description: "Owned by a flyout." },
    { name: "in-toast", description: "Owned by a toast." }
  ],
  texts: []
} as const satisfies E.ComponentVocabulary
