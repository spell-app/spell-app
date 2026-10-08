/**
 * The English vocabulary of `<ui-placeholder-paragraph>`:  every name the tag uses.
 * - Its tag, attributes (each with its kind and allowed values), slots and parts.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - A skeleton shape, `ui: false`:  it sits inside a `<ui-placeholder>`,
 *   whose vocabulary (`UIPlaceholder.vocabulary.en.ts`) says how the family's attributes become class words.
 */

import type { E } from "$/ui/core"

/****************
 * ### `placeholderParagraphVocabulary`
 * The names of `<ui-placeholder-paragraph>`, a paragraph's skeleton:
 * `<div class="paragraph" part="paragraph">` around a slot.
 ****************/
export const placeholderParagraphVocabulary = {
  tag: "ui-placeholder-paragraph",
  topics: ["loading", "content parts", "elements"],
  aka: ["skeleton text", "skeleton paragraph"],
  noun: "paragraph",
  ui: false,
  description: "The skeleton of a paragraph:  a block of lines, of varied lengths unless set.",
  attributes: [],
  events: [],
  slots: [{ name: "", description: "`<ui-placeholder-line>`s." }],
  parts: [{ name: "paragraph", description: "The paragraph block." }],
  states: [],
  texts: []
} as const satisfies E.ComponentVocabulary
