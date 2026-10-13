/**
 * The English vocabulary of `<ui-placeholder-line>`:  every name the tag uses.
 * - Its tag, attributes (each with its kind and allowed values), slots and parts.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - A skeleton shape, `ui: false`:  it sits inside a `<ui-placeholder>`,
 *   whose vocabulary (`UIPlaceholder.en.ts`) says how the family's attributes become class words.
 */

import type { E } from "$/ui/core"

/****************
 * ### `placeholderLineVocabulary`
 * The names of `<ui-placeholder-line>`, one bar:  `<div class="[length] line" part="line">`, empty.
 ****************/
export const placeholderLineVocabulary = {
  tag: "ui-placeholder-line",
  topics: ["loading", "content parts", "elements"],
  aka: ["skeleton line"],
  noun: "line",
  ui: false,
  description: "One line of text's skeleton:  a bar.",
  attributes: [
    {
      name: "length",
      kind: "valueOnly",
      values: ["full", "very long", "long", "medium", "short", "very short"],
      description:
        "How long the bar is;  absent, it follows its position in the block.  `medium` IS a length here, not a size."
    }
  ],
  events: [],
  slots: [],
  parts: [{ name: "line", description: "The bar." }],
  states: [],
  texts: []
} as const satisfies E.ComponentVocabulary
