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
    "A reply on an item, after its answer:  `<from> · re: <re>` is drawn, the date at the right;  the reply is its " +
    "children.",
  attributes: [
    { name: "from", kind: "string", description: "Who wrote it (`Claude`, `Owen`)." },
    {
      name: "at",
      kind: "string",
      format: "time",
      description: "When:  `2026-10-06 23:55`, drawn `10/6/26 23:55` (`PlanDates`)."
    },
    { name: "re", kind: "string", description: "What it's about (`as built (Doc Review)`, `revisit soon`)." }
  ],
  events: [],
  slots: [{ name: "", description: "The reply." }],
  parts: [
    { name: "base", description: "The card:  Claude's violet, Owen's orange (`from`)." },
    { name: "header", description: "Its heading band, a flex row:  `who` left, `date` right." },
    { name: "who", description: "The heading's left:  `<from> · re: <re>`;  wraps within itself." },
    { name: "date", description: "The heading's right:  `at`, `10/6/26 23:55`, on the top line;  never wraps." },
    { name: "body", description: "The reply;  not drawn when empty." }
  ],
  states: [],
  texts: [{ key: "re", text: "re: {re}", description: "What the reply is about, in its heading." }],
  children: [{ tag: "flow", description: "The reply." }]
} as const satisfies EpicVocabulary
