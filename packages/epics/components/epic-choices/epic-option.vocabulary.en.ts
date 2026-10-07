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
  parts: [
    { name: "base", description: "The card;  answered, a panel." },
    { name: "header", description: "Its header:  letter, title, `(recommended)`, the Choose pill." },
    { name: "toggle", description: "Answered:  the `<button>` that folds the panel (its header's text)." },
    { name: "check", description: "Answered and chosen:  the check before its letter." },
    { name: "title", description: "`A · A named palette`." },
    { name: "recommended", description: "`(recommended)`." },
    { name: "actions", description: "While the page is reviewed:  the box at the header's end holding the pill." },
    {
      name: "choose",
      description:
        "The Choose pill (`<button aria-pressed>`):  marks its letter as the item's pick in the page's review inbox."
    },
    { name: "body", description: "Its pros and cons;  answered, hidden while folded." }
  ],
  states: [
    { name: "answered", description: "Its question is answered:  a panel under Choices." },
    { name: "chosen", description: "Its `letter` is its `<epic-choices chosen>`." },
    { name: "open", description: "Answered, and unfolded (the chosen one starts so)." },
    { name: "picked", description: "Its letter is the item's pick in the review inbox:  framed orange until applied." }
  ],
  texts: [
    { key: "recommended", text: "(recommended)", description: "After the recommended option's title." },
    { key: "choose", text: "Choose", description: "The Choose pill." },
    { key: "chosen", text: "Chosen", description: "The Choose pill, its letter picked." },
    { key: "tipChoose", text: "Pick {letter}", description: "The pill's tooltip." },
    { key: "tipChosen", text: "{letter} is picked:  click to un-pick", description: "The picked pill's tooltip." },
    { key: "tipSent", text: "sent", description: "The picked pill's tooltip, once its mark went to Claude." },
    { key: "tipNotSent", text: "not sent yet", description: "The picked pill's tooltip, before Send." }
  ],
  children: [
    { tag: "flow", slot: "title", max: 1, description: "A title with markup." },
    { tag: "flow", description: "Its pros and cons." }
  ]
} as const satisfies EpicVocabulary
