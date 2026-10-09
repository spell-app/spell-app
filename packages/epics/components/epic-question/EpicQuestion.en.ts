/**
 * Every name `<epic-question>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-question>`
 * A question's text, as first asked.
 ****************/
export const epicQuestionVocabulary = {
  tag: "epic-question",
  topics: ["documentation", "content parts", "text"],
  aka: ["question", "original question", "ask", "prompt"],
  noun: "question",
  ui: false,
  description:
    "A question's text as first asked, under a small `Question` label:  the first thing in its item, before its " +
    "options and answer.  The tool finds the question by this tag, not by its place.  The text stays the page's " +
    "own children.",
  attributes: [],
  events: [],
  slots: [{ name: "", description: "The question, as asked." }],
  parts: [
    { name: "base", description: "The label over the text." },
    { name: "label", description: "`Question`, a small grey eyebrow (as an item's `Original question`)." }
  ],
  states: [],
  texts: [{ key: "label", text: "Question", description: "Over the question's text." }],
  children: [{ tag: "flow", description: "The question, as asked." }]
} as const satisfies EpicVocabulary
