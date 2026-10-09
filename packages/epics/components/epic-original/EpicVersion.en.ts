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
      description:
        "When it was replaced (`2026-10-04 20:49`, drawn `10/4/26 20:49`);  absent on the first version, as first " +
        "written."
    }
  ],
  events: [],
  slots: [{ name: "", description: "The text, as it was." }],
  parts: [
    { name: "base", description: "The version." },
    { name: "heading", description: "`As first written` / `As of <as-of>`:  none on a lone first version." },
    { name: "body", description: "The text, as it was." }
  ],
  states: [],
  texts: [
    {
      key: "firstWritten",
      text: "As first written",
      description: "The first version's heading, once there's a second."
    },
    { key: "asOf", text: "As of {asOf}", description: "A later version's heading:  when it was replaced." }
  ],
  children: [
    { tag: "epic-question", max: 1, description: "A question's text as first asked, moved here by a rewrite." },
    { tag: "flow", description: "The text, as it was." },
    { tag: "epic-answer", max: 1, description: "Its answer card, as it was (P14:  hand-written ones converted)." },
    { tag: "epic-reply", description: "Its replies, as they were (P14:  hand-written ones converted)." }
  ]
} as const satisfies EpicVocabulary
