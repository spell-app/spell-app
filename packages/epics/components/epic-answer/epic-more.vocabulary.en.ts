/**
 * Every name `<epic-more>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-more>`
 * The More Details card on an item.
 ****************/
export const epicMoreVocabulary = {
  tag: "epic-more",
  topics: ["documentation", "cards"],
  aka: ["more details", "details", "follow-up", "addendum"],
  skeleton: null,
  noun: "more",
  ui: false,
  description:
    "More Details (Add Details Now):  a white, open, foldable card under an item's text and answer;  the item's " +
    "own text above it is labelled Original Reply.  A second Add Details replaces it.",
  attributes: [],
  events: [],
  slots: [{ name: "", description: "What the item's text left out." }],
  parts: [{ name: "base", description: "The card." }],
  states: [],
  texts: [],
  children: [{ tag: "flow", description: "What the item's text left out." }]
} as const satisfies EpicVocabulary
