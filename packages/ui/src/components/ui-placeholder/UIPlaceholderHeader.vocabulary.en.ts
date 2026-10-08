/**
 * The English vocabulary of `<ui-placeholder-header>`:  every name the tag uses.
 * - Its tag, attributes (each with its kind and allowed values), slots and parts.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - A skeleton shape, `ui: false`:  it sits inside a `<ui-placeholder>`,
 *   whose vocabulary (`UIPlaceholder.vocabulary.en.ts`) says how the family's attributes become class words.
 */

import type { E } from "$/ui/core"

/****************
 * ### `placeholderHeaderVocabulary`
 * The names of `<ui-placeholder-header>`, a header's skeleton, two taller bars:
 * `<div class="[image] header" part="header">` around a slot.
 ****************/
export const placeholderHeaderVocabulary = {
  tag: "ui-placeholder-header",
  topics: ["loading", "content parts", "elements"],
  aka: ["skeleton heading"],
  noun: "header",
  ui: false,
  description: "The skeleton of a header:  a block of taller, shorter lines, optionally beside an image.",
  attributes: [{ name: "image", kind: "keyOnly", description: "A square image beside the lines." }],
  events: [],
  slots: [{ name: "", description: "`<ui-placeholder-line>`s, usually two." }],
  parts: [{ name: "header", description: "The header block;  with `image`, its `::before` is the square." }],
  states: [],
  texts: []
} as const satisfies E.ComponentVocabulary
