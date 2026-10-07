/**
 * Every name `<epic-original>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-original>`
 * An item's Original Discussion:  its earlier text, folded.
 ****************/
export const epicOriginalVocabulary = {
  tag: "epic-original",
  topics: ["documentation", "containers"],
  aka: ["original discussion", "history", "earlier versions", "revisions"],
  skeleton: null,
  noun: "original",
  ui: false,
  description:
    "An item's Original Discussion:  the text a rewrite or a second answer replaced, one `<epic-version>` each, " +
    "oldest first, folded.  Ignored by everything that reads the item (options never counted, links never checked).",
  attributes: [],
  events: [],
  slots: [{ name: "", description: "The versions." }],
  parts: [
    { name: "base", description: "The aside." },
    { name: "toggle", description: "Its `Original Discussion` `<button>`, which folds it." },
    { name: "body", description: "The versions;  hidden while folded." }
  ],
  states: [{ name: "open", description: "Unfolded (it starts folded)." }],
  texts: [{ key: "original", text: "Original Discussion", description: "The aside's heading." }],
  children: [{ tag: "epic-version", min: 1, description: "The versions, oldest first." }]
} as const satisfies EpicVocabulary
