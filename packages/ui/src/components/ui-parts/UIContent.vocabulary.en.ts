/**
 * The English vocabulary of `<ui-content>`, one of the 13 generic content parts:  every name the tag uses.
 * - The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - The noun IS the part word, and the class its root carries:  `<ui-content>` => `class="content"`.
 *   Parts have no `ui` class (`ui: false`), except a STANDALONE `<ui-header>`, which is Fomantic's `ui header`.
 * - Owners declare the parts they own (`ownsParts` in THEIR vocabularies).
 *   `OwnerContext` finds a part's nearest owner, and the part sets `:state(in-<owner>)`;
 *   its `states` list the owners Fomantic styles it in.
 * - `UIParts.css` styles every part;  its header lists the tokens owners must set.
 */

import type { E } from "$/ui/core"

/****************
 * ### `contentVocabulary`
 * The names of `<ui-content>`, a content block:  `<div class="content">`.
 ****************/
export const contentVocabulary = {
  tag: "ui-content",
  topics: ["content parts", "containers", "cards"],
  aka: ["body", "content area", "card body"],
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
    { name: "in-item", description: "Owned by an item." },
    { name: "in-feed", description: "Owned by a feed." },
    { name: "in-comment", description: "Owned by a comment." },
    { name: "in-modal", description: "Owned by a modal." },
    { name: "in-flyout", description: "Owned by a flyout." },
    { name: "in-message", description: "Owned by a message." },
    { name: "in-list", description: "Owned by a list." },
    { name: "in-step", description: "Owned by a step." },
    { name: "in-accordion", description: "Owned by an accordion." },
    { name: "in-popup", description: "Owned by a popup." },
    { name: "in-toast", description: "Owned by a toast." },
    { name: "in-search", description: "Owned by a search." },
    { name: "in-header", description: "Owned by a header." }
  ],
  texts: []
} as const satisfies E.ComponentVocabulary
