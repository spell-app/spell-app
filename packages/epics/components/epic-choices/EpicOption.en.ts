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
    { name: "header", description: "Its header:  letter, title, the recommended thumbs-up, the Choose pill." },
    {
      name: "toggle",
      description:
        "The `<button>` that folds the card or panel (its header's text, the chevron first);  a card with no pros " +
        "and cons:  a plain span."
    },
    { name: "check", description: "Answered and chosen:  the check before its letter." },
    { name: "title", description: "`A · A named palette`." },
    {
      name: "recommended",
      description: "The recommended one's violet thumbs-up, after its title, labelled `Recommended`."
    },
    { name: "actions", description: "While the page is reviewed:  the box at the header's end holding the pill." },
    {
      name: "choose",
      description:
        "The Choose pill (`<button aria-pressed>`):  marks its letter as the item's pick in the page's review inbox;  " +
        "on the chosen option, solid and `aria-disabled`:  the pick applied."
    },
    { name: "body", description: "Its pros and cons;  hidden (`until-found`) while folded." }
  ],
  states: [
    { name: "answered", description: "Its question is answered:  a panel under Choices." },
    { name: "chosen", description: "Its `letter` is its `<epic-choices chosen>`." },
    {
      name: "open",
      description: "Unfolded:  a card starts so;  an answered panel only when it's the chosen one (page state)."
    },
    {
      name: "picked",
      description:
        "Its letter is the item's pick in the review inbox, in its card set, not applied yet:  framed green:  " +
        "dashed until sent, then outlined."
    }
  ],
  texts: [
    {
      key: "recommended",
      text: "Recommended",
      description: "The thumbs-up after the recommended option's title:  its label and tooltip."
    },
    { key: "choose", text: "Choose", description: "The Choose pill." },
    { key: "chosen", text: "Chosen", description: "The Choose pill, its letter picked." },
    { key: "tipChoose", text: "Pick {letter}", description: "The pill's tooltip." },
    { key: "tipChosen", text: "{letter} is picked:  click to un-pick", description: "The picked pill's tooltip." },
    { key: "tipSent", text: "sent", description: "The picked pill's tooltip, once its mark went to Claude." },
    { key: "tipNotSent", text: "not sent yet", description: "The picked pill's tooltip, before Send." },
    {
      key: "tipApplied",
      text: "{letter} is the chosen option",
      description: "The chosen option's pill's tooltip:  the pick applied."
    }
  ],
  children: [
    { tag: "flow", slot: "title", max: 1, description: "A title with markup." },
    { tag: "flow", description: "Its pros and cons." }
  ]
} as const satisfies EpicVocabulary
