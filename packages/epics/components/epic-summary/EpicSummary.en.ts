/**
 * Every name `<epic-summary>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-summary>`
 * The Overview's summary:  what the epic is, in two sentences.
 ****************/
export const epicSummaryVocabulary = {
  tag: "epic-summary",
  topics: ["documentation", "text", "typography"],
  aka: ["summary", "lede", "abstract", "tl;dr"],
  noun: "summary",
  ui: false,
  description:
    "The Overview's summary, two sentences, drawn as a lede at the top of `1. Overview`.  The text stays the page's " +
    "own children.",
  attributes: [],
  events: [],
  slots: [{ name: "", description: "The summary:  text, or a `<p>`." }],
  parts: [{ name: "base", description: "The lede." }],
  states: [],
  texts: [],
  children: [{ tag: "flow", description: "The summary." }]
} as const satisfies EpicVocabulary
