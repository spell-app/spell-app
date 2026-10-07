/**
 * Every name `<epic-answer>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-answer>`
 * An answered question's answer card.
 ****************/
export const epicAnswerVocabulary = {
  tag: "epic-answer",
  topics: ["documentation", "cards", "feedback"],
  aka: ["answer", "decision", "resolution", "verdict"],
  skeleton: null,
  noun: "answer",
  ui: false,
  description:
    "An answered question's answer card, after its question and Choices:  titled `Answer · <title>`, or " +
    "`D7 · <title>` when it keeps an old decision's id.",
  attributes: [
    {
      name: "id",
      property: "epicId",
      kind: "string",
      format: "anchor",
      description:
        "An old decision's id (`d7`), from before decisions became answers (2026-10-04):  old `#d7` links land on " +
        "it.  Absent on new answers."
    },
    {
      name: "title",
      property: "epicTitle",
      kind: "string",
      description: "The answer in a few words (`Named palette`)."
    }
  ],
  events: [],
  slots: [{ name: "", description: "The answer, and why." }],
  parts: [
    { name: "base", description: "The card." },
    { name: "header", description: "Its heading band:  `Answer · <title>`." },
    { name: "label", description: "`Answer`, or the old decision's id (`D7`)." },
    { name: "title", description: "The title." },
    { name: "body", description: "The answer, and why;  not drawn when empty." }
  ],
  states: [],
  texts: [{ key: "answer", text: "Answer", description: "The card's label, without an old decision's id." }],
  children: [{ tag: "flow", description: "The answer, and why." }]
} as const satisfies EpicVocabulary
