/**
 * Every name `<epic-choices>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-choices>`
 * A question's option cards.
 ****************/
export const epicChoicesVocabulary = {
  tag: "epic-choices",
  topics: ["documentation", "selection", "cards"],
  aka: ["choices", "options", "pros and cons", "alternatives"],
  skeleton: null,
  noun: "choices",
  ui: false,
  description:
    "A question's option cards, `<epic-option>`s:  side by side while the question is open (the Choose pills " +
    "come later);  folded under Choices once it's answered, the chosen one marked.",
  attributes: [
    {
      name: "chosen",
      kind: "string",
      format: "letter",
      description: "The chosen option's `letter`, once answered;  absent while the question is open."
    }
  ],
  events: [],
  slots: [{ name: "", description: "The options." }],
  parts: [{ name: "base", description: "The cards." }],
  states: [],
  texts: [],
  children: [{ tag: "epic-option", min: 1, description: "The options, `A`, `B` ..." }]
} as const satisfies EpicVocabulary
