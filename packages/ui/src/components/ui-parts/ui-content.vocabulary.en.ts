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
 * ### `<ui-content>`
 * A content block:  `<div class="content">`.
 ****************/
export const contentVocabulary = {
  tag: "ui-content",
  topics: ["content parts", "containers", "cards"],
  aka: ["body", "content area", "card body"],
  skeleton: false,
  noun: "content",
  ui: false,
  description: "The main content block of a card, item, event, comment, modal, message, list item, step ...",
  attributes: [
    { name: "image", kind: "keyOnly", description: "In a modal:  an image beside the description (a flex row)." },
    { name: "scrolling", kind: "keyOnly", description: "In a modal:  a capped height that scrolls." },
    { name: "floated", kind: "valueAndKey", values: "floats", description: "Floats `left` or `right`." },
    {
      name: "text-align",
      kind: "textAlign",
      values: "alignments",
      description: "Aligns its text `left`, `center`, `right` or `justified` (a card's `center aligned content`)."
    },
    {
      name: "vertical-align",
      kind: "verticalAlign",
      values: "verticalAlignments",
      description: "In an item or a list:  `top`, `middle` or `bottom` against the image or icon beside it."
    }
  ],
  events: [],
  slots: [{ name: "", description: "Content, usually other parts." }],
  parts: [{ name: "content", description: "The content box." }],
  states: [
    { name: "in-card", description: "Owned by a card." },
    { name: "in-item", description: "Owned by a item." },
    { name: "in-feed", description: "Owned by a feed." },
    { name: "in-comment", description: "Owned by a comment." },
    { name: "in-modal", description: "Owned by a modal." },
    { name: "in-flyout", description: "Owned by a flyout." },
    { name: "in-message", description: "Owned by a message." },
    { name: "in-list", description: "Owned by a list." },
    { name: "in-step", description: "Owned by a step." },
    { name: "in-accordion", description: "Owned by a accordion." },
    { name: "in-popup", description: "Owned by a popup." },
    { name: "in-toast", description: "Owned by a toast." },
    { name: "in-search", description: "Owned by a search." },
    { name: "in-header", description: "Owned by a header." }
  ],
  texts: []
} as const satisfies ComponentVocabulary
