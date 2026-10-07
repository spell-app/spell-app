/**
 * Every name `<epic-commit>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-commit>`
 * One commit of a phase or an item.
 ****************/
export const epicCommitVocabulary = {
  tag: "epic-commit",
  topics: ["documentation", "lists"],
  aka: ["commit", "change", "git"],
  skeleton: null,
  noun: "commit",
  ui: false,
  description:
    "One commit that built a phase or fixed an item:  its short sha is drawn, linked through `<epic-page repo>`;  " +
    "its sentence is its children.",
  attributes: [
    {
      name: "sha",
      kind: "string",
      required: true,
      format: "sha",
      description: "The commit's full sha (shown as its first 7)."
    }
  ],
  events: [],
  slots: [{ name: "", description: "What it did, one or two sentences." }],
  parts: [{ name: "base", description: "The line." }],
  states: [],
  texts: [],
  children: [{ tag: "flow", description: "What it did, one or two sentences." }]
} as const satisfies EpicVocabulary
