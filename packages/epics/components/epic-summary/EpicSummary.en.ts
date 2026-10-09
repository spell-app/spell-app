/**
 * Every name `<epic-summary>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type`, plus the review controls' parts and texts (`REVIEW_*`) from `epic-item`'s types file,
 *   data too:  the summary takes review notes (epic `airplane` P2).
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

// the review controls the summary draws, as `<epic-item>` does
import { REVIEW_PARTS, REVIEW_TEXTS } from "$/epics/components/epic-item/EpicItem.types"

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
    "own children.  While the page is reviewed, it takes review notes as an Overview sub-section does (Revisit, Make " +
    "Todo, Do Now), keyed `summary` in the review inbox:  it has no id of its own.",
  attributes: [],
  events: [],
  slots: [
    { name: "", description: "The summary:  text, or a `<p>`." },
    {
      name: "status",
      description: "Claude's status cards on Owen's marks (`<epic-status slot=\"status\">`, P13):  under the lede."
    },
    {
      name: "notes",
      description:
        'Owen\'s notes on the summary from the page, kept once Claude took them (`<epic-reply slot="notes">`):  ' +
        "under the lede."
    }
  ],
  parts: [
    { name: "base", description: "The lede." },
    { name: "review", description: "Under the lede:  the review buttons, a marked note, the note box." },
    ...REVIEW_PARTS
  ],
  states: [],
  texts: [
    {
      key: "summaryLabel",
      text: "the summary",
      description: "Its name in the review controls' words (`Review the summary`, `the summary:  your note`)."
    },
    ...REVIEW_TEXTS
  ],
  children: [
    { tag: "flow", description: "The summary." },
    {
      tag: "epic-reply",
      slot: "notes",
      description: "Owen's notes on the summary, kept once Claude took them (`inbox done | clear`), oldest first."
    },
    {
      tag: "epic-status",
      slot: "status",
      description: "Claude's status cards on Owen's marks, oldest first (`plan-doc status`;  a todo filed:  born done)."
    }
  ]
} as const satisfies EpicVocabulary
