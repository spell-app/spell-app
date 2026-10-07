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
    { name: "title", description: "A title with markup, in place of `title`." }
  ],
  parts: [{ name: "base", description: "The card." }],
  states: [],
  texts: [],
  children: [
    { tag: "flow", slot: "title", max: 1, description: "A title with markup." },
    { tag: "flow", description: "Its pros and cons." }
  ]
} as const satisfies EpicVocabulary
