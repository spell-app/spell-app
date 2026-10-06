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
 * ### `<ui-header>`
 * A header:  standalone, `<div class="ui ... header">` (`<h1>` ... `<h6>` with `level`);  owned, `<div class="header">`.
 ****************/
export const headerVocabulary = {
  tag: "ui-header",
  topics: ["content parts", "typography", "text", "basic", "elements"],
  aka: ["heading", "title", "h1", "headline"],
  skeleton: { parts: [{ shape: "line", length: "medium" }] },
  noun: "header",
  plural: "headers",
  description: "A header provides a short summary of content.",
  attributes: [
    {
      name: "level",
      kind: "enum",
      values: ["1", "2", "3", "4", "5", "6"],
      description: "Page header:  renders `<h1>` ... `<h6>`, sized by level unless `size` is set."
    },
    {
      name: "size",
      kind: "size",
      description:
        "Content header size relative to the surrounding text, `mini` ... `massive`;  `medium` is the default."
    },
    { name: "color", kind: "color", description: "Hue of the text (and of a `dividing` rule)." },
    {
      name: "sub",
      kind: "keyOnly",
      description: "A sub heading:  small, uppercase.  Inside a header, its sub header."
    },
    { name: "icon", kind: "keyOnly", description: "Icon header:  a large slotted icon centred above the text." },
    { name: "dividing", kind: "keyOnly", description: "A rule below it." },
    { name: "block", kind: "keyOnly", description: "In a tinted box." },
    {
      name: "attached",
      kind: "keyOrValueAndKey",
      values: ["top", "bottom"],
      description: "Joined to a segment below (`top`) or above (`bottom`);  bare `attached` sits between two."
    },
    { name: "seamless", kind: "keyOnly", description: "With `attached`:  no line where it meets the segment." },
    { name: "floated", kind: "valueAndKey", values: "floats", description: "Floats `left` or `right`." },
    {
      name: "text-align",
      kind: "textAlign",
      values: "alignments",
      description: "Aligns its text `left`, `center`, `right` or `justified`."
    },
    { name: "fitted", kind: "keyOnly", description: "No padding." },
    { name: "disabled", kind: "keyOnly", description: "Dimmed." },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds:  the dark scheme, for it and its parts." },
    { name: "href", kind: "string", description: "Renders a link (`<a>`) styled as a header." }
  ],
  events: [],
  slots: [
    {
      name: "",
      description: "Text, a slotted `<ui-icon>` / `<img>`, a `<ui-content>` and a nested `<ui-header>` (sub header)."
    }
  ],
  parts: [{ name: "header", description: "The header box (`<div>`, `<h1>` ... `<h6>`, or `<a>`)." }],
  states: [
    { name: "in-card", description: "Owned by a card." },
    { name: "in-item", description: "Owned by an item." },
    { name: "in-modal", description: "Owned by a modal." },
    { name: "in-flyout", description: "Owned by a flyout." },
    { name: "in-message", description: "Owned by a message." },
    { name: "in-list", description: "Owned by a list." },
    { name: "in-popup", description: "Owned by a popup." },
    { name: "in-toast", description: "Owned by a toast." },
    { name: "in-header", description: "Owned by a header." },
    { name: "in-menu", description: "Owned by a menu:  an item's sub header (a vertical menu's `.item > .header`)." }
  ],
  texts: [],
  ownsParts: ["header", "content"]
} as const satisfies E.ComponentVocabulary
