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
 * ### `<ui-actions>`
 * Actions:  `<div class="actions">`.
 ****************/
export const actionsVocabulary = {
  tag: "ui-actions",
  topics: ["content parts", "buttons", "dialogs"],
  aka: ["footer buttons", "button bar", "dialog actions"],
  skeleton: "none",
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
