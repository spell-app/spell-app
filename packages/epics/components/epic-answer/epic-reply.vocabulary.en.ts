/**
 * Every name `<epic-reply>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-reply>`
 * A reply card on an item.
 ****************/
export const epicReplyVocabulary = {
  tag: "epic-reply",
  topics: ["documentation", "cards", "social"],
  aka: ["reply", "comment", "response", "note"],
  skeleton: null,
  noun: "reply",
  ui: false,
  description:
    "A reply on an item, after its answer:  `<from> · <at> · re: <re>` is drawn;  the reply is its children.",
  attributes: [
    { name: "from", kind: "string", description: "Who wrote it (`Claude`, `Owen`)." },
    { name: "at", kind: "string", format: "time", description: "When:  `2026-10-06 23:55`." },
    { name: "re", kind: "string", description: "What it's about (`as built (Doc Review)`, `revisit soon`)." }
  ],
  events: [],
  slots: [{ name: "", description: "The reply." }],
  parts: [{ name: "base", description: "The card." }],
  states: [],
  texts: [],
  children: [{ tag: "flow", description: "The reply." }]
} as const satisfies EpicVocabulary
