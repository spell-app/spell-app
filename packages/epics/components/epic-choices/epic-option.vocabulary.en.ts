/**
 * Every name `<epic-option>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-option>`
 * One option card of a question.
 ****************/
export const epicOptionVocabulary = {
  tag: "epic-option",
  topics: ["documentation", "selection", "cards"],
  aka: ["option", "choice", "alternative", "card"],
  skeleton: null,
  noun: "option",
  ui: false,
  description: "One option of a question:  its letter and title are drawn;  its pros and cons are its children.",
  attributes: [
    {
      name: "letter",
      kind: "string",
      required: true,
      format: "letter",
      description: "`A`, `B` ...:  what `<epic-choices chosen>` and Owen's pick name."
    },
    {
      name: "title",
      property: "epicTitle",
      kind: "string",
      required: "or slot",
      description: "The option in a few words, WITHOUT its letter (`A named palette`)."
    },
    { name: "recommended", kind: "boolean", description: "The one Claude recommends." }
  ],
  events: [],
  slots: [
    { name: "", description: "Its pros and cons." },
    { name: "title", description: "A title with markup, in place of `title`." },
    { name: "actions", description: "At the end of its header:  the Choose pill (P9).  Page state only." }
  ],
  parts: [
    { name: "base", description: "The card;  answered, a panel." },
    { name: "header", description: "Its header:  letter, title, `(recommended)`, actions." },
    { name: "toggle", description: "Answered:  the `<button>` that folds the panel (its header's text)." },
    { name: "check", description: "Answered and chosen:  the check before its letter." },
    { name: "title", description: "`A · A named palette`." },
    { name: "recommended", description: "`(recommended)`." },
    { name: "actions", description: "The box around the `actions` slot." },
    { name: "body", description: "Its pros and cons;  answered, hidden while folded." }
  ],
  states: [
    { name: "answered", description: "Its question is answered:  a panel under Choices." },
    { name: "chosen", description: "Its `letter` is its `<epic-choices chosen>`." },
    { name: "open", description: "Answered, and unfolded (the chosen one starts so)." }
  ],
  texts: [{ key: "recommended", text: "(recommended)", description: "After the recommended option's title." }],
  children: [
    { tag: "flow", slot: "title", max: 1, description: "A title with markup." },
    { tag: "flow", description: "Its pros and cons." }
  ]
} as const satisfies EpicVocabulary
