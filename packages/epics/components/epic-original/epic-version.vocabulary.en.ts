/**
 * Every name `<epic-version>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-version>`
 * One earlier version of an item's text, in its Original Discussion.
 ****************/
export const epicVersionVocabulary = {
  tag: "epic-version",
  topics: ["documentation", "content parts"],
  aka: ["version", "revision", "earlier text"],
  skeleton: null,
  noun: "version",
  ui: false,
  description:
    "One earlier version of an item's text:  headed `As first written` (undated) or `As of <as-of>`;  ids inside " +
    "are `data-original-id`s, so nothing links into it.",
  attributes: [
    {
      name: "as-of",
      kind: "string",
      format: "time",
      description: "When it was replaced (`2026-10-04 20:49`);  absent on the first version, as first written."
    }
  ],
  events: [],
  slots: [{ name: "", description: "The text, as it was." }],
  parts: [{ name: "base", description: "The version." }],
  states: [],
  texts: [],
  children: [{ tag: "flow", description: "The text, as it was." }]
} as const satisfies EpicVocabulary
