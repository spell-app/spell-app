/**
 * Every name `<epic-choices>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-choices>`
 * Option cards:  a question's, or the options any item's prose weighs (a call's, a reply's).
 ****************/
export const epicChoicesVocabulary = {
  tag: "epic-choices",
  topics: ["documentation", "selection", "cards"],
  aka: ["choices", "options", "pros and cons", "alternatives"],
  noun: "choices",
  ui: false,
  description:
    "Option cards, `<epic-option>`s:  side by side while open, each with a Choose pill while the page is reviewed;  " +
    "folded under Choices once answered, the chosen one marked.  Wherever prose goes (`flow`, P14):  a question's " +
    "own, after its text, or the options any item weighs -- a judgement call's, a reply's, More Details'.",
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
    {
      name: "chosen",
      description: "Answered with an option chosen:  `✓ Chosen:  B · Bananas` in the toggle, green, folded or not."
    },
    { name: "panels", description: "Answered:  the box of option panels, hidden while folded." }
  ],
  states: [
    { name: "answered", description: "Its question is answered (`chosen`, or `answered` on its item):  folded." },
    { name: "open", description: "Answered, and its options unfolded." }
  ],
  texts: [
    { key: "choices", text: "Choices", description: "The answered question's options' heading." },
    {
      key: "chosen",
      text: "Chosen:  {name}",
      description: "After the heading:  the chosen option, `{name}` its letter and title (`B · Bananas`)."
    }
  ],
  children: [{ tag: "epic-option", min: 1, description: "The options, `A`, `B` ..." }],
  // P14:  options in any prose too -- a reply's, a judgement call's text (`Upgrader`, the old prose option grids)
  flow: true
} as const satisfies EpicVocabulary
