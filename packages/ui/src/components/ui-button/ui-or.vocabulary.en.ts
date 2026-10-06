/**
 * Every name `<ui-or>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states,
 * texts.  Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - The family's grammar notes are in `ui-button.vocabulary.en.ts`.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-or>`
 * The round "or" between two buttons of a group:  `<span class="or" data-text="or">`.
 ****************/
export const orVocabulary = {
  tag: "ui-or",
  topics: ["buttons", "controls", "elements"],
  aka: ["button separator", "or divider"],
  skeleton: false,
  noun: "or",
  ui: false,
  description: "A conditional between two buttons of a group.",
  attributes: [
    {
      name: "text",
      kind: "string",
      description: "Badge text;  default the translated `or` text.  Keep it to a short word."
    }
  ],
  events: [],
  slots: [],
  parts: [{ name: "or", description: "The badge." }],
  states: [{ name: "or", description: "Marks the host as a separator, so a group doesn't stretch it." }],
  texts: [{ key: "or", text: "or", description: "Badge text." }]
} as const satisfies ComponentVocabulary
