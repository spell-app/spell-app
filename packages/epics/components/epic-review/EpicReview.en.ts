/**
 * Every name `<epic-review>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type`, plus its texts and value lists from its types file, data too.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

import { REVIEW_KINDS, REVIEW_NAME_TEXTS, REVIEW_SHOWS, REVIEW_TEXTS } from "./EpicReview.types"

/****************
 * ### `<epic-review>`
 * The review controls (P9):  what Owen does with an item, an Overview sub-section, a phase or the summary
 * while the page is reviewed.
 ****************/
export const epicReviewVocabulary = {
  tag: "epic-review",
  topics: ["forms", "buttons", "status"],
  aka: ["review controls", "review buttons", "note box", "review note", "approve", "revisit", "do now"],
  skeleton: "inline 6 x 1.5",
  noun: "review controls",
  ui: false,
  description:
    "The review controls of one item, Overview sub-section, phase or the summary (P9), drawn by its family in its own " +
    "shadow root, never written in a doc:  the buttons at the end of its line (`shows=buttons`), its note box " +
    "(`note`) or a marked note (`said`).  Only while the page is reviewed (served by the page server, its inbox " +
    "answering);  every one reads and writes the page's review inbox (`ReviewClient`).",
  attributes: [
    {
      name: "of",
      kind: "string",
      required: true,
      description: "The inbox key it marks:  the element's id (`q7`, `o1`, `p3`), or `summary`."
    },
    {
      name: "shows",
      kind: "enum",
      values: REVIEW_SHOWS,
      required: true,
      description:
        "What it draws:  `buttons` (the controls at the end of a line or title), `note` (the note box), `said` (a " +
        "marked note, its box closed, with Edit)."
    },
    {
      name: "buttons",
      kind: "enum",
      values: REVIEW_KINDS,
      default: "item",
      description:
        "Whose:  `item` (Approve, Revisit, Make Todo, Do Now), `todo` (the plane, Revisit, the x;  its note box the " +
        "plane, Revisit Later, the x), `part` (an Overview sub-section, a phase, the summary:  no Approve)."
    },
    {
      name: "label",
      kind: "string",
      description:
        "Its element's name as shown (`Q7`, `the summary`):  the buttons' group's and the note's spoken name."
    },
    {
      name: "tip",
      kind: "string",
      description:
        "The element's review label in words (`reviewed 10/7/26`), after each button's name in its tooltip " +
        "(`Approve · reviewed 10/7/26`)."
    },
    {
      name: "under-line",
      kind: "boolean",
      description:
        "A note box under an item's line (the item has no details):  done with it, it closes, its draft kept.  " +
        "Without it, a box stays, and stops counting as written in once it's empty."
    }
  ],
  events: [
    {
      name: "epic-show-note",
      detail: "{ of: string }",
      description:
        "Revisit or Edit pressed:  the reader is taken to the note box, which then takes the focus.  The family that " +
        "draws it unfolds to show the box."
    }
  ],
  slots: [],
  parts: [
    {
      name: "base",
      description:
        "What it draws:  the buttons' group (`shows=buttons`), the note box (`note`), or the marked note (`said`)."
    }
  ],
  states: [],
  texts: [...REVIEW_NAME_TEXTS, ...REVIEW_TEXTS],
  children: []
} as const satisfies EpicVocabulary
