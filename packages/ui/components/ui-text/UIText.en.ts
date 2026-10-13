/**
 * The English vocabulary of `<ui-text>`:  every name the tag uses.
 * - Its tag, attributes (each with its kind and allowed values), slots, parts and states.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - The attributes become Fomantic's class words, in Fomantic's order (`ClassBuilder`):
 *   `<ui-text size="large" color="red" inverted>` => `ui large red inverted text`;
 *   `<ui-text state="error">` => `ui error text`.
 * - Sizes are relative to the surrounding text, on Fomantic's text ladder (`mini` 0.4em ... `massive` 8em).
 */

import type { E } from "$/ui/core"

/****************
 * ### `textVocabulary`
 * The names of `<ui-text>`, inline text:  `<span class="ui … text" part="text">` around a slot.
 ****************/
export const textVocabulary = {
  tag: "ui-text",
  topics: ["text", "typography", "basic", "elements"],
  aka: ["span", "inline text", "colored text", "label text"],
  noun: "text",
  description: "A text is used to style some inline text with a simple color.",
  attributes: [
    {
      name: "size",
      kind: "size",
      description: "Size relative to the surrounding text, `mini` (0.4em) ... `massive` (8em);  `medium` is 1em."
    },
    { name: "color", kind: "color", description: "Hue of the text." },
    {
      name: "state",
      kind: "valueOnly",
      values: ["error", "info", "success", "warning"],
      description: "Semantic colour of a status message."
    },
    { name: "inverted", kind: "keyOnly", description: "The hue as it reads on a dark surface." },
    { name: "disabled", kind: "keyOnly", description: "Faded:  shown as unavailable." }
  ],
  events: [],
  slots: [{ name: "", description: "The text." }],
  parts: [{ name: "text", description: "The inline text box." }],
  states: [{ name: "disabled", description: "Faded:  shown as unavailable." }],
  texts: []
} as const satisfies E.ComponentVocabulary
