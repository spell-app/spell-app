/**
 * The English vocabulary of `<ui-placeholder-image>`:  every name the tag uses.
 * - Its tag, attributes (each with its kind and allowed values), slots and parts.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - A skeleton shape, `ui: false`:  it sits inside a `<ui-placeholder>`,
 *   whose vocabulary (`UIPlaceholder.vocabulary.en.ts`) says how the family's attributes become class words.
 */

import type { E } from "$/ui/core"

/****************
 * ### `placeholderImageVocabulary`
 * The names of `<ui-placeholder-image>`, an image's skeleton:  `<div class="[square] [rectangular] image"
 * part="image">`, empty.
 ****************/
export const placeholderImageVocabulary = {
  tag: "ui-placeholder-image",
  topics: ["loading", "images", "elements"],
  aka: ["skeleton image", "image placeholder"],
  noun: "image",
  ui: false,
  description: "The skeleton of an image:  a block of fixed height, or of a fixed aspect ratio.",
  attributes: [
    { name: "square", kind: "keyOnly", description: "A 1:1 block as wide as its container." },
    {
      name: "rectangular",
      kind: "keyOnly",
      description: "A 4:3 block as wide as its container;  wins over `square` if both are set."
    }
  ],
  events: [],
  slots: [],
  parts: [{ name: "image", description: "The image block." }],
  states: [],
  texts: []
} as const satisfies E.ComponentVocabulary
