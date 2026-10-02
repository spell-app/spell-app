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
 * ### `<ui-avatar>`
 * An avatar:  `<span class="avatar"><img alt=""></span>`.
 ****************/
export const avatarVocabulary = {
  tag: "ui-avatar",
  topics: ["content parts", "images", "social"],
  aka: ["profile picture", "user image", "userpic"],
  skeleton: null,
  noun: "avatar",
  ui: false,
  description: "A small picture of a person:  a comment's or a card's.",
  attributes: [
    { name: "src", kind: "string", description: "Image URL;  renders the `<img>` (or slot one)." },
    { name: "alt", kind: "string", description: 'Alternative text;  default `""` (decorative, the name is nearby).' }
  ],
  events: [],
  slots: [{ name: "", description: "An `<img>`, instead of `src`." }],
  parts: [
    { name: "avatar", description: "The avatar box." },
    { name: "image", description: "The `<img>` rendered from `src`." }
  ],
  states: [
    { name: "in-card", description: "Owned by a card." },
    { name: "in-item", description: "Owned by a item." },
    { name: "in-comment", description: "Owned by a comment." }
  ],
  texts: []
} as const satisfies ComponentVocabulary
