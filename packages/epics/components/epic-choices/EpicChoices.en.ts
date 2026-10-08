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
  noun: "choices",
  ui: false,
  description:
    "A question's option cards, `<epic-option>`s:  side by side while the question is open, each with a Choose " +
    "pill while the page is reviewed;  folded under Choices once it's answered, the chosen one marked.",
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
  parts: [
    { name: "base", description: "The cards side by side;  answered, the folded Choices aside." },
    { name: "toggle", description: "Answered:  the `Choices` `<button>` that folds the options." },
    { name: "panels", description: "Answered:  the box of option panels, hidden while folded." }
  ],
  states: [
    { name: "answered", description: "Its question is answered (`chosen`, or `answered` on its item):  folded." },
    { name: "open", description: "Answered, and its options unfolded." }
  ],
  texts: [{ key: "choices", text: "Choices", description: "The answered question's options' heading." }],
  children: [{ tag: "epic-option", min: 1, description: "The options, `A`, `B` ..." }],
  // P14:  options in any prose too -- a reply's, a judgement call's text (`Upgrader`, the old prose option grids)
  flow: true
} as const satisfies EpicVocabulary
